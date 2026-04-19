import { useCurrentFrame, useVideoConfig, Img, interpolate } from 'remotion'
import { Audio } from '@remotion/media'
import { visualizeAudio, useAudioData, type MediaUtilsAudioData } from '@remotion/media-utils'
import { VisualizerProps, getActiveLyric, getTypographyStyle } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

function safeVisualize(audioData: MediaUtilsAudioData | null, frame: number, fps: number, n: number): number[] {
  if (!audioData) return new Array(n).fill(0)
  try {
    return visualizeAudio({ audioData, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0)
  } catch {
    return new Array(n).fill(0)
  }
}

export const NeonPlayerVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const freq = safeVisualize(audioData, frame, fps, 32)
  const overall = freq.reduce((a, b) => a + b, 0) / freq.length

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  const progress = Math.min(currentTime / durationInSeconds, 1)

  // Layout constants
  const padL = width * 0.05
  const padR = width * 0.05
  const eqW  = width * 0.38          // left EQ section width
  const artW = width * 0.38          // artwork card width
  const artH = height * 0.72
  const artX = width - padR - artW   // artwork card left edge
  const artY = (height - artH) / 2
  const artR = 40                    // corner radius

  // EQ bars — pyramid shape (tallest in middle)
  const eqCols = 14
  const eqRows = 12
  const cellW  = (eqW - padL) / eqCols
  const cellH  = (height * 0.55) / eqRows
  const eqBaseY = height * 0.72

  // Dashed line Y
  const lineY = height * 0.5

  // Pause button
  const btnX = artX - 28
  const btnY = lineY
  const btnR = 28

  // Neon glow color — purple/pink gradient like reference
  const neon1 = '#a855f7'
  const neon2 = '#ec4899'

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.4), [0, fps * 0.15], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#0a0a14' }}>
      {/* Dark gradient bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(88,28,135,0.18) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 50% 50% at 75% 50%, rgba(168,85,247,0.08) 0%, transparent 70%)',
      }} />

      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          {/* Neon border gradient */}
          <linearGradient id="neonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={neon1} />
            <stop offset="100%" stopColor={neon2} />
          </linearGradient>
          {/* Neon glow filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="artClip">
            <rect x={artX} y={artY} width={artW} height={artH} rx={artR} />
          </clipPath>
        </defs>

        {/* ── EQ PYRAMID BARS (left side) ── */}
        {Array.from({ length: eqCols }, (_, col) => {
          // Pyramid: tallest in center columns
          const distFromCenter = Math.abs(col - (eqCols - 1) / 2) / ((eqCols - 1) / 2)
          const maxRows = Math.round(eqRows * (1 - distFromCenter * 0.75))
          const freqVal = freq[col % freq.length] ?? 0
          const activeLit = Math.round(maxRows * (0.4 + freqVal * 0.6))

          return Array.from({ length: maxRows }, (_, row) => {
            const isLit = row < activeLit
            const x = padL + col * cellW + cellW * 0.15
            const y = eqBaseY - (row + 1) * cellH + cellH * 0.15
            const w = cellW * 0.7
            const h = cellH * 0.7
            // Color: bottom rows purple, top rows pink
            const t = row / maxRows
            const alpha = isLit ? (0.7 + t * 0.3) : 0.08
            const color = isLit
              ? `rgba(${Math.round(168 + t * 80)},${Math.round(85 - t * 40)},${Math.round(247 - t * 100)},${alpha})`
              : 'rgba(100,60,180,0.08)'

            return (
              <rect key={`${col}-${row}`}
                x={x} y={y} width={w} height={h}
                fill={color} rx={2}
              />
            )
          })
        })}

        {/* ── DASHED PROGRESS LINE ── */}
        <line
          x1={padL} y1={lineY}
          x2={artX - btnR - 8} y2={lineY}
          stroke="rgba(168,85,247,0.25)"
          strokeWidth={2}
          strokeDasharray="8,6"
        />
        {/* Progress fill */}
        <line
          x1={padL} y1={lineY}
          x2={padL + (artX - btnR - 8 - padL) * progress} y2={lineY}
          stroke="url(#neonBorder)"
          strokeWidth={2}
          strokeDasharray="8,6"
          filter="url(#softGlow)"
        />

        {/* ── ARTWORK CARD ── */}
        {/* Neon border glow (outer) */}
        <rect
          x={artX - 3} y={artY - 3}
          width={artW + 6} height={artH + 6}
          rx={artR + 3}
          fill="none"
          stroke="url(#neonBorder)"
          strokeWidth={3}
          opacity={0.5}
          filter="url(#neonGlow)"
        />
        {/* Neon border (crisp) */}
        <rect
          x={artX} y={artY}
          width={artW} height={artH}
          rx={artR}
          fill="none"
          stroke="url(#neonBorder)"
          strokeWidth={2.5}
        />

        {/* ── PAUSE BUTTON ── */}
        {/* Button glow */}
        <circle cx={btnX} cy={btnY} r={btnR + 6}
          fill="rgba(168,85,247,0.15)" filter="url(#neonGlow)" />
        {/* Button bg */}
        <circle cx={btnX} cy={btnY} r={btnR}
          fill="url(#neonBorder)" />
        {/* Pause icon */}
        <rect x={btnX - 9} y={btnY - 11} width={7} height={22} rx={2} fill="#fff" />
        <rect x={btnX + 2}  y={btnY - 11} width={7} height={22} rx={2} fill="#fff" />

        {/* ── LYRICS ── */}
        {activeLyric && (
          <text
            x={padL}
            y={height * 0.88}
            fill="#fff"
            opacity={lyricOpacity}
            fontSize={typoStyle_.fontSize as number * 0.55}
            fontFamily={typoStyle_.fontFamily as string}
            fontWeight={typoStyle_.fontWeight as number}
          >
            {activeLyric}
          </text>
        )}
      </svg>

      {/* ── ARTWORK IMAGE ── */}
      <div style={{
        position: 'absolute',
        left: artX, top: artY,
        width: artW, height: artH,
        borderRadius: artR,
        overflow: 'hidden',
      }}>
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Dark overlay on artwork */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
        }} />
      </div>

      {/* ── ARTIST / TRACK TEXT ── */}
      <div style={{
        position: 'absolute',
        left: padL,
        bottom: height * 0.18,
      }}>
        <div style={{
          fontSize: height * 0.075,
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          {/* Will be replaced by actual song title */}
          Artist
        </div>
        <div style={{
          fontSize: height * 0.04,
          color: neon1,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          marginTop: 4,
        }}>
          Track Name
        </div>
      </div>

      <Audio src={audioSrc} />
      <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
    </div>
    </EffectsWrapper>
  )
}
