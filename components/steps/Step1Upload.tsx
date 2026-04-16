'use client'
import { useCallback, useRef, useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { extractWaveform } from '@/lib/audio/waveform'

const ACCEPTED_AUDIO = ['.mp3', '.wav', '.m4a']
const ACCEPTED_ART   = ['.jpg', '.jpeg', '.png', '.webp']

export default function Step1Upload() {
  const store       = useStore()
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [uploading, setUploading]       = useState(false)
  const [error, setError]               = useState('')
  const [audioDragging, setAudioDrag]   = useState(false)
  const [artDragging,   setArtDrag]     = useState(false)

  // Local editable fields — user can fix wrong ID3 tags
  const [localTitle,  setLocalTitle]  = useState(store.songTitle)
  const [localArtist, setLocalArtist] = useState(store.artist)

  // Sync when store changes (e.g. after upload returns metadata)
  useEffect(() => { setLocalTitle(store.songTitle)  }, [store.songTitle])
  useEffect(() => { setLocalArtist(store.artist)    }, [store.artist])

  const drawWaveform = useCallback((data: number[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const barW = canvas.width / data.length
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    grad.addColorStop(0, '#a855f7')
    grad.addColorStop(0.5, '#ec4899')
    grad.addColorStop(1, '#a855f7')
    data.forEach((val, i) => {
      const barH = val * canvas.height * 0.85
      ctx.fillStyle = grad
      ctx.globalAlpha = 0.5 + val * 0.5
      ctx.beginPath()
      ctx.roundRect(i * barW, (canvas.height - barH) / 2, Math.max(barW - 1, 1), barH, 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [])

  const handleAudioFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_AUDIO.includes(ext)) { setError('Please upload an MP3, WAV, or M4A file.'); return }
    if (file.size > 50 * 1024 * 1024) { setError('File too large. Max 50MB.'); return }
    setError('')
    store.setAudio(file, URL.createObjectURL(file))
    // Pre-fill title from filename as fallback
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
    if (!store.songTitle) {
      setLocalTitle(nameWithoutExt)
      store.setMetadata(nameWithoutExt, store.artist, store.duration)
    }
    try {
      const buf = await file.arrayBuffer()
      const audioCtx = new AudioContext()
      const decoded  = await audioCtx.decodeAudioData(buf)
      const waveData = await extractWaveform(decoded)
      store.setWaveformData(waveData)
      drawWaveform(waveData)
    } catch {}
  }, [store, drawWaveform])

  const handleArtFile = useCallback((file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_ART.includes(ext)) { setError('Please upload a JPG, PNG, or WEBP image.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Artwork too large. Max 10MB.'); return }
    setError('')
    store.setArtwork(file, URL.createObjectURL(file))
  }, [store])

  const handleUpload = async () => {
    if (!store.audioFile) return

    // Commit the user-edited title/artist to store BEFORE upload
    store.setMetadata(localTitle.trim() || 'Unknown', localArtist.trim() || 'Unknown', store.duration)

    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('audio', store.audioFile)
      if (store.artworkFile) fd.append('artwork', store.artworkFile)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data = await res.json()

      store.setAudioPath(data.audioPath)
      store.setArtworkPath(data.artworkPath)

      // Only use server metadata if user hasn't typed anything custom
      const finalTitle  = localTitle.trim()  || data.title  || 'Unknown'
      const finalArtist = localArtist.trim() || data.artist || 'Unknown'
      store.setMetadata(finalTitle, finalArtist, data.duration)
      setLocalTitle(finalTitle)
      setLocalArtist(finalArtist)

      store.setCurrentStep(2)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const openPicker = (accept: string, handler: (f: File) => void) => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = accept
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0]
      if (f) handler(f)
    }
    input.click()
  }

  return (
    <div className="space-y-5">

      {/* Required / Optional legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          Required
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
          Optional
        </span>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Audio */}
        <div
          onDragOver={(e) => { e.preventDefault(); setAudioDrag(true) }}
          onDragLeave={() => setAudioDrag(false)}
          onDrop={(e) => { e.preventDefault(); setAudioDrag(false); const f = e.dataTransfer.files[0]; if (f) handleAudioFile(f) }}
          onClick={() => openPicker(ACCEPTED_AUDIO.join(','), handleAudioFile)}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[160px] flex flex-col items-center justify-center gap-3 p-6 overflow-hidden ${
            audioDragging ? 'border-purple-400 bg-purple-500/10'
            : store.audioFile ? 'border-purple-500/50 bg-purple-500/5'
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50'
          }`}
        >
          <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">Required</span>
          {store.audioFile ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-2xl">🎵</div>
              <div className="text-center">
                <p className="text-zinc-100 font-semibold truncate max-w-[200px] text-sm">{store.audioFile.name}</p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {store.duration > 0 ? `${Math.floor(store.duration/60)}:${String(Math.round(store.duration%60)).padStart(2,'0')}` : 'Processing...'}
                  {' · '}{(store.audioFile.size/1024/1024).toFixed(1)} MB
                </p>
              </div>
              <span className="text-xs text-purple-400">Click to change</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl">🎵</div>
              <div className="text-center">
                <p className="text-zinc-300 font-medium text-sm">Drop audio here</p>
                <p className="text-zinc-500 text-xs">MP3, WAV, M4A · max 50MB</p>
              </div>
            </>
          )}
        </div>

        {/* Artwork */}
        <div
          onDragOver={(e) => { e.preventDefault(); setArtDrag(true) }}
          onDragLeave={() => setArtDrag(false)}
          onDrop={(e) => { e.preventDefault(); setArtDrag(false); const f = e.dataTransfer.files[0]; if (f) handleArtFile(f) }}
          onClick={() => openPicker(ACCEPTED_ART.join(','), handleArtFile)}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[160px] flex flex-col items-center justify-center gap-3 p-6 overflow-hidden ${
            artDragging ? 'border-pink-400 bg-pink-500/10'
            : store.artworkFile ? 'border-pink-500/50'
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50'
          }`}
        >
          <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 z-10">Required</span>
          {store.artworkUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={store.artworkUrl} alt="artwork" className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-40" />
              <div className="relative z-10 text-center">
                <p className="text-zinc-100 font-semibold text-sm">{store.artworkFile?.name}</p>
                <p className="text-zinc-400 text-xs mt-0.5">Click to change</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl">🖼️</div>
              <div className="text-center">
                <p className="text-zinc-300 font-medium text-sm">Drop artwork here</p>
                <p className="text-zinc-500 text-xs">JPG, PNG, WEBP · max 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Waveform */}
      {store.waveformData.length > 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Waveform</p>
          <canvas ref={canvasRef} width={800} height={60} className="w-full rounded-lg" />
        </div>
      )}

      {/* ── SONG INFO — editable, used for lyrics fetch ── */}
      {store.audioFile && (
        <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Song Info</p>
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              ✏️ Edit if wrong — used for lyrics search
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Song Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder="e.g. Tere Bina"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Artist Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={localArtist}
                onChange={(e) => setLocalArtist(e.target.value)}
                placeholder="e.g. Arijit Singh"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <p className="text-zinc-600 text-xs">
            💡 These are used to search lyrics automatically. Make sure they're correct.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!store.audioFile || !store.artworkFile || uploading || !localTitle.trim()}
        className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-all"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Continue to Lyrics
            <span className="text-xs opacity-60 font-normal">(optional)</span>
            →
          </span>
        )}
      </button>

      <p className="text-center text-zinc-600 text-xs">
        Audio + Artwork are required · Lyrics are optional
      </p>
    </div>
  )
}
