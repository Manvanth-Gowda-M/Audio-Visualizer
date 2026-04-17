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

export const CircleVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const frequencyData = safeVisualize(audioData, frame, fps, 80)

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  const cx = width / 2
  const cy = height / 2
  const radius = 180

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.3), [0, fps * 0.3], [0, 1], { extrapolateRight: 'clamp' })
    : 0

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
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
        }}
      />

      {/* SVG visualizer */}
      <svg
        style={{ position: 'absolute', inset: 0 }}
        width={width}
        height={height}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)">
          {frequencyData.map((val, i) => {
            const angle = (i / 80) * Math.PI * 2 - Math.PI / 2
            const barHeight = val * 120 + 4
            const x1 = cx + Math.cos(angle) * radius
            const y1 = cy + Math.sin(angle) * radius
            const x2 = cx + Math.cos(angle) * (radius + barHeight)
            const y2 = cy + Math.sin(angle) * (radius + barHeight)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={accentColor}
                strokeWidth={3}
                strokeLinecap="round"
              />
            )
          })}
        </g>
      </svg>

      {/* Circular artwork */}
      <div
        style={{
          position: 'absolute',
          left: cx - 150,
          top: cy - 150,
          width: 300,
          height: 300,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `0 0 40px ${accentColor}66`,
        }}
      >
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Lyrics */}
      {activeLyric && (
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
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
