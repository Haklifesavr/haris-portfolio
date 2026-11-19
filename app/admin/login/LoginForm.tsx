'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: f.get('username'), password: f.get('password') }),
    }).catch(() => null)
    if (res?.ok) { router.replace('/admin'); router.refresh(); return }
    const data = res ? await res.json().catch(() => ({})) : {}
    setError(data.error || 'Couldn’t reach the server. Try again.')
    setBusy(false)
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <span className="mono-mark" aria-hidden="true">HK</span>
      <h1>Portfolio admin</h1>
      <p className="mute" style={{ marginBottom: 14 }}>Log in to add and edit projects.</p>
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required autoFocus />
        <span className="field-err" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <span className="field-err" />
      </div>
      {error && <p className="form-err" role="alert">{error}</p>}
      <button className="btn btn-acc" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <Link href="/" className="link mute" style={{ justifySelf: "center", marginTop: 12, fontSize: 14 }}>← Back to the site</Link>
    </form>
  )
}
