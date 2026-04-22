import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  spring,
} from 'remotion'
import { Audio } from '@remotion/media'
import {
  visualizeAudio,
  useAudioData,
  type MediaUtilsAudioData,
} from '@remotion/media-utils'
import { VisualizerProps } from './shared'

// ── Helpers ────────────────────────────────────────────────────────────────

function safeVisualize(
  audioData: MediaUtilsAudioData | null,
  frame: number,
  fps: number,
  n: number,
): number[] {
  if (!audioData) return new Array(n).fill(0)
  try {
    return (
      visualizeAudio({ audioData, frame, fps, numberOfSamples: n }) ??
      new Array(n).fill(0)
    )
  } catch {
    return new Array(n).fill(0)
  }
}

// Smoothly interpolate between two number arrays (lerp)
function lerpArray(prev: number[], next: number[], t: number): number[] {
  return next.map((v, i) => (prev[i] ?? 0) * (1 - t) + v * t)
}

// ── Component ──────────────────────────────────────────────────────────────

export const NeonGlassVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  songTitle = 'Song Title',
  artistName = 'Artist Name',
  durationInSeconds,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const t = frame / fps

  // ── Audio ──────────────────────────────────────────────────────────────
  const audioData = useAudioData(audioSrc)
  const rawFreq   = safeVisualize(audioData, frame, fps, 48)
  // Smooth the freq data: blend current with a 3-frame-old snapshot
  const prevFreq  = safeVisualize(audioData, Math.max(0, frame - 3), fps, 48)
  const freq      = lerpArray(prevFreq, rawFreq, 0.55)
  const overall   = Math.min(freq.reduce((a, b) => a + b, 0) / freq.length, 1)

  // Loudness-driven subtle card glow intensity
  const loudness = interpolate(overall, [0, 1], [0, 1], { extrapolateRight: 'clamp' })

  // ── Entry animation ────────────────────────────────────────────────────
  const cardEntrance = spring({ frame, fps, config: { damping: 22, mass: 1.1, stiffness: 90 }, durationInFrames: 50 })
  const cardScale    = interpolate(cardEntrance, [0, 1], [0.88, 1])
  const cardOpacity  = interpolate(cardEntrance, [0, 1], [0, 1])

  // ── Layout ─────────────────────────────────────────────────────────────
  const cardW  = Math.round(width  * 0.36)
  const cardH  = Math.round(height * 0.82)
  const cardX  = (width  - cardW) / 2
  const cardY  = (height - cardH) / 2
  const cardR  = 32

  const artW   = cardW - 48
  const artH   = Math.round(cardH * 0.54)
  const artX   = cardX + 24
  const artY   = cardY + 24
  const artR   = 20

  // Waveform section — bottom of card
  const wfY   = artY + artH + 36
  const wfH   = 56
  const wfW   = cardW - 48
  const wfX   = cardX + 24
  const wfBars = 40

  // Text positions
  const titleY  = wfY - 22
  const artistY = wfY - 4

  // ── Neon background lines ───────────────────────────────────────────────
  // 18 diagonal lines animated left → right very slowly
  const LINE_COUNT = 22
  const speed      = 0.18 // pixels per frame at 30fps base
  const lineOffset = (t * speed * fps) % (width * 0.12) // tile seamlessly

  const neonMid   = '#e040fb'    // bright magenta
  const neonDark  = '#7b1fa2'    // deep purple

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0010',
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      }}
    >

      {/* ── BACKGROUND LAYER ───────────────────────────────────────────── */}
      {/* Deep purple radial glow centre */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 70% at 50% 50%,
          rgba(120,0,160,0.28) 0%,
          rgba(60,0,100,0.12) 45%,
          transparent 100%)`,
      }} />

      {/* Animated neon diagonal lines SVG */}
      <svg
        style={{ position: 'absolute', inset: 0 }}
        width={width}
        height={height}
      >
        <defs>
          <filter id="ngl-blur-far" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <filter id="ngl-glow-near" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Far lines (blurred, dim) */}
        {Array.from({ length: LINE_COUNT }, (_, i) => {
          const frac   = i / LINE_COUNT
          const baseX  = frac * width * 1.5 - width * 0.25
          const animX  = baseX + lineOffset
          const x1     = animX - height * 0.7
          const x2     = animX + height * 0.1
          const alpha  = 0.09 + frac * 0.07
          return (
            <line
              key={`far-${i}`}
              x1={x1} y1={0}
              x2={x2} y2={height}
              stroke={neonDark}
              strokeWidth={i % 3 === 0 ? 2.5 : 1.2}
              strokeOpacity={alpha}
              filter="url(#ngl-blur-far)"
            />
          )
        })}

        {/* Near lines (crisp, brighter) */}
        {Array.from({ length: Math.floor(LINE_COUNT * 0.5) }, (_, i) => {
          const frac   = i / (LINE_COUNT * 0.5)
          const baseX  = frac * width * 1.4 - width * 0.2
          const animX  = baseX + lineOffset * 1.4
          const x1     = animX - height * 0.7
          const x2     = animX + height * 0.1
          const alpha  = 0.18 + frac * 0.12
          return (
            <line
              key={`near-${i}`}
              x1={x1} y1={0}
              x2={x2} y2={height}
              stroke={neonMid}
              strokeWidth={1.5}
              strokeOpacity={alpha}
              filter="url(#ngl-glow-near)"
            />
          )
        })}
      </svg>

      {/* ── GLASS CARD ─────────────────────────────────────────────────── */}
      <svg
        style={{
          position: 'absolute', inset: 0,
          transform: `scale(${cardScale})`,
          transformOrigin: 'center center',
          opacity: cardOpacity,
        }}
        width={width}
        height={height}
      >
        <defs>
          {/* Card glass fill */}
          <linearGradient id="ngl-card-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>

          {/* Card border glow gradient */}
          <linearGradient id="ngl-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgba(224,64,251,0.55)" />
            <stop offset="50%"  stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(224,64,251,0.35)" />
          </linearGradient>

          {/* Artwork glow */}
          <filter id="ngl-art-glow" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur stdDeviation={5 + loudness * 6} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Card drop shadow */}
          <filter id="ngl-card-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow
              dx="0" dy="8"
              stdDeviation={20 + loudness * 12}
              floodColor={neonMid}
              floodOpacity={0.22 + loudness * 0.14}
            />
          </filter>

          {/* Clip path for card */}
          <clipPath id="ngl-card-clip">
            <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={cardR} />
          </clipPath>

          {/* Clip for artwork */}
          <clipPath id="ngl-art-clip">
            <rect x={artX} y={artY} width={artW} height={artH} rx={artR} />
          </clipPath>
        </defs>

        {/* Card outer neon glow ring */}
        <rect
          x={cardX - 3} y={cardY - 3}
          width={cardW + 6} height={cardH + 6}
          rx={cardR + 3}
          fill="none"
          stroke={neonMid}
          strokeWidth={2}
          strokeOpacity={0.3 + loudness * 0.25}
          filter="url(#ngl-art-glow)"
        />

        {/* Glass card background */}
        <rect
          x={cardX} y={cardY}
          width={cardW} height={cardH}
          rx={cardR}
          fill="url(#ngl-card-fill)"
          filter="url(#ngl-card-shadow)"
        />

        {/* Card border */}
        <rect
          x={cardX} y={cardY}
          width={cardW} height={cardH}
          rx={cardR}
          fill="none"
          stroke="url(#ngl-border-grad)"
          strokeWidth={1.5}
        />

        {/* Artwork border glow */}
        <rect
          x={artX - 2} y={artY - 2}
          width={artW + 4} height={artH + 4}
          rx={artR + 2}
          fill="none"
          stroke={neonMid}
          strokeWidth={1.5}
          strokeOpacity={0.2 + loudness * 0.25}
          filter="url(#ngl-art-glow)"
        />

        {/* ── WAVEFORM ── */}
        {Array.from({ length: wfBars }, (_, i) => {
          const freqIdx = Math.round((i / wfBars) * (freq.length - 1))
          const val     = freq[freqIdx] ?? 0
          const barH    = Math.max(3, val * wfH * 0.9 + 3)
          const barW    = (wfW / wfBars) * 0.55
          const x       = wfX + (i / wfBars) * wfW
          const centreY = wfY + wfH / 2
          // Mirror top + bottom
          const alpha   = 0.45 + val * 0.55
          const fill    = val > 0.4 ? neonMid : 'rgba(255,255,255,0.7)'

          return (
            <g key={i}>
              {/* Top bar */}
              <rect
                x={x} y={centreY - barH}
                width={barW} height={barH}
                rx={2}
                fill={fill}
                fillOpacity={alpha}
              />
              {/* Bottom mirror */}
              <rect
                x={x} y={centreY}
                width={barW} height={barH}
                rx={2}
                fill={fill}
                fillOpacity={alpha * 0.4}
              />
            </g>
          )
        })}

        {/* Waveform centre line */}
        <line
          x1={wfX} y1={wfY + wfH / 2}
          x2={wfX + wfW} y2={wfY + wfH / 2}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        {/* Song title */}
        <text
          x={cardX + cardW / 2}
          y={titleY}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={height * 0.038}
          fontWeight={700}
          fontFamily='"Inter", "Helvetica Neue", Arial, sans-serif'
          letterSpacing="-0.01em"
        >
          {songTitle}
        </text>

        {/* Artist name */}
        <text
          x={cardX + cardW / 2}
          y={artistY + height * 0.032}
          textAnchor="middle"
          fill="rgba(230,180,255,0.75)"
          fontSize={height * 0.024}
          fontWeight={400}
          fontFamily='"Inter", "Helvetica Neue", Arial, sans-serif'
          letterSpacing="0.04em"
        >
          {artistName.toUpperCase()}
        </text>

      </svg>

      {/* ── ARTWORK IMAGE (HTML layer so backdrop-filter works) ─────────── */}
      <div
        style={{
          position: 'absolute',
          left: artX,
          top:  artY,
          width: artW,
          height: artH,
          borderRadius: artR,
          overflow: 'hidden',
          transform: `scale(${cardScale})`,
          transformOrigin: `${width / 2}px ${height / 2}px`,
          opacity: cardOpacity,
        }}
      >
        <Img
          src={artworkSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Top inner glow overlay on artwork */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(
            180deg,
            rgba(224,64,251,0.04) 0%,
            transparent 40%,
            rgba(0,0,0,0.25) 100%
          )`,
        }} />
      </div>

      {/* Backdrop blur overlay for glass card effect */}
      <div
        style={{
          position: 'absolute',
          left: cardX,
          top:  cardY,
          width: cardW,
          height: cardH,
          borderRadius: cardR,
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          transform: `scale(${cardScale})`,
          transformOrigin: `${width / 2}px ${height / 2}px`,
          opacity: cardOpacity * 0.99,
          // This must sit BELOW the card SVG but ABOVE the bg
          zIndex: -1,
        }}
      />

      <Audio src={audioSrc} />
    </div>
  )
}
