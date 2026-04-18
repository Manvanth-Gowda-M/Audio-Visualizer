import { useCurrentFrame, useVideoConfig, Audio, Img, interpolate } from 'remotion'
import { visualizeAudio, useAudioData, type MediaUtilsAudioData } from '@remotion/media-utils'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

function safeVisualize(audioData: MediaUtilsAudioData | null, frame: number, fps: number, n: number): number[] {
  if (!audioData) return new Array(n).fill(0)
  try {
    return visualizeAudio({ audioData, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0)
  } catch {
    return new Array(n).fill(0)
  }
}

/* Smooth a value toward target — removes jitter, makes motion premium */
function smooth(prev: number, current: number, factor = 0.12): number {
  return prev + (current - prev) * factor
}

/* Build a smooth SVG cubic bezier path from frequency data */
function buildWavePath(
  freqData: number[],
  x0: number,
  y0: number,
  w: number,
  maxH: number
): string {
  const pts = freqData.map((v, i) => ({
    x: x0 + (i / (freqData.length - 1)) * w,
    y: y0 - v * maxH,
  }))

  if (pts.length < 2) return ''

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  // Close path down to baseline
  d += ` L ${pts[pts.length - 1].x} ${y0} L ${pts[0].x} ${y0} Z`
  return d
}

/* Module-level smoothed freq array — persists across frames */
let smoothedFreq: number[] = []

export const DashboardVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  lyrics,
  accentColor,
  typoStyle,
  durationInSeconds,
  lyricsFont = 'inter',
  effects = [],
  songTitle = 'Song Name',
  artistName = 'Author Name',
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const SAMPLES = 48
  const audioData = useAudioData(audioSrc)
  const rawFreq = safeVisualize(audioData, frame, fps, SAMPLES)

  // Smooth each frequency bin
  if (smoothedFreq.length !== SAMPLES) smoothedFreq = new Array(SAMPLES).fill(0)
  smoothedFreq = smoothedFreq.map((prev, i) => smooth(prev, rawFreq[i] ?? 0, 0.12))

  const progress = Math.min(currentTime / durationInSeconds, 1)

  // Fade-in
  const fadeIn = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' })

  // Format time
  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // Card dimensions
  const cardW = width * 0.62
  const cardH = height * 0.52
  const cardX = (width - cardW) / 2
  const cardY = (height - cardH) / 2

  // Artwork
  const artSize = cardH * 0.48
  const artX = cardX + cardW * 0.04
  const artY = cardY + cardH * 0.1

  // Waveform area
  const waveX = cardX + cardW * 0.04
  const waveW = cardW * 0.92
  const waveBaseY = cardY + cardH * 0.82
  const waveMaxH = cardH * 0.28

  // Progress bar
  const barY = cardY + cardH * 0.88
  const barH = 4
  const barX = waveX
  const barW = waveW

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ width, height, position: 'relative', overflow: 'hidden', opacity: fadeIn }}>

        {/* ── BACKGROUND — dark teal gradient ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0d2b2b 0%, #0a2020 30%, #0c2535 60%, #0a1e2e 100%)',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 45%, rgba(0,0,0,0.45) 100%)',
        }} />

        {/* ── MAIN CARD ── */}
        <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
          <defs>
            {/* Card shadow filter */}
            <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="24" floodColor="rgba(0,0,0,0.5)" floodOpacity="1" />
            </filter>

            {/* Waveform gradient fill */}
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1de9b6" stopOpacity="0.15" />
              <stop offset="40%"  stopColor="#00e676" stopOpacity="0.55" />
              <stop offset="70%"  stopColor="#1de9b6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#00bfa5" stopOpacity="0.2" />
            </linearGradient>

            {/* Waveform stroke gradient */}
            <linearGradient id="waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1de9b6" stopOpacity="0.4" />
              <stop offset="40%"  stopColor="#00e676" stopOpacity="1" />
              <stop offset="70%"  stopColor="#1de9b6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00bfa5" stopOpacity="0.5" />
            </linearGradient>

            {/* Progress bar gradient */}
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00e676" />
              <stop offset="100%" stopColor="#1de9b6" />
            </linearGradient>

            {/* Subtle waveform glow */}
            <filter id="waveGlow" x="-5%" y="-30%" width="110%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Artwork clip */}
            <clipPath id="artClip">
              <rect x={artX} y={artY} width={artSize} height={artSize} rx={10} />
            </clipPath>
          </defs>

          {/* Card background */}
          <rect
            x={cardX} y={cardY} width={cardW} height={cardH}
            rx={18}
            fill="rgba(255,255,255,0.04)"
            filter="url(#cardShadow)"
          />
          {/* Card border */}
          <rect
            x={cardX} y={cardY} width={cardW} height={cardH}
            rx={18}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
          />

          {/* ── WAVEFORM PATH ── */}
          <g filter="url(#waveGlow)">
            {/* Fill */}
            <path
              d={buildWavePath(smoothedFreq, waveX, waveBaseY, waveW, waveMaxH)}
              fill="url(#waveGrad)"
            />
            {/* Stroke — top line only */}
            <path
              d={(() => {
                const pts = smoothedFreq.map((v, i) => ({
                  x: waveX + (i / (smoothedFreq.length - 1)) * waveW,
                  y: waveBaseY - v * waveMaxH,
                }))
                if (pts.length < 2) return ''
                let d = `M ${pts[0].x} ${pts[0].y}`
                for (let i = 1; i < pts.length; i++) {
                  const prev = pts[i - 1]
                  const curr = pts[i]
                  const cpx = (prev.x + curr.x) / 2
                  d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
                }
                return d
              })()}
              fill="none"
              stroke="url(#waveStroke)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>

          {/* ── PROGRESS BAR ── */}
          {/* Track */}
          <rect x={barX} y={barY} width={barW} height={barH} rx={barH / 2}
            fill="rgba(255,255,255,0.1)" />
          {/* Fill */}
          <rect x={barX} y={barY} width={barW * progress} height={barH} rx={barH / 2}
            fill="url(#progressGrad)" />
          {/* Dot at progress head */}
          {progress > 0.01 && (
            <circle
              cx={barX + barW * progress}
              cy={barY + barH / 2}
              r={barH * 1.4}
              fill="#00e676"
            />
          )}

          {/* ── TIME ── */}
          <text
            x={cardX + cardW - cardW * 0.05}
            y={cardY + cardH * 0.58}
            textAnchor="end"
            fill="rgba(255,255,255,0.75)"
            fontSize={cardH * 0.12}
            fontFamily="Inter, monospace"
            fontWeight={300}
            letterSpacing="0.05em"
          >
            {fmt(currentTime)}
          </text>
        </svg>

        {/* ── ARTWORK ── */}
        <div style={{
          position: 'absolute',
          left: artX, top: artY,
          width: artSize, height: artSize,
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* ── TEXT ── */}
        <div style={{
          position: 'absolute',
          left: artX + artSize + cardW * 0.04,
          top: artY + artSize * 0.08,
          width: cardW * 0.42,
        }}>
          {/* Author */}
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: cardH * 0.1,
            fontWeight: 400,
            color: '#4dd0c4',
            letterSpacing: '0.02em',
            marginBottom: cardH * 0.04,
          }}>
            {artistName}
          </div>
          {/* Song */}
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: cardH * 0.18,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}>
            {songTitle}
          </div>
        </div>

        <Audio src={audioSrc} />
        <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
      </div>
    </EffectsWrapper>
  )
}
