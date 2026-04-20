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
  lrclib:       { label: 'LRCLib',        icon: '🎵', color: 'bg-[#06d6a0] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' },
  megalobiz:    { label: 'Megalobiz',     icon: '🌐', color: 'bg-[#4361ee] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' },
  rclyricsband: { label: 'RCLyricsBand',  icon: '🎤', color: 'bg-[#ff2056] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' },
  genius:       { label: 'Genius',        icon: '💡', color: 'bg-[#fbff12] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' },
  whisper:      { label: 'Whisper AI',    icon: '🤖', color: 'bg-[#f72585] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' },
  manual:       { label: 'Manual',        icon: '✏️', color: 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' },
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
  link.href = `https://fonts.googleapis.com/css2?family=${name}:wght@400;700;900&display=swap`
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
    <div className="space-y-6">

      {/* Optional banner */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-[#fbff12] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-4xl hidden sm:block">💡</span>
        <div className="flex-1">
          <p className="text-black font-black uppercase text-xl">Lyrics are optional</p>
          <p className="text-gray-900 font-bold text-sm mt-1">Skip if you don't need them for your visualizer.</p>
        </div>
        <button onClick={() => store.setCurrentStep(3)}
          className="shrink-0 px-6 py-3 border-4 border-black bg-white hover:bg-gray-100 text-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          Skip →
        </button>
      </div>

      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3">
          {srcMeta && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 font-black text-sm uppercase ${srcMeta.color}`}>
                {srcMeta.icon} {srcMeta.label}
                {store.lyricsSynced && (
                  <span className="ml-2 px-2 py-0.5 bg-[#fbff12] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black">SYNCED ⏱</span>
                )}
              </span>
              {store.lyrics.length > 0 && (
                <span className="text-sm font-black text-black px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{store.lyrics.length} LINES</span>
              )}
            </div>
          )}
          {fetchLog.length > 0 && (
            <button onClick={() => setShowLog(!showLog)}
              className="text-sm font-black text-gray-800 hover:text-black hover:underline uppercase transition-colors">
              {showLog ? '▲ Hide fetch log' : '▼ View fetch log'}
            </button>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={handleCopy}
            className="px-4 py-2 text-sm font-black uppercase border-4 border-black bg-white hover:bg-gray-100 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={fetchLyrics} disabled={store.lyricsLoading}
            className="px-4 py-2 text-sm font-black uppercase border-4 border-black bg-[#06d6a0] hover:bg-[#05b586] disabled:bg-gray-300 disabled:shadow-none disabled:translate-x-1 disabled:translate-y-1 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            {store.lyricsLoading ? 'Searching...' : 'Re-fetch'}
          </button>
        </div>
      </div>

      {/* Fetch log */}
      {showLog && fetchLog.length > 0 && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 space-y-2">
          {fetchLog.map((line, i) => (
            <div key={i} className={`text-sm font-black font-mono uppercase ${line.startsWith('✓') ? 'text-[#06d6a0]' : line.startsWith('✗') ? 'text-[#ff2056]' : 'text-black'}`}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {store.lyricsLoading && (
        <div className="bg-[#4361ee] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 border-4 border-black border-t-white animate-spin shrink-0" />
            <span className="text-xl text-white font-black uppercase tracking-wide">Searching 4 sources...</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['LRCLib', 'Megalobiz', 'RCLyricsBand', 'Genius'].map((s, i) => (
              <div key={s} className="font-black text-black text-sm uppercase flex items-center gap-2 px-3 py-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-3 h-3 border-2 border-black bg-[#ff2056] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {!store.lyricsLoading && (
        <>
          {/* Mode tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {([
              { id: 'lrc',      label: '⏱ LRC / Paste', bg: 'bg-[#fbff12]' },
              { id: 'plain',    label: '✏️ Plain Text', bg: 'bg-[#06d6a0]' },
              { id: 'timeline', label: '🎚 Timeline', bg: 'bg-[#4361ee]', textColor: 'text-white' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id as 'lrc'|'plain'|'timeline')}
                className={`px-5 py-3 font-black uppercase text-sm md:text-base border-4 border-black transition-all ${
                  mode === tab.id 
                  ? `${tab.bg} ${tab.textColor || 'text-black'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]` 
                  : 'bg-white text-black hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── LRC MODE ── */}
          {mode === 'lrc' && (
             <div className="space-y-5">
               {/* Quick guide */}
               <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6 space-y-5">
                 <p className="text-xl font-black uppercase bg-[#ff2056] text-white border-4 border-black px-4 py-2 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">📋 LRC Format Guide</p>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
                   <div>
                     <p className="font-black text-lg mb-3 uppercase">Format</p>
                     <code className="block bg-gray-100 text-black border-4 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] leading-relaxed text-sm lg:text-base">
                       [mm:ss.xx] lyric line<br/>
                       [00:05.20] Tere bina lagta nahi<br/>
                       [00:10.50] Dil mera kahin
                     </code>
                   </div>
                   <div>
                     <p className="font-black text-lg mb-3 uppercase">Get LRC from:</p>
                     <div className="space-y-3">
                       {[
                         { name: 'lrclib.net', url: 'https://lrclib.net' },
                         { name: 'megalobiz.com', url: 'https://www.megalobiz.com/lrc/maker' },
                         { name: 'rclyricsband.com', url: 'https://rclyricsband.com' },
                       ].map(s => (
                         <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                           className="flex items-center gap-3 bg-[#fbff12] text-black text-base border-4 border-black px-4 py-2 font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all w-fit">
                           <span className="text-xl">↗</span> {s.name}
                         </a>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>

               <div className="relative group mt-6">
                 <div className="absolute -inset-1 bg-black rounded-sm blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                 <textarea
                   value={lrcText}
                   onChange={e => handleLrcChange(e.target.value)}
                   placeholder={`Paste your LRC here:\n\n[00:00.00] Intro music\n[00:05.20] Tere bina lagta nahi\n[00:10.50] Dil mera kahin\n[00:15.80] Raaton mein jagta hoon\n[00:20.00] Bas tera hi naam\n\nOr type manually in the same format.`}
                   className="relative w-full h-80 bg-white border-4 border-black p-5 text-black text-base font-bold font-mono resize-none focus:outline-none focus:ring-4 focus:ring-[#fbff12] transition-colors leading-relaxed shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                   spellCheck={false}
                 />
                 {lrcText && (
                   <button
                     onClick={() => { setLrcText(''); store.setLyrics([], 'manual', false) }}
                     className="absolute top-4 right-4 z-10 text-xs font-black uppercase bg-[#ff2056] text-white px-3 py-1.5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                   >
                     Clear
                   </button>
                 )}
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#06d6a0] border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-2">
                 <p className="text-black font-black uppercase text-base">
                   {store.lyrics.length > 0
                     ? `✓ ${store.lyrics.length} lines parsed${store.lyricsSynced ? ' · synced timestamps' : ''}`
                     : 'Paste LRC above — lines will be parsed automatically'}
                 </p>
                 {store.lyrics.length > 0 && (
                   <button
                     onClick={() => setMode('timeline')}
                     className="px-4 py-2 font-black uppercase text-black bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                   >
                     View timeline →
                   </button>
                 )}
               </div>
             </div>
          )}

          {/* ── PLAIN MODE ── */}
          {mode === 'plain' && (
            <div className="space-y-5">
              <div className="bg-[#fbff12] border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-black font-black uppercase text-lg">One lyric line per row. Timestamps auto-distributed evenly.</p>
              </div>
              <textarea
                value={plainText}
                onChange={e => handlePlainChange(e.target.value)}
                placeholder={`Tere bina lagta nahi\nDil mera kahin\nRaaton mein jagta hoon\nBas tera hi naam`}
                className="w-full h-80 bg-white border-4 border-black p-6 text-black text-xl font-bold resize-none focus:outline-none focus:ring-4 focus:ring-[#06d6a0] transition-colors leading-relaxed shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                style={{ fontFamily: selectedFont.family }}
              />
              <div className="bg-[#4361ee] text-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
                <p className="font-black uppercase tracking-widest text-lg">{store.lyrics.length} lines · {Math.round(store.duration)}s duration</p>
              </div>
            </div>
          )}

          {/* ── TIMELINE MODE ── */}
          {mode === 'timeline' && (
            <div className="space-y-6">
              {/* Mini player */}
              {store.audioUrl && (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-[#fbff12] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <audio ref={audioRef} src={store.audioUrl}
                    onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
                    onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
                  <button
                    onClick={() => playing ? audioRef.current?.pause() : audioRef.current?.play()}
                    className="w-14 h-14 border-4 border-black bg-white hover:bg-[#ff2056] hover:text-white flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors shrink-0">
                    {playing ? '⏸' : '▶'}
                  </button>
                  <div className="w-full flex-1 cursor-pointer relative h-8 border-4 border-black bg-white shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]" onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * store.duration
                  }}>
                    <div className="absolute inset-y-0 left-0 bg-[#06d6a0] border-r-4 border-black" style={{ width: `${(currentTime / (store.duration || 1)) * 100}%` }} />
                  </div>
                  <div className="flex gap-4 items-center w-full sm:w-auto mt-2 sm:mt-0 justify-between">
                    <span className="text-black font-black p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg shrink-0">
                      {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-black text-black uppercase bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Click to stamp ⏱</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar py-2">
                {store.lyrics.length === 0 ? (
                  <div className="bg-[#fbff12] border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-black font-black uppercase text-2xl">Add lyrics in LRC or Plain tab first</p>
                  </div>
                ) : store.lyrics.map((line, i) => {
                  const isActive = i === activeLyricIdx
                  const end = line.end ?? (line.time + 5)
                  return (
                    <div key={i} className={`flex flex-col md:flex-row md:items-center gap-3 p-4 border-4 border-black transition-all ${isActive ? 'bg-[#4361ee] text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] translate-x-[-4px] translate-y-[-4px]' : 'bg-white text-black hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]'}`}>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Start stamp */}
                        <button onClick={() => stampNow(i)} title="Stamp current time"
                          className={`shrink-0 font-black text-base px-3 py-2 border-4 border-black min-w-[70px] text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${isActive ? 'bg-[#fbff12] text-black' : 'bg-[#06d6a0] text-black'}`}>
                          {Math.floor(line.time / 60)}:{String(Math.floor(line.time % 60)).padStart(2, '0')}
                        </button>
                        <span className="font-black text-2xl">→</span>
                        {/* End time */}
                        <span className="font-black text-base min-w-[70px] px-3 py-2 border-4 border-black bg-gray-100 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                          {Math.floor(end / 60)}:{String(Math.floor(end % 60)).padStart(2, '0')}
                        </span>
                      </div>

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
                          className="w-full md:flex-1 bg-white border-4 border-black px-4 py-3 text-lg font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#fbff12] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          style={{ fontFamily: selectedFont.family }}
                        />
                      ) : (
                        <span onClick={() => setEditingIdx(i)}
                          className={`w-full md:flex-1 text-lg cursor-text truncate px-4 py-3 border-4 border-transparent hover:border-black transition-all ${isActive ? 'font-black' : 'font-bold'}`}
                          style={{ fontFamily: selectedFont.family }}>
                          {line.text || <span className="text-gray-400 italic font-sans text-sm">empty</span>}
                        </span>
                      )}

                      {/* Time slider */}
                      <input type="range" min={0} max={store.duration || 210} step={0.1}
                        value={line.time}
                        onChange={e => setTimestamp(i, parseFloat(e.target.value))}
                        className={`w-full md:w-32 accent-black shrink-0 border-4 border-black h-4 appearance-none ${isActive ? 'bg-black' : 'bg-gray-200'}`} style={{ WebkitAppearance: 'none' }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── FONT PICKER ── */}
          <div className="bg-[#ff2056] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
              <span className="absolute -top-12 -left-4 bg-[#fbff12] text-black font-black uppercase px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                Customize
              </span>
              <p className="text-2xl text-white font-black uppercase mt-4 sm:mt-0 tracking-widest">Lyrics Font</p>
              <div className="bg-white border-4 border-black px-5 py-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-black text-lg" style={{ fontFamily: selectedFont.family }}>
                  {selectedFont.name} · <span className="text-gray-500 text-sm uppercase">{selectedFont.style}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {FONTS.map(font => (
                <button key={font.id} onClick={() => store.setLyricsFont(font.id)}
                  className={`p-4 text-center transition-all border-4 border-black bg-white flex flex-col items-center justify-center h-32 ${
                    store.lyricsFont === font.id
                      ? 'shadow-none translate-x-1 translate-y-1 bg-[#fbff12]'
                      : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  }`}>
                  <div className="text-4xl text-black font-bold leading-tight"
                    style={{ fontFamily: font.family }}>
                    Aa
                  </div>
                  <div className="text-sm text-black font-black mt-3 truncate uppercase w-full">{font.name}</div>
                  <div className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">{font.style}</div>
                </button>
              ))}
            </div>
            
            {/* Preview */}
            {store.lyrics.length > 0 && (
              <div className="mt-8 p-6 sm:p-10 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-100 opacity-50" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <p className="relative text-black text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-[2px_2px_0px_rgba(255,32,86,1)]" style={{ fontFamily: selectedFont.family }}>
                  "{store.lyrics[0]?.text || 'Preview text'}"
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom actions */}
      <div className="flex flex-col sm:flex-row gap-5 mt-10">
        <button onClick={() => store.setCurrentStep(3)}
          className="flex-1 py-4 sm:py-5 bg-white border-4 border-black text-black font-black uppercase text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-none transition-all">
          Skip lyrics
        </button>
        <button onClick={() => store.setCurrentStep(3)}
          className="flex-[2] py-4 sm:py-5 bg-[#4361ee] border-4 border-black text-white font-black uppercase text-2xl tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all">
          Continue to Style →
        </button>
      </div>
    </div>
  )
}
