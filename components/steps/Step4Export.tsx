'use client'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import Link from 'next/link'

const FORMATS = [
  { id: 'mp4',  label: 'MP4',  icon: '🎬', desc: 'Best compatibility · H.264',  badge: 'Recommended' },
  { id: 'webm', label: 'WebM', icon: '🌐', desc: 'Web optimized · VP8',          badge: '' },
] as const

const QUALITIES = [
  { id: 'draft',  label: 'Draft',   res: '480p',  icon: '⚡', desc: 'Fast render · smaller file',  color: 'text-zinc-400' },
  { id: 'hd',     label: 'HD',      res: '720p',  icon: '📺', desc: 'Good quality · balanced',      color: 'text-blue-400' },
  { id: 'fullhd', label: 'Full HD', res: '1080p', icon: '🎯', desc: 'Premium quality',              color: 'text-purple-400' },
] as const

const ASPECTS = [
  { id: '16:9', label: '16:9', icon: '🖥',  desc: 'Landscape · YouTube / Desktop' },
  { id: '9:16', label: '9:16', icon: '📱',  desc: 'Portrait · Reels / TikTok / Shorts' },
  { id: '1:1',  label: '1:1',  icon: '⬜',  desc: 'Square · Instagram Feed' },
] as const

const qualityDims: Record<string, { w: number; h: number; fps: number; jpegQ: number; scale: number }> = {
  draft:  { w: 854,  h: 480,  fps: 24, jpegQ: 40, scale: 0.5  },
  hd:     { w: 1280, h: 720,  fps: 24, jpegQ: 60, scale: 0.75 },
  fullhd: { w: 1920, h: 1080, fps: 30, jpegQ: 75, scale: 1    },
}

export default function Step4Export() {
  const store = useStore()
  const abortRef = useRef<AbortController | null>(null)
  const [configured, setConfigured] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const status = store.renderStatus

  const selectedQuality = QUALITIES.find(q => q.id === store.exportQuality) ?? QUALITIES[1]
  const selectedFormat  = FORMATS.find(f => f.id === store.exportFormat)    ?? FORMATS[0]
  const selectedAspect  = ASPECTS.find(a => a.id === store.exportAspect)    ?? ASPECTS[0]

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const startRender = async () => {
    setError('')
    setProgress(0)
    setDownloadUrl(null)
    store.setRenderStatus('processing', 0)

    try {
      // Dynamically import the web renderer — keeps it out of the main bundle
      const { renderMediaOnWeb } = await import('@remotion/web-renderer')

      // Dynamically import the right composition component
      const compositionMap: Record<string, () => Promise<React.ComponentType<Record<string, unknown>>>> = {
        circle:      () => import('@/remotion/compositions/CircleVisualizer').then(m => m.CircleVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        waveform:    () => import('@/remotion/compositions/WaveformVisualizer').then(m => m.WaveformVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        particles:   () => import('@/remotion/compositions/ParticlesVisualizer').then(m => m.ParticlesVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        vinyl:       () => import('@/remotion/compositions/VinylVisualizer').then(m => m.VinylVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        glitch:      () => import('@/remotion/compositions/GlitchVisualizer').then(m => m.GlitchVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        cassette:    () => import('@/remotion/compositions/CassetteVisualizer').then(m => m.CassetteVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        neonplayer:  () => import('@/remotion/compositions/NeonPlayerVisualizer').then(m => m.NeonPlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        appleplayer: () => import('@/remotion/compositions/ApplePlayerVisualizer').then(m => m.ApplePlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        poster:      () => import('@/remotion/compositions/PosterVisualizer').then(m => m.PosterVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        dashboard:   () => import('@/remotion/compositions/DashboardVisualizer').then(m => m.DashboardVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        circular:    () => import('@/remotion/compositions/CircularPlayerVisualizer').then(m => m.CircularPlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        cinematic:   () => import('@/remotion/compositions/CinematicVinylVisualizer').then(m => m.CinematicVinylVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        editorial:   () => import('@/remotion/compositions/EditorialAlbumVisualizer').then(m => m.EditorialAlbumVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        symmetrical: () => import('@/remotion/compositions/SymmetricalVisualizer').then(m => m.SymmetricalVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        retro:       () => import('@/remotion/compositions/RetroPlayerVisualizer').then(m => m.RetroPlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        retro_cassette: () => import('@/remotion/compositions/RetroCassetteVisualizer').then(m => m.RetroCassetteVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        cinematic_vinyl_ui: () => import('@/remotion/compositions/CinematicVinylUIVisualizer').then(m => m.CinematicVinylUIVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        neon_glass:          () => import('@/remotion/compositions/NeonGlassVisualizer').then(m => m.NeonGlassVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
        neumorph_sphere:     () => import('@/remotion/compositions/NeumorphicSphereVisualizer').then(m => m.NeumorphicSphereVisualizer as unknown as React.ComponentType<Record<string, unknown>>),
      }

      const component = await (compositionMap[store.template] ?? compositionMap.circle)()

      const isApple    = store.template === 'appleplayer'
      const isPortrait = isApple || store.template === 'circular'
      const isSquare   = store.template === 'retro'
      const q          = qualityDims[store.exportQuality] ?? qualityDims.hd
      const fps        = q.fps
      const jpegQ      = q.jpegQ
      const renderScale = q.scale

      const aspectMap: Record<string, { w: number; h: number }> = {
        '16:9': { w: q.w, h: q.h },
        '9:16': { w: q.h, h: q.w },
        '1:1':  { w: q.h, h: q.h },
      }
      const effectiveAspect = isSquare ? '1:1' : isPortrait ? '9:16' : store.exportAspect
      const dims = aspectMap[effectiveAspect] ?? aspectMap['16:9']

      const durationInSeconds = store.duration || 30

      // store.audioPath / store.artworkPath are now full Vercel Blob CDN URLs
      // (https://xxxx.public.blob.vercel-storage.com/...). They are served from
      // Vercel's CDN with CORS headers, so the render worker can fetch them even
      // under COOP+COEP cross-origin isolation. Multiple parallel users are safe —
      // each upload goes to its own unique CDN URL, no /tmp race conditions.
      const audioSrc   = store.audioPath   ?? store.audioUrl   ?? ''
      const artworkSrc = store.artworkPath ?? store.artworkUrl ?? ''

      const inputProps = isApple ? {
        audioSrc,
        artworkSrc,
        songTitle:  store.songTitle  || 'Song Title',
        artistName: store.artist     || 'Artist Name',
        labelText:  store.labelText  || 'Now Playing',
        durationInSeconds,
        themeColor: store.themeColor || 'white',
        fontStyle:  store.fontStyle  || 'minimal',
      } : {
        audioSrc,
        artworkSrc,
        lyrics:      store.lyrics,
        accentColor: store.accentColor,
        typoStyle:   store.typoStyle,
        durationInSeconds,
        lyricsFont:  store.lyricsFont,
        effects:     store.effects,
        songTitle:   store.songTitle,
        artistName:  store.artist,
        albumName:   store.labelText || 'Album',
      }

      abortRef.current = new AbortController()

      const container = store.exportFormat === 'webm' ? 'webm' : 'mp4'

      const result = await renderMediaOnWeb({
        composition: {
          id: store.template,
          component,
          durationInFrames: Math.ceil(durationInSeconds * fps),
          fps,
          width:  dims.w,
          height: dims.h,
        },
        inputProps,
        container,
        scale: renderScale,
        onProgress: ({ progress: p }) => {
          const pct = Math.round(p * 100)
          setProgress(pct)
          store.setRenderStatus('processing', pct)
        },
        signal: abortRef.current.signal,
      })

      const blob = await result.getBlob()
      const url  = URL.createObjectURL(blob)
      setDownloadUrl(url)
      store.setRenderStatus('done', 100)
      store.setOutputUrl(url)

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Client render error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      store.setRenderStatus('error')
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    store.setRenderStatus('idle')
    setConfigured(false)
    setProgress(0)
    setDownloadUrl(null)
    setError('')
  }

  /* ── CONFIG SCREEN ── */
  if (!configured && status === 'idle') {
    return (
      <div className="max-w-2xl mx-auto space-y-5 relative px-1 sm:px-0">
      
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Export Settings</h2>
          <p className="text-zinc-400 text-sm mt-1.5 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Video renders in your browser — securely and fast
          </p>
        </div>

        {/* Format */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Format</p>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => store.setExportFormat(f.id as 'mp4' | 'webm')}
                className={`relative p-5 rounded-2xl text-center transition-all duration-300 border ${
                  store.exportFormat === f.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] transform scale-[1.02]'
                    : 'border-white/5 bg-black/20 hover:bg-black/40 hover:border-white/10'
                }`}>
                {f.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold whitespace-nowrap shadow-lg">
                    {f.badge}
                  </span>
                )}
                <div className="text-3xl mb-2 filter drop-shadow-lg">{f.icon}</div>
                <div className={`font-bold text-base mb-0.5 transition-colors ${store.exportFormat === f.id ? 'text-white' : 'text-zinc-300'}`}>{f.label}</div>
                <div className="text-[11px] text-zinc-500">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Quality</p>
          <div className="grid grid-cols-3 gap-3 relative z-10">
            {QUALITIES.map(q => (
              <button key={q.id} onClick={() => store.setExportQuality(q.id as 'draft' | 'hd' | 'fullhd')}
                className={`p-4 rounded-2xl text-center transition-all duration-300 border ${
                  store.exportQuality === q.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] transform scale-[1.02]'
                    : 'border-white/5 bg-black/20 hover:bg-black/40 hover:border-white/10'
                }`}>
                <div className="text-2xl mb-1.5 filter drop-shadow-md">{q.icon}</div>
                <div className={`font-bold text-sm mb-1 ${store.exportQuality === q.id ? 'text-white' : 'text-zinc-200'}`}>{q.label}</div>
                <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/30 inline-block mb-1.5 ${q.color}`}>{q.res}</div>
                <div className="text-[10px] text-zinc-500 leading-tight">{q.desc}</div>
              </button>
            ))}
          </div>
          <div className="relative z-10 mt-4 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
            <span className="text-blue-400 mt-0.5">💡</span>
            <p className="text-xs text-blue-200/70 leading-relaxed">Draft renders fastest for previewing. Full HD may take 5–15 min depending on your device performance and song length.</p>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Aspect Ratio</p>
          <div className="grid grid-cols-3 gap-3 relative z-10">
            {ASPECTS.map(a => (
              <button key={a.id} onClick={() => store.setExportAspect(a.id as '16:9' | '9:16' | '1:1')}
                className={`p-4 rounded-xl text-center transition-all duration-300 border ${
                  store.exportAspect === a.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] transform scale-[1.02]'
                    : 'border-white/5 bg-black/20 hover:bg-black/40 hover:border-white/10'
                }`}>
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className={`font-bold text-sm mb-1 ${store.exportAspect === a.id ? 'text-white' : 'text-zinc-200'}`}>{a.label}</div>
                <div className="text-[10px] text-zinc-500 leading-tight px-2">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary + Render */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-2xl border border-white/20 p-4 sm:p-5 shadow-2xl ring-1 ring-white/5 z-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Settings pills */}
            <div className="flex gap-4 sm:gap-6 flex-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Format</span>
                <span className="text-zinc-100 font-bold text-sm">{selectedFormat.label}</span>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Quality</span>
                <span className={`font-bold text-sm ${selectedQuality.color}`}>{selectedQuality.res}</span>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Aspect</span>
                <span className="text-zinc-100 font-bold text-sm">{selectedAspect.label}</span>
              </div>
            </div>

            {/* Render button */}
            <button
              onClick={() => { setConfigured(true); startRender() }}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2"
            >
              🎬 Render Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── RENDERING / DONE / ERROR ── */
  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] text-center space-y-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

      {status === 'processing' && (
        <div className="w-full max-w-md relative z-10 space-y-8 p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          
          <div>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 text-2xl font-black mb-2">Rendering Web Video</p>
            <p className="text-zinc-400 text-sm">Please keep this tab open — do not navigate away</p>
          </div>
          
          <div className="space-y-3 bg-black/20 p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-end">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Progress</span>
              <span className="text-purple-400 font-mono text-xl font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-3 p-0.5 overflow-hidden ring-1 ring-white/10 inset-shadow-sm">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDQwbDQwLTQwSDB2NDB6TTQwIDBMMCA0MGg0MFYweiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+')] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Format', value: selectedFormat.label, color: 'text-zinc-100' },
              { label: 'Quality',  value: selectedQuality.res, color: selectedQuality.color },
              { label: 'Aspect',   value: selectedAspect.label, color: 'text-zinc-100' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-black/10 border border-white/5">
                <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
                <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          
          <button onClick={reset} className="text-zinc-500 hover:text-red-400 text-sm font-medium transition-colors px-4 py-2 hover:bg-red-500/10 rounded-lg">
            Cancel Render
          </button>
        </div>
      )}

      {status === 'done' && downloadUrl && (
        <div className="space-y-8 w-full max-w-md relative z-10 p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto text-4xl shadow-[0_0_40px_rgba(16,185,129,0.4)] ring-8 ring-emerald-500/20">
            ✅
          </div>
          <div>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 text-3xl font-black mb-2">Video Ready!</p>
            <p className="text-zinc-400 text-sm font-medium bg-black/20 inline-block px-4 py-1.5 rounded-full border border-white/5">
              {selectedFormat.label} • {selectedQuality.res} • {selectedAspect.label}
            </p>
          </div>
          
          <div className="pt-2">
            <a
              href={downloadUrl}
              download={`visualizer_${store.template}_${Date.now()}.${selectedFormat.id}`}
              className="flex items-center justify-center gap-3 w-full py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Video
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={reset} className="py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold transition-all hover:text-white">
              Make Another
            </button>
            <Link href="/" className="py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold transition-all hover:text-white text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6 w-full max-w-md relative z-10 p-8 rounded-3xl bg-red-950/30 backdrop-blur-xl border border-red-500/20 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto text-5xl ring-8 ring-red-500/10">
            ❌
          </div>
          <div>
            <p className="text-red-400 text-2xl font-black mb-2">Render Failed</p>
            <p className="text-zinc-400 text-sm">Something went wrong while rendering your video.</p>
          </div>
          
          {error && (
            <div className="bg-black/40 border border-red-500/30 rounded-xl p-4 text-left max-h-32 overflow-y-auto custom-scrollbar">
              <p className="text-red-300 font-mono text-xs break-words">{error}</p>
            </div>
          )}
          
          <div className="bg-red-500/10 rounded-xl p-4 text-left border border-red-500/20">
            <h4 className="text-red-300 text-xs font-bold uppercase tracking-wider mb-2">Troubleshooting Tips</h4>
            <ul className="text-red-200/70 text-xs space-y-1.5 list-disc list-inside">
              <li>Try switching Quality to Draft</li>
              <li>Ensure audio file is not missing or corrupted</li>
              <li>Refresh page and try again</li>
            </ul>
          </div>
          
          <button onClick={reset} className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            Change Settings & Retry
          </button>
        </div>
      )}
    </div>
  )
}
