export type Project = {
  id: string
  title: string
  /** Short label shown as a badge, e.g. "Freelance" or "DevDimensions" */
  role: string
  summary: string
  owned: string
  challenge: string
  result: string
  stack: string[]
  liveUrl: string
  repoUrl: string
  /** Path under /public, e.g. "/projects/daivio-1a2b3c.webp", or "" for a generated cover */
  image: string
  featured: boolean
}
