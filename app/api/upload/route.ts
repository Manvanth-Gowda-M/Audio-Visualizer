import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { parseBuffer } from 'music-metadata'

// Edge runtime works here since we're no longer writing to the local filesystem.
// Using Node.js runtime to keep music-metadata (Buffer-based) working.
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile   = formData.get('audio')   as File | null
    const artworkFile = formData.get('artwork')  as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 })
    }

    const timestamp = Date.now()

    // ── Upload audio to Vercel Blob ────────────────────────────────────────────
    // `put` streams straight to Vercel's CDN. The returned `url` is a stable
    // HTTPS URL accessible from any serverless function instance — no /tmp race.
    const audioBytes  = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(audioBytes)
    const audioFilename = `audio/${timestamp}_${audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const audioBlob = await put(audioFilename, audioBuffer, {
      access: 'public',
      contentType: audioFile.type || 'audio/mpeg',
      // addRandomSuffix prevents collisions between concurrent uploads
      addRandomSuffix: true,
    })

    // ── Upload artwork to Vercel Blob (if provided) ────────────────────────────
    let artworkUrl = ''
    if (artworkFile) {
      const artworkBytes    = await artworkFile.arrayBuffer()
      const artworkFilename = `artwork/${timestamp}_${artworkFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const artworkBlob     = await put(artworkFilename, artworkBytes, {
        access: 'public',
        contentType: artworkFile.type || 'image/jpeg',
        addRandomSuffix: true,
      })
      artworkUrl = artworkBlob.url
    }

    // ── Extract audio metadata ─────────────────────────────────────────────────
    let title    = audioFile.name.replace(/\.[^/.]+$/, '')
    let artist   = 'Unknown Artist'
    let duration = 0

    try {
      const metadata = await parseBuffer(audioBuffer, audioFile.type || 'audio/mpeg')
      title    = metadata.common.title   || title
      artist   = metadata.common.artist  || artist
      duration = metadata.format.duration || 0
    } catch { /* metadata is optional — continue without it */ }

    return NextResponse.json({
      // These are now full HTTPS Vercel Blob CDN URLs, not /api/uploads/... paths.
      // They are accessible from any serverless container and from the Remotion
      // render worker (which runs under COOP+COEP isolation).
      // Vercel Blob CDN serves with CORS headers by default.
      audioPath:   audioBlob.url,
      artworkPath: artworkUrl,
      title,
      artist,
      duration,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
