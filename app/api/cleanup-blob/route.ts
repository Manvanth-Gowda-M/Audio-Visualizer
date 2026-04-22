import { NextResponse } from 'next/server'
import { list, del } from '@vercel/blob'

export const runtime = 'nodejs'

// DELETE /api/cleanup-blob
// Deletes ALL blobs in the store. Call once to clear old uploads.
// Protected by a secret key so only you can call it.
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CLEANUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) {
    return NextResponse.json({ error: 'No blob token configured' }, { status: 400 })
  }

  let deleted = 0
  let cursor: string | undefined

  // Paginate through all blobs and delete each one
  do {
    const result = await list({ cursor, token })
    for (const blob of result.blobs) {
      await del(blob.url, { token })
      deleted++
    }
    cursor = result.cursor
  } while (cursor)

  return NextResponse.json({ deleted, message: `Deleted ${deleted} files from Vercel Blob.` })
}
