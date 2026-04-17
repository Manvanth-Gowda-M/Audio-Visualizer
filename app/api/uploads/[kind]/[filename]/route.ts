import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TMP_UPLOAD_ROOT = path.join('/tmp', 'audio-visualizer', 'uploads')
const ALLOWED_KINDS = new Set(['audio', 'artwork'])

function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.mp3') return 'audio/mpeg'
  if (ext === '.wav') return 'audio/wav'
  if (ext === '.m4a') return 'audio/mp4'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ kind: string; filename: string }> }
) {
  const { kind, filename } = await context.params
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: 'Invalid upload kind' }, { status: 400 })
  }

  const safeFilename = path.basename(filename)
  const baseDir = path.join(TMP_UPLOAD_ROOT, kind)
  const filePath = path.join(baseDir, safeFilename)
  const normalizedBaseDir = `${path.resolve(baseDir)}${path.sep}`
  const normalizedFilePath = path.resolve(filePath)

  if (!normalizedFilePath.startsWith(normalizedBaseDir)) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
  }

  try {
    const file = await readFile(normalizedFilePath)
    return new Response(file, {
      headers: {
        'Content-Type': contentTypeFor(safeFilename),
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
