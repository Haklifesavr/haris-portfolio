import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Admin login', robots: { index: false, follow: false } }

export default function LoginPage() {
  return (
    <main className="login">
      <div className="hero-bg" aria-hidden="true"><span className="orb b" /><span className="grid" /></div>
      <LoginForm />
    </main>
  )
}
