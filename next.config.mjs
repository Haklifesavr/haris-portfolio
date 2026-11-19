/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // The old site had separate pages; everything now lives on one page.
      { source: '/contact', destination: '/#contact', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:slug*', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
