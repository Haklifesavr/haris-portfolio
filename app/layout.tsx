import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import { profile } from '@/content/profile'
import './globals.css'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Geist({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

const SITE = 'https://hariskhan-app.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: `${profile.name} · ${profile.role}`,
  description: profile.headline,
  openGraph: { title: `${profile.name} · ${profile.role}`, description: profile.headline, url: SITE, type: 'website', images: ['/profile.jpg'] },
  twitter: { card: 'summary', title: `${profile.name} · ${profile.role}`, description: profile.headline },
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0B0F' },
    { media: '(prefers-color-scheme: light)', color: '#F6F6F2' },
  ],
}

// Applies the saved theme before first paint (no flash).
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
