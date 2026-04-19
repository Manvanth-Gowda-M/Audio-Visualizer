import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@remotion/bundler', '@remotion/renderer', 'music-metadata'],
  async headers() {
    return [
      {
        // ── REQUIRED: enables SharedArrayBuffer for @remotion/web-renderer ──────────
        // Without these headers, browsers disable SharedArrayBuffer (Spectre fix),
        // which breaks WebCodecs-based rendering. This must be on ALL routes.
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy',  value: 'require-corp' },
        ],
      },
      {
        // Prevent caching of uploaded files so new uploads always load fresh
        source: '/api/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          // Required: COEP forces all resources to opt-in via CORP header.
          // Uploaded media must declare this so the renderer can load them.
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
