import { useCurrentFrame, useVideoConfig, Audio, Img, interpolate } from 'remotion'
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

export const VinylVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const freq = safeVisualize(audioData, frame, fps, 64)
  const bass = freq.slice(0, 4).reduce((a, b) => a + b, 0) / 4

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  const cx = width / 2
  const cy = height / 2
  const vinylR = 260
  const labelR = 100
  const spinDeg = (frame / fps) * 33.3 * 6 // 33.3 RPM

  // Aurora layers
  const auroraOpacity = interpolate(bass, [0, 1], [0.15, 0.45], { extrapolateRight: 'clamp' })

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.4), [0, fps * 0.15], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#0a0a0f' }}>
      {/* Aurora background blobs */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${accentColor}${Math.round(auroraOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 60% 80% at 80% 40%, ${accentColor}22 0%, transparent 70%)`,
      }} />

      {/* Blurred artwork bg */}
      <Img src={artworkSrc} style={{
        position: 'absolute', width: '100%', height: '100%',
        objectFit: 'cover', filter: 'blur(40px) brightness(0.2)', transform: 'scale(1.1)',
      }} />

      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        <defs>
          <radialGradient id="vinylGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="40%" stopColor="#111" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <filter id="vinylGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="vinylClip">
            <circle cx={cx} cy={cy} r={vinylR} />
          </clipPath>
        </defs>

        {/* Vinyl disc */}
        <g transform={`rotate(${spinDeg}, ${cx}, ${cy})`}>
          <circle cx={cx} cy={cy} r={vinylR} fill="url(#vinylGrad)" />
          {/* Grooves */}
          {Array.from({ length: 18 }, (_, i) => {
            const r = labelR + 12 + i * 8
            return (
              <circle key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke="#ffffff08" strokeWidth={1} />
            )
          })}
          {/* Sheen */}
          <ellipse cx={cx - 60} cy={cy - 80} rx={80} ry={40}
            fill="none" stroke="#ffffff12" strokeWidth={2}
            transform={`rotate(-30, ${cx - 60}, ${cy - 80})`} />
        </g>

        {/* Frequency arcs around vinyl */}
        <g filter="url(#vinylGlow)">
          {freq.map((val, i) => {
            const angle = (i / freq.length) * Math.PI * 2 - Math.PI / 2
            const innerR = vinylR + 8
            const outerR = vinylR + 8 + val * 80
            const x1 = cx + Math.cos(angle) * innerR
            const y1 = cy + Math.sin(angle) * innerR
            const x2 = cx + Math.cos(angle) * outerR
            const y2 = cy + Math.sin(angle) * outerR
            const alpha = Math.round((0.5 + val * 0.5) * 255).toString(16).padStart(2, '0')
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={`${accentColor}${alpha}`} strokeWidth={3} strokeLinecap="round" />
            )
          })}
        </g>

        {/* Label circle */}
        <circle cx={cx} cy={cy} r={labelR} fill="#111" />
        <image href={artworkSrc} x={cx - labelR} y={cy - labelR}
          width={labelR * 2} height={labelR * 2}
          clipPath="url(#vinylClip)"
          style={{ clipPath: `circle(${labelR}px at ${cx}px ${cy}px)` }}
        />
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={8} fill="#0a0a0f" />

        {/* Tonearm */}
        <g transform={`rotate(${25 + bass * 5}, ${cx + vinylR + 80}, ${cy - vinylR - 40})`}>
          <line x1={cx + vinylR + 80} y1={cy - vinylR - 40}
            x2={cx + vinylR - 20} y2={cy + 20}
            stroke="#888" strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx + vinylR + 80} cy={cy - vinylR - 40} r={10} fill="#555" />
        </g>
      </svg>

      {/* Song info */}
      <div style={{
        position: 'absolute', bottom: '8%', left: 0, right: 0,
        textAlign: 'center', padding: '0 80px',
      }}>
        {activeLyric && (
          <div style={{ opacity: lyricOpacity, ...typoStyle_, marginBottom: 12 }}>
            {activeLyric}
          </div>
        )}
      </div>

      <Audio src={audioSrc} />
      <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
    </div>
    </EffectsWrapper>
  )
}
