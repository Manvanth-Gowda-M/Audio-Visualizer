import { useCurrentFrame, useVideoConfig, Audio, Img, interpolate } from 'remotion'
import { visualizeAudio } from '@remotion/media-utils'
import { VisualizerProps, getActiveLyric, getTypographyStyle } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

function safeVisualize(src: string, frame: number, fps: number, n: number): number[] {
  if (!src) return new Array(n).fill(0)
  try {
    return visualizeAudio({ src, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0)
  } catch {
    return new Array(n).fill(0)
  }
}

function seededRand(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const GlitchVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const freq = safeVisualize(audioSrc, frame, fps, 128)
  const bass = freq.slice(0, 6).reduce((a, b) => a + b, 0) / 6
  const mid = freq.slice(20, 40).reduce((a, b) => a + b, 0) / 20

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  // Glitch intensity driven by bass
  const glitchIntensity = interpolate(bass, [0, 0.8, 1], [0, 8, 30], { extrapolateRight: 'clamp' })
  const rgbShift = glitchIntensity * 0.6

  // Scanline opacity
  const scanlineOpacity = 0.08 + mid * 0.06

  // Horizontal glitch slices (deterministic per frame)
  const glitchSlices = Array.from({ length: 6 }, (_, i) => {
    const active = seededRand(frame * 0.3 + i * 7) < bass * 0.7
    const y = seededRand(i * 13 + frame * 0.1) * height
    const h = 4 + seededRand(i * 5) * 20
    const shift = (seededRand(i * 3 + frame * 0.2) - 0.5) * glitchIntensity * 4
    return { active, y, h, shift }
  })

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.3), [0, fps * 0.1], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  const cx = width / 2
  const cy = height / 2

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#000' }}>
      {/* RGB-shifted artwork layers */}
      <Img src={artworkSrc} style={{
        position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
        filter: `blur(2px) brightness(0.5)`,
        transform: `translateX(${-rgbShift}px)`,
        mixBlendMode: 'screen',
        opacity: 0.6,
      }} />
      <Img src={artworkSrc} style={{
        position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
        filter: `blur(2px) brightness(0.5) hue-rotate(120deg)`,
        transform: `translateX(${rgbShift}px)`,
        mixBlendMode: 'screen',
        opacity: 0.4,
      }} />
      <Img src={artworkSrc} style={{
        position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
        filter: `blur(2px) brightness(0.5) hue-rotate(240deg)`,
        mixBlendMode: 'screen',
        opacity: 0.4,
      }} />

      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

      {/* Scanlines */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={width} height={height}>
        <defs>
          <pattern id="scanlines" x="0" y="0" width={width} height={4} patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width={width} height={2} fill={`rgba(0,0,0,${scanlineOpacity})`} />
          </pattern>
          <filter id="glitchGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="url(#scanlines)" />

        {/* Glitch horizontal slices */}
        {glitchSlices.map((s, i) =>
          s.active ? (
            <rect key={i} x={s.shift} y={s.y} width={width} height={s.h}
              fill={`${accentColor}22`} />
          ) : null
        )}

        {/* Spectrum bars — bottom */}
        <g filter="url(#glitchGlow)">
          {freq.map((val, i) => {
            const bw = (width / freq.length) - 1
            const bh = val * height * 0.3
            const x = i * (bw + 1)
            const hue = (i / freq.length) * 60
            return (
              <rect key={i} x={x} y={height - bh} width={bw} height={bh}
                fill={`hsl(${hue + 260}, 100%, 65%)`}
                opacity={0.7 + val * 0.3}
              />
            )
          })}
        </g>

        {/* Center artwork with glitch border */}
        <rect x={cx - 155} y={cy - 155} width={310} height={310}
          fill="none" stroke={accentColor} strokeWidth={2} opacity={0.6} />
        <rect x={cx - 155 + glitchIntensity * 0.5} y={cy - 155} width={310} height={310}
          fill="none" stroke="#ff0055" strokeWidth={1} opacity={0.4} />
        <rect x={cx - 155 - glitchIntensity * 0.3} y={cy - 155} width={310} height={310}
          fill="none" stroke="#00ffff" strokeWidth={1} opacity={0.4} />
      </svg>

      {/* Center artwork */}
      <div style={{
        position: 'absolute',
        left: cx - 150, top: cy - 150,
        width: 300, height: 300,
        overflow: 'hidden',
      }}>
        <Img src={artworkSrc} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          filter: `contrast(1.1) saturate(1.3)`,
          transform: `translateX(${glitchIntensity * 0.3}px)`,
        }} />
      </div>

      {/* Lyrics with glitch effect */}
      {activeLyric && (
        <div style={{
          position: 'absolute', bottom: '10%', left: 0, right: 0,
          textAlign: 'center', padding: '0 80px', opacity: lyricOpacity,
        }}>
          {/* Shadow copies for RGB split */}
          <div style={{
            ...typoStyle_,
            position: 'absolute', left: 0, right: 0,
            color: '#ff0055', opacity: 0.6,
            transform: `translateX(${-rgbShift * 0.5}px)`,
            textShadow: 'none',
          }}>{activeLyric}</div>
          <div style={{
            ...typoStyle_,
            position: 'absolute', left: 0, right: 0,
            color: '#00ffff', opacity: 0.6,
            transform: `translateX(${rgbShift * 0.5}px)`,
            textShadow: 'none',
          }}>{activeLyric}</div>
          <div style={{ ...typoStyle_, position: 'relative' }}>{activeLyric}</div>
        </div>
      )}

      <Audio src={audioSrc} />
      <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
    </div>
    </EffectsWrapper>
  )
}
