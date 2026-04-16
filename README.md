# Audio Visualizer

Create stunning audio visualizer videos with auto-fetched lyrics. Free, no watermark, no account needed.

## Setup

```bash
npm install
npm run db:push
npm run dev
```

## How it works

1. **Upload** — Drop an MP3/WAV + album artwork
2. **Lyrics** — Auto-fetched from LRCLib or Genius (free, no API key)
3. **Customize** — Pick a visualizer template, typography style, and accent color
4. **Export** — Render and download your MP4

## Requirements

- Node.js 18+
- FFmpeg installed: https://ffmpeg.org/download.html
  - Windows: `winget install ffmpeg` or download from the site
  - Mac: `brew install ffmpeg`
  - Linux: `apt install ffmpeg`

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run db:push          # Push Prisma schema to SQLite
npm run db:studio        # Open Prisma Studio
npm run remotion:dev     # Open Remotion Studio
```

## Stack

- Next.js 14 + TypeScript + Tailwind CSS
- Remotion (video rendering)
- Web Audio API (waveform extraction)
- LRCLib + Genius (free lyrics)
- SQLite + Prisma (job tracking)
- FFmpeg (video encoding)
