import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@remotion/bundler', '@remotion/renderer', 'music-metadata'],
  async headers() {
    return [
      {
        // Prevent caching of uploaded files so new uploads always load fresh
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ]
  },
}

export default nextConfig
