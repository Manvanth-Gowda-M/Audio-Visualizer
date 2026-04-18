import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { parseBuffer } from 'music-metadata'
import { TMP_UPLOAD_ROOT } from '@/lib/media/storage'

// Node.js runtime is required because this route writes uploaded files to disk.
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const artworkFile = formData.get('artwork') as File | null

    if (!audioFile) return NextResponse.json({ error: 'No audio file' }, { status: 400 })

    const timestamp = Date.now()

    const audioDir = path.join(TMP_UPLOAD_ROOT, 'audio')
    const artworkDir = path.join(TMP_UPLOAD_ROOT, 'artwork')
    await mkdir(audioDir, { recursive: true })
    await mkdir(artworkDir, { recursive: true })

    const audioBytes = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(audioBytes)
    const audioFilename = `${timestamp}_${audioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const audioSavePath = path.join(audioDir, audioFilename)
    await writeFile(audioSavePath, audioBuffer)

    let artworkFilename = ''
    let artworkPath = ''
    if (artworkFile) {
      const artworkBytes = await artworkFile.arrayBuffer()
      artworkFilename = `${timestamp}_${artworkFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const artworkSavePath = path.join(artworkDir, artworkFilename)
      await writeFile(artworkSavePath, Buffer.from(artworkBytes))
      artworkPath = `/api/uploads/artwork/${artworkFilename}`
    }

    let title = audioFile.name.replace(/\.[^/.]+$/, '')
    let artist = 'Unknown Artist'
    let duration = 0

    try {
      const metadata = await parseBuffer(audioBuffer, audioFile.type || 'audio/mpeg')
      title = metadata.common.title || title
      artist = metadata.common.artist || artist
      duration = metadata.format.duration || 0
    } catch {}

    return NextResponse.json({
      audioPath: `/api/uploads/audio/${audioFilename}`,
      artworkPath,
      title,
      artist,
      duration,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
