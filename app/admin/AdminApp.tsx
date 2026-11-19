'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProjectCover from '@/components/ProjectCover'
import type { Project } from '@/lib/types'

type Upload = { path: string; base64: string; preview: string }
type Item = Project & { _upload?: Upload }

const EMPTY: Project = { id: '', title: '', role: '', summary: '', owned: '', challenge: '', result: '', stack: [], liveUrl: '', repoUrl: '', image: '', featured: true }
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
const strip = (list: Item[]) => list.map(({ _upload, ...p }) => { void _upload; return p })

/** Resize an image in the browser and encode it as WebP (keeps uploads small for Vercel). */
async function toWebp(file: File): Promise<{ base64: string; preview: string }> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / bmp.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(Math.min(bmp.height * scale, 2400))
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, bmp.width * scale, bmp.height * scale)
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.85))
  if (!blob || blob.type !== 'image/webp') throw new Error('This browser can’t convert images to WebP. Try Chrome, Edge or Firefox.')
  if (blob.size > 1_400_000) throw new Error('That image is still too large after resizing. Try a smaller screenshot.')
  const dataUrl: string = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.onerror = rej; fr.readAsDataURL(blob) })
  return { base64: dataUrl.split(',')[1], preview: dataUrl }
}

function Field({ label, hint, children, full }: { label: string; hint?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      <label>{label}</label>
      {children}
      <span className="hint">{hint || ' '}</span>
    </div>
  )
}

function Editor({ initial, isNew, taken, onClose, onSave }: {
  initial: Item; isNew: boolean; taken: Set<string>; onClose: () => void; onSave: (p: Item) => void
}) {
  const dlg = useRef<HTMLDialogElement>(null)
  const [f, setF] = useState<Item>(initial)
  const [stack, setStack] = useState(initial.stack.join(', '))
  const [idTouched, setIdTouched] = useState(!isNew)
  const [error, setError] = useState('')
  const [imgBusy, setImgBusy] = useState(false)
  useEffect(() => { dlg.current?.showModal() }, [])

  const set = <K extends keyof Item>(k: K, v: Item[K]) => setF((p) => ({ ...p, [k]: v, ...(k === 'title' && isNew && !idTouched ? { id: slugify(String(v)) } : {}) }))
  const input = (k: 'title' | 'role' | 'liveUrl' | 'repoUrl', props: React.InputHTMLAttributes<HTMLInputElement> = {}) =>
    <input value={f[k]} onChange={(e) => set(k, e.target.value)} {...props} />
  const area = (k: 'summary' | 'owned' | 'challenge' | 'result', rows = 3) =>
    <textarea value={f[k]} onChange={(e) => set(k, e.target.value)} rows={rows} maxLength={400} />

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose an image file (PNG, JPEG or WebP).'); return }
    if (file.size > 15_000_000) { setError('That file is over 15 MB. Use a smaller screenshot.'); return }
    setImgBusy(true); setError('')
    try {
      const { base64, preview } = await toWebp(file)
      const name = `${slugify(f.id || f.title) || 'project'}-${Math.random().toString(36).slice(2, 8)}.webp`
      setF((p) => ({ ...p, image: `/projects/${name}`, _upload: { path: `public/projects/${name}`, base64, preview } }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t read that image.')
    } finally { setImgBusy(false) }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const p: Item = { ...f, id: slugify(f.id), title: f.title.trim(), stack: stack.split(',').map((s) => s.trim()).filter(Boolean) }
    if (!p.title) return setError('Add a title.')
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(p.id)) return setError('The ID needs at least 2 lowercase letters, numbers or dashes.')
    if (isNew && taken.has(p.id)) return setError('Another project already uses that ID.')
    if (!p.summary.trim()) return setError('Add a one-line summary.')
    for (const u of [p.liveUrl, p.repoUrl]) if (u && !/^https?:\/\/\S+\.\S+/.test(u)) return setError('Links must start with https:// (or leave them empty).')
    onSave(p)
    dlg.current?.close()
  }

  const preview = f._upload?.preview
  return (
    <dialog ref={dlg} className="drawer" onClose={onClose} aria-labelledby="ed-h">
      <form className="drawer-in" onSubmit={submit} noValidate>
        <div className="drawer-head">
          <h2 id="ed-h">{isNew ? 'Add project' : `Edit ${initial.title}`}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => dlg.current?.close()}>✕</button>
        </div>
        <div className="img-box">
          <ProjectCover project={{ ...f, stack: stack.split(',').map((s) => s.trim()).filter(Boolean) }} src={preview} sizes="600px" />
          <div className="img-ctrl">
            <p><strong>{preview ? 'New image ready' : f.image ? 'Using a screenshot' : 'No image: showing a generated cover'}</strong>Any screenshot works; it’s resized and converted to WebP automatically.</p>
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label className="btn btn-ghost sm file-btn">{imgBusy ? 'Processing…' : f.image ? 'Replace image' : 'Upload image'}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr" onChange={pick} disabled={imgBusy} />
              </label>
              {f.image && <button type="button" className="btn btn-danger sm" onClick={() => setF((p) => ({ ...p, image: '', _upload: undefined }))}>Remove</button>}
            </span>
          </div>
        </div>
        {error && <p className="form-err" role="alert">{error}</p>}
        <div className="grid2">
          <Field label="Title">{input('title', { required: true, maxLength: 80, autoFocus: true })}</Field>
          <Field label="ID" hint={isNew ? 'Filled in from the title' : 'Can’t be changed'}>
            <input value={f.id} disabled={!isNew} onChange={(e) => { setIdTouched(true); set('id', e.target.value) }} />
          </Field>
          <Field label="Label" hint='Shown as a badge, e.g. "Freelance"'>{input('role', { maxLength: 40 })}</Field>
          <Field label="Tech stack" hint="Comma separated">
            <input value={stack} onChange={(e) => setStack(e.target.value)} />
          </Field>
          <Field label="Summary" full hint="One or two sentences">{area('summary', 2)}</Field>
          <Field label="What I owned" full>{area('owned')}</Field>
          <Field label="The hard problem" full>{area('challenge')}</Field>
          <Field label="Result" full hint="Leave empty to hide">{area('result')}</Field>
          <Field label="Live site link">{input('liveUrl', { type: 'url', placeholder: 'https://' })}</Field>
          <Field label="Source code link">{input('repoUrl', { type: 'url', placeholder: 'https://github.com/…' })}</Field>
          <label className="check full"><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />Featured (large card with the full write-up)</label>
        </div>
        <div className="drawer-foot">
          <button type="button" className="btn btn-ghost" onClick={() => dlg.current?.close()}>Cancel</button>
          <button type="submit" className="btn btn-acc" disabled={imgBusy}>{isNew ? 'Add to draft' : 'Keep changes'}</button>
        </div>
      </form>
    </dialog>
  )
}

function Confirm({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null)
  useEffect(() => { dlg.current?.showModal() }, [])
  return (
    <dialog ref={dlg} className="confirm" onClose={onCancel}>
      <h2 className="h-s">Delete {title}?</h2>
      <p className="mute">It’s removed from the draft. Nothing changes on the live site until you publish.</p>
      <div className="drawer-foot">
        <button type="button" className="btn btn-ghost" onClick={() => dlg.current?.close()}>Keep it</button>
        <button type="button" className="btn btn-danger" onClick={() => { onConfirm(); dlg.current?.close() }}>Delete</button>
      </div>
    </dialog>
  )
}

export default function AdminApp() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [saved, setSaved] = useState('[]')
  const [version, setVersion] = useState('')
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading')
  const [notice, setNotice] = useState<{ kind: 'ok' | 'bad' | 'warn'; text: string } | null>(null)
  const [editing, setEditing] = useState<{ item: Item; isNew: boolean } | null>(null)
  const [deleting, setDeleting] = useState<Item | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState('')

  const fetchAll = useCallback(async () => {
    setLoad('loading')
    const res = await fetch('/api/admin/projects', { cache: 'no-store' }).catch(() => null)
    if (res?.status === 401) { router.replace('/admin/login'); return }
    const data = res ? await res.json().catch(() => ({})) : {}
    if (!res?.ok) { setNotice({ kind: 'bad', text: data.error || 'Couldn’t load projects.' }); setLoad('error'); return }
    setItems(data.projects); setSaved(JSON.stringify(data.projects)); setVersion(data.version); setLoad('ready')
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t) }, [toast])

  const dirty = useMemo(() => JSON.stringify(strip(items)) !== saved || items.some((i) => i._upload), [items, saved])
  const savedById = useMemo(() => new Map((JSON.parse(saved) as Project[]).map((p) => [p.id, JSON.stringify(p)])), [saved])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [dirty])

  function move(i: number, d: number) {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items];[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  async function publish() {
    setPublishing(true); setNotice(null)
    const uploads = items.filter((i) => i._upload && i.image === i._upload.path.replace(/^public/, '')).map((i) => ({ path: i._upload!.path, base64: i._upload!.base64 }))
    const res = await fetch('/api/admin/projects', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: strip(items), uploads, version }),
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    setPublishing(false)
    if (res?.status === 401) { router.replace('/admin/login'); return }
    if (!res?.ok) { setNotice({ kind: res?.status === 409 ? 'warn' : 'bad', text: data.error || 'Publishing failed. Try again.' }); return }
    setItems(data.projects); setSaved(JSON.stringify(data.projects)); setVersion(data.version)
    setNotice({ kind: 'ok', text: data.commit === 'local' ? 'Saved to your local files.' : 'Published. Vercel is redeploying the site; changes are live in about a minute.' })
  }

  async function logout() {
    if (dirty && !confirm('You have unpublished changes. Log out anyway?')) return
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null)
    router.replace('/admin/login')
  }

  return (
    <div className="admin-shell">
      <header className="adm-top">
        <div className="adm-top-in">
          <Link href="/" className="brand" target="_blank" rel="noopener noreferrer"><span className="mono-mark" aria-hidden="true">HK</span><span>Portfolio admin</span></Link>
          <Link href="/" className="btn btn-ghost sm" target="_blank" rel="noopener noreferrer">View site</Link>
          <button type="button" className="btn btn-ghost sm" onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1 className="h-l">Projects</h1>
            <p className="mute">Edit as much as you like, then publish once. Publishing commits to GitHub and Vercel redeploys automatically.</p>
          </div>
          <button type="button" className="btn btn-acc" disabled={load !== 'ready'} onClick={() => setEditing({ item: { ...EMPTY }, isNew: true })}>+ Add project</button>
        </div>

        {notice && (
          <div className={`notice ${notice.kind}`} role={notice.kind === 'ok' ? 'status' : 'alert'}>
            <span style={{ flex: 1 }}>{notice.text}</span>
            {notice.kind === 'warn' && <button type="button" className="btn btn-ghost sm" onClick={() => { setNotice(null); fetchAll() }}>Reload latest</button>}
            {load === 'error' && <button type="button" className="btn btn-ghost sm" onClick={fetchAll}>Try again</button>}
          </div>
        )}

        {load === 'loading' && <p className="mute">Loading projects…</p>}
        {load === 'ready' && (
          <ul className="adm-list">
            {items.map((p, i) => (
              <li key={p.id} className={`adm-row${savedById.get(p.id) !== JSON.stringify(strip([p])[0]) || p._upload ? ' dirty' : ''}`}>
                <ProjectCover project={p} src={p._upload?.preview} sizes="140px" />
                <div className="adm-info">
                  <h2>{p.title}{p.featured && <span className="tag acc">Featured</span>}{p.role && <span className="tag">{p.role}</span>}{!savedById.has(p.id) ? <span className="tag acc">New</span> : savedById.get(p.id) !== JSON.stringify(strip([p])[0]) && <span className="tag">Edited</span>}</h2>
                  <p>{p.summary}</p>
                </div>
                <div className="adm-btns">
                  <button type="button" className="icon-btn" aria-label={`Move ${p.title} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                  <button type="button" className="icon-btn" aria-label={`Move ${p.title} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
                  <button type="button" className="btn btn-ghost sm" onClick={() => setEditing({ item: p, isNew: false })}>Edit</button>
                  <button type="button" className="btn btn-danger sm" onClick={() => setDeleting(p)}>Delete</button>
                </div>
              </li>
            ))}
            {items.length === 0 && <li className="notice">No projects yet. Add your first one.</li>}
          </ul>
        )}
      </main>

      {dirty && (
        <div className="publish-bar" role="region" aria-label="Unpublished changes">
          <p>You have unpublished changes</p>
          <button type="button" className="btn btn-ghost sm" disabled={publishing} onClick={() => { setItems(JSON.parse(saved)); setNotice(null) }}>Discard</button>
          <button type="button" className="btn btn-acc sm" disabled={publishing} onClick={publish}>{publishing ? 'Publishing…' : 'Publish changes'}</button>
        </div>
      )}

      {editing && (
        <Editor
          initial={editing.item}
          isNew={editing.isNew}
          taken={new Set(items.map((x) => x.id))}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            setItems((list) => (editing.isNew ? [p, ...list] : list.map((x) => (x.id === p.id ? p : x))))
            setToast(editing.isNew ? `${p.title} added to the draft.` : `${p.title} updated in the draft.`)
          }}
        />
      )}
      {deleting && <Confirm title={deleting.title} onCancel={() => setDeleting(null)} onConfirm={() => setItems((l) => l.filter((x) => x.id !== deleting.id))} />}
      <div className={`toast${toast ? ' on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}
