import { NextResponse } from 'next/server'
import { loadProjects, saveProjects, storeAvailable } from '@/lib/projects-store'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const notConfigured = () =>
  NextResponse.json({ error: 'Saving isn’t set up yet. Add a GITHUB_TOKEN environment variable in Vercel (see README).' }, { status: 503 })

export async function GET() {
  if (!storeAvailable()) return notConfigured()
  try {
    return NextResponse.json(await loadProjects())
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Couldn’t load projects from GitHub. Check GITHUB_TOKEN and GITHUB_REPO.' }, { status: 502 })
  }
}

export async function PUT(req: Request) {
  if (!storeAvailable()) return notConfigured()
  if (!req.headers.get('content-type')?.includes('application/json'))
    return NextResponse.json({ error: 'Invalid request.' }, { status: 415 })
  let body: { projects?: unknown; uploads?: unknown; version?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const res = await saveProjects(body.projects, (body.uploads as never) || [], String(body.version || ''))
  const { status, ...rest } = res
  return NextResponse.json(rest, { status })
}
