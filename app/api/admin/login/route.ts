import { NextResponse } from 'next/server'
import { SESSION_COOKIE, SESSION_HOURS, createSession, safeEqual, sessionSecret } from '@/lib/session'

export async function POST(req: Request) {
  const user = process.env.ADMIN_USERNAME || ''
  const pass = process.env.ADMIN_PASSWORD || ''
  if (!user || !pass || !sessionSecret())
    return NextResponse.json({ error: 'Admin login isn’t set up yet. Add ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET (32+ characters) in Vercel.' }, { status: 503 })

  let body: { username?: unknown; password?: unknown } = {}
  try { body = await req.json() } catch {}
  const u = typeof body.username === 'string' ? body.username : ''
  const p = typeof body.password === 'string' ? body.password : ''

  const ok = (await safeEqual(u, user)) && (await safeEqual(p, pass))
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)) // slow down guessing
    return NextResponse.json({ error: 'Wrong username or password.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, await createSession(u), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  })
  return res
}
