import path from 'path'
import { mkdir } from 'fs/promises'
import prisma from '../prisma'

export async function startRenderJob(projectId: string, durationInSeconds = 210) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error('Project not found')

  await prisma.project.update({
    where: { id: projectId },
    data: { renderStatus: 'processing' },
  })

  try {
    const { bundle } = await import('@remotion/bundler')
    const { renderMedia, selectComposition } = await import('@remotion/renderer')

    const compositionId =
      project.template === 'circle'
        ? 'CircleVisualizer'
        : project.template === 'waveform'
        ? 'WaveformVisualizer'
        : 'ParticlesVisualizer'

    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'),
      webpackOverride: (config) => config,
    })

    const inputProps = {
      audioSrc: project.audioPath,
      artworkSrc: project.artworkPath,
      lyrics: JSON.parse(project.lyrics),
      accentColor: project.accentColor,
      typoStyle: project.typoStyle,
      durationInSeconds,
    }

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    })

    const outputDir = path.join(process.cwd(), 'public', 'outputs')
    await mkdir(outputDir, { recursive: true })
    const outputLocation = path.join(outputDir, `${projectId}.mp4`)

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { renderStatus: 'done', outputPath: `/outputs/${projectId}.mp4` },
    })

    return `/outputs/${projectId}.mp4`
  } catch (err) {
    console.error('Render job failed:', err)
    await prisma.project.update({
      where: { id: projectId },
      data: { renderStatus: 'error' },
    })
    throw err
  }
}
