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
  const [personDragging, setPersonDrag] = useState(false)

  // Local editable fields — user can fix wrong ID3 tags
  const [localTitle,  setLocalTitle]  = useState(store.songTitle)
  const [localArtist, setLocalArtist] = useState(store.artist)

  // Sync when store changes (e.g. after upload returns metadata)
  useEffect(() => { setLocalTitle(store.songTitle)  }, [store.songTitle])
  useEffect(() => { setLocalArtist(store.artist)    }, [store.artist])

  // ── If already uploaded, draw saved waveform ──────────────────────────────
  useEffect(() => {
    if (store.isUploaded && store.waveformData.length > 0) {
      drawWaveform(store.waveformData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isUploaded])

  const drawWaveform = useCallback((data: number[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const barW = canvas.width / data.length
    ctx.fillStyle = '#000000'
    data.forEach((val, i) => {
      const barH = val * canvas.height * 0.85
      ctx.globalAlpha = 0.8 + val * 0.2
      ctx.beginPath()
      ctx.rect(i * barW, (canvas.height - barH) / 2, Math.max(barW - 1, 1), barH)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [])

  const getAudioDuration = useCallback((file: File) => {
    return new Promise<number | null>((resolve) => {
      const audio = document.createElement('audio')
      const objectUrl = URL.createObjectURL(file)
      const cleanup = () => {
        URL.revokeObjectURL(objectUrl)
        audio.removeAttribute('src')
      }
      audio.preload = 'metadata'
      audio.onloadedmetadata = () => {
        const duration = audio.duration
        cleanup()
        resolve(Number.isFinite(duration) && duration >= 0 ? duration : null)
      }
      audio.onerror = () => { cleanup(); resolve(null) }
      audio.src = objectUrl
    })
  }, [])

  const handleAudioFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_AUDIO.includes(ext)) { setError('Please upload an MP3, WAV, or M4A file.'); return }
    if (file.size > 50 * 1024 * 1024) { setError('File too large. Max 50MB.'); return }
    setError('')
    store.setAudio(file, URL.createObjectURL(file))
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
    if (!store.songTitle) setLocalTitle(nameWithoutExt)
    const titleForMetadata = store.songTitle || nameWithoutExt
    const detectedDuration = await getAudioDuration(file)
    store.setMetadata(titleForMetadata, store.artist, detectedDuration ?? 0)
    try {
      const buf = await file.arrayBuffer()
      const audioCtx = new AudioContext()
      const decoded  = await audioCtx.decodeAudioData(buf)
      const waveData = await extractWaveform(decoded)
      store.setWaveformData(waveData)
      drawWaveform(waveData)
    } catch {}
  }, [store, drawWaveform, getAudioDuration])

  const handleArtFile = useCallback((file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_ART.includes(ext)) { setError('Please upload a JPG, PNG, or WEBP image.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Artwork too large. Max 10MB.'); return }
    setError('')
    store.setArtwork(file, URL.createObjectURL(file))
  }, [store])

  const handlePersonFiles = useCallback((files: FileList | File[]) => {
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (ACCEPTED_ART.includes(ext) && file.size <= 10 * 1024 * 1024) {
        validFiles.push(file)
      }
    }
    if (validFiles.length === 0) {
      setError('Please upload valid JPG, PNG, or WEBP images under 10MB.');
      return;
    }
    setError('')
    const maxFiles = 4
    const newFiles = [...store.personImageFiles, ...validFiles].slice(0, maxFiles)
    store.setPersonImages(newFiles)
  }, [store])

  const removePersonImage = (index: number) => {
    const newFiles = [...store.personImageFiles]
    newFiles.splice(index, 1)
    store.setPersonImages(newFiles)
  }

  const handleUpload = async () => {
    if (!store.audioFile) return

    setUploading(true)
    setError('')

    try {
      // ── Everything runs in the browser — zero server upload needed ──────────
      // renderMediaOnWeb renders locally in the browser tab and can read blob:
      // URLs directly. No Vercel Blob, no /tmp, no storage costs ever.

      // Create stable blob: URLs the Remotion renderer can fetch
      const audioBlobUrl   = URL.createObjectURL(store.audioFile)
      const artworkBlobUrl = store.artworkFile
        ? URL.createObjectURL(store.artworkFile)
        : ''
      const personBlobUrls = store.personImageFiles.map(file => URL.createObjectURL(file))

      store.setAudioPath(audioBlobUrl)
      store.setArtworkPath(artworkBlobUrl)
      store.setPersonImagePaths(personBlobUrls)

      // Final metadata — prefer what the user typed over filename fallback
      const finalTitle  = localTitle.trim()  || store.songTitle  || store.audioFile.name.replace(/\.[^/.]+$/, '') || 'Unknown'
      const finalArtist = localArtist.trim() || store.artist     || 'Unknown'
      store.setMetadata(finalTitle, finalArtist, store.duration)
      setLocalTitle(finalTitle)
      setLocalArtist(finalArtist)

      store.setIsUploaded(true)
      store.setCurrentStep(2)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
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

  const openMultiplePicker = (accept: string, handler: (files: FileList) => void) => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = accept; input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) handler(files)
    }
    input.click()
  }

  // ── If already uploaded, show a summary + "Change files" option ───────────
  if (store.isUploaded && store.audioPath) {
    return (
      <div className="space-y-6">
        {/* Already-uploaded banner */}
        <div className="bg-[#06d6a0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-black font-black uppercase text-xl tracking-widest flex items-center gap-2">
                <span>✅</span> Files Uploaded
              </p>
              <p className="text-black font-bold text-sm mt-1">
                {store.songTitle} — {store.artist}
              </p>
              {store.duration > 0 && (
                <p className="text-black/70 font-bold text-sm">
                  Duration: {Math.floor(store.duration / 60)}:{String(Math.round(store.duration % 60)).padStart(2, '0')}
                </p>
              )}
            </div>
            <button
              onClick={() => store.clearFiles()}
              className="px-5 py-3 border-4 border-black bg-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              🔄 Change Files
            </button>
          </div>
        </div>

        {/* Waveform */}
        {store.waveformData.length > 0 && (
          <div className="bg-[#fcfcfc] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5">
            <p className="text-sm text-black font-black uppercase tracking-widest mb-3">Waveform</p>
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <canvas ref={canvasRef} width={800} height={80} className="w-full" />
            </div>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={() => store.setCurrentStep(2)}
          className="w-full py-4 border-4 border-black bg-[#4361ee] hover:bg-[#344bba] text-white font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Continue to Lyrics →
        </button>
      </div>
    )
  }

  // ── Fresh upload UI ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Required / Optional legend */}
      <div className="flex items-center gap-4 text-sm font-black uppercase">
        <span className="flex items-center gap-2 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#ff2056] text-white">
          Required
        </span>
        <span className="flex items-center gap-2 px-3 py-1.5 border-2 border-dashed border-black bg-white text-black">
          Optional
        </span>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Audio */}
        <div
          onDragOver={(e) => { e.preventDefault(); setAudioDrag(true) }}
          onDragLeave={() => setAudioDrag(false)}
          onDrop={(e) => { e.preventDefault(); setAudioDrag(false); const f = e.dataTransfer.files[0]; if (f) handleAudioFile(f) }}
          onClick={() => openPicker(ACCEPTED_AUDIO.join(','), handleAudioFile)}
          className={`relative border-4 border-dashed border-black cursor-pointer transition-all min-h-[180px] flex flex-col items-center justify-center gap-4 p-6 overflow-hidden ${
            audioDragging ? 'bg-[#fbff12]'
            : store.audioFile ? 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-solid translate-x-[-4px] translate-y-[-4px]'
            : 'bg-[#fcfcfc] hover:bg-[#fbff12]'
          }`}
        >
          <span className="absolute top-3 right-3 text-xs font-black uppercase px-2 py-1 border-2 border-black bg-[#ff2056] text-white">Required</span>
          {store.audioFile ? (
            <>
              <div className="w-14 h-14 border-4 border-black bg-[#fbff12] flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">🎵</div>
              <div className="text-center mt-2">
                <p className="text-black font-black uppercase truncate max-w-[200px] text-lg">{store.audioFile.name}</p>
                <p className="text-gray-700 font-bold text-sm mt-1">
                  {store.duration > 0 ? `${Math.floor(store.duration/60)}:${String(Math.round(store.duration%60)).padStart(2,'0')}` : 'Duration unavailable'}
                  {' · '}{(store.audioFile.size/1024/1024).toFixed(1)} MB
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 border-4 border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">🎵</div>
              <div className="text-center mt-2">
                <p className="text-black font-black uppercase text-lg">Drop audio here</p>
                <p className="text-black font-bold text-sm mt-1">MP3, WAV, M4A · max 50MB</p>
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
          className={`relative border-4 border-dashed border-black cursor-pointer transition-all min-h-[180px] flex flex-col items-center justify-center gap-4 p-6 overflow-hidden ${
            artDragging ? 'bg-[#ff2056]'
            : store.artworkFile ? 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-solid translate-x-[-4px] translate-y-[-4px]'
            : 'bg-[#fcfcfc] hover:bg-[#ff2056]'
          }`}
        >
          <span className="absolute top-3 right-3 text-xs font-black uppercase px-2 py-1 border-2 border-black bg-[#ff2056] text-white z-10">Required</span>
          {store.artworkUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={store.artworkUrl} alt="artwork" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 mx-auto border-4 border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2">🖼️</div>
                <p className="text-black font-black uppercase text-lg truncate max-w-[200px]">{store.artworkFile?.name}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 border-4 border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">🖼️</div>
              <div className="text-center mt-2">
                <p className="text-black font-black uppercase text-lg">Drop artwork here</p>
                <p className="text-black font-bold text-sm mt-1">JPG, PNG, WEBP · max 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collage Images (Only for aesthetic template) */}
      {store.template === 'aesthetic' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setPersonDrag(true) }}
          onDragLeave={() => setPersonDrag(false)}
          onDrop={(e) => { e.preventDefault(); setPersonDrag(false); if (e.dataTransfer.files.length) handlePersonFiles(e.dataTransfer.files) }}
          onClick={() => openMultiplePicker(ACCEPTED_ART.join(','), handlePersonFiles)}
          className={`relative border-4 border-dashed border-black cursor-pointer transition-all min-h-[180px] flex flex-col items-center justify-center gap-4 p-6 overflow-hidden ${
            personDragging ? 'bg-[#ff2056]'
            : store.personImageFiles.length > 0 ? 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-solid translate-x-[-4px] translate-y-[-4px]'
            : 'bg-[#fcfcfc] hover:bg-[#ff2056]'
          }`}
        >
          <span className="absolute top-3 right-3 text-xs font-black uppercase px-2 py-1 border-2 border-black bg-[#ff2056] text-white z-10">Optional (Max 4)</span>
          
          {store.personImageFiles.length > 0 ? (
            <div className="w-full">
              <p className="text-black font-black uppercase text-lg text-center mb-4">Collage Images ({store.personImageFiles.length}/4)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" onClick={(e) => e.stopPropagation()}>
                {store.personImageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt={`person ${i}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removePersonImage(i)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-[#ff2056] border-2 border-black text-white font-black flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {store.personImageFiles.length < 4 && (
                  <div 
                    onClick={() => openMultiplePicker(ACCEPTED_ART.join(','), handlePersonFiles)}
                    className="aspect-square border-4 border-dashed border-black bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-3xl">+</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 border-4 border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">📸</div>
              <div className="text-center mt-2">
                <p className="text-black font-black uppercase text-lg">Drop person images here</p>
                <p className="text-black font-bold text-sm mt-1">Select up to 4 images for the collage</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Waveform */}
      {store.waveformData.length > 0 && (
        <div className="bg-[#06d6a0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5">
          <p className="text-sm text-black font-black uppercase tracking-widest mb-3">Waveform Data</p>
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <canvas ref={canvasRef} width={800} height={80} className="w-full" />
          </div>
        </div>
      )}

      {/* Song info */}
      {store.audioFile && (
        <div className="bg-[#fbff12] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-lg text-black uppercase tracking-widest font-black">Song Info</p>
            <span className="text-sm font-bold text-black border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ✏️ Edit if wrong — used for lyrics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-black text-black uppercase mb-2 block">Song Title <span className="text-[#ff2056]">*</span></label>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder="e.g. Tere Bina"
                className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-3 text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-black text-black uppercase mb-2 block">Artist Name <span className="text-[#ff2056]">*</span></label>
              <input
                type="text"
                value={localArtist}
                onChange={(e) => setLocalArtist(e.target.value)}
                placeholder="e.g. Arijit Singh"
                className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-3 text-base font-bold text-black placeholder-gray-400 focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#ff2056] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white font-black uppercase text-lg">
          <span className="text-2xl">⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!store.audioFile || !store.artworkFile || uploading || !localTitle.trim()}
        className="w-full py-4 border-4 border-black bg-[#4361ee] hover:bg-[#344bba] disabled:bg-gray-300 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 text-white font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:cursor-not-allowed"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-6 h-6 border-4 border-black border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Continue to Style →
          </span>
        )}
      </button>

      <p className="text-center text-black font-bold uppercase text-sm">
        Audio + Artwork are required to continue
      </p>
    </div>
  )
}
