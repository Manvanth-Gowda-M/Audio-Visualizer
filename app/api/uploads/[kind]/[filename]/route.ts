import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { TMP_UPLOAD_ROOT, UPLOAD_KINDS } from '@/lib/media/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_KINDS = new Set(UPLOAD_KINDS)
type UploadKind = (typeof UPLOAD_KINDS)[number]

function isUploadKind(kind: string): kind is UploadKind {
  return ALLOWED_KINDS.has(kind as UploadKind)
}

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
  const { kind: rawKind, filename } = await context.params
  if (!isUploadKind(rawKind)) {
    return NextResponse.json({ error: 'Invalid upload kind' }, { status: 400 })
  }
  const kind = rawKind

  const safeFilename = path.basename(filename)
  const baseDir = path.join(TMP_UPLOAD_ROOT, kind)
  const filePath = path.join(baseDir, safeFilename)
  const normalizedBaseDir = path.resolve(baseDir)
  const normalizedFilePath = path.resolve(filePath)
  const relativePath = path.relative(normalizedBaseDir, normalizedFilePath)

  if (
    relativePath.startsWith('..') ||
    relativePath.includes(`..${path.sep}`) ||
    relativePath.includes('..\\') ||
    path.isAbsolute(relativePath)
  ) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
  }

  try {
    const file = await readFile(normalizedFilePath)
    return new Response(file, {
      headers: {
        'Content-Type': contentTypeFor(safeFilename),
        'Cache-Control': 'no-cache, max-age=0',
      },
    })
  } catch (err) {
    console.error('Media fetch error:', err)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
