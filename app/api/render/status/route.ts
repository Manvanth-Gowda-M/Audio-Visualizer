import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      status: project.renderStatus,
      outputPath: project.outputPath,
    })
  } catch (err) {
    console.error('Status error:', err)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
