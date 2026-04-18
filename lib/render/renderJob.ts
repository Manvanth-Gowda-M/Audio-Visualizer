import path from 'path'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import prisma from '../prisma'
import { MEDIA_API_PATH_REGEX, TMP_UPLOAD_ROOT } from '../media/storage'

/* ── Resolve Chrome path — use cached download, never re-download ── */
function getChromePath(): string | undefined {
  const candidates = [
    // Remotion's own cached download
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'win64', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'linux64', 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'mac-arm64', 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'mac-x64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
    // System Chrome fallbacks
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]
  return candidates.find(p => existsSync(p))
}

/* ── Bundle cache — reuse across renders instead of re-bundling every time ── */
let cachedBundleLocation: string | null = null
let bundleInProgress: Promise<string> | null = null
let ffmpegWired = false

function wireStaticFfmpegBinaries() {
  if (ffmpegWired) return
  const prependToPath = (binaryPath: string | null | undefined, toolName: 'ffmpeg' | 'ffprobe') => {
    if (!binaryPath || !existsSync(binaryPath)) return false
    const binDir = path.dirname(binaryPath)
    const pathDelimiter = process.platform === 'win32' ? ';' : ':'
    const currentPath = process.env.PATH || ''
    const alreadyIncluded = currentPath.split(pathDelimiter).includes(binDir)
    if (!alreadyIncluded) {
      process.env.PATH = `${binDir}${pathDelimiter}${currentPath}`
    }
    if (toolName === 'ffmpeg') {
      process.env.FFMPEG_PATH = binaryPath
      process.env.FFMPEG_BINARY = binaryPath
    } else {
      process.env.FFPROBE_PATH = binaryPath
      process.env.FFPROBE_BINARY = binaryPath
    }
    return true
  }

  let ffmpegPath: string | null | undefined
  let ffprobePath: string | null | undefined

  try {
    // ffmpeg-static is CommonJS-only and returns a string path.
    ffmpegPath = require('ffmpeg-static') as string | null
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Render] Failed to load ffmpeg-static package:', message)
  }
  try {
    ffprobePath = (require('ffprobe-static') as { path?: string }).path
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[Render] Failed to load ffprobe-static package:', message)
  }

  const ffmpegReady = prependToPath(ffmpegPath, 'ffmpeg')
  const ffprobeReady = prependToPath(ffprobePath, 'ffprobe')

  if (ffmpegReady && ffprobeReady) {
    console.log('[Render] Using bundled ffmpeg + ffprobe binaries')
  } else {
    console.warn('[Render] Bundled ffmpeg/ffprobe not fully available, falling back to system PATH')
  }
  ffmpegWired = true
}

function resolveMediaAbsolutePath(mediaPath: string): string | null {
  // Backward compatibility: existing projects may still reference legacy /uploads/* paths.
  if (mediaPath.startsWith('/uploads/')) {
    const relativePath = mediaPath.slice('/uploads/'.length)
    const uploadsBaseDir = path.resolve(process.cwd(), 'public', 'uploads')
    const resolvedPath = path.resolve(uploadsBaseDir, relativePath)
    const relativeFromBase = path.relative(uploadsBaseDir, resolvedPath)
    if (relativeFromBase.startsWith('..') || path.isAbsolute(relativeFromBase)) return null
    return resolvedPath
  }

  const apiMatch = mediaPath.match(MEDIA_API_PATH_REGEX)
  if (apiMatch) {
    const [, kind, filename] = apiMatch
    const safeFilename = path.basename(filename)
    return path.join(TMP_UPLOAD_ROOT, kind, safeFilename)
  }

  return null
}

async function getBundleLocation(): Promise<string> {
  // Return cached bundle if available
  if (cachedBundleLocation) return cachedBundleLocation

  // If a bundle is already in progress, wait for it
  if (bundleInProgress) return bundleInProgress

  bundleInProgress = (async () => {
    console.log('[Bundle] Starting Remotion bundle...')
    const { bundle } = await import('@remotion/bundler')
    const loc = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'),
      webpackOverride: (config) => config,
    })
    console.log('[Bundle] Done:', loc)
    cachedBundleLocation = loc
    bundleInProgress = null
    return loc
  })()

  return bundleInProgress
}

/* ── Pre-warm the bundle on server start (call this once) ── */
export function prewarmBundle() {
  getBundleLocation().catch(() => {})
}

export async function startRenderJob(projectId: string, durationInSeconds = 210) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error('Project not found')

  await prisma.project.update({
    where: { id: projectId },
    data: { renderStatus: 'processing' },
  })

  try {
    const { renderMedia, selectComposition } = await import('@remotion/renderer')
    wireStaticFfmpegBinaries()

    const compositionId =
      project.template === 'circle'     ? 'CircleVisualizer'
      : project.template === 'waveform' ? 'WaveformVisualizer'
      : project.template === 'particles'? 'ParticlesVisualizer'
      : project.template === 'vinyl'    ? 'VinylVisualizer'
      : project.template === 'glitch'   ? 'GlitchVisualizer'
      : project.template === 'cassette' ? 'CassetteVisualizer'
      : project.template === 'neonplayer'? 'NeonPlayerVisualizer'
      : project.template === 'poster'   ? 'PosterVisualizer'
      : project.template === 'dashboard'? 'DashboardVisualizer'
      : project.template === 'circular' ? 'CircularPlayerVisualizer'
      : 'ApplePlayerVisualizer'

    // Use cached bundle — massive speedup
    const bundleLocation = await getBundleLocation()

    const isApple    = project.template === 'appleplayer'
    const isPortrait = isApple || project.template === 'circular'

    // Verify files exist before starting render
    const { existsSync: fileExists } = await import('fs')
    const ensureMediaFile = (mediaPath: string, label: 'audio' | 'artwork') => {
      const absPath = resolveMediaAbsolutePath(mediaPath)
      if (!absPath) {
        throw new Error(`Invalid or unsupported ${label} path format: ${mediaPath}`)
      }
      if (!fileExists(absPath)) {
        throw new Error(`${label === 'audio' ? 'Audio' : 'Artwork'} file not found: ${absPath}`)
      }
      return absPath
    }

    const audioAbsPath = ensureMediaFile(project.audioPath, 'audio')
    const artworkAbsPath = ensureMediaFile(project.artworkPath, 'artwork')

    // Use file:// URLs so Remotion reads directly from disk — works in both
    // local dev and serverless environments where localhost is not available.
    const toFileUrl = (absPath: string) =>
      `file:///${absPath.replace(/\\/g, '/').replace(/^\//, '')}`

    const audioSrc   = toFileUrl(audioAbsPath)
    const artworkSrc = toFileUrl(artworkAbsPath)

    console.log('[Render] Audio:', audioAbsPath)
    console.log('[Render] Artwork:', artworkAbsPath)
    console.log('[Render] Template:', project.template, '→', compositionId)

    const inputProps = isApple ? {
      audioSrc,
      artworkSrc,
      songTitle:  project.title,
      artistName: project.artist,
      labelText:  project.labelText || 'Now Playing',
      durationInSeconds,
      themeColor: project.themeColor || 'white',
      fontStyle:  project.fontStyle  || 'minimal',
    } : {
      audioSrc,
      artworkSrc,
      lyrics:     JSON.parse(project.lyrics),
      accentColor: project.accentColor,
      typoStyle:  project.typoStyle,
      durationInSeconds,
      lyricsFont: project.fontStyle || 'inter',
      effects:    JSON.parse(project.effects || '[]'),
      songTitle:  project.title,
      artistName: project.artist,
      albumName:  project.labelText || 'Album',
    }

    // Quality → resolution + CRF
    const qualityMap: Record<string, { w: number; h: number; crf: number }> = {
      draft:  { w: 854,  h: 480,  crf: 32 },
      hd:     { w: 1280, h: 720,  crf: 26 },
      fullhd: { w: 1920, h: 1080, crf: 22 },
      '4k':   { w: 3840, h: 2160, crf: 18 },
    }
    const q = qualityMap[project.exportQuality || 'fullhd'] ?? qualityMap.fullhd

    const aspectMap: Record<string, { w: number; h: number }> = {
      '16:9': { w: q.w, h: q.h },
      '9:16': { w: q.h, h: q.w },
      '1:1':  { w: q.h, h: q.h },
      '4:5':  { w: Math.round(q.h * 4 / 5), h: q.h },
    }
    // Portrait templates always render 9:16 regardless of export aspect setting
    const defaultAspect = isPortrait ? '9:16' : (project.exportAspect || '16:9')
    const dims = aspectMap[defaultAspect] ?? aspectMap['16:9']

    const codecMap: Record<string, 'h264' | 'vp8' | 'gif'> = {
      mp4: 'h264', webm: 'vp8', gif: 'gif',
    }
    const codec = codecMap[project.exportFormat || 'mp4'] ?? 'h264'
    const ext   = codec === 'vp8' ? 'webm' : codec === 'gif' ? 'gif' : 'mp4'

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
    })

    const outputDir = path.join(process.cwd(), 'public', 'outputs')
    await mkdir(outputDir, { recursive: true })
    const outputLocation = path.join(outputDir, `${projectId}.${ext}`)

    const chromePath = getChromePath()
    console.log('[Render] Chrome:', chromePath ?? 'auto-detect')
    console.log('[Render] Output:', outputLocation)
    console.log('[Render] Frames:', Math.ceil(durationInSeconds * 30), 'at', dims.w, 'x', dims.h)

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: Math.ceil(durationInSeconds * 30),
        width:  dims.w,
        height: dims.h,
      },
      serveUrl:     bundleLocation,
      codec,
      outputLocation,
      inputProps,
      concurrency:  Math.max(1, require('os').cpus().length - 1),
      ...(codec === 'h264' ? {
        crf: q.crf,
        x264Preset: project.exportQuality === 'draft'  ? 'ultrafast'
          : project.exportQuality === 'hd'             ? 'faster'
          : project.exportQuality === '4k'             ? 'slow'
          : 'medium',
      } : {}),
      timeoutInMilliseconds: 5 * 60 * 1000,
      chromiumOptions: {
        disableWebSecurity: true,
      },
      ...(chromePath ? { browserExecutable: chromePath } : {}),
      onProgress: ({ progress }) => {
        const pct = Math.round(progress * 100)
        if (pct % 5 === 0) console.log(`[Render] ${pct}%`)
      },
    })

    console.log('[Render] Encoding done, updating DB...')

    // Reconnect prisma in case connection dropped during long render
    try {
      await prisma.$connect()
    } catch {}

    await prisma.project.update({
      where: { id: projectId },
      data: { renderStatus: 'done', outputPath: `/outputs/${projectId}.${ext}` },
    })

    console.log('[Render] DB updated → done')

    return `/outputs/${projectId}.${ext}`
  } catch (err) {
    console.error('Render job failed:', err)
    await prisma.project.update({
      where: { id: projectId },
      data: { renderStatus: 'error' },
    })
    throw err
  }
}
