'use client'

import { useEffect } from 'react'

/** Scroll reveals and the hero spotlight. Pure progressive enhancement: content is visible without JS. */
export default function Effects() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('js')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = document.querySelectorAll('[data-reveal]')
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))

    const hero = document.querySelector<HTMLElement>('.hero')
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (!hero) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect()
        hero.style.setProperty('--mx', `${e.clientX - r.left}px`)
        hero.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    hero?.addEventListener('pointermove', onMove)
    return () => { io.disconnect(); hero?.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [])
  return null
}
