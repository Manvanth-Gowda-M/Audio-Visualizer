import { useCurrentFrame, useVideoConfig, Audio, Img, interpolate, spring } from 'remotion'
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

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/* Polar → cartesian on a circle */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/* SVG arc path from startDeg to endDeg */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg)
  const e = polar(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

let smoothBass = 0
let smoothAmp  = 0

export const CircularPlayerVisualizer: React.FC<VisualizerProps> = ({
  audioSrc, artworkSrc, lyrics, accentColor,
  typoStyle, durationInSeconds, lyricsFont = 'inter',
  effects = [], songTitle = 'Song Title', artistName = 'Artist',
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const freq = safeVisualize(audioData, frame, fps, 32)
  const rawBass = freq.slice(0, 4).reduce((a, b) => a + b, 0) / 4
  const rawAmp  = freq.reduce((a, b) => a + b, 0) / freq.length
  smoothBass = smoothBass + (rawBass - smoothBass) * 0.1
  smoothAmp  = smoothAmp  + (rawAmp  - smoothAmp)  * 0.1

  const progress = Math.min(currentTime / durationInSeconds, 1)
  const fadeIn   = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: 'clamp' })

  // Active lyric
  const activeLyric = (() => {
    for (const l of lyrics) {
      const end = l.end ?? (l.time + 5)
      if (currentTime >= l.time && currentTime < end) return l.text
    }
    return ''
  })()
  const lyricOpacity = activeLyric
    ? interpolate(frame % (fps * 0.4), [0, fps * 0.15], [0, 1], { extrapolateRight: 'clamp' })
    : 0

  // Layout — 9:16
  const cx = width / 2
  // Arc center — lower half of screen
  const arcCY = height * 0.68

  // Arc params — semi-circle from -160° to -20° (bottom-heavy)
  const ARC_START = -160
  const ARC_END   = -20
  const ARC_RANGE = ARC_END - ARC_START
  const arcR      = width * 0.42
  const progressDeg = ARC_START + ARC_RANGE * progress
  const dotPos    = polar(cx, arcCY, arcR, progressDeg)

  // Inner reactive arc (bass)
  const innerR    = arcR * (0.72 + smoothBass * 0.08)

  // Play button
  const btnR      = width * 0.16
  const btnCY     = arcCY + arcR * 0.18
  const glowScale = 1 + smoothAmp * 0.12
  const pulseScale = 1 + 0.025 * Math.sin((frame / fps) * 1.2 * Math.PI)

  // Heart pulse
  const heartScale = 1 + 0.08 * Math.sin((frame / fps) * 0.8 * Math.PI)

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ width, height, position: 'relative', overflow: 'hidden', opacity: fadeIn }}>

        {/* ── BACKGROUND ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #0a0000 0%, #1a0000 30%, #0d0000 60%, #000 100%)',
        }} />
        {/* Radial red glow from center */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 50% 68%, rgba(180,0,0,0.22) 0%, transparent 70%)`,
        }} />

        {/* ── BLURRED ARTWORK TOP ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: height * 0.42,
          overflow: 'hidden',
        }}>
          <Img src={artworkSrc} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'blur(0px) brightness(0.7)',
          }} />
          {/* Fade to dark at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '60%',
            background: 'linear-gradient(transparent, #0a0000)',
          }} />
          {/* Side vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, transparent 40%, rgba(0,0,0,0.7) 100%)',
          }} />
        </div>

        {/* ── SONG INFO (below artwork) ── */}
        <div style={{
          position: 'absolute',
          top: height * 0.36,
          left: 0, right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: width * 0.055,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {songTitle}
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: width * 0.035,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            marginTop: 4,
          }}>
            {artistName}
          </div>
        </div>

        {/* ── LYRIC LINE ── */}
        {activeLyric && (
          <div style={{
            position: 'absolute',
            top: height * 0.46,
            left: 0, right: 0,
            textAlign: 'center',
            padding: '0 40px',
            opacity: lyricOpacity,
            fontFamily: 'Inter, sans-serif',
            fontSize: width * 0.038,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.55)',
            fontStyle: 'italic',
          }}>
            {activeLyric}
          </div>
        )}

        {/* ── MAIN SVG LAYER ── */}
        <svg style={{ position: 'absolute', inset: 0 }} width={width} height={height}>
          <defs>
            {/* Red glow filter */}
            <filter id="redGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="btnGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="20" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial gradient for arc background disc */}
            <radialGradient id="discGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(30,0,0,0.9)" />
              <stop offset="100%" stopColor="rgba(5,0,0,0.95)" />
            </radialGradient>
          </defs>

          {/* ── DARK DISC behind arc ── */}
          <circle cx={cx} cy={arcCY} r={arcR * 1.12}
            fill="url(#discGrad)"
            opacity={0.92}
          />

          {/* ── INNER REACTIVE ARC (bass) ── */}
          <path
            d={arcPath(cx, arcCY, innerR, ARC_START, ARC_END)}
            fill="none"
            stroke={`rgba(200,0,0,${0.25 + smoothBass * 0.4})`}
            strokeWidth={innerR * 0.06}
            strokeLinecap="round"
            filter="url(#redGlow)"
          />

          {/* ── PROGRESS ARC TRACK ── */}
          <path
            d={arcPath(cx, arcCY, arcR, ARC_START, ARC_END)}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* ── PROGRESS ARC FILL ── */}
          {progress > 0.005 && (
            <path
              d={arcPath(cx, arcCY, arcR, ARC_START, progressDeg)}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={2.5}
              strokeLinecap="round"
              filter="url(#softGlow)"
            />
          )}

          {/* ── PROGRESS DOT ── */}
          <circle
            cx={dotPos.x} cy={dotPos.y} r={8}
            fill="#fff"
            filter="url(#softGlow)"
          />
          <circle cx={dotPos.x} cy={dotPos.y} r={4} fill="#fff" />

          {/* ── HEART ICON ── */}
          <g transform={`translate(${cx}, ${arcCY - arcR * 0.38}) scale(${heartScale})`}>
            <path
              d="M0,-10 C-3,-16 -12,-16 -12,-8 C-12,0 0,10 0,10 C0,10 12,0 12,-8 C12,-16 3,-16 0,-10 Z"
              fill="rgba(220,30,30,0.9)"
              filter="url(#softGlow)"
            />
          </g>

          {/* ── TIME DISPLAY ── */}
          <text
            x={cx} y={arcCY - arcR * 0.18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.85)"
            fontSize={width * 0.048}
            fontFamily="Inter, monospace"
            fontWeight={300}
            letterSpacing="0.05em"
          >
            {fmt(currentTime)} / {fmt(durationInSeconds)}
          </text>

          {/* ── PLAY BUTTON GLOW RINGS ── */}
          {[3.2, 2.4, 1.8].map((mult, i) => (
            <circle key={i}
              cx={cx} cy={btnCY}
              r={btnR * mult * glowScale}
              fill="none"
              stroke={`rgba(180,0,0,${(0.12 - i * 0.03) + smoothAmp * 0.08})`}
              strokeWidth={btnR * 0.15}
              filter="url(#btnGlow)"
            />
          ))}

          {/* ── PLAY BUTTON OUTER RING (red) ── */}
          <circle cx={cx} cy={btnCY} r={btnR * 1.35 * pulseScale}
            fill="none"
            stroke={`rgba(200,0,0,${0.6 + smoothAmp * 0.3})`}
            strokeWidth={btnR * 0.12}
            filter="url(#redGlow)"
          />

          {/* ── PLAY BUTTON INNER DARK RING ── */}
          <circle cx={cx} cy={btnCY} r={btnR * 1.15}
            fill="rgba(20,0,0,0.8)"
          />

          {/* ── PLAY BUTTON WHITE CIRCLE ── */}
          <circle cx={cx} cy={btnCY} r={btnR * pulseScale}
            fill="#fff"
          />

          {/* ── PAUSE ICON ── */}
          <rect
            x={cx - btnR * 0.22} y={btnCY - btnR * 0.32}
            width={btnR * 0.14} height={btnR * 0.64}
            rx={btnR * 0.04} fill="#111"
          />
          <rect
            x={cx + btnR * 0.08} y={btnCY - btnR * 0.32}
            width={btnR * 0.14} height={btnR * 0.64}
            rx={btnR * 0.04} fill="#111"
          />

          {/* ── PREV BUTTON ── */}
          <circle cx={cx - width * 0.28} cy={btnCY} r={width * 0.07}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.1)" strokeWidth={1}
          />
          {/* Prev icon */}
          <polygon
            points={`${cx - width * 0.28 + 8},${btnCY - 12} ${cx - width * 0.28 - 8},${btnCY} ${cx - width * 0.28 + 8},${btnCY + 12}`}
            fill="rgba(255,255,255,0.7)"
          />
          <rect
            x={cx - width * 0.28 - 12} y={btnCY - 12}
            width={4} height={24} rx={2}
            fill="rgba(255,255,255,0.7)"
          />

          {/* ── NEXT BUTTON ── */}
          <circle cx={cx + width * 0.28} cy={btnCY} r={width * 0.07}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.1)" strokeWidth={1}
          />
          {/* Next icon */}
          <polygon
            points={`${cx + width * 0.28 - 8},${btnCY - 12} ${cx + width * 0.28 + 8},${btnCY} ${cx + width * 0.28 - 8},${btnCY + 12}`}
            fill="rgba(255,255,255,0.7)"
          />
          <rect
            x={cx + width * 0.28 + 8} y={btnCY - 12}
            width={4} height={24} rx={2}
            fill="rgba(255,255,255,0.7)"
          />

          {/* ── HOME INDICATOR ── */}
          <rect
            x={cx - 60} y={height * 0.95}
            width={120} height={4} rx={2}
            fill="rgba(255,255,255,0.3)"
          />
        </svg>

        <Audio src={audioSrc} />
        <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
      </div>
    </EffectsWrapper>
  )
}
