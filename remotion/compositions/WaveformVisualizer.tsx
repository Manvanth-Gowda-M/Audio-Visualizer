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

export const WaveformVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor, typoStyle,
  durationInSeconds, lyricsFont = 'inter', effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const frequencyData = safeVisualize(audioData, frame, fps, 128)

  const activeLyric = getActiveLyric(lyrics, currentTime)
  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, lyricsFont)

  const barWidth = Math.floor(width / 128) - 2
  const cx = width / 2
  const cy = height / 2

  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.3), [0, fps * 0.3], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      {/* Dark gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, #050505 0%, ${accentColor}22 100%)`,
        }}
      />

      {/* Artwork */}
      <div
        style={{
          position: 'absolute',
          left: cx - 100,
          top: cy - 200,
          width: 200,
          height: 200,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: `0 0 30px ${accentColor}55`,
        }}
      >
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Waveform bars */}
      <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
        {frequencyData.map((val, i) => {
          const barH = Math.max(val * (height * 0.35), 4)
          const x = i * (barWidth + 2) + (width - 128 * (barWidth + 2)) / 2
          return (
            <g key={i}>
              {/* top bar */}
              <rect
                x={x}
                y={cy - barH}
                width={barWidth}
                height={barH}
                fill={accentColor}
                opacity={0.85}
                rx={2}
              />
              {/* bottom mirror */}
              <rect
                x={x}
                y={cy}
                width={barWidth}
                height={barH}
                fill={accentColor}
                opacity={0.4}
                rx={2}
              />
            </g>
          )
        })}
      </svg>

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
