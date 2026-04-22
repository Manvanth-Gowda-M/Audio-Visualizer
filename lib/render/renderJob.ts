// @ts-nocheck
// This file uses runtime-only Remotion APIs (Lambda/bundler/renderer) whose type signatures
// change frequently across patch versions. Type-checking is suppressed intentionally.
import path from 'path'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import prisma from '../prisma'
import { MEDIA_API_PATH_REGEX, TMP_UPLOAD_ROOT } from '../media/storage'

/* ─────────────────────────────────────────────
   Helpers shared by both Lambda + local paths
───────────────────────────────────────────── */

function templateToCompositionId(template: string): string {
  const map: Record<string, string> = {
    circle:       'CircleVisualizer',
    waveform:     'WaveformVisualizer',
    particles:    'ParticlesVisualizer',
    vinyl:        'VinylVisualizer',
    glitch:       'GlitchVisualizer',
    cassette:     'CassetteVisualizer',
    neonplayer:   'NeonPlayerVisualizer',
    poster:       'PosterVisualizer',
    dashboard:    'DashboardVisualizer',
    circular:     'CircularPlayerVisualizer',
    appleplayer:  'ApplePlayerVisualizer',
    cinematic:    'CinematicVinylVisualizer',
    editorial:    'EditorialAlbumVisualizer',
    symmetrical:  'SymmetricalVisualizer',
    retro:        'RetroPlayerVisualizer',
    retro_cassette: 'RetroCassetteVisualizer',
    cinematic_vinyl_ui: 'CinematicVinylUIVisualizer',
  }
  return map[template] ?? 'CircleVisualizer'
}

function buildInputProps(project: {
  template: string; audioPath: string; artworkPath: string
  title: string; artist: string; lyrics: string; accentColor: string
  typoStyle: string; fontStyle: string; labelText: string; themeColor: string
  effects: string
}, durationInSeconds: number, audioSrc: string, artworkSrc: string) {
  const isApple = project.template === 'appleplayer'
  if (isApple) {
    return {
      audioSrc,
      artworkSrc,
      songTitle:  project.title,
      artistName: project.artist,
      labelText:  project.labelText || 'Now Playing',
      durationInSeconds,
      themeColor: project.themeColor || 'white',
      fontStyle:  project.fontStyle  || 'minimal',
    }
  }
  return {
    audioSrc,
    artworkSrc,
    lyrics:      JSON.parse(project.lyrics || '[]'),
    accentColor: project.accentColor,
    typoStyle:   project.typoStyle,
    durationInSeconds,
    lyricsFont:  project.fontStyle || 'inter',
    effects:     JSON.parse(project.effects || '[]'),
    songTitle:   project.title,
    artistName:  project.artist,
    albumName:   project.labelText || 'Album',
  }
}

const qualityMap: Record<string, { w: number; h: number; crf: number; preset: string; jpegQ: number }> = {
  draft:  { w: 854,  h: 480,  crf: 36, preset: 'ultrafast', jpegQ: 40 },
  hd:     { w: 1280, h: 720,  crf: 28, preset: 'superfast', jpegQ: 60 },
  fullhd: { w: 1920, h: 1080, crf: 24, preset: 'veryfast',  jpegQ: 75 },
  '4k':   { w: 3840, h: 2160, crf: 20, preset: 'fast',      jpegQ: 85 },
}

function getDims(quality: string, aspect: string, isPortrait: boolean, isSquare?: boolean) {
  const q = qualityMap[quality] ?? qualityMap.fullhd
  const aspectMap: Record<string, { w: number; h: number }> = {
    '16:9': { w: q.w, h: q.h },
    '9:16': { w: q.h, h: q.w },
    '1:1':  { w: q.h, h: q.h },
    '4:5':  { w: Math.round(q.h * 4 / 5), h: q.h },
  }
  const effectiveAspect = isSquare ? '1:1' : isPortrait ? '9:16' : (aspect || '16:9')
  return { dims: aspectMap[effectiveAspect] ?? aspectMap['16:9'], crf: q.crf, preset: q.preset, jpegQ: q.jpegQ }
}

/* ─────────────────────────────────────────────
   LAMBDA render (used on Vercel / production)
───────────────────────────────────────────── */

async function startLambdaRender(projectId: string, durationInSeconds: number) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error('Project not found')

  // webpackIgnore tells both Webpack and Turbopack to skip bundling this import.
  // @remotion/lambda/client is only needed at runtime when Lambda is configured
  // via REMOTION_SERVE_URL. It is never called during the Vercel build.
  // @ts-ignore – package intentionally absent from deps; only used at runtime via Lambda config
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  const { renderMediaOnLambda, getRenderProgress, speculateFunctionName } =
    // @ts-ignore
    await import(/* webpackIgnore: true */ '@remotion/lambda/client')

  // Cast as string — AwsRegion is a string union; avoids another @remotion/lambda type resolution
  // Cast to `any` so TypeScript accepts it as AwsRegion without importing the type
  // (importing AwsRegion from @remotion/lambda would break the build — it's not in deps)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const region = (process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || 'us-east-1') as any
  const serveUrl = process.env.REMOTION_SERVE_URL!
  const RAM    = parseInt(process.env.REMOTION_MEMORY_MB  || '2048')
  const DISK   = parseInt(process.env.REMOTION_DISK_MB    || '10240')
  const TIMEOUT = parseInt(process.env.REMOTION_TIMEOUT_S || '240')

  const functionName = speculateFunctionName({ memorySizeInMb: RAM, diskSizeInMb: DISK, timeoutInSeconds: TIMEOUT })

  const compositionId = templateToCompositionId(project.template)
  const isApple    = project.template === 'appleplayer'
  const isPortrait = isApple || project.template === 'circular'
  const isSquare   = project.template === 'retro'

  // audioPath / artworkPath are now full Vercel Blob CDN URLs (https://...).
  // No need to prepend appUrl — they are already absolute. Fall back to constructing
  // an absolute URL from the /api/uploads/ path for backward-compat with any old projects.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const toAbsolute = (p: string) =>
    p.startsWith('http://') || p.startsWith('https://') ? p : `${appUrl}${p}`

  const audioSrc   = toAbsolute(project.audioPath)
  const artworkSrc = toAbsolute(project.artworkPath)
  const inputProps = buildInputProps(project, durationInSeconds, audioSrc, artworkSrc)

  const codecMap: Record<string, 'h264' | 'vp8' | 'gif'> = { mp4: 'h264', webm: 'vp8', gif: 'gif' }
  const codec = codecMap[project.exportFormat || 'mp4'] ?? 'h264'
  const ext   = codec === 'vp8' ? 'webm' : codec === 'gif' ? 'gif' : 'mp4'
  const { dims } = getDims(project.exportQuality, project.exportAspect, isPortrait, isSquare)

  console.log('[Lambda] Starting render:', compositionId, dims, codec)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { renderId, bucketName } = await (renderMediaOnLambda as any)({
    region,
    functionName,
    serveUrl,
    composition: compositionId,
    inputProps,
    codec,
    imageFormat: 'jpeg',
    jpegQuality: getDims(project.exportQuality, project.exportAspect, isPortrait, isSquare).jpegQ,
    maxRetries: 1,
    framesPerLambda: 60,
    privacy: 'public',
    outName: `${projectId}.${ext}`,
    downloadBehavior: { type: 'download', fileName: `video.${ext}` },
    width:  dims.w,
    height: dims.h,
    durationInFrames: Math.ceil(durationInSeconds * 30),
    fps: 30,
    chromiumOptions: { disableWebSecurity: true, gl: 'angle' },
  })

  console.log('[Lambda] Render started, renderId:', renderId)

  // Poll until done
  while (true) {
    await new Promise(r => setTimeout(r, 3000))
    const progress = await getRenderProgress({ renderId, bucketName, functionName, region })

    if (progress.fatalErrorEncountered) {
      throw new Error(progress.errors?.[0]?.message || 'Lambda render failed')
    }

    const pct = Math.round((progress.overallProgress ?? 0) * 100)
    console.log(`[Lambda] ${pct}%`)

    await prisma.project.update({
      where: { id: projectId },
      data: { renderStatus: 'processing' },
    }).catch(() => {})

    if (progress.done) {
      const outputUrl = progress.outputFile ?? ''
      console.log('[Lambda] Done:', outputUrl)

      await prisma.project.update({
        where: { id: projectId },
        data: { renderStatus: 'done', outputPath: outputUrl },
      })
      return outputUrl
    }
  }
}

/* ─────────────────────────────────────────────
   LOCAL render (used in dev / non-Vercel)
───────────────────────────────────────────── */

let cachedBundleLocation: string | null = null
let bundleInProgress: Promise<string> | null = null
let ffmpegWired = false

function getChromePath(): string | undefined {
  const candidates = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'win64', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'linux64', 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'mac-arm64', 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'mac-x64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]
  return candidates.find(p => existsSync(p))
}

function wireStaticFfmpegBinaries() {
  if (ffmpegWired) return
  const prependToPath = (binaryPath: string | null | undefined, toolName: 'ffmpeg' | 'ffprobe') => {
    if (!binaryPath || !existsSync(binaryPath)) return false
    const binDir = path.dirname(binaryPath)
    const delimiter = process.platform === 'win32' ? ';' : ':'
    const cur = process.env.PATH || ''
    if (!cur.split(delimiter).includes(binDir)) process.env.PATH = `${binDir}${delimiter}${cur}`
    if (toolName === 'ffmpeg') { process.env.FFMPEG_PATH = binaryPath; process.env.FFMPEG_BINARY = binaryPath }
    else { process.env.FFPROBE_PATH = binaryPath; process.env.FFPROBE_BINARY = binaryPath }
    return true
  }
  let ffmpegPath: string | null | undefined
  let ffprobePath: string | null | undefined
  try { ffmpegPath = require('ffmpeg-static') as string | null } catch {}
  try { ffprobePath = (require('ffprobe-static') as { path?: string }).path } catch {}
  const ok = prependToPath(ffmpegPath, 'ffmpeg') && prependToPath(ffprobePath, 'ffprobe')
  if (ok) console.log('[Render] Using bundled ffmpeg + ffprobe')
  else console.warn('[Render] Falling back to system ffmpeg/ffprobe')
  ffmpegWired = true
}

function resolveMediaAbsolutePath(mediaPath: string): string | null {
  // If it's already a full HTTPS URL (Vercel Blob CDN), pass it through — the local
  // renderer will fetch it over the network just like the Lambda renderer does.
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath
  }
  if (mediaPath.startsWith('/uploads/')) {
    const base = path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'public', 'uploads')
    const resolved = path.resolve(base, mediaPath.slice('/uploads/'.length))
    const rel = path.relative(base, resolved)
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null
    return resolved
  }
  // Legacy: /api/uploads/kind/filename → /tmp path (dev-only fallback)
  const m = mediaPath.match(MEDIA_API_PATH_REGEX)
  if (m) return path.join(TMP_UPLOAD_ROOT, m[1], path.basename(m[2]))
  return null
}

async function getBundleLocation(): Promise<string> {
  if (cachedBundleLocation) return cachedBundleLocation
  if (bundleInProgress) return bundleInProgress
  bundleInProgress = (async () => {
    console.log('[Bundle] Bundling Remotion...')
    const { bundle } = await import('@remotion/bundler')
    const loc = await bundle({ entryPoint: path.join(/*turbopackIgnore: true*/ process.cwd(), 'remotion', 'Root.tsx'), webpackOverride: c => c })
    console.log('[Bundle] Done:', loc)
    cachedBundleLocation = loc
    bundleInProgress = null
    return loc
  })()
  return bundleInProgress
}

export function prewarmBundle() {
  if (!isLambdaMode()) getBundleLocation().catch(() => {})
}

async function startLocalRender(projectId: string, durationInSeconds: number) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error('Project not found')

  const { renderMedia, selectComposition } = await import('@remotion/renderer')
  wireStaticFfmpegBinaries()

  const compositionId = templateToCompositionId(project.template)
  const isApple    = project.template === 'appleplayer'
  const isPortrait = isApple || project.template === 'circular'
  const isSquare   = project.template === 'retro'

  const audioAbsPath   = resolveMediaAbsolutePath(project.audioPath)
  const artworkAbsPath = resolveMediaAbsolutePath(project.artworkPath)
  if (!audioAbsPath   || !existsSync(audioAbsPath))   throw new Error('Audio file not found: '   + project.audioPath)
  if (!artworkAbsPath || !existsSync(artworkAbsPath)) throw new Error('Artwork file not found: ' + project.artworkPath)

  const toFileUrl = (p: string) => `file:///${p.replace(/\\/g, '/').replace(/^\//, '')}`
  const inputProps = buildInputProps(project, durationInSeconds, toFileUrl(audioAbsPath), toFileUrl(artworkAbsPath))

  const codecMap: Record<string, 'h264' | 'vp8' | 'gif'> = { mp4: 'h264', webm: 'vp8', gif: 'gif' }
  const codec = codecMap[project.exportFormat || 'mp4'] ?? 'h264'
  const ext   = codec === 'vp8' ? 'webm' : codec === 'gif' ? 'gif' : 'mp4'
  const { dims, crf, preset, jpegQ } = getDims(project.exportQuality, project.exportAspect, isPortrait, isSquare)

  const bundleLocation = await getBundleLocation()
  const composition = await selectComposition({ serveUrl: bundleLocation, id: compositionId, inputProps })

  const outputDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'outputs')
  await mkdir(outputDir, { recursive: true })
  const outputLocation = path.join(outputDir, `${projectId}.${ext}`)
  const chromePath = getChromePath()

  // Use ALL available cores — Remotion spawns separate browser tabs per frame chunk
  const cpuCount = require('os').cpus().length
  const concurrency = Math.max(2, cpuCount)

  // Timeout scaled by quality: draft = 3 min, hd = 5 min, fullhd = 8 min, 4k = 15 min
  const timeoutMap: Record<string, number> = { draft: 3, hd: 5, fullhd: 8, '4k': 15 }
  const timeoutMin = timeoutMap[project.exportQuality] ?? 8

  console.log(`[Render] Local render: ${compositionId} ${dims.w}x${dims.h} ${codec} preset=${preset} crf=${crf} concurrency=${concurrency}`)

  await renderMedia({
    composition: { ...composition, durationInFrames: Math.ceil(durationInSeconds * 30), width: dims.w, height: dims.h },
    serveUrl: bundleLocation,
    codec,
    outputLocation,
    inputProps,
    concurrency,
    imageFormat: 'jpeg',
    jpegQuality: jpegQ,
    ...(codec === 'h264' ? { crf, x264Preset: preset } : {}),
    timeoutInMilliseconds: timeoutMin * 60 * 1000,
    chromiumOptions: { disableWebSecurity: true, gl: 'angle' },
    ...(chromePath ? { browserExecutable: chromePath } : {}),
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100)
      if (pct % 5 === 0) console.log(`[Render] ${pct}%`)
    },
  })

  try { await prisma.$connect() } catch {}
  await prisma.project.update({ where: { id: projectId }, data: { renderStatus: 'done', outputPath: `/outputs/${projectId}.${ext}` } })
  return `/outputs/${projectId}.${ext}`
}

/* ─────────────────────────────────────────────
   Public entry point
───────────────────────────────────────────── */

function isLambdaMode() {
  return !!(process.env.REMOTION_SERVE_URL && (process.env.REMOTION_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID))
}

export async function startRenderJob(projectId: string, durationInSeconds = 210) {
  await prisma.project.update({ where: { id: projectId }, data: { renderStatus: 'processing' } })
  try {
    if (isLambdaMode()) {
      console.log('[Render] Using Lambda mode')
      return await startLambdaRender(projectId, durationInSeconds)
    } else {
      console.log('[Render] Using local mode')
      return await startLocalRender(projectId, durationInSeconds)
    }
  } catch (err) {
    console.error('[Render] Job failed:', err)
    await prisma.project.update({ where: { id: projectId }, data: { renderStatus: 'error' } }).catch(() => {})
    throw err
  }
}
