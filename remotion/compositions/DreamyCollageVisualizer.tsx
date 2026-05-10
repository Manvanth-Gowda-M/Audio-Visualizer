import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'

// --- SVGs ---
const SpotifyIcon = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.6 12.84c.361.181.54.78.361 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z" />
  </svg>
)

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

const Pause = ({ size = 24, fill = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
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

const Sparkles = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" style={style}>
    <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="#fff" opacity="0.8" />
    <path d="M80 20 L82 38 L100 40 L82 42 L80 60 L78 42 L60 40 L78 38 Z" fill="#fff" opacity="0.6" transform="scale(0.5) translate(40, -40)" />
  </svg>
)

export const DreamyCollageVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Lover',
  artistName = 'Taylor Swift',
  quoteText = 'Collect beautiful\nmoments',
  durationInSeconds,
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  // Process Images
  const fallbacks = [
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
  ]
  const images = Array.from({ length: 6 }).map((_, i) => 
    personImages && personImages.length > i ? personImages[i] : 
    (personImages && personImages.length > 0 ? personImages[i % personImages.length] : fallbacks[i])
  )

  const centerImage = images[0]
  const sideImages = images.slice(1, 6)
  
  const whiteFlower = 'https://cdn.pixabay.com/photo/2014/04/05/11/40/daisy-316618_1280.png'
  const branchTexture = 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&q=80&w=600' // Using an Unsplash texture mapped to overlay/multiply

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], { extrapolateRight: 'clamp' })
  
  const currentTime = frame / fps
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Animations
  const bgZoom = interpolate(frame, [0, durationInSeconds * fps], [1, 1.1])
  
  // Parallax offsets
  const floatY = Math.sin(frame / 60) * 10
  const floatX = Math.cos(frame / 80) * 5
  
  const p1 = Math.sin(frame / 45) * 8
  const p2 = Math.cos(frame / 50) * -8
  const p3 = Math.sin(frame / 55) * 10
  const p4 = Math.cos(frame / 40) * -10
  const p5 = Math.sin(frame / 35) * 6

  const uiY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 15 } }), [0, 1], [-100, 0])
  const uiOpacity = spring({ frame: frame - 20, fps, config: { damping: 20 } })

  return (
    <AbsoluteFill style={{ backgroundColor: '#a5c9e2', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* --- BACKGROUND --- */}
      <AbsoluteFill>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #a5c9e2 0%, #d4eaf7 50%, #90b8d6 100%)',
          transform: `scale(${bgZoom})`
        }} />
        {/* Soft Noise Texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.15, mixBlendMode: 'overlay',
          transform: `scale(${bgZoom})`
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(130,170,200,0.6) 100%)',
          mixBlendMode: 'multiply'
        }} />
      </AbsoluteFill>

      {/* --- DECORATIVE ELEMENTS (BACK) --- */}
      <Img src={whiteFlower} style={{ position: 'absolute', top: '15%', left: '-5%', width: '300px', opacity: 0.2, filter: 'blur(4px)', transform: 'rotate(20deg)' }} />
      <Img src={whiteFlower} style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '400px', opacity: 0.15, filter: 'blur(6px)', transform: 'rotate(-15deg)' }} />

      {/* --- SIDE COLLAGE IMAGES --- */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        
        {/* Top Left */}
        <div style={{
          position: 'absolute', top: '12%', left: '5%', width: '38%', height: '22%',
          transform: `translateY(${p1}px) rotate(-3deg)`,
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '6px solid #fff', borderRadius: '4px', overflow: 'hidden'
        }}>
          <Img src={sideImages[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Mid Left */}
        <div style={{
          position: 'absolute', top: '36%', left: '8%', width: '30%', height: '20%',
          transform: `translateY(${p2}px) rotate(2deg)`,
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '6px solid #fff', borderRadius: '4px', overflow: 'hidden'
        }}>
          <Img src={sideImages[1]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Bottom Left */}
        <div style={{
          position: 'absolute', top: '58%', left: '5%', width: '35%', height: '25%',
          transform: `translateY(${p3}px) rotate(-1deg)`,
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '6px solid #fff', borderRadius: '4px', overflow: 'hidden'
        }}>
          <Img src={sideImages[2]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Top Right (Lower than player) */}
        <div style={{
          position: 'absolute', top: '35%', right: '5%', width: '32%', height: '22%',
          transform: `translateY(${p4}px) rotate(4deg)`,
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '6px solid #fff', borderRadius: '4px', overflow: 'hidden'
        }}>
          <Img src={sideImages[3]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Bottom Right */}
        <div style={{
          position: 'absolute', bottom: '15%', right: '8%', width: '32%', height: '18%',
          transform: `translateY(${p5}px) rotate(-2deg)`,
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '6px solid #fff', borderRadius: '4px', overflow: 'hidden'
        }}>
          <Img src={sideImages[4]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

      </div>

      {/* --- CENTER HERO SUBJECT --- */}
      {/* If it's a transparent PNG, drop-shadow creates an outline. If JPEG, it outlines the box. */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 20, pointerEvents: 'none',
        transform: `translate(${floatX}px, ${floatY}px)`
      }}>
        <Img 
          src={centerImage} 
          style={{
            height: '80%', width: 'auto', maxWidth: '80%',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 0px 0px 8px #ffffff) drop-shadow(0px 20px 40px rgba(0,0,0,0.25))',
            pointerEvents: 'auto'
          }}
        />
      </div>

      {/* --- DECORATIVE ELEMENTS (FRONT) --- */}
      <Img src={whiteFlower} style={{ position: 'absolute', top: '32%', left: '35%', width: '120px', zIndex: 25, filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.1))', transform: `translateY(${floatY * 0.5}px) rotate(15deg)` }} />
      <Sparkles style={{ position: 'absolute', top: '28%', right: '35%', zIndex: 25, transform: `translateY(${p4}px)` }} />
      
      {/* Hand-drawn heart */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ position: 'absolute', top: '55%', left: '3%', zIndex: 25, opacity: 0.8, transform: `translateY(${p3}px) rotate(-15deg)` }}>
         <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* --- TYPOGRAPHY --- */}
      <div style={{
        position: 'absolute', top: '26%', right: '10%', zIndex: 15,
        fontFamily: '"Dancing Script", "Pacifico", cursive', fontSize: '32px',
        color: '#475569', textAlign: 'center', lineHeight: 1.2,
        transform: 'rotate(-5deg)', opacity: 0.85
      }}>
        {quoteText.split('\\n').map((line, i) => <div key={i}>{line}</div>)}
        <div style={{ fontSize: '18px', marginTop: '8px' }}>♡</div>
      </div>

      {/* Sticky Note */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '8%', zIndex: 30,
        backgroundColor: '#f8f4ec', padding: '24px 32px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1), inset 0 0 20px rgba(0,0,0,0.02)',
        transform: 'rotate(-2deg)',
        fontFamily: '"Dancing Script", "Pacifico", cursive', fontSize: '28px',
        color: '#475569', textAlign: 'center', lineHeight: 1.3
      }}>
        <div style={{ position: 'absolute', top: '-10px', left: '50%', marginLeft: '-20px', width: '40px', height: '20px', backgroundColor: '#a3b8c2', opacity: 0.6, transform: 'rotate(-2deg)' }} />
        You glow<br/>differently when...
        <div style={{ fontSize: '16px', marginTop: '4px', textAlign: 'right' }}>♡</div>
      </div>


      {/* --- FLOATING MUSIC PLAYER (TOP RIGHT) --- */}
      <div style={{
        position: 'absolute', top: '6%', right: '6%', width: '420px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '32px', padding: '24px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.2)',
        zIndex: 40,
        transform: `translateY(${uiY}px)`,
        opacity: uiOpacity,
        color: '#fff'
      }}>
        {/* Top Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '24px' }}>
          <Img 
            src={artworkSrc || images[0]} 
            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}
          />
          <div style={{ marginLeft: '16px', flex: 1, marginTop: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{songTitle}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', opacity: 0.9, fontWeight: 500 }}>{artistName}</p>
          </div>
          <SpotifyIcon size={28} style={{ opacity: 0.9, marginTop: '8px' }} />
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, backgroundColor: '#fff', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', left: `calc(${progress}% - 6px)`, top: '-4px', width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px', opacity: 0.8, fontWeight: 500 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationInSeconds)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}>
          <Shuffle size={20} style={{ opacity: 0.7 }} />
          <SkipBack size={28} style={{ opacity: 0.9 }} />
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#82aac8', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <Pause size={28} fill="currentColor" />
          </div>
          <SkipForward size={28} style={{ opacity: 0.9 }} />
          <Heart size={20} style={{ opacity: 0.9 }} fill="#fff" />
        </div>
      </div>
      
    </AbsoluteFill>
  )
}
