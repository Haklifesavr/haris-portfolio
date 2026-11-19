'use client'

import { useRef, useState } from 'react'
import { profile } from '@/content/profile'
import { CheckIcon, CopyIcon } from './Icons'

const SERVICE = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_USER_ID

export function CopyEmail() {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <div className="email-row">
      <a href={`mailto:${profile.email}`} className="email-big">{profile.email}</a>
      <button type="button" className="icon-btn" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <span className="sr" aria-live="polite">{copied ? 'Email address copied' : ''}</span>
    </div>
  )
}

type Errors = Partial<Record<'user_name' | 'user_email' | 'message', string>>

export function ContactForm() {
  const form = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const f = new FormData(form.current!)
    const name = String(f.get('user_name') || '').trim()
    const email = String(f.get('user_email') || '').trim()
    const message = String(f.get('message') || '').trim()
    const next: Errors = {}
    if (!name) next.user_name = 'Add your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.user_email = 'Enter an email like name@company.com.'
    if (message.length < 10) next.message = 'Add a short message (at least 10 characters).'
    setErrors(next)
    if (Object.keys(next).length) {
      form.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus()
      return
    }
    if (!SERVICE || !TEMPLATE || !PUBLIC_KEY) {
      // No EmailJS keys configured: open the visitor's mail app instead.
      location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name}`)}&body=${encodeURIComponent(`${message}\n\n${name} (${email})`)}`
      return
    }
    setState('sending')
    try {
      const emailjs = (await import('@emailjs/browser')).default
      await emailjs.sendForm(SERVICE, TEMPLATE, form.current!, { publicKey: PUBLIC_KEY })
      setState('sent')
      form.current?.reset()
    } catch {
      setState('failed')
    }
  }

  if (state === 'sent')
    return (
      <div className="form-done" role="status">
        <CheckIcon size={28} />
        <p className="h-s">Message sent. Thanks!</p>
        <p className="mute">I&apos;ll reply to you by email, usually within a day.</p>
        <button type="button" className="btn btn-ghost sm" onClick={() => setState('idle')}>Send another</button>
      </div>
    )

  const field = (name: keyof Errors, label: string, el: React.ReactNode) => (
    <div className={`field${errors[name] ? ' bad' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {el}
      <span className="field-err" aria-live="polite">{errors[name] || ''}</span>
    </div>
  )

  return (
    <form ref={form} className="contact-form" onSubmit={submit} noValidate>
      <div className="field-row">
        {field('user_name', 'Name', <input id="user_name" name="user_name" autoComplete="name" aria-invalid={!!errors.user_name} />)}
        {field('user_email', 'Email', <input id="user_email" name="user_email" type="email" autoComplete="email" aria-invalid={!!errors.user_email} />)}
      </div>
      {field('message', 'Message', <textarea id="message" name="message" rows={5} aria-invalid={!!errors.message} placeholder="A role, a project, or just hello." />)}
      {state === 'failed' && <p className="form-err" role="alert">That didn&apos;t send. Please email me directly at {profile.email}.</p>}
      <button type="submit" className="btn btn-acc" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
    </form>
  )
}
