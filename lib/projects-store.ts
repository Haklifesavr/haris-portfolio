import { promises as fs } from 'fs'
import path from 'path'
import { commitFiles, githubConfigured, readFile, GitHubError } from './github'
import type { Project } from './types'

export const DATA_PATH = 'content/projects.json'
const IMAGE_RE = /^\/projects\/[a-z0-9-]+\.webp$/
const UPLOAD_PATH_RE = /^public\/projects\/[a-z0-9-]+\.webp$/
export const MAX_IMAGE_BYTES = 1_500_000

/** Local development without a token writes straight to disk. */
const diskMode = () => !githubConfigured() && process.env.NODE_ENV === 'development'
export const storeAvailable = () => githubConfigured() || diskMode()

export async function loadProjects(): Promise<{ projects: Project[]; version: string }> {
  if (diskMode()) {
    const text = await fs.readFile(path.join(process.cwd(), DATA_PATH), 'utf8')
    return { projects: JSON.parse(text).projects, version: String(text.length) + ':' + hash(text) }
  }
  const { text, sha } = await readFile(DATA_PATH)
  return { projects: JSON.parse(text).projects, version: sha }
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
function url(v: unknown) {
  const s = str(v, 300)
  if (!s) return ''
  try {
    const u = new URL(s)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

export function validate(list: unknown): { projects?: Project[]; error?: string } {
  if (!Array.isArray(list) || list.length > 50) return { error: 'Invalid project list.' }
  const seen = new Set<string>()
  const out: Project[] = []
  for (const raw of list as Record<string, unknown>[]) {
    const id = str(raw.id, 60)
    const title = str(raw.title, 80)
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(id)) return { error: `“${title || id}” needs an ID of lowercase letters, numbers and dashes.` }
    if (seen.has(id)) return { error: `Two projects share the ID “${id}”.` }
    seen.add(id)
    if (!title) return { error: 'Every project needs a title.' }
    const summary = str(raw.summary, 400)
    if (!summary) return { error: `“${title}” needs a summary.` }
    const liveUrl = url(raw.liveUrl), repoUrl = url(raw.repoUrl)
    if (liveUrl === null || repoUrl === null) return { error: `“${title}” has a link that isn’t a valid https:// address.` }
    const stack = (Array.isArray(raw.stack) ? raw.stack : []).map((s) => str(s, 30)).filter(Boolean).slice(0, 12)
    const image = str(raw.image, 120)
    if (image && !IMAGE_RE.test(image)) return { error: `“${title}” has an invalid image path.` }
    out.push({
      id, title, summary, stack, liveUrl, repoUrl,
      role: str(raw.role, 40),
      owned: str(raw.owned, 400),
      challenge: str(raw.challenge, 400),
      result: str(raw.result, 400),
      image,
      featured: Boolean(raw.featured),
    })
  }
  return { projects: out }
}

export type Upload = { path: string; base64: string }

function checkUpload(u: Upload) {
  if (!UPLOAD_PATH_RE.test(u.path) || typeof u.base64 !== 'string') return 'Invalid image upload.'
  const bytes = Buffer.from(u.base64, 'base64')
  if (bytes.length > MAX_IMAGE_BYTES) return 'An image is too large (max 1.5 MB after resizing).'
  // WebP files start with "RIFF....WEBP"
  if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') return 'Images must be WebP.'
  return ''
}

export async function saveProjects(input: unknown, uploads: Upload[], baseVersion: string) {
  if (!Array.isArray(uploads) || uploads.length > 10) return { status: 400, error: 'Too many images in one save.' }
  for (const u of uploads) {
    const err = checkUpload(u)
    if (err) return { status: 400, error: err }
  }
  const uploaded = new Set(uploads.map((u) => u.path.replace(/^public/, '')))
  const { projects, error } = validate(input)
  if (error || !projects) return { status: 422, error }

  const current = await loadProjects()
  if (current.version !== baseVersion) return { status: 409, error: 'Someone else saved changes since you loaded this page. Reload to get the latest version.' }

  // Every image must exist: either uploaded now or already in the repo.
  const known = new Set([...current.projects.map((p) => p.image).filter(Boolean), ...uploaded])
  for (const p of projects) if (p.image && !known.has(p.image)) return { status: 422, error: `The image for “${p.title}” is missing. Upload it again.` }

  // Remove image files no project uses any more.
  const stillUsed = new Set(projects.map((p) => p.image).filter(Boolean))
  const orphaned = current.projects.map((p) => p.image).filter((img) => img && !stillUsed.has(img))
  const usedUploads = uploads.filter((u) => stillUsed.has(u.path.replace(/^public/, '')))

  const json = JSON.stringify({ projects }, null, 2) + '\n'
  if (diskMode()) {
    const root = process.cwd()
    for (const u of usedUploads) await fs.writeFile(path.join(root, u.path), Buffer.from(u.base64, 'base64'))
    for (const img of orphaned) await fs.unlink(path.join(root, 'public', img)).catch(() => {})
    await fs.writeFile(path.join(root, DATA_PATH), json)
    return { status: 200, projects, version: (await loadProjects()).version, commit: 'local' }
  }

  try {
    const commit = await commitFiles(
      [
        { path: DATA_PATH, content: json, encoding: 'utf-8' },
        ...usedUploads.map((u) => ({ path: u.path, content: u.base64, encoding: 'base64' as const })),
        ...orphaned.map((img) => ({ path: `public${img}`, delete: true as const })),
      ],
      `Update projects from admin panel`,
    )
    const fresh = await loadProjects()
    return { status: 200, projects, version: fresh.version, commit }
  } catch (e) {
    if (e instanceof GitHubError && e.status === 409) return { status: 409, error: e.message }
    console.error(e)
    return { status: 502, error: 'Couldn’t save to GitHub. Check the GITHUB_TOKEN environment variable.' }
  }
}
