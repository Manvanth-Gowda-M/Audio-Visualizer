import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
} from 'remotion'
import { Audio } from '@remotion/media'
import { VisualizerProps } from './shared'

export interface CinematicVinylProps extends VisualizerProps {
  songTitle?: string
  artistName?: string
}

function fmt(s: number) {
  if (isNaN(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export const CinematicVinylVisualizer: React.FC<CinematicVinylProps> = ({
  audioSrc,
  artworkSrc,
  songTitle = 'Song Title',
  artistName = 'Artist Name',
  durationInSeconds,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  // Vinyl rotation: 1 full rotation every 10 seconds (very slow and realistic)
  const rotationDeg = (currentTime / 10) * 360

  // Progress logic
  const progress = Math.min(currentTime / durationInSeconds, 1)
  const remaining = durationInSeconds - currentTime

  // Layout calculations (16:9)
  // Vinyl placed on the right
  const vinylR = height * 0.45 // 45% of height gives a nice large vinyl
  const cx = width * 0.75
  const cy = height * 0.5
  const labelR = vinylR * 0.35 // Label size relative to vinyl

  // Background blur and vignette
  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#050505' }}>
      
      {/* ── CINEMATIC BACKGROUND ── */}
      <Img 
        src={artworkSrc} 
        style={{
          position: 'absolute',
          width: '120%', height: '120%',
          top: '-10%', left: '-10%',
          objectFit: 'cover',
          filter: 'blur(60px) brightness(0.15) saturate(0.8)',
          opacity: 0.8
        }} 
      />
      {/* Lighting / Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 75% 50%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.95) 100%)',
      }} />

      {/* ── LEFT SIDE: TYPOGRAPHY & PROGRESS ── */}
      <div style={{
        position: 'absolute',
        top: 0, left: '10%', bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '40%',
        zIndex: 10,
      }}>
        <div style={{
          fontFamily: 'Inter, Helvetica, sans-serif',
          fontWeight: 800,
          fontSize: width * 0.045, // Dynamic font size
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: height * 0.02,
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {songTitle}
        </div>
        <div style={{
          fontFamily: 'Inter, Helvetica, sans-serif',
          fontWeight: 300,
          fontSize: width * 0.022,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.01em',
          marginBottom: height * 0.08,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {artistName}
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ width: '100%' }}>
          <div style={{
            width: '100%',
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: '#f59e0b', // Warm orange/yellow
              borderRadius: 2,
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 12,
            fontFamily: 'Inter, Helvetica, sans-serif',
            fontSize: width * 0.012,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>
            <span>{fmt(currentTime)}</span>
            <span>-{fmt(remaining)}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: VINYL RECORD ── */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={width} height={height}>
        <defs>
          <radialGradient id="cinematic-vinylGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#111" />
            <stop offset="30%" stopColor="#0a0a0a" />
            <stop offset="80%" stopColor="#050505" />
            <stop offset="98%" stopColor="#000" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <filter id="vinyl-shadow">
            <feDropShadow dx="-20" dy="30" stdDeviation="40" floodColor="#000" floodOpacity="0.8" />
          </filter>
        </defs>

        <g transform={`rotate(${rotationDeg}, ${cx}, ${cy})`} filter="url(#vinyl-shadow)">
          {/* Main Disc */}
          <circle cx={cx} cy={cy} r={vinylR} fill="url(#cinematic-vinylGrad)" />
          
          {/* Subtle Grooves */}
          {Array.from({ length: 25 }, (_, i) => {
            const r = labelR + 15 + i * ((vinylR - labelR - 20) / 25)
            return (
              <circle key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={1} />
            )
          })}
          
          {/* Light Sweeps / Reflections for depth */}
          <path 
            d={`M ${cx} ${cy - vinylR} A ${vinylR} ${vinylR} 0 0 1 ${cx + vinylR} ${cy} L ${cx} ${cy} Z`} 
            fill="rgba(255,255,255,0.03)" 
            opacity="0.5"
          />
          <path 
            d={`M ${cx} ${cy + vinylR} A ${vinylR} ${vinylR} 0 0 1 ${cx - vinylR} ${cy} L ${cx} ${cy} Z`} 
            fill="rgba(255,255,255,0.015)" 
            opacity="0.5"
          />
        </g>
        
        {/* Center Hole Shadow inside SVG for perfect layering */}
        <circle cx={cx} cy={cy} r={8} fill="#030303" />
      </svg>

      {/* Label Artwork (Must use Remotion Img for Blob URLs) */}
      <div style={{
        position: 'absolute',
        left: cx - labelR, top: cy - labelR,
        width: labelR * 2, height: labelR * 2,
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 15px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
        transform: `rotate(${rotationDeg}deg)`,
      }}>
        <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Spindle overlapping the label */}
      <div style={{
        position: 'absolute',
        left: cx - 12, top: cy - 12,
        width: 24, height: 24,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 60% 40%, #555 0%, #111 60%, #000 100%)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
      }} />

      {/* Audio Element */}
      {audioSrc && <Audio src={audioSrc} />}
    </div>
  )
}
