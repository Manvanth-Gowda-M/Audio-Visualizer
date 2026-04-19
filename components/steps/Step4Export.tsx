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

const qualityDims: Record<string, { w: number; h: number }> = {
  draft:  { w: 854,  h: 480  },
  hd:     { w: 1280, h: 720  },
  fullhd: { w: 1920, h: 1080 },
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
      }

      const component = await (compositionMap[store.template] ?? compositionMap.circle)()

      const isApple    = store.template === 'appleplayer'
      const isPortrait = isApple || store.template === 'circular'
      const q = qualityDims[store.exportQuality] ?? qualityDims.hd

      const aspectMap: Record<string, { w: number; h: number }> = {
        '16:9': { w: q.w, h: q.h },
        '9:16': { w: q.h, h: q.w },
        '1:1':  { w: q.h, h: q.h },
      }
      const effectiveAspect = isPortrait ? '9:16' : store.exportAspect
      const dims = aspectMap[effectiveAspect] ?? aspectMap['16:9']

      const durationInSeconds = store.duration || 30
      const fps = 30

      // Use blob URLs — the audio/artwork are already in browser memory from the upload step.
      // These work fine in the Remotion render worker once COOP/COEP headers are set
      // (SharedArrayBuffer enabled), since blob: URLs are same-origin and need no CORP header.
      // Avoid using /api/uploads paths on Vercel: the /tmp filesystem is ephemeral
      // and may 404 on a different serverless function instance.
      const audioSrc   = store.audioUrl   ?? ''
      const artworkSrc = store.artworkUrl ?? ''

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-zinc-100">Export Settings</h2>
          <p className="text-zinc-500 text-sm mt-1">Video renders in your browser — no upload needed</p>
        </div>

        {/* Format */}
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Format</p>
          <div className="grid grid-cols-2 gap-3">
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => store.setExportFormat(f.id as 'mp4' | 'webm')}
                className={`relative p-4 rounded-xl text-center transition-all border ${
                  store.exportFormat === f.id
                    ? 'border-purple-500/60 bg-purple-600/15'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}>
                {f.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-semibold whitespace-nowrap">
                    {f.badge}
                  </span>
                )}
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className={`font-bold text-sm ${store.exportFormat === f.id ? 'text-purple-300' : 'text-zinc-200'}`}>{f.label}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Quality</p>
          <div className="grid grid-cols-3 gap-3">
            {QUALITIES.map(q => (
              <button key={q.id} onClick={() => store.setExportQuality(q.id as 'draft' | 'hd' | 'fullhd')}
                className={`p-3 rounded-xl text-center transition-all border ${
                  store.exportQuality === q.id
                    ? 'border-purple-500/60 bg-purple-600/15'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}>
                <div className="text-xl mb-1">{q.icon}</div>
                <div className={`font-bold text-sm ${store.exportQuality === q.id ? 'text-purple-300' : 'text-zinc-200'}`}>{q.label}</div>
                <div className={`text-xs font-mono font-bold ${q.color}`}>{q.res}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5 leading-tight">{q.desc}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-3">💡 Draft renders fastest. Full HD may take 5–15 min depending on song length.</p>
        </div>

        {/* Aspect Ratio */}
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Aspect Ratio</p>
          <div className="grid grid-cols-3 gap-3">
            {ASPECTS.map(a => (
              <button key={a.id} onClick={() => store.setExportAspect(a.id as '16:9' | '9:16' | '1:1')}
                className={`p-3 rounded-xl text-center transition-all border ${
                  store.exportAspect === a.id
                    ? 'border-purple-500/60 bg-purple-600/15'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}>
                <div className="text-xl mb-1">{a.icon}</div>
                <div className={`font-bold text-sm ${store.exportAspect === a.id ? 'text-purple-300' : 'text-zinc-200'}`}>{a.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4 flex items-center gap-4">
          <div className="flex-1 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-zinc-100 font-bold text-sm">{selectedFormat.label}</div>
              <div className="text-zinc-600 text-xs">Format</div>
            </div>
            <div>
              <div className={`font-bold text-sm ${selectedQuality.color}`}>{selectedQuality.res}</div>
              <div className="text-zinc-600 text-xs">Quality</div>
            </div>
            <div>
              <div className="text-zinc-100 font-bold text-sm">{selectedAspect.label}</div>
              <div className="text-zinc-600 text-xs">Aspect</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setConfigured(true); startRender() }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg transition-all"
        >
          🎬 Start Rendering
        </button>
      </div>
    )
  }

  /* ── RENDERING / DONE / ERROR ── */
  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] text-center space-y-6">

      {status === 'processing' && (
        <div className="w-full max-w-md space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-zinc-100 text-xl font-bold mb-1">Rendering in your browser</p>
            <p className="text-zinc-500 text-sm">Keep this tab open — do not close or navigate away</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Progress</span>
              <span className="text-purple-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Template', value: store.template },
              { label: 'Quality',  value: selectedQuality.res, color: selectedQuality.color },
              { label: 'Aspect',   value: selectedAspect.label },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className={`font-semibold capitalize text-xs ${s.color ?? 'text-zinc-100'}`}>{s.value}</div>
                <div className="text-zinc-600 text-[10px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={reset} className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
            Cancel
          </button>
        </div>
      )}

      {status === 'done' && downloadUrl && (
        <div className="space-y-6 w-full max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto text-4xl">✅</div>
          <div>
            <p className="text-zinc-100 text-2xl font-black mb-2">Your video is ready!</p>
            <p className="text-zinc-500 text-sm">{selectedFormat.label} · {selectedQuality.res} · {selectedAspect.label}</p>
          </div>
          <a
            href={downloadUrl}
            download={`visualizer.${selectedFormat.label.toLowerCase()}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg transition-all"
          >
            ⬇️ Download {selectedFormat.label}
          </a>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={reset} className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors">
              Create another
            </button>
            <Link href="/" className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-center">
              Back to home
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-5 w-full max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center mx-auto text-4xl">❌</div>
          <div>
            <p className="text-zinc-100 text-xl font-bold mb-2">Render failed</p>
            {error && <p className="text-red-400 text-xs font-mono bg-red-500/10 rounded-lg p-3 mt-2 text-left break-all">{error}</p>}
            <p className="text-zinc-500 text-sm mt-2">Try a lower quality setting or a shorter song.</p>
          </div>
          <button onClick={reset} className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors">
            ← Change settings & retry
          </button>
        </div>
      )}
    </div>
  )
}
