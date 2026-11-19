'use client'

import { useEffect, useState } from 'react'
import { profile } from '@/content/profile'
import { FileIcon, GitHubIcon, LinkedInIcon, MoonIcon, SunIcon } from './Icons'

const LINKS = [
  ['work', 'Work'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
] as const

export default function Nav() {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null)

  useEffect(() => {
    const saved = document.documentElement.dataset.theme as 'dark' | 'light' | undefined
    setTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'))
    const onScroll = () => setScrolled(scrollY > 12)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => { removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch {}
  }

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}${open ? ' open' : ''}`}>
      <div className="nav-in">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <span className="mono-mark" aria-hidden="true">HK</span>
          <span className="brand-name">{profile.name}</span>
        </a>
        <nav aria-label="Sections" className="nav-links" id="nav-links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a href={profile.links.resume} target="_blank" rel="noopener noreferrer" className="nav-resume-m">Résumé</a>
        </nav>
        <div className="nav-actions">
          <a className="icon-btn" href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><GitHubIcon /></a>
          <a className="icon-btn" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><LinkedInIcon /></a>
          <button className="icon-btn" type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <a className="btn btn-acc sm nav-resume" href={profile.links.resume} target="_blank" rel="noopener noreferrer"><FileIcon size={16} />Résumé</a>
          <button className="menu-btn" type="button" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
            <span /><span /><span className="sr">Menu</span>
          </button>
        </div>
      </div>
    </header>
  )
}
