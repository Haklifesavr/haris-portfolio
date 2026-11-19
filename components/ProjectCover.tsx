import Image from 'next/image'
import type { Project } from '@/lib/types'

export function hueFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h % 360
}

function host(url: string) {
  try { return new URL(url).host.replace(/^www\./, '') } catch { return '' }
}

/** Real screenshot in a browser frame, or a generated typographic cover when there's no image yet. */
export default function ProjectCover({ project, src, priority, sizes = '(max-width: 900px) 100vw, 55vw' }: {
  project: Pick<Project, 'id' | 'title' | 'image' | 'liveUrl' | 'repoUrl' | 'stack'>
  src?: string
  priority?: boolean
  sizes?: string
}) {
  const h = hueFor(project.id || project.title)
  const image = src || project.image
  const label = host(project.liveUrl) || host(project.repoUrl)
  return (
    <div className="cover" style={{ ['--h' as string]: h }}>
      <div className="cover-glow" aria-hidden="true" />
      <div className="browser">
        <div className="browser-bar" aria-hidden="true"><i /><i /><i />{label && <span>{label}</span>}</div>
        <div className="browser-view">
          {image ? (
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="shot" />
            ) : (
              <Image src={image} alt={`Screenshot of ${project.title}`} fill sizes={sizes} className="shot" priority={priority} />
            )
          ) : (
            <div className="gen" aria-hidden="true">
              <span className="gen-title">{project.title}</span>
              <span className="gen-stack">{project.stack.slice(0, 3).join(' · ')}</span>
              <span className="gen-blob a" /><span className="gen-blob b" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
