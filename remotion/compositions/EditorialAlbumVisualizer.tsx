import React, { useMemo } from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  Img,
} from 'remotion'
import { Audio } from '@remotion/media'
import { useAudioData, visualizeAudio, MediaUtilsAudioData } from '@remotion/media-utils'
import { VisualizerProps } from './shared'

export interface EditorialAlbumProps extends VisualizerProps {
  songTitle?: string
  artistName?: string
  tracklistText?: string // New prop for multiline tracks, falls back to a nice looking mock
}

function fmt(s: number) {
  if (isNaN(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function safeVisualize(audioData: MediaUtilsAudioData | null, frame: number, fps: number, n: number): number[] {
  if (!audioData) return new Array(n).fill(0)
  try {
    return visualizeAudio({ audioData, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0)
  } catch {
    return new Array(n).fill(0)
  }
}

export const EditorialAlbumVisualizer: React.FC<EditorialAlbumProps> = ({
  audioSrc,
  artworkSrc,
  songTitle = 'Song Name',
  artistName = 'Author Name',
  tracklistText,
  durationInSeconds,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  // Extract wave data for bottom bar
  const audioData = useAudioData(audioSrc)
  const wavePoints = 80
  const freq = safeVisualize(audioData, frame, fps, wavePoints)

  // Vinyl rotation: 1 full rotation every 10 seconds
  const rotationDeg = (currentTime / 12) * 360

  // Progress logic
  const progress = Math.min(currentTime / durationInSeconds, 1)

  // Layout calculations (16:9 = 1920x1080)
  const albumSize = height * 0.55 // 594px
  const cx = width * 0.35 // Left-center biased
  const cy = height * 0.52

  const vinylR = albumSize * 0.48 // Slightly smaller than the square wrapper
  const labelR = vinylR * 0.35

  // Parse tracklist or use mock
  const tracks = useMemo(() => {
    if (tracklistText && tracklistText.trim().length > 0) {
      return tracklistText.split('\n').filter(Boolean).map(row => {
        const parts = row.split('-')
        const dur = parts.length > 1 ? parts.pop()?.trim() : ''
        const title = parts.join('-').trim()
        return { title: title || row, duration: dur }
      })
    }
    // Beautiful mock based on reference image
    return [
      { title: 'Intro', duration: '1:51' },
      { title: `Music Track feat ${artistName} 02`, duration: '2:31' },
      { title: 'Music Track 03', duration: '2:12' },
      { title: 'Music Track 04', duration: '4:05' },
      { title: 'Music Track 05', duration: '3:35' },
      { title: 'Music Track 06', duration: '4:15' },
      { title: `Music Track feat ${artistName} 07`, duration: '5:01' },
      { title: 'Music Track 08', duration: '2:34' },
      { title: 'Music Track 09', duration: '2:15' },
      { title: 'Music Track (Remix) 10', duration: '2:57' },
      { title: 'Music Track 11', duration: '4:16' },
      { title: 'Outro', duration: '3:42' },
    ]
  }, [tracklistText, artistName])

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#F0A868' }}>
      
      {/* Very subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15) 100%)',
        pointerEvents: 'none'
      }} />

      {/* ── TOP CENTER: TYPOGRAPHY ── */}
      <div style={{
        position: 'absolute',
        top: height * 0.18,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Inter, Helvetica, sans-serif',
        fontSize: 32,
        fontWeight: 300,
        color: '#333',
        letterSpacing: '0.02em'
      }}>
        {artistName} - {songTitle}
      </div>

      {/* ── CENTER-LEFT: VINYL & ALBUM ── */}
      
      {/* 1. The Vinyl (partially behind album) */}
      <div style={{
        position: 'absolute',
        left: cx - (albumSize/2) + (albumSize * 0.35), // shifted right
        top: cy - vinylR,
        width: vinylR * 2,
        height: vinylR * 2,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #111, #1a1a1a, #0a0a0a, #050505)',
        boxShadow: '20px 10px 40px rgba(0,0,0,0.25)',
        transform: `rotate(${rotationDeg}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Vinyl Grooves */}
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)'
        }} />
        <div style={{
          position: 'absolute', inset: 24, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)'
        }} />
        <div style={{
          position: 'absolute', inset: 48, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)'
        }} />
        {/* Center Label */}
        <div style={{
          width: labelR * 2, height: labelR * 2, borderRadius: '50%', overflow: 'hidden',
          background: '#fff'
        }}>
           <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* Spindle hole */}
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F0A868', position: 'absolute' }} />
      </div>

      {/* 2. The Album Cover */}
      <div style={{
        position: 'absolute',
        left: cx - (albumSize/2) - (albumSize * 0.15), // slightly left of center
        top: cy - (albumSize/2),
        width: albumSize,
        height: albumSize,
        background: '#fff',
        boxShadow: '-10px 15px 40px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Soft plastic wrap glare simulation */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.05) 100%)',
          pointerEvents: 'none'
        }} />
      </div>


      {/* ── RIGHT SECTION: TRACKLIST ── */}
      <div style={{
        position: 'absolute',
        right: width * 0.08,
        top: cy - (albumSize/2),
        height: albumSize,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontFamily: 'Inter, Helvetica, sans-serif',
        color: '#444',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: '0.15em',
          marginBottom: 20,
          opacity: 0.6
        }}>
          TRACKLIST
        </div>
        
        {tracks.map((track, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8,
            fontSize: 22,
            fontWeight: 300,
            marginBottom: 8,
            opacity: 0.85
          }}>
            <span>{track.title}</span>
            {track.duration && <span>- {track.duration}</span>}
          </div>
        ))}
      </div>


      {/* ── BOTTOM SECTION: WAVEFORM & PROGRESS ── */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.15,
        left: '25%',
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        
        {/* Subtle Waveform (Using an SVG path for a continuous smooth line) */}
        <div style={{ width: '100%', height: 40, marginBottom: 8, position: 'relative' }}>
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d={`M 0 50 ${freq.map((val, i) => {
                const x = (i / (freq.length - 1)) * 100
                const y = 50 - (val * 40) // Subtle amplitude
                return `L ${x} ${y}`
              }).join(' ')}`}
              fill="none"
              stroke="#fff"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
             <path
              d={`M 0 50 ${freq.map((val, i) => {
                const x = (i / (freq.length - 1)) * 100
                const y = 50 + (val * 40) // Bottom mirror
                return `L ${x} ${y}`
              }).join(' ')}`}
              fill="none"
              stroke="#fff"
              strokeWidth="0.8"
              strokeLinejoin="round"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Flat minimal playhead timeline */}
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 20
        }}>
          <div style={{
            flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', position: 'relative'
          }}>
            <div style={{
              width: `${progress * 100}%`, height: '100%', background: '#fff'
            }} />
          </div>
          <div style={{
            fontFamily: 'Inter, Helvetica, sans-serif',
            fontSize: 14,
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '0.05em'
          }}>
            {fmt(currentTime)} / {fmt(durationInSeconds)}
          </div>
        </div>

      </div>

      {audioSrc && <Audio src={audioSrc} />}
    </div>
  )
}
