import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audioPath, artworkPath, lyrics, template, typoStyle, accentColor, duration, labelText, themeColor, fontStyle } = body

    const project = await prisma.project.create({
      data: {
        audioPath,
        artworkPath,
        lyrics: JSON.stringify(lyrics || []),
        template: template || 'circle',
        typoStyle: typoStyle || 'minimal',
        accentColor: accentColor || '#a855f7',
        labelText: labelText || 'Now Playing',
        themeColor: themeColor || 'white',
        fontStyle: fontStyle || 'minimal',
        effects: JSON.stringify(body.effects || []),
        exportFormat:  body.exportFormat  || 'mp4',
        exportQuality: body.exportQuality || 'fullhd',
        exportAspect:  body.exportAspect  || '16:9',
        renderStatus: 'queued',
      },
    })

    // Kick off render in background — pass actual duration
    const actualDuration = duration && duration > 0 ? duration : 210
    void import('@/lib/render/renderJob').then(({ startRenderJob }) =>
      startRenderJob(project.id, actualDuration).catch(console.error)
    )

    return NextResponse.json({ projectId: project.id })
  } catch (err) {
    console.error('Render start error:', err)
    return NextResponse.json({ error: 'Failed to start render' }, { status: 500 })
  }
}
