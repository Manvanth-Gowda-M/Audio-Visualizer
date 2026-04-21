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

export const CassetteVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const freq = safeVisualize(audioData, frame, fps, 32)
  const bass = freq.slice(0, 4).reduce((a, b) => a + b, 0) / 4
  const overall = freq.reduce((a, b) => a + b, 0) / freq.length

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  const cx = width / 2
  const cy = height / 2

  // Tape reel spin — left reel fills, right reel empties
  const progress = Math.min(currentTime / durationInSeconds, 1)
  const leftReelR = 40 + progress * 25
  const rightReelR = 65 - progress * 25
  const reelSpin = (frame / fps) * 120 * (1 + overall)

  // VU meter levels (8 bars each side)
  const vuBars = 8
  const vuLeft = freq.slice(0, vuBars)
  const vuRight = freq.slice(vuBars, vuBars * 2)

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.4), [0, fps * 0.15], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  // Cassette body dimensions
  const bodyW = 520
  const bodyH = 320
  const bodyX = cx - bodyW / 2
  const bodyY = cy - bodyH / 2 - 20

  const reelCY = bodyY + bodyH * 0.42
  const leftReelCX = cx - 110
  const rightReelCX = cx + 110

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
    <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      {/* Warm retro background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, #1a0a00 0%, #0d0d1a 50%, #001a0d 100%)`,
      }} />
      <Img src={artworkSrc} style={{
        position: 'absolute', width: '100%', height: '100%',
        objectFit: 'cover', filter: 'blur(30px) brightness(0.15) sepia(0.5)',
        transform: 'scale(1.1)',
      }} />

      {/* Grain texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <filter id="cassetteGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#111" />
          </linearGradient>
          <linearGradient id="tapeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a0800" />
            <stop offset="100%" stopColor="#0d0500" />
          </linearGradient>
        </defs>

        {/* Cassette body */}
        <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH}
          rx={16} fill="url(#bodyGrad)" stroke="#444" strokeWidth={2} />

        {/* Label area */}
        <rect x={bodyX + 20} y={bodyY + 20} width={bodyW - 40} height={bodyH * 0.35}
          rx={8} fill="#1a1a2e" stroke="#333" strokeWidth={1} />

        {/* Artwork rendered via div+Img overlay below — SVG <image> bypasses Remotion asset resolution */}

        {/* Tape window */}
        <rect x={cx - 160} y={reelCY - 70} width={320} height={130}
          rx={8} fill="url(#tapeGrad)" stroke="#333" strokeWidth={1} />

        {/* Tape path */}
        <path d={`M ${leftReelCX + leftReelR} ${reelCY} Q ${cx} ${reelCY + 50} ${rightReelCX - rightReelR} ${reelCY}`}
          fill="none" stroke="#3a2000" strokeWidth={6} />

        {/* Left reel */}
        <g transform={`rotate(${-reelSpin}, ${leftReelCX}, ${reelCY})`}>
          <circle cx={leftReelCX} cy={reelCY} r={leftReelR} fill="#222" stroke="#444" strokeWidth={2} />
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <line key={i}
                x1={leftReelCX + Math.cos(a) * 8} y1={reelCY + Math.sin(a) * 8}
                x2={leftReelCX + Math.cos(a) * (leftReelR - 4)} y2={reelCY + Math.sin(a) * (leftReelR - 4)}
                stroke="#555" strokeWidth={2} />
            )
          })}
          <circle cx={leftReelCX} cy={reelCY} r={8} fill="#333" />
        </g>

        {/* Right reel */}
        <g transform={`rotate(${reelSpin}, ${rightReelCX}, ${reelCY})`}>
          <circle cx={rightReelCX} cy={reelCY} r={rightReelR} fill="#222" stroke="#444" strokeWidth={2} />
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <line key={i}
                x1={rightReelCX + Math.cos(a) * 8} y1={reelCY + Math.sin(a) * 8}
                x2={rightReelCX + Math.cos(a) * (rightReelR - 4)} y2={reelCY + Math.sin(a) * (rightReelR - 4)}
                stroke="#555" strokeWidth={2} />
            )
          })}
          <circle cx={rightReelCX} cy={reelCY} r={8} fill="#333" />
        </g>

        {/* VU Meters — left side */}
        <g filter="url(#cassetteGlow)">
          {vuLeft.map((val, i) => {
            const barH = 12
            const barW = 28
            const x = bodyX + 30
            const y = bodyY + bodyH * 0.62 + i * (barH + 3)
            const filled = Math.round(val * 6)
            return Array.from({ length: 6 }, (_, j) => {
              const isLit = j < filled
              const isRed = j >= 4
              const color = isRed ? '#ff3333' : isLit ? accentColor : '#222'
              return (
                <rect key={j} x={x + j * (barW / 6 + 1)} y={y}
                  width={barW / 6} height={barH}
                  fill={color} opacity={isLit ? 0.9 : 0.3} rx={1} />
              )
            })
          })}
        </g>

        {/* VU Meters — right side */}
        <g filter="url(#cassetteGlow)">
          {vuRight.map((val, i) => {
            const barH = 12
            const barW = 28
            const x = bodyX + bodyW - 58
            const y = bodyY + bodyH * 0.62 + i * (barH + 3)
            const filled = Math.round(val * 6)
            return Array.from({ length: 6 }, (_, j) => {
              const isLit = j < filled
              const isRed = j >= 4
              const color = isRed ? '#ff3333' : isLit ? accentColor : '#222'
              return (
                <rect key={j} x={x + j * (barW / 6 + 1)} y={y}
                  width={barW / 6} height={barH}
                  fill={color} opacity={isLit ? 0.9 : 0.3} rx={1} />
              )
            })
          })}
        </g>

        {/* Progress bar below cassette */}
        <rect x={bodyX} y={bodyY + bodyH + 20} width={bodyW} height={4}
          rx={2} fill="#222" />
        <rect x={bodyX} y={bodyY + bodyH + 20} width={bodyW * progress} height={4}
          rx={2} fill={accentColor} opacity={0.8} />

        {/* Accent glow pulse on bass hit */}
        <circle cx={cx} cy={cy} r={vinylPulse(bass, bodyW * 0.6)}
          fill="none" stroke={accentColor}
          strokeWidth={2} opacity={bass * 0.3} />
      </svg>

      {/* Cassette label artwork — positioned overlay using Remotion <Img>.
          SVG's native <image> element cannot resolve blob: URLs or CORP-gated files
          in the render worker, so we render this as an absolutely-positioned div instead. */}
      <div style={{
        position: 'absolute',
        left: bodyX + 24,
        top:  bodyY + 24,
        width:  bodyH * 0.35 - 8,
        height: bodyH * 0.35 - 8,
        borderRadius: 4,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Lyrics */}
      {activeLyric && (
        <div style={{
          position: 'absolute', bottom: '6%', left: 0, right: 0,
          textAlign: 'center', padding: '0 80px',
          opacity: lyricOpacity, ...typoStyle_,
        }}>
          {activeLyric}
        </div>
      )}

      <Audio src={audioSrc} />
      <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
    </div>
    </EffectsWrapper>
  )
}

function vinylPulse(bass: number, base: number) {
  return base * (0.5 + bass * 0.5)
}
