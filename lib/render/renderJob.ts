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

const qualityMap: Record<string, { w: number; h: number; crf: number }> = {
  draft:  { w: 854,  h: 480,  crf: 32 },
  hd:     { w: 1280, h: 720,  crf: 26 },
  fullhd: { w: 1920, h: 1080, crf: 22 },
  '4k':   { w: 3840, h: 2160, crf: 18 },
}

function getDims(quality: string, aspect: string, isPortrait: boolean) {
  const q = qualityMap[quality] ?? qualityMap.fullhd
  const aspectMap: Record<string, { w: number; h: number }> = {
    '16:9': { w: q.w, h: q.h },
    '9:16': { w: q.h, h: q.w },
    '1:1':  { w: q.h, h: q.h },
    '4:5':  { w: Math.round(q.h * 4 / 5), h: q.h },
  }
  const effectiveAspect = isPortrait ? '9:16' : (aspect || '16:9')
  return { dims: aspectMap[effectiveAspect] ?? aspectMap['16:9'], crf: q.crf }
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
  const region = (process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || 'us-east-1') as string
  const serveUrl = process.env.REMOTION_SERVE_URL!
  const RAM    = parseInt(process.env.REMOTION_MEMORY_MB  || '2048')
  const DISK   = parseInt(process.env.REMOTION_DISK_MB    || '10240')
  const TIMEOUT = parseInt(process.env.REMOTION_TIMEOUT_S || '240')

  const functionName = speculateFunctionName({ memorySizeInMb: RAM, diskSizeInMb: DISK, timeoutInSeconds: TIMEOUT })

  const compositionId = templateToCompositionId(project.template)
  const isApple   = project.template === 'appleplayer'
  const isPortrait = isApple || project.template === 'circular'

  // On Lambda, media is served via the Next.js API route using the public app URL
  // NOTE: operator precedence fix — NEXT_PUBLIC_APP_URL takes priority, then VERCEL_URL, then localhost
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const audioSrc   = `${appUrl}${project.audioPath}`
  const artworkSrc = `${appUrl}${project.artworkPath}`
  const inputProps = buildInputProps(project, durationInSeconds, audioSrc, artworkSrc)

  const codecMap: Record<string, 'h264' | 'vp8' | 'gif'> = { mp4: 'h264', webm: 'vp8', gif: 'gif' }
  const codec = codecMap[project.exportFormat || 'mp4'] ?? 'h264'
  const ext   = codec === 'vp8' ? 'webm' : codec === 'gif' ? 'gif' : 'mp4'
  const { dims } = getDims(project.exportQuality, project.exportAspect, isPortrait)

  console.log('[Lambda] Starting render:', compositionId, dims, codec)

  const { renderId, bucketName } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: compositionId,
    inputProps,
    codec,
    imageFormat: 'jpeg',
    maxRetries: 1,
    framesPerLambda: 20,
    privacy: 'public',
    outName: `${projectId}.${ext}`,
    downloadBehavior: { type: 'download', fileName: `video.${ext}` },
    width:  dims.w,
    height: dims.h,
    durationInFrames: Math.ceil(durationInSeconds * 30),
    fps: 30,
    chromiumOptions: { disableWebSecurity: true },
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
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'win64', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'linux64', 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'mac-arm64', 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
    path.join(process.cwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'mac-x64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
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
  if (mediaPath.startsWith('/uploads/')) {
    const base = path.resolve(process.cwd(), 'public', 'uploads')
    const resolved = path.resolve(base, mediaPath.slice('/uploads/'.length))
    const rel = path.relative(base, resolved)
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null
    return resolved
  }
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
    const loc = await bundle({ entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'), webpackOverride: c => c })
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

  const audioAbsPath   = resolveMediaAbsolutePath(project.audioPath)
  const artworkAbsPath = resolveMediaAbsolutePath(project.artworkPath)
  if (!audioAbsPath   || !existsSync(audioAbsPath))   throw new Error('Audio file not found: '   + project.audioPath)
  if (!artworkAbsPath || !existsSync(artworkAbsPath)) throw new Error('Artwork file not found: ' + project.artworkPath)

  const toFileUrl = (p: string) => `file:///${p.replace(/\\/g, '/').replace(/^\//, '')}`
  const inputProps = buildInputProps(project, durationInSeconds, toFileUrl(audioAbsPath), toFileUrl(artworkAbsPath))

  const codecMap: Record<string, 'h264' | 'vp8' | 'gif'> = { mp4: 'h264', webm: 'vp8', gif: 'gif' }
  const codec = codecMap[project.exportFormat || 'mp4'] ?? 'h264'
  const ext   = codec === 'vp8' ? 'webm' : codec === 'gif' ? 'gif' : 'mp4'
  const { dims, crf } = getDims(project.exportQuality, project.exportAspect, isPortrait)

  const bundleLocation = await getBundleLocation()
  const composition = await selectComposition({ serveUrl: bundleLocation, id: compositionId, inputProps })

  const outputDir = path.join(process.cwd(), 'public', 'outputs')
  await mkdir(outputDir, { recursive: true })
  const outputLocation = path.join(outputDir, `${projectId}.${ext}`)
  const chromePath = getChromePath()

  console.log('[Render] Local render:', compositionId, dims, codec)

  await renderMedia({
    composition: { ...composition, durationInFrames: Math.ceil(durationInSeconds * 30), width: dims.w, height: dims.h },
    serveUrl: bundleLocation,
    codec,
    outputLocation,
    inputProps,
    concurrency: Math.max(1, require('os').cpus().length - 1),
    ...(codec === 'h264' ? { crf, x264Preset: project.exportQuality === 'draft' ? 'ultrafast' : project.exportQuality === '4k' ? 'slow' : 'medium' } : {}),
    timeoutInMilliseconds: 5 * 60 * 1000,
    chromiumOptions: { disableWebSecurity: true },
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
