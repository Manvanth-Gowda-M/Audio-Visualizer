import { useCurrentFrame, useVideoConfig, Audio, Img, interpolate, spring } from 'remotion'
import { visualizeAudio } from '@remotion/media-utils'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

function safeVisualize(src: string, frame: number, fps: number, n: number): number[] {
  if (!src) return new Array(n).fill(0)
  try {
    return visualizeAudio({ src, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0)
  } catch {
    return new Array(n).fill(0)
  }
}

export const PosterVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  lyrics,
  accentColor,
  typoStyle,
  durationInSeconds,
  lyricsFont = 'inter',
  effects = [],
  songTitle = 'Song Title',
  artistName = 'Artist',
  albumName = 'Album',
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const freq = safeVisualize(audioSrc, frame, fps, 128)

  // Fade-in at start
  const fadeIn = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: 'clamp' })

  // Subtle float for artwork
  const floatY = Math.sin((frame / fps) * 0.6 * Math.PI) * 4

  // Artwork slow scale
  const artScale = 1 + 0.015 * Math.sin((frame / fps) * 0.4 * Math.PI)

  // Vinyl spin
  const vinylSpin = (frame / fps) * 33.3 * 6

  // Layout
  const cx = width / 2
  const cy = height / 2

  // Artwork position — left-center
  const artSize = height * 0.62
  const artX = width * 0.08
  const artY = cy - artSize / 2 + floatY

  // Vinyl — behind artwork, offset right
  const vinylR = artSize * 0.52
  const vinylCX = artX + artSize * 0.72
  const vinylCY = cy + floatY

  // Waveform bars
  const barCount = 80
  const barMaxH = height * 0.09
  const barW = (width - 40) / barCount - 1.5

  // Typography — right side
  const textX = width * 0.56
  const textCY = cy

  // Active lyric
  const activeLyric = (() => {
    for (const line of lyrics) {
      const end = line.end ?? (line.time + 5)
      if (currentTime >= line.time && currentTime < end) return line.text
    }
    return ''
  })()

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.4), [0, fps * 0.15], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ width, height, position: 'relative', overflow: 'hidden', opacity: fadeIn }}>

        {/* ── BACKGROUND — soft pastel gradient ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #f8f0ff 0%, #fce4f0 25%, #ede0ff 50%, #dce8ff 75%, #e8f4ff 100%)',
        }} />
        {/* Soft blurred artwork tint */}
        <Img src={artworkSrc} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', filter: 'blur(60px) saturate(0.4) brightness(1.1)',
          opacity: 0.25,
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(200,180,220,0.25) 100%)',
        }} />

        {/* ── TOP WAVEFORM ── */}
        <svg style={{ position: 'absolute', top: 0, left: 0 }} width={width} height={height * 0.14}>
          <defs>
            <linearGradient id="waveTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#f472b6" stopOpacity="0.9" />
              <stop offset="40%"  stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="70%"  stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {Array.from({ length: barCount }, (_, i) => {
            const val = freq[Math.floor(i * freq.length / barCount)] ?? 0
            // Smooth with neighbor
            const prev = freq[Math.floor(Math.max(0, i - 1) * freq.length / barCount)] ?? 0
            const next = freq[Math.floor(Math.min(barCount - 1, i + 1) * freq.length / barCount)] ?? 0
            const smooth = (prev + val * 2 + next) / 4
            const bh = Math.max(smooth * barMaxH * 1.4, 3)
            const x = 20 + i * (barW + 1.5)
            return (
              <rect key={i}
                x={x} y={height * 0.14 - bh}
                width={barW} height={bh}
                fill="url(#waveTop)" rx={barW / 2}
              />
            )
          })}
        </svg>

        {/* ── BOTTOM WAVEFORM ── */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0 }} width={width} height={height * 0.14}>
          <defs>
            <linearGradient id="waveBot" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#f472b6" stopOpacity="0.9" />
              <stop offset="40%"  stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="70%"  stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {Array.from({ length: barCount }, (_, i) => {
            const val = freq[Math.floor(i * freq.length / barCount)] ?? 0
            const prev = freq[Math.floor(Math.max(0, i - 1) * freq.length / barCount)] ?? 0
            const next = freq[Math.floor(Math.min(barCount - 1, i + 1) * freq.length / barCount)] ?? 0
            const smooth = (prev + val * 2 + next) / 4
            const bh = Math.max(smooth * barMaxH * 1.4, 3)
            const x = 20 + i * (barW + 1.5)
            return (
              <rect key={i}
                x={x} y={0}
                width={barW} height={bh}
                fill="url(#waveBot)" rx={barW / 2}
              />
            )
          })}
        </svg>

        {/* ── VINYL DISK — behind artwork ── */}
        <div style={{
          position: 'absolute',
          left: vinylCX - vinylR,
          top: vinylCY - vinylR,
          width: vinylR * 2,
          height: vinylR * 2,
          borderRadius: '50%',
          transform: `rotate(${vinylSpin}deg)`,
          boxShadow: '8px 12px 40px rgba(100,60,140,0.25)',
        }}>
          <svg width={vinylR * 2} height={vinylR * 2} viewBox={`0 0 ${vinylR * 2} ${vinylR * 2}`}>
            <defs>
              <radialGradient id="vinylBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#2a2a2a" />
                <stop offset="60%"  stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#111" />
              </radialGradient>
            </defs>
            <circle cx={vinylR} cy={vinylR} r={vinylR} fill="url(#vinylBg)" />
            {/* Grooves */}
            {Array.from({ length: 12 }, (_, i) => (
              <circle key={i} cx={vinylR} cy={vinylR} r={vinylR * (0.25 + i * 0.06)}
                fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
            {/* Sheen */}
            <ellipse cx={vinylR * 0.7} cy={vinylR * 0.65} rx={vinylR * 0.35} ry={vinylR * 0.12}
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={2}
              transform={`rotate(-35, ${vinylR * 0.7}, ${vinylR * 0.65})`} />
            {/* Center label */}
            <circle cx={vinylR} cy={vinylR} r={vinylR * 0.18}
              fill="#3a2a5a" />
            <circle cx={vinylR} cy={vinylR} r={vinylR * 0.05}
              fill="#1a1a1a" />
          </svg>
        </div>

        {/* ── ARTWORK ── */}
        <div style={{
          position: 'absolute',
          left: artX,
          top: artY,
          width: artSize,
          height: artSize,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '12px 20px 60px rgba(100,60,140,0.3), 0 4px 20px rgba(0,0,0,0.15)',
          transform: `scale(${artScale})`,
          transformOrigin: 'center center',
        }}>
          <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ── TYPOGRAPHY — right side ── */}
        <div style={{
          position: 'absolute',
          left: textX,
          top: textCY - height * 0.22,
          width: width * 0.38,
        }}>
          {/* Artist name */}
          <div style={{
            fontFamily: 'Inter, Poppins, sans-serif',
            fontSize: height * 0.048,
            fontWeight: 700,
            color: '#7c3aed',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: height * 0.012,
          }}>
            {artistName}
          </div>

          {/* Song title */}
          <div style={{
            fontFamily: 'Inter, Poppins, sans-serif',
            fontSize: height * 0.072,
            fontWeight: 300,
            color: '#2d1b4e',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            marginBottom: height * 0.04,
          }}>
            {songTitle}
          </div>

          {/* Album pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${height * 0.012}px ${height * 0.028}px`,
            borderRadius: 999,
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            marginBottom: height * 0.06,
          }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: height * 0.028,
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              Album · {albumName}
            </span>
          </div>

          {/* Lyric line */}
          {activeLyric && (
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: height * 0.032,
              fontWeight: 300,
              color: '#6b21a8',
              letterSpacing: '0.04em',
              opacity: lyricOpacity,
              marginTop: height * 0.02,
              fontStyle: 'italic',
            }}>
              "{activeLyric}"
            </div>
          )}
        </div>

        {/* ── NEUMORPHIC CONTROLS — bottom center ── */}
        <div style={{
          position: 'absolute',
          bottom: height * 0.14,
          left: 0, right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: height * 0.04,
        }}>
          {/* Prev */}
          <div style={{
            width: height * 0.1,
            height: height * 0.1,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #f0e8ff, #e0d4f8)',
            boxShadow: '6px 6px 16px rgba(160,120,200,0.35), -4px -4px 12px rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={height * 0.04} height={height * 0.04} viewBox="0 0 24 24" fill="none">
              <path d="M19 20L9 12l10-8v16zM5 4v16" stroke="#4c1d95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Play/Pause — bigger */}
          <div style={{
            width: height * 0.13,
            height: height * 0.13,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #f5eeff, #e8d8ff)',
            boxShadow: '8px 8px 20px rgba(140,100,200,0.4), -6px -6px 16px rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Pause icon (playing state) */}
            <svg width={height * 0.05} height={height * 0.05} viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" rx="2" fill="#4c1d95"/>
              <rect x="14" y="4" width="4" height="16" rx="2" fill="#4c1d95"/>
            </svg>
          </div>

          {/* Next */}
          <div style={{
            width: height * 0.1,
            height: height * 0.1,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #f0e8ff, #e0d4f8)',
            boxShadow: '6px 6px 16px rgba(160,120,200,0.35), -4px -4px 12px rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={height * 0.04} height={height * 0.04} viewBox="0 0 24 24" fill="none">
              <path d="M5 4l10 8-10 8V4zM19 4v16" stroke="#4c1d95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <Audio src={audioSrc} />
        <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
      </div>
    </EffectsWrapper>
  )
}
