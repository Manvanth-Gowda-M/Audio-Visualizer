'use client'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import Link from 'next/link'

/* ── Config options ── */
const FORMATS = [
  { id: 'mp4',  label: 'MP4',  icon: '🎬', desc: 'Best compatibility · H.264',  badge: 'Recommended' },
  { id: 'webm', label: 'WebM', icon: '🌐', desc: 'Web optimized · VP8',          badge: '' },
  { id: 'gif',  label: 'GIF',  icon: '🖼️', desc: 'Animated · no audio',          badge: '' },
] as const

const QUALITIES = [
  { id: 'draft',  label: 'Draft',   res: '480p',  icon: '⚡', desc: 'Fast render · smaller file',  color: 'text-zinc-400' },
  { id: 'hd',     label: 'HD',      res: '720p',  icon: '📺', desc: 'Good quality · balanced',      color: 'text-blue-400' },
  { id: 'fullhd', label: 'Full HD', res: '1080p', icon: '🎯', desc: 'Premium quality',              color: 'text-purple-400' },
  { id: '4k',     label: '4K',      res: '2160p', icon: '💎', desc: 'Ultra quality · large file',   color: 'text-amber-400' },
] as const

const ASPECTS = [
  { id: '16:9', label: '16:9',  icon: '🖥',  desc: 'Landscape · YouTube / Desktop' },
  { id: '9:16', label: '9:16',  icon: '📱',  desc: 'Portrait · Reels / TikTok / Shorts' },
  { id: '1:1',  label: '1:1',   icon: '⬜',  desc: 'Square · Instagram Feed' },
  { id: '4:5',  label: '4:5',   icon: '📷',  desc: 'Portrait · Instagram Feed' },
] as const

export default function Step4Export() {
  const store = useStore()
  const pollingRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const fakeRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef  = useRef(false)
  const [configured, setConfigured] = useState(false)

  const stop = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (fakeRef.current)    clearInterval(fakeRef.current)
  }

  const startRender = async () => {
    store.setRenderStatus('queued', 0)
    try {
      const res = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioPath:     store.audioPath,
          artworkPath:   store.artworkPath,
          lyrics:        store.lyrics,
          template:      store.template,
          typoStyle:     store.typoStyle,
          accentColor:   store.accentColor,
          duration:      store.duration,
          labelText:     store.labelText,
          themeColor:    store.themeColor,
          fontStyle:     store.fontStyle,
          effects:       store.effects,
          exportFormat:  store.exportFormat,
          exportQuality: store.exportQuality,
          exportAspect:  store.exportAspect,
          songTitle:     store.songTitle,
          artistName:    store.artist,
        }),
      })
      const data = await res.json()
      if (!data.projectId) throw new Error()
      store.setProjectId(data.projectId)
      store.setRenderStatus('processing', 0)

      // Fake progress — increments faster so it doesn't look stuck
      // Goes 0→85% over ~2 minutes, then waits for real 'done'
      let fakeP = 0
      fakeRef.current = setInterval(() => {
        // Accelerate early, slow down near 85%
        const increment = fakeP < 30 ? 3 : fakeP < 60 ? 2 : fakeP < 80 ? 1 : 0.3
        fakeP = Math.min(fakeP + increment, 85)
        store.setRenderStatus('processing', Math.round(fakeP))
      }, 1500)  // every 1.5s

      // Poll real status every 2s
      pollingRef.current = setInterval(async () => {
        try {
          const s = await fetch(`/api/render/status?projectId=${data.projectId}`).then(r => r.json())
          if (s.status === 'done') {
            stop(); store.setRenderStatus('done', 100); store.setOutputUrl(s.outputPath)
          } else if (s.status === 'error') {
            stop(); store.setRenderStatus('error')
          }
        } catch {}
      }, 2000)
    } catch {
      store.setRenderStatus('error')
    }
  }

  useEffect(() => {
    return () => stop()
  }, [])

  const status = store.renderStatus
  const selectedQuality = QUALITIES.find(q => q.id === store.exportQuality) ?? QUALITIES[2]
  const selectedFormat  = FORMATS.find(f => f.id === store.exportFormat)    ?? FORMATS[0]
  const selectedAspect  = ASPECTS.find(a => a.id === store.exportAspect)    ?? ASPECTS[0]

  /* ── CONFIG SCREEN (shown before render starts) ── */
  if (!configured && status === 'idle') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-zinc-100">Export Settings</h2>
          <p className="text-zinc-500 text-sm mt-1">Choose your format and quality before rendering</p>
        </div>

        {/* Format */}
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Format</p>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => store.setExportFormat(f.id)}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUALITIES.map(q => (
              <button key={q.id} onClick={() => store.setExportQuality(q.id)}
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
        </div>

        {/* Aspect Ratio */}
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Aspect Ratio</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ASPECTS.map(a => (
              <button key={a.id} onClick={() => store.setExportAspect(a.id)}
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

        {/* Summary + Render button */}
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

      {(status === 'queued') && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-zinc-300 text-lg font-medium">Preparing render pipeline...</p>
          <p className="text-zinc-600 text-sm">Bundling Remotion compositions</p>
        </div>
      )}

      {status === 'processing' && (
        <div className="w-full max-w-md space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-zinc-100 text-xl font-bold mb-1">Rendering your video</p>
            <p className="text-zinc-500 text-sm">This takes 1–5 minutes depending on quality & length</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Progress</span>
              <span className="text-purple-400 font-mono">{store.renderProgress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${store.renderProgress}%` }}
              />
            </div>
          </div>
          {/* Render config summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Template',  value: store.template },
              { label: 'Format',    value: selectedFormat.label },
              { label: 'Quality',   value: selectedQuality.res, color: selectedQuality.color },
              { label: 'Aspect',    value: selectedAspect.label },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                <div className={`font-semibold capitalize text-xs ${s.color ?? 'text-zinc-100'}`}>{s.value}</div>
                <div className="text-zinc-600 text-[10px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="space-y-6 w-full max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto text-4xl">✅</div>
          <div>
            <p className="text-zinc-100 text-2xl font-black mb-2">Your video is ready!</p>
            <p className="text-zinc-500 text-sm">
              {selectedFormat.label} · {selectedQuality.res} · {selectedAspect.label}
            </p>
          </div>
          <a
            href={store.outputUrl ?? '#'}
            download
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg transition-all"
          >
            ⬇️ Download {selectedFormat.label}
          </a>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { stop(); store.reset() }}
              className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
            >
              Create another
            </button>
            <Link href="/"
              className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-center">
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
            <p className="text-zinc-500 text-sm">Try again. If the issue persists, check server logs for the exact render error.</p>
          </div>
          <button
            onClick={() => {
              stop()
              store.setRenderStatus('idle')
              setConfigured(false)
            }}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
          >
            ← Change settings & retry
          </button>
        </div>
      )}
    </div>
  )
}
