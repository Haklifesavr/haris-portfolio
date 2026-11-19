// Minimal GitHub client: read a file and write several files in ONE commit (so one Vercel deploy).
const API = 'https://api.github.com'

export const githubConfigured = () => Boolean(process.env.GITHUB_TOKEN)
const repo = () => process.env.GITHUB_REPO || 'haklifesavr/haris-portfolio'
const branch = () => process.env.GITHUB_BRANCH || 'master'

export class GitHubError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}/repos/${repo()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new GitHubError(`GitHub ${init.method || 'GET'} ${path} failed (${res.status}): ${body.slice(0, 200)}`, res.status)
  }
  return res.json() as Promise<T>
}

export async function readFile(path: string) {
  const data = await gh<{ content: string; sha: string }>(`/contents/${path}?ref=${encodeURIComponent(branch())}`)
  return { text: Buffer.from(data.content, 'base64').toString('utf8'), sha: data.sha }
}

type FileChange = { path: string; content: string; encoding: 'utf-8' | 'base64' } | { path: string; delete: true }

export async function commitFiles(changes: FileChange[], message: string) {
  const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${branch()}`)
  const parent = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`)
  const tree = await Promise.all(
    changes.map(async (c) => {
      if ('delete' in c) return { path: c.path, mode: '100644', type: 'blob', sha: null }
      const blob = await gh<{ sha: string }>('/git/blobs', { method: 'POST', body: JSON.stringify({ content: c.content, encoding: c.encoding }) })
      return { path: c.path, mode: '100644', type: 'blob', sha: blob.sha }
    }),
  )
  const newTree = await gh<{ sha: string }>('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree }) })
  const commit = await gh<{ sha: string }>('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  })
  try {
    await gh(`/git/refs/heads/${branch()}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) })
  } catch (e) {
    if (e instanceof GitHubError && e.status === 422) throw new GitHubError('The repository changed while you were saving. Reload and try again.', 409)
    throw e
  }
  return commit.sha
}
