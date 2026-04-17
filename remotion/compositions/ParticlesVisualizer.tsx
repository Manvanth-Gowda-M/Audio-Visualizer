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

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export const ParticlesVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const frequencyData = safeVisualize(audioData, frame, fps, 32)

  const bassEnergy = frequencyData.slice(0, 4).reduce((a, b) => a + b, 0) / 4
  const burst = interpolate(bassEnergy, [0, 1], [1, 3], { extrapolateRight: 'clamp' })

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  const cx = width / 2
  const cy = height / 2

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.3), [0, fps * 0.3], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  const particles = Array.from({ length: 150 }, (_, i) => {
    const rx = seededRandom(i * 3)
    const ry = seededRandom(i * 3 + 1)
    const speed = seededRandom(i * 3 + 2) * 0.5 + 0.5
    const size = seededRandom(i * 7) * 5 + 3
    const opacity = seededRandom(i * 11) * 0.7 + 0.3

    const angle = rx * Math.PI * 2
    const dist = ry * Math.min(width, height) * 0.45
    const t = (frame / fps) * speed * burst

    const x = cx + Math.cos(angle + t * 0.3) * dist * (1 + Math.sin(t * 0.7) * 0.2)
    const y = cy + Math.sin(angle + t * 0.3) * dist * (1 + Math.cos(t * 0.5) * 0.2)

    return { x, y, size, opacity }
  })

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#000' }}>
      {/* Blurred background */}
      <Img
        src={artworkSrc}
        style={{
          position: 'absolute',
          width: '110%',
          height: '110%',
          top: '-5%',
          left: '-5%',
          objectFit: 'cover',
          filter: 'blur(20px)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

      {/* Particles */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={accentColor}
            opacity={p.opacity}
          />
        ))}
      </svg>

      {/* Circular artwork */}
      <div
        style={{
          position: 'absolute',
          left: cx - 140,
          top: cy - 140,
          width: 280,
          height: 280,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `0 0 50px ${accentColor}88`,
        }}
      >
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Lyrics */}
      {activeLyric && (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: 0,
            right: 0,
            textAlign: 'center',
            padding: '0 80px',
            opacity: lyricOpacity,
            ...typoStyle_,
          }}
        >
          {activeLyric}
        </div>
      )}

      <Audio src={audioSrc} />
      <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
    </div>
    </EffectsWrapper>
  )
}
