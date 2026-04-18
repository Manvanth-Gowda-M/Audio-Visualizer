'use client'
import { useEffect, useState, useRef } from 'react'
import { useStore, LyricLine } from '@/lib/store'
import { parseLrc, toLrc, distributeLines } from '@/lib/lyrics/lrcParser'

/* ── Font catalogue ── */
const FONTS: { id: string; name: string; family: string; style: string }[] = [
  { id: 'inter',       name: 'Inter',         family: 'Inter, sans-serif',                    style: 'Modern' },
  { id: 'playfair',    name: 'Playfair',       family: 'Playfair Display, serif',              style: 'Elegant' },
  { id: 'montserrat',  name: 'Montserrat',     family: 'Montserrat, sans-serif',               style: 'Bold' },
  { id: 'spacegrotesk',name: 'Space Grotesk',  family: 'Space Grotesk, sans-serif',            style: 'Techy' },
  { id: 'bebas',       name: 'Bebas Neue',     family: 'Bebas Neue, cursive',                  style: 'Impact' },
  { id: 'pacifico',    name: 'Pacifico',       family: 'Pacifico, cursive',                    style: 'Retro' },
  { id: 'cinzel',      name: 'Cinzel',         family: 'Cinzel, serif',                        style: 'Luxury' },
  { id: 'orbitron',    name: 'Orbitron',       family: 'Orbitron, sans-serif',                 style: 'Sci-Fi' },
  { id: 'satisfy',     name: 'Satisfy',        family: 'Satisfy, cursive',                     style: 'Script' },
  { id: 'rajdhani',    name: 'Rajdhani',       family: 'Rajdhani, sans-serif',                 style: 'Hindi' },
  { id: 'josefin',     name: 'Josefin Sans',   family: 'Josefin Sans, sans-serif',             style: 'Minimal' },
  { id: 'ubuntu',      name: 'Ubuntu',         family: 'Ubuntu, sans-serif',                   style: 'Clean' },
]

/* ── Source badge config ── */
const SOURCE_META: Record<string, { label: string; icon: string; color: string }> = {
  lrclib:       { label: 'LRCLib',        icon: '🎵', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  megalobiz:    { label: 'Megalobiz',     icon: '🌐', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  rclyricsband: { label: 'RCLyricsBand',  icon: '🎤', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' },
  genius:       { label: 'Genius',        icon: '💡', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' },
  whisper:      { label: 'Whisper AI',    icon: '🤖', color: 'text-purple-400 bg-purple-500/10 border-purple-500/25' },
  manual:       { label: 'Manual',        icon: '✏️', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
}

/* ── Load Google Fonts dynamically ── */
function loadFont(family: string) {
  if (typeof document === 'undefined') return
  const name = family.split(',')[0].trim().replace(/ /g, '+')
  const id = `gf-${name}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${name}:wght@400;700&display=swap`
  document.head.appendChild(link)
}

export default function Step2Lyrics() {
  const store = useStore()
  const [lrcText, setLrcText] = useState('')
  const [mode, setMode] = useState<'lrc' | 'plain' | 'timeline'>('lrc')
  const [plainText, setPlainText] = useState('')
  const [copied, setCopied] = useState(false)
  const [fetchLog, setFetchLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)

  // Load all fonts on mount
  useEffect(() => {
    FONTS.forEach(f => loadFont(f.family))
  }, [])

  const fetchLyrics = async () => {
    store.setLyricsLoading(true)
    setFetchLog([])
    const log: string[] = []
    const sources = ['LRCLib', 'Megalobiz', 'RCLyricsBand', 'Genius']
    sources.forEach(s => { log.push(`Trying ${s}...`); })
    setFetchLog([...log])

    try {
      const res = await fetch('/api/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: store.songTitle, artist: store.artist, duration: store.duration }),
      })
      const data = await res.json()
      store.setLyrics(data.lyrics, data.source, data.synced)

      // Populate editor
      if (data.synced && data.lyrics.length > 0) {
        setLrcText(toLrc(data.lyrics))
        setMode('lrc')
      } else {
        setPlainText(data.lyrics.map((l: LyricLine) => l.text).join('\n'))
        setMode('plain')
      }

      const found = SOURCE_META[data.source]
      log.push(
        data.lyrics.length > 0
          ? `✓ ${data.lyrics.length} lines from ${found?.label ?? data.source}${data.synced ? ' · synced ⏱' : ' · plain text'}`
          : '✗ Not found — enter manually below'
      )
      setFetchLog([...log])
    } catch {
      store.setLyrics([], 'manual', false)
      log.push('✗ Fetch failed')
      setFetchLog([...log])
    } finally {
      store.setLyricsLoading(false)
    }
  }

  useEffect(() => {
    if (store.lyrics.length === 0 && !store.lyricsLoading) fetchLyrics()
    else {
      if (store.lyricsSynced) setLrcText(toLrc(store.lyrics))
      else setPlainText(store.lyrics.map(l => l.text).join('\n'))
      setMode(store.lyricsSynced ? 'lrc' : 'plain')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Parse LRC text → store
  const handleLrcChange = (val: string) => {
    setLrcText(val)
    const parsed = parseLrc(val, store.duration)
    if (parsed.length > 0) {
      store.setLyrics(parsed, 'manual', true)
    } else {
      // Might be plain text — keep as is
      const lines = val.split('\n').filter(l => l.trim() && !l.startsWith('['))
      if (lines.length > 0) {
        store.setLyrics(distributeLines(lines, store.duration || 210), 'manual', false)
      }
    }
  }

  // Parse plain text → store
  const handlePlainChange = (val: string) => {
    setPlainText(val)
    const lines = val.split('\n').filter(l => l.trim())
    store.setLyrics(distributeLines(lines, store.duration || 210), 'manual', false)
  }

  const setTimestamp = (idx: number, time: number) => {
    const updated = store.lyrics.map((l, i) => {
      if (i === idx) return { ...l, time }
      return l
    })
    // Recalculate ends
    const withEnds = updated.map((l, i) => ({
      ...l,
      end: updated[i + 1]?.time ?? (store.duration || l.time + 5),
    }))
    store.setLyrics(withEnds, store.lyricsSource, true)
    setLrcText(toLrc(withEnds))
  }

  const stampNow = (idx: number) => {
    if (audioRef.current) setTimestamp(idx, audioRef.current.currentTime)
  }

  const handleCopy = () => {
    const text = mode === 'lrc' ? lrcText : plainText
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeLyricIdx = store.lyrics.findIndex(l => {
    const end = l.end ?? (l.time + 5)
    return currentTime >= l.time && currentTime < end
  })

  const srcMeta = store.lyricsSource ? SOURCE_META[store.lyricsSource] : null
  const selectedFont = FONTS.find(f => f.id === store.lyricsFont) ?? FONTS[0]

  return (
    <div className="space-y-4">

      {/* Optional banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
        <span className="text-lg">💡</span>
        <p className="text-zinc-400 text-sm flex-1">
          Lyrics are <span className="text-zinc-200 font-medium">optional</span>. Skip if you don't need them.
        </p>
        <button onClick={() => store.setCurrentStep(3)}
          className="shrink-0 px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm transition-colors">
          Skip →
        </button>
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          {srcMeta && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${srcMeta.color}`}>
                {srcMeta.icon} {srcMeta.label}
                {store.lyricsSynced && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">SYNCED ⏱</span>
                )}
              </span>
              {store.lyrics.length > 0 && (
                <span className="text-xs text-zinc-600">{store.lyrics.length} lines</span>
              )}
            </div>
          )}
          {fetchLog.length > 0 && (
            <button onClick={() => setShowLog(!showLog)}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              {showLog ? '▲ Hide' : '▼'} fetch log
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleCopy}
            className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
            {copied ? '✓' : 'Copy'}
          </button>
          <button onClick={fetchLyrics} disabled={store.lyricsLoading}
            className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-40">
            {store.lyricsLoading ? 'Searching...' : 'Re-fetch'}
          </button>
        </div>
      </div>

      {/* Fetch log */}
      {showLog && fetchLog.length > 0 && (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 space-y-1">
          {fetchLog.map((line, i) => (
            <div key={i} className={`text-xs font-mono ${line.startsWith('✓') ? 'text-emerald-400' : line.startsWith('✗') ? 'text-red-400' : 'text-zinc-500'}`}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {store.lyricsLoading && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-sm text-zinc-300 font-medium">Searching 4 sources...</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['LRCLib', 'Megalobiz', 'RCLyricsBand', 'Genius'].map((s, i) => (
              <div key={s} className="text-xs text-zinc-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {!store.lyricsLoading && (
        <>
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl w-fit">
            {([
              { id: 'lrc',      label: '⏱ LRC / Paste' },
              { id: 'plain',    label: '✏️ Plain Text' },
              { id: 'timeline', label: '🎚 Timeline' },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === tab.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── LRC MODE ── */}
          {mode === 'lrc' && (
            <div className="space-y-3">
              {/* Quick guide */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 space-y-2">
                <p className="text-xs text-zinc-400 font-semibold">📋 LRC Format Guide</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-zinc-600 mb-1">Format:</p>
                    <code className="text-emerald-400 block leading-relaxed">
                      [mm:ss.xx] lyric line<br/>
                      [00:05.20] Tere bina lagta nahi<br/>
                      [00:10.50] Dil mera kahin
                    </code>
                  </div>
                  <div>
                    <p className="text-zinc-600 mb-1">Get LRC from:</p>
                    <div className="space-y-1">
                      {[
                        { name: 'lrclib.net', url: 'https://lrclib.net' },
                        { name: 'megalobiz.com', url: 'https://www.megalobiz.com/lrc/maker' },
                        { name: 'rclyricsband.com', url: 'https://rclyricsband.com' },
                      ].map(s => (
                        <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors">
                          <span>↗</span> {s.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={lrcText}
                  onChange={e => handleLrcChange(e.target.value)}
                  placeholder={`Paste your LRC here:\n\n[00:00.00] Intro music\n[00:05.20] Tere bina lagta nahi\n[00:10.50] Dil mera kahin\n[00:15.80] Raaton mein jagta hoon\n[00:20.00] Bas tera hi naam\n\nOr type manually in the same format.`}
                  className="w-full h-72 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-zinc-200 text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors font-mono leading-relaxed"
                  spellCheck={false}
                />
                {lrcText && (
                  <button
                    onClick={() => { setLrcText(''); store.setLyrics([], 'manual', false) }}
                    className="absolute top-3 right-3 text-xs text-zinc-600 hover:text-zinc-400 bg-zinc-800 px-2 py-1 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-zinc-600 text-xs">
                  {store.lyrics.length > 0
                    ? `✓ ${store.lyrics.length} lines parsed${store.lyricsSynced ? ' · synced timestamps' : ''}`
                    : 'Paste LRC above — lines will be parsed automatically'}
                </p>
                {store.lyrics.length > 0 && (
                  <button
                    onClick={() => setMode('timeline')}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View timeline →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── PLAIN MODE ── */}
          {mode === 'plain' && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">One lyric line per row. Timestamps auto-distributed evenly.</p>
              <textarea
                value={plainText}
                onChange={e => handlePlainChange(e.target.value)}
                placeholder={`Tere bina lagta nahi\nDil mera kahin\nRaaton mein jagta hoon\nBas tera hi naam`}
                className="w-full h-64 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-zinc-200 text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                style={{ fontFamily: selectedFont.family }}
              />
              <p className="text-zinc-600 text-xs">{store.lyrics.length} lines · {Math.round(store.duration)}s duration</p>
            </div>
          )}

          {/* ── TIMELINE MODE ── */}
          {mode === 'timeline' && (
            <div className="space-y-3">
              {/* Mini player */}
              {store.audioUrl && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-white/5">
                  <audio ref={audioRef} src={store.audioUrl}
                    onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
                    onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
                  <button
                    onClick={() => playing ? audioRef.current?.pause() : audioRef.current?.play()}
                    className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-sm transition-colors shrink-0">
                    {playing ? '⏸' : '▶'}
                  </button>
                  <div className="flex-1 cursor-pointer" onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * store.duration
                  }}>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(currentTime / (store.duration || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-zinc-400 text-xs font-mono shrink-0">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-zinc-600 hidden sm:block">Click to stamp ⏱</span>
                </div>
              )}

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {store.lyrics.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-8">Add lyrics in LRC or Plain tab first</p>
                ) : store.lyrics.map((line, i) => {
                  const isActive = i === activeLyricIdx
                  const end = line.end ?? (line.time + 5)
                  return (
                    <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${isActive ? 'bg-purple-600/15 border border-purple-500/30' : 'bg-zinc-900 border border-transparent hover:border-zinc-700'}`}>
                      {/* Start stamp */}
                      <button onClick={() => stampNow(i)} title="Stamp current time"
                        className="shrink-0 font-mono text-xs px-2 py-1 rounded-lg bg-zinc-800 hover:bg-purple-600/30 text-zinc-400 hover:text-purple-300 transition-colors min-w-[48px] text-center">
                        {Math.floor(line.time / 60)}:{String(Math.floor(line.time % 60)).padStart(2, '0')}
                      </button>
                      <span className="text-zinc-600 text-xs">→</span>
                      {/* End time */}
                      <span className="font-mono text-xs text-zinc-600 min-w-[40px]">
                        {Math.floor(end / 60)}:{String(Math.floor(end % 60)).padStart(2, '0')}
                      </span>

                      {/* Text */}
                      {editingIdx === i ? (
                        <input autoFocus defaultValue={line.text}
                          onBlur={e => {
                            const updated = store.lyrics.map((l, j) => j === i ? { ...l, text: e.target.value } : l)
                            store.setLyrics(updated, store.lyricsSource, store.lyricsSynced)
                            setLrcText(toLrc(updated))
                            setEditingIdx(null)
                          }}
                          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="flex-1 bg-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          style={{ fontFamily: selectedFont.family }}
                        />
                      ) : (
                        <span onClick={() => setEditingIdx(i)}
                          className={`flex-1 text-sm cursor-text truncate ${isActive ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}
                          style={{ fontFamily: selectedFont.family }}>
                          {line.text || <span className="text-zinc-700 italic">empty</span>}
                        </span>
                      )}

                      {/* Time slider */}
                      <input type="range" min={0} max={store.duration || 210} step={0.1}
                        value={line.time}
                        onChange={e => setTimestamp(i, parseFloat(e.target.value))}
                        className="w-16 accent-purple-500 shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── FONT PICKER ── */}
          <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Lyrics Font</p>
              <span className="text-xs text-zinc-600" style={{ fontFamily: selectedFont.family }}>
                {selectedFont.name} · {selectedFont.style}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {FONTS.map(font => (
                <button key={font.id} onClick={() => store.setLyricsFont(font.id)}
                  className={`p-2.5 rounded-xl text-center transition-all border ${
                    store.lyricsFont === font.id
                      ? 'border-purple-500/60 bg-purple-600/15'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}>
                  <div className="text-base text-zinc-100 leading-tight"
                    style={{ fontFamily: font.family }}>
                    Aa
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{font.name}</div>
                  <div className="text-[9px] text-zinc-700">{font.style}</div>
                </button>
              ))}
            </div>
            {/* Preview */}
            {store.lyrics.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <p className="text-zinc-300 text-sm" style={{ fontFamily: selectedFont.family }}>
                  {store.lyrics[0]?.text || 'Preview text'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom actions */}
      <div className="flex gap-3">
        <button onClick={() => store.setCurrentStep(3)}
          className="flex-1 py-3.5 rounded-2xl border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 font-semibold transition-colors">
          Skip lyrics
        </button>
        <button onClick={() => store.setCurrentStep(3)}
          className="flex-[2] py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors">
          Continue to Style →
        </button>
      </div>
    </div>
  )
}
