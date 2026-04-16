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
        : project.template === 'particles'
        ? 'ParticlesVisualizer'
        : project.template === 'vinyl'
        ? 'VinylVisualizer'
        : project.template === 'glitch'
        ? 'GlitchVisualizer'
        : project.template === 'cassette'
        ? 'CassetteVisualizer'
        : project.template === 'neonplayer'
        ? 'NeonPlayerVisualizer'
        : 'ApplePlayerVisualizer'

    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'),
      webpackOverride: (config) => config,
    })

    const isApple = project.template === 'appleplayer'
    const inputProps = isApple ? {
      audioSrc: `http://localhost:${process.env.PORT || 3000}${project.audioPath}`,
      artworkSrc: `http://localhost:${process.env.PORT || 3000}${project.artworkPath}`,
      songTitle: project.title,
      artistName: project.artist,
      labelText: project.labelText || 'Now Playing',
      durationInSeconds,
      themeColor: project.themeColor || 'white',
      fontStyle: project.fontStyle || 'minimal',
    } : {
      audioSrc: `http://localhost:${process.env.PORT || 3000}${project.audioPath}`,
      artworkSrc: `http://localhost:${process.env.PORT || 3000}${project.artworkPath}`,
      lyrics: JSON.parse(project.lyrics),
      accentColor: project.accentColor,
      typoStyle: project.typoStyle,
      durationInSeconds,
      lyricsFont: project.fontStyle || 'inter',
      effects: JSON.parse(project.effects || '[]'),
    }

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    })

    // Override durationInFrames with actual song duration
    const actualDurationInFrames = Math.ceil(durationInSeconds * 30)

    // Quality → resolution map
    const qualityMap: Record<string, { w: number; h: number; crf: number }> = {
      draft:  { w: 854,  h: 480,  crf: 28 },
      hd:     { w: 1280, h: 720,  crf: 23 },
      fullhd: { w: 1920, h: 1080, crf: 18 },
      '4k':   { w: 3840, h: 2160, crf: 16 },
    }
    const q = qualityMap[project.exportQuality || 'fullhd'] ?? qualityMap.fullhd

    // Aspect ratio → composition dimensions
    const aspectMap: Record<string, { w: number; h: number }> = {
      '16:9': { w: q.w, h: q.h },
      '9:16': { w: q.h, h: q.w },
      '1:1':  { w: q.h, h: q.h },
      '4:5':  { w: Math.round(q.h * 4/5), h: q.h },
    }
    const dims = aspectMap[project.exportAspect || '16:9'] ?? aspectMap['16:9']

    // Format → codec map
    const codecMap: Record<string, 'h264' | 'vp8' | 'gif'> = {
      mp4:  'h264',
      webm: 'vp8',
      gif:  'gif',
    }
    const codec = codecMap[project.exportFormat || 'mp4'] ?? 'h264'
    const ext   = project.exportFormat === 'webm' ? 'webm' : project.exportFormat === 'gif' ? 'gif' : 'mp4'

    const outputDir = path.join(process.cwd(), 'public', 'outputs')
    await mkdir(outputDir, { recursive: true })
    const outputLocation = path.join(outputDir, `${projectId}.${ext}`)

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: actualDurationInFrames,
        width: dims.w,
        height: dims.h,
      },
      serveUrl: bundleLocation,
      codec,
      outputLocation,
      inputProps,
      ...(codec === 'h264' ? { crf: q.crf } : {}),
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { renderStatus: 'done', outputPath: `/outputs/${projectId}.${ext}` },
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
