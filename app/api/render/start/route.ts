import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audioPath, artworkPath, lyrics, template, typoStyle, accentColor, duration } = body

    const project = await prisma.project.create({
      data: {
        audioPath,
        artworkPath,
        lyrics: JSON.stringify(lyrics || []),
        template: template || 'circle',
        typoStyle: typoStyle || 'minimal',
        accentColor: accentColor || '#a855f7',
        renderStatus: 'queued',
      },
    })

    // Kick off render in background
    void import('@/lib/render/renderJob').then(({ startRenderJob }) =>
      startRenderJob(project.id, duration || 210).catch(console.error)
    )

    return NextResponse.json({ projectId: project.id })
  } catch (err) {
    console.error('Render start error:', err)
    return NextResponse.json({ error: 'Failed to start render' }, { status: 500 })
  }
}
