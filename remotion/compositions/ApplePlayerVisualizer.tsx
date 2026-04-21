import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  spring,
} from 'remotion'
import { Audio } from '@remotion/media'
import { VisualizerProps } from './shared'

/* ── font presets ── */
const FONTS: Record<string, { title: string; body: string }> = {
  minimal: { title: 'SF Pro Display, -apple-system, Helvetica Neue, sans-serif', body: 'SF Pro Text, -apple-system, Helvetica Neue, sans-serif' },
  serif:   { title: 'Georgia, Times New Roman, serif',                           body: 'Georgia, Times New Roman, serif' },
  mono:    { title: 'SF Mono, Menlo, monospace',                                 body: 'SF Mono, Menlo, monospace' },
}

/* ── theme color presets ── */
const THEMES: Record<string, { accent: string; progress: string }> = {
  white:  { accent: 'rgba(255,255,255,0.9)',  progress: 'rgba(255,255,255,0.85)' },
  gold:   { accent: 'rgba(201,168,76,0.95)',  progress: 'rgba(201,168,76,0.9)'   },
  blue:   { accent: 'rgba(96,165,250,0.95)',  progress: 'rgba(96,165,250,0.9)'   },
  purple: { accent: 'rgba(168,85,247,0.95)',  progress: 'rgba(168,85,247,0.9)'   },
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/* ── SVG icons ── */
const IconRewind = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M18 8L6 18l12 10V8z" fill="rgba(255,255,255,0.85)" />
    <path d="M30 8L18 18l12 10V8z" fill="rgba(255,255,255,0.85)" />
  </svg>
)
const IconPause = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="13" y="10" width="10" height="32" rx="3" fill="rgba(255,255,255,0.95)" />
    <rect x="29" y="10" width="10" height="32" rx="3" fill="rgba(255,255,255,0.95)" />
  </svg>
)
const IconForward = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M6 8l12 10L6 28V8z" fill="rgba(255,255,255,0.85)" />
    <path d="M18 8l12 10-12 10V8z" fill="rgba(255,255,255,0.85)" />
  </svg>
)
const IconVolumeLow = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 8h3l5-4v14l-5-4H3V8z" fill="rgba(255,255,255,0.5)" />
  </svg>
)
const IconVolumeHigh = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 8h3l5-4v14l-5-4H3V8z" fill="rgba(255,255,255,0.5)" />
    <path d="M14 6.5c1.5 1 2.5 2.7 2.5 4.5s-1 3.5-2.5 4.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16.5 4c2.2 1.5 3.5 4 3.5 7s-1.3 5.5-3.5 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconBluetooth = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M7 6l8 5-8 5V6zM15 6l-8 5 8 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export interface ApplePlayerProps {
  audioSrc: string
  artworkSrc: string
  songTitle: string
  artistName: string
  labelText: string
  durationInSeconds: number
  themeColor?: string
  fontStyle?: string
}

export const ApplePlayerVisualizer: React.FC<ApplePlayerProps> = ({
  audioSrc,
  artworkSrc,
  songTitle,
  artistName,
  labelText,
  durationInSeconds,
  themeColor = 'white',
  fontStyle = 'minimal',
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const theme = THEMES[themeColor] ?? THEMES.white
  const font  = FONTS[fontStyle]   ?? FONTS.minimal

  const progress = Math.min(currentTime / durationInSeconds, 1)
  const remaining = durationInSeconds - currentTime

  /* ── animations ── */
  // Card fade-in
  const cardOpacity = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' })
  const cardY = interpolate(frame, [0, fps * 0.6], [40, 0], { extrapolateRight: 'clamp' })

  // Artwork slow scale loop (breathe)
  const artScale = 1 + 0.012 * Math.sin((frame / fps) * 0.4 * Math.PI)

  // Volume bar fill (static 70%)
  const volumeFill = 0.7

  /* ── layout ── */
  const cardW = width * 0.82
  const cardH = height * 0.78
  const cardX = (width - cardW) / 2
  const cardY0 = (height - cardH) / 2

  const artW = cardW - 0          // full card width
  const artH = cardH * 0.52
  const artR = 24                  // corner radius

  const padH = cardW * 0.07
  const textY = cardY0 + artH + cardH * 0.04

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#111' }}>

      {/* ── BLURRED BACKGROUND ── */}
      <Img
        src={artworkSrc}
        style={{
          position: 'absolute',
          width: '120%', height: '120%',
          top: '-10%', left: '-10%',
          objectFit: 'cover',
          filter: 'blur(32px) brightness(0.45) saturate(1.2)',
        }}
      />
      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* ── GLASSMORPHISM CARD ── */}
      <div style={{
        position: 'absolute',
        left: cardX, top: cardY0,
        width: cardW, height: cardH,
        borderRadius: 32,
        background: 'rgba(28,28,30,0.72)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        overflow: 'hidden',
      }}>

        {/* ── ARTWORK ── */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: artW, height: artH,
          overflow: 'hidden',
          borderRadius: `${artR}px ${artR}px 0 0`,
        }}>
          <Img
            src={artworkSrc}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: `scale(${artScale})`,
              transformOrigin: 'center center',
            }}
          />
          {/* Subtle bottom fade into card */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
            background: 'linear-gradient(transparent, rgba(28,28,30,0.9))',
          }} />
        </div>

        {/* ── TEXT SECTION ── */}
        <div style={{
          position: 'absolute',
          top: artH + cardH * 0.03,
          left: padH, right: padH,
        }}>
          {/* Label */}
          <div style={{
            fontFamily: font.body,
            fontSize: cardW * 0.038,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.02em',
            marginBottom: cardH * 0.008,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            {labelText || 'Now Playing'}
          </div>

          {/* Song title */}
          <div style={{
            fontFamily: font.title,
            fontSize: cardW * 0.072,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: cardH * 0.006,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {songTitle || 'Song Title'}
          </div>

          {/* Artist */}
          <div style={{
            fontFamily: font.body,
            fontSize: cardW * 0.052,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            {artistName || 'Artist Name'}
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{
          position: 'absolute',
          top: artH + cardH * 0.285,
          left: padH, right: padH,
        }}>
          {/* Track */}
          <div style={{
            width: '100%', height: 3,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            {/* Fill */}
            <div style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: theme.progress,
              borderRadius: 2,
              transition: 'width 0.1s linear',
            }} />
          </div>
          {/* Scrubber dot */}
          <div style={{
            position: 'absolute',
            top: -4,
            left: `calc(${progress * 100}% - 5px)`,
            width: 11, height: 11,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }} />
          {/* Timestamps */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 10,
            fontFamily: font.body,
            fontSize: cardW * 0.036,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.01em',
          }}>
            <span>{fmt(currentTime)}</span>
            <span>−{fmt(Math.max(remaining, 0))}</span>
          </div>
        </div>

        {/* ── CONTROLS ROW ── */}
        <div style={{
          position: 'absolute',
          top: artH + cardH * 0.44,
          left: padH, right: padH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <IconRewind />
          <IconPause />
          <IconForward />
          <IconBluetooth />
        </div>

        {/* ── VOLUME BAR ── */}
        <div style={{
          position: 'absolute',
          top: artH + cardH * 0.595,
          left: padH, right: padH,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <IconVolumeLow />
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${volumeFill * 100}%`,
              height: '100%',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: 2,
            }} />
          </div>
          <IconVolumeHigh />
        </div>

      </div>

      {/* Audio */}
      {audioSrc && <Audio src={audioSrc} />}
    </div>
  )
}
