import { NextRequest, NextResponse } from 'next/server'
import { parseBuffer } from 'music-metadata'

export const runtime = 'nodejs'

// ── Helpers ────────────────────────────────────────────────────────────────

const hasBlobToken = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  return !!(token && token.length > 10)
}

/** Upload to Vercel Blob CDN — used in production */
async function uploadToBlob(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { put } = await import('@vercel/blob')
  const blob = await put(filename, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  })
  return blob.url
}

/** Save to /public/uploads — used locally when Blob token is not configured */
async function uploadToLocal(
  buffer: Buffer,
  kind: 'audio' | 'artwork',
  filename: string,
): Promise<string> {
  const path  = await import('path')
  const fs    = await import('fs/promises')
  const cwd   = process.cwd()

  const dir = path.join(cwd, 'public', 'uploads', kind)
  await fs.mkdir(dir, { recursive: true })

  // Sanitize filename
  const safe   = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const dest   = path.join(dir, `${Date.now()}_${safe}`)
  await fs.writeFile(dest, buffer)

  // Return a path relative to /public so Next.js serves it
  return `/uploads/${kind}/${Date.now()}_${safe}`
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData    = await req.formData()
    const audioFile   = formData.get('audio')   as File | null
    const artworkFile = formData.get('artwork')  as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const useBlob  = hasBlobToken()
    const timestamp = Date.now()

    // ── Audio ──────────────────────────────────────────────────────────────
    const audioBytes  = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(audioBytes)
    const audioSafeName = audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')

    let audioPath: string
    if (useBlob) {
      audioPath = await uploadToBlob(
        audioBuffer,
        `audio/${timestamp}_${audioSafeName}`,
        audioFile.type || 'audio/mpeg',
      )
    } else {
      audioPath = await uploadToLocal(audioBuffer, 'audio', audioSafeName)
    }

    // ── Artwork ────────────────────────────────────────────────────────────
    let artworkPath = ''
    if (artworkFile) {
      const artworkBytes   = await artworkFile.arrayBuffer()
      const artworkBuffer  = Buffer.from(artworkBytes)
      const artworkSafeName = artworkFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')

      if (useBlob) {
        artworkPath = await uploadToBlob(
          artworkBuffer,
          `artwork/${timestamp}_${artworkSafeName}`,
          artworkFile.type || 'image/jpeg',
        )
      } else {
        artworkPath = await uploadToLocal(artworkBuffer, 'artwork', artworkSafeName)
      }
    }

    // ── Metadata ────────────────────────────────────────────────────────────
    let title    = audioFile.name.replace(/\.[^/.]+$/, '')
    let artist   = 'Unknown Artist'
    let duration = 0

    try {
      const metadata = await parseBuffer(audioBuffer, audioFile.type || 'audio/mpeg')
      title    = metadata.common.title   || title
      artist   = metadata.common.artist  || artist
      duration = metadata.format.duration || 0
    } catch { /* metadata is optional */ }

    console.log(`[Upload] ${useBlob ? 'Blob CDN' : 'Local FS'} — audio: ${audioPath}`)

    return NextResponse.json({ audioPath, artworkPath, title, artist, duration })

  } catch (err) {
    console.error('[Upload] Error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `Upload failed: ${msg}` },
      { status: 500 },
    )
  }
}
