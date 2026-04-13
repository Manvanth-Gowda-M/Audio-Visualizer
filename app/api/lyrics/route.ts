import { NextRequest, NextResponse } from 'next/server'
import { fetchLyrics } from '@/lib/lyrics/pipeline'

export async function POST(req: NextRequest) {
  try {
    const { title, artist, duration } = await req.json()
    const result = await fetchLyrics(title || '', artist || '', duration || 210)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Lyrics error:', err)
    return NextResponse.json({ lyrics: [], source: 'manual' })
  }
}
