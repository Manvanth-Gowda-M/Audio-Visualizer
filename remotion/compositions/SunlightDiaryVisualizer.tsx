import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'

// --- SVG Icons ---
const Heart = ({ size = 24, fill = "none", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const SkipBack = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
)

const SkipForward = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
)

const Play = ({ size = 24, fill = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const Shuffle = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const Repeat = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

// --- Doodles SVGs ---
const ArrowDoodle = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20 80 Q 50 20 80 20" />
    <polyline points="60 20 80 20 80 40" />
  </svg>
)

const LinesDoodle = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="40" height="40" viewBox="0 0 50 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" style={style}>
    <line x1="10" y1="10" x2="40" y2="40" />
    <line x1="25" y1="5" x2="45" y2="25" />
  </svg>
)

const CurvedLinesDoodle = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" style={style}>
    <path d="M10 25 Q 25 10 40 25 Q 25 40 10 25" />
  </svg>
)

export const SunlightDiaryVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Golden Hour',
  artistName = 'JVKE',
  quoteText = 'Collect moments,\nnot things.',
  durationInSeconds,
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const mainImage = (personImages && personImages.length > 0) ? personImages[0] : (artworkSrc || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800')
  const bgImage = 'https://images.unsplash.com/photo-1444464666168-49b626f8627c?auto=format&fit=crop&q=80&w=1080'
  const sunflowerPNG = 'https://cdn.pixabay.com/photo/2014/04/05/11/40/sunflower-316620_1280.png'
  const daisyPNG = 'https://cdn.pixabay.com/photo/2014/04/05/11/40/daisy-316618_1280.png'

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], { extrapolateRight: 'clamp' })
  
  const currentTime = frame / fps
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Animations
  const bgZoom = interpolate(frame, [0, durationInSeconds * fps], [1, 1.1])
  const phoneFloatY = Math.sin(frame / 45) * 15
  const phoneFloatX = Math.cos(frame / 60) * 5
  
  const doodleOpacity = spring({ frame: frame - 15, fps, config: { damping: 200 } })
  const uiY = interpolate(spring({ frame: frame - 30, fps, config: { damping: 15 } }), [0, 1], [100, 0])

  return (
    <AbsoluteFill style={{ backgroundColor: '#111', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* --- BACKGROUND --- */}
      <AbsoluteFill>
        <Img
          src={bgImage}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${bgZoom})`,
            filter: 'grayscale(0.8) blur(8px) brightness(0.6) contrast(1.2)',
          }}
        />
        {/* Warm Vignette Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,180,0,0.15) 0%, rgba(0,0,0,0.7) 100%)',
          mixBlendMode: 'multiply'
        }} />
      </AbsoluteFill>

      {/* --- BACKGROUND SUNFLOWERS --- */}
      <Img src={sunflowerPNG} style={{ position: 'absolute', top: '20%', right: '-10%', width: '400px', filter: 'blur(6px) brightness(0.8)', transform: 'rotate(15deg)' }} />
      <Img src={sunflowerPNG} style={{ position: 'absolute', bottom: '30%', left: '-15%', width: '500px', filter: 'blur(8px) brightness(0.7)', transform: 'rotate(-20deg)' }} />

      {/* --- MAIN TYPOGRAPHY --- */}
      <div style={{
        position: 'absolute', top: '6%', width: '100%', textAlign: 'center',
        zIndex: 10
      }}>
        <h1 style={{
          fontFamily: '"Anton", sans-serif', fontSize: '180px', margin: 0, lineHeight: 0.85,
          color: '#eab308', // Warm sunflower yellow
          textTransform: 'uppercase', letterSpacing: '-2px',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <span style={{ position: 'relative' }}>
            SUNLIGHT
            <Img src={daisyPNG} style={{ position: 'absolute', top: '-40px', right: '-60px', width: '120px', transform: 'rotate(15deg)' }} />
            <Img src={daisyPNG} style={{ position: 'absolute', bottom: '-20px', left: '-50px', width: '90px', transform: 'rotate(-10deg)' }} />
          </span>
          <span style={{ position: 'relative' }}>
            DIARY
            <Img src={daisyPNG} style={{ position: 'absolute', top: '10px', right: '-80px', width: '140px', transform: 'rotate(45deg)' }} />
          </span>
        </h1>
      </div>

      {/* --- QUOTE BOX --- */}
      <div style={{
        position: 'absolute', top: '25%', left: '8%',
        backgroundColor: '#eab308', borderRadius: '24px', padding: '40px 32px',
        width: '280px', zIndex: 15,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        transform: 'rotate(-3deg)'
      }}>
        <span style={{ fontSize: '60px', fontWeight: 900, lineHeight: 0.5, color: '#1a1a1a', display: 'block', marginBottom: '20px' }}>“</span>
        <p style={{
          fontSize: '28px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 24px 0',
          lineHeight: 1.3, whiteSpace: 'pre-wrap'
        }}>{quoteText}</p>
        <div style={{ width: '60px', height: '2px', backgroundColor: '#1a1a1a', marginBottom: '16px' }} />
        <Heart size={24} fill="none" style={{ color: '#1a1a1a' }} />
      </div>

      {/* --- MAIN PHONE COMPOSITION --- */}
      <div style={{
        position: 'absolute', top: '35%', left: '10%', right: '10%', height: '500px',
        transform: `translate(${phoneFloatX}px, ${phoneFloatY}px) rotate(2deg)`,
        zIndex: 20,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        
        {/* The "Phone Screen" containing the person's image */}
        <div style={{
          position: 'relative',
          width: '800px', height: '400px',
          borderRadius: '40px', overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          border: '12px solid #222', // Simple phone bezel
          backgroundColor: '#000'
        }}>
           <Img src={mainImage} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(1.05) saturate(1.2)' }} />
           
           {/* Inner Screen Vignette */}
           <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
        </div>

        {/* Doodles around the phone */}
        <ArrowDoodle style={{ position: 'absolute', top: '-60px', right: '0px', opacity: doodleOpacity, transform: 'rotate(45deg)' }} />
        <LinesDoodle style={{ position: 'absolute', top: '-40px', left: '150px', opacity: doodleOpacity }} />
        <CurvedLinesDoodle style={{ position: 'absolute', bottom: '40px', left: '-50px', opacity: doodleOpacity }} />
        
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ position: 'absolute', bottom: '20px', right: '40px', opacity: doodleOpacity, transform: 'rotate(-15deg)' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      {/* --- FOREGROUND SUNFLOWERS --- */}
      <Img src={sunflowerPNG} style={{ position: 'absolute', bottom: '-15%', left: '-25%', width: '600px', filter: 'blur(2px) drop-shadow(0 20px 40px rgba(0,0,0,0.8))', zIndex: 30, transform: `translateY(${phoneFloatY * -1.5}px) rotate(10deg)` }} />
      <Img src={sunflowerPNG} style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: '550px', filter: 'blur(3px) drop-shadow(0 20px 40px rgba(0,0,0,0.8))', zIndex: 30, transform: `translateY(${phoneFloatY * -1}px) rotate(-15deg)` }} />

      {/* --- FLOATING MUSIC PLAYER CARD --- */}
      <div style={{
        position: 'absolute', bottom: '8%', left: '15%', right: '15%',
        backgroundColor: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(20px)',
        borderRadius: '32px', padding: '32px',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        zIndex: 40,
        transform: `translateY(${uiY}px)`,
      }}>
        {/* Top Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <Img 
            src={artworkSrc || mainImage} 
            style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
          />
          <div style={{ marginLeft: '24px', flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{songTitle}</h2>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', color: '#aaa', fontWeight: 500 }}>{artistName}</p>
          </div>
          <Heart size={32} fill="#eab308" style={{ color: '#eab308' }} />
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: '24px' }}>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '3px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, backgroundColor: '#eab308', borderRadius: '3px' }} />
            {/* Playhead dot */}
            <div style={{ position: 'absolute', left: `calc(${progress}% - 8px)`, top: '-5px', width: '16px', height: '16px', backgroundColor: '#eab308', borderRadius: '50%', boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '16px', color: '#888', fontWeight: 500 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationInSeconds)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <Shuffle size={28} style={{ color: '#666' }} />
          <SkipBack size={36} style={{ color: '#fff' }} />
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', boxShadow: '0 10px 20px rgba(234, 179, 8, 0.3)' }}>
            <Play size={36} fill="currentColor" />
          </div>
          <SkipForward size={36} style={{ color: '#fff' }} />
          <Repeat size={28} style={{ color: '#666' }} />
        </div>
      </div>
      
    </AbsoluteFill>
  )
}
