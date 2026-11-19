import Image from 'next/image'
import { profile } from '@/content/profile'
import data from '@/content/projects.json'
import type { Project } from '@/lib/types'
import Nav from '@/components/Nav'
import Effects from '@/components/Effects'
import ProjectCover from '@/components/ProjectCover'
import { ContactForm, CopyEmail } from '@/components/Contact'
import { ArrowUpRight, FileIcon, GitHubIcon, LinkedInIcon, MailIcon } from '@/components/Icons'

const projects = (data.projects as Project[])
const featured = projects.filter((p) => p.featured)
const more = projects.filter((p) => !p.featured)

function ProjectLinks({ p }: { p: Project }) {
  if (!p.liveUrl && !p.repoUrl) return null
  return (
    <div className="p-links">
      {p.liveUrl && <a className="btn btn-acc sm" href={p.liveUrl} target="_blank" rel="noopener noreferrer">Visit live site <ArrowUpRight size={16} /></a>}
      {p.repoUrl && <a className="btn btn-ghost sm" href={p.repoUrl} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> Source code</a>}
    </div>
  )
}

function Featured({ p, i }: { p: Project; i: number }) {
  const details = [['What I owned', p.owned], ['The hard problem', p.challenge], ['Result', p.result]].filter(([, v]) => v)
  return (
    <article className={`feat${i % 2 ? ' flip' : ''}`} data-reveal>
      <div className="feat-media">
        <ProjectCover project={p} priority={i === 0} />
      </div>
      <div className="feat-body">
        <div className="feat-top">
          <span className="idx">{String(i + 1).padStart(2, '0')}</span>
          {p.role && <span className="badge">{p.role}</span>}
          {p.liveUrl && <span className="live"><i />Live</span>}
        </div>
        <h3 className="h-l">{p.title}</h3>
        <p className="lead">{p.summary}</p>
        {details.length > 0 && (
          <dl className="facts">
            {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        )}
        <ul className="chips" aria-label="Tech stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
        <ProjectLinks p={p} />
      </div>
    </article>
  )
}

function Card({ p }: { p: Project }) {
  return (
    <article className="card" data-reveal>
      <ProjectCover project={p} sizes="(max-width: 900px) 100vw, 33vw" />
      <div className="card-body">
        <div className="feat-top">{p.role && <span className="badge">{p.role}</span>}{p.liveUrl && <span className="live"><i />Live</span>}</div>
        <h3 className="h-s">{p.title}</h3>
        <p className="mute">{p.summary}</p>
        {p.owned && <p className="card-owned"><strong>Owned:</strong> {p.owned}</p>}
        <ul className="chips sm">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
        <ProjectLinks p={p} />
      </div>
    </article>
  )
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#work">Skip to work</a>
      <Nav />
      <Effects />
      <main id="top">
        <section className="hero" aria-labelledby="hero-h">
          <div className="hero-bg" aria-hidden="true"><span className="orb a" /><span className="orb b" /><span className="grid" /></div>
          <div className="wrap hero-in">
            <div className="hero-copy">
              <p className="pill"><i />{profile.availability} · {profile.location}</p>
              <p className="hello">Hi, I&apos;m {profile.name}.</p>
              <h1 id="hero-h" className="h-xl">{profile.headline}</h1>
              <p className="hero-intro">{profile.intro}</p>
              <div className="hero-ctas">
                <a className="btn btn-acc" href="#work">See selected work</a>
                <a className="btn btn-ghost" href={profile.links.resume} target="_blank" rel="noopener noreferrer"><FileIcon size={17} />Résumé</a>
                <span className="hero-social">
                  <a className="icon-btn" href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon /></a>
                  <a className="icon-btn" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
                  <a className="icon-btn" href={`mailto:${profile.email}`} aria-label="Email"><MailIcon /></a>
                </span>
              </div>
            </div>
            <div className="hero-photo">
              <div className="photo-frame">
                <Image src="/profile.jpg" alt={`Portrait of ${profile.name}`} fill sizes="(max-width: 900px) 70vw, 380px" priority />
              </div>
              <span className="float f1">Python · Django</span>
              <span className="float f2">React · Next.js</span>
              <span className="float f3">AWS · GCP · Azure</span>
              <span className="float f4">LLM · RAG</span>
            </div>
          </div>
          <div className="wrap">
            <dl className="stats">
              {profile.stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
            </dl>
          </div>
        </section>

        <section id="work" className="section" aria-labelledby="work-h">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <p className="eyebrow">01 · Selected work</p>
              <h2 id="work-h" className="h-l">Products I&apos;ve built and shipped</h2>
              <p className="lead mute">What I owned on each one, the hard part, and how it turned out.</p>
            </div>
            <div className="feats">{featured.map((p, i) => <Featured key={p.id} p={p} i={i} />)}</div>
            {more.length > 0 && (
              <>
                <h3 className="sub-h" data-reveal>More projects</h3>
                <div className="cards">{more.map((p) => <Card key={p.id} p={p} />)}</div>
              </>
            )}
          </div>
        </section>

        <section id="experience" className="section alt" aria-labelledby="exp-h">
          <div className="wrap two">
            <div className="sec-head sticky" data-reveal>
              <p className="eyebrow">02 · Experience</p>
              <h2 id="exp-h" className="h-l">Where I&apos;ve worked</h2>
              <p className="mute">{profile.education}</p>
            </div>
            <ol className="timeline">
              {profile.experience.map((job) => (
                <li key={job.company} data-reveal>
                  <div className="tl-head">
                    <h3 className="h-s">{job.title} <span className="at">@ {job.company}</span></h3>
                    <span className="period">{job.period}</span>
                  </div>
                  <ul>{job.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="skills" className="section" aria-labelledby="skills-h">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <p className="eyebrow">03 · Skills</p>
              <h2 id="skills-h" className="h-l">The toolkit</h2>
            </div>
            <div className="skills">
              {profile.skills.map((g) => (
                <div key={g.group} className="skill" data-reveal>
                  <h3>{g.group}</h3>
                  <ul className="chips">{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section contact" aria-labelledby="contact-h">
          <div className="wrap two">
            <div data-reveal>
              <p className="eyebrow">04 · Contact</p>
              <h2 id="contact-h" className="h-xl">Let&apos;s build something that ships.</h2>
              <p className="lead mute">Hiring for a senior full-stack or AI product role? I&apos;d like to hear about it.</p>
              <CopyEmail />
              <div className="contact-links">
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /> LinkedIn <ArrowUpRight size={14} /></a>
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /> GitHub <ArrowUpRight size={14} /></a>
                <a href={profile.links.resume} target="_blank" rel="noopener noreferrer"><FileIcon /> Résumé <ArrowUpRight size={14} /></a>
              </div>
            </div>
            <div className="form-card" data-reveal><ContactForm /></div>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap foot-in">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span className="mute">Built with Next.js · Deployed on Vercel</span>
          <a href="#top" className="link">Back to top ↑</a>
        </div>
      </footer>
    </>
  )
}
