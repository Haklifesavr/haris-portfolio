// Signed admin session cookie. Uses Web Crypto only, so it works in middleware (edge) and route handlers.
export const SESSION_COOKIE = 'hk_admin'
export const SESSION_HOURS = 8

const enc = new TextEncoder()

function b64url(bytes: Uint8Array) {
  let s = ''
  bytes.forEach((b) => (s += String.fromCharCode(b)))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)))
}

function equalBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export function sessionSecret() {
  const s = process.env.ADMIN_SESSION_SECRET || ''
  return s.length >= 32 ? s : ''
}

export async function createSession(username: string) {
  const secret = sessionSecret()
  const payload = b64url(enc.encode(JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600_000 })))
  return `${payload}.${b64url(await hmac(payload, secret))}`
}

export async function verifySession(token: string | undefined) {
  const secret = sessionSecret()
  if (!token || !secret) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  try {
    if (!equalBytes(fromB64url(sig), await hmac(payload, secret))) return false
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)))
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

/** Constant-time comparison of two strings (compares their HMACs). */
export async function safeEqual(a: string, b: string) {
  const k = sessionSecret() || 'compare'
  return equalBytes(await hmac(a, k), await hmac(b, k))
}
