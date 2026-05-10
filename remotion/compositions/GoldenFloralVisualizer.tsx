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

export const GoldenFloralVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Sunflower',
  artistName = 'Post Malone, Swae Lee',
  durationInSeconds,
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  // Process Images
  const fallbacks = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
  ]
  const images = Array.from({ length: 4 }).map((_, i) => 
    personImages && personImages.length > i ? personImages[i] : 
    (personImages && personImages.length > 0 ? personImages[i % personImages.length] : fallbacks[i])
  )

  const centerImage = images[0]
  const sideImages = images.slice(1, 4)
  
  // High quality flower placeholders (yellow roses & baby's breath style)
  const yellowRose = 'https://cdn.pixabay.com/photo/2013/07/21/13/00/rose-165819_1280.jpg' // Using a realistic rose, we'll blend it to look cutout if needed, or use a PNG
  const rosePng = 'https://cdn.pixabay.com/photo/2016/08/03/21/57/yellow-rose-1567923_1280.png'
  const bouquetPng = 'https://cdn.pixabay.com/photo/2017/08/01/22/01/flowers-2568341_1280.png'

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], { extrapolateRight: 'clamp' })
  
  const currentTime = frame / fps
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Animations
  const bgBreathing = Math.sin(frame / 60) * 0.1 + 0.9 // 0.8 to 1.0
  const bgParallax = interpolate(frame, [0, durationInSeconds * fps], [0, -50])
  
  // Parallax offsets
  const floatY = Math.sin(frame / 70) * 12
  const floatX = Math.cos(frame / 90) * 8
  
  const p1 = Math.sin(frame / 50) * 15 // Top left
  const p2 = Math.cos(frame / 45) * -12 // Top right
  const p3 = Math.sin(frame / 60) * 10 // Bottom left

  const uiY = interpolate(spring({ frame: frame - 15, fps, config: { damping: 14 } }), [0, 1], [-50, 0])
  const uiOpacity = spring({ frame: frame - 15, fps, config: { damping: 20 } })

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1610', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* --- BACKGROUND GLOW & GRADIENT --- */}
      <AbsoluteFill>
        <div style={{
          position: 'absolute', inset: '-10%',
          background: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.6) 0%, rgba(180,100,20,0.4) 40%, #1a1610 80%)',
          opacity: bgBreathing,
          transform: `scale(${1 + bgBreathing * 0.05})`
        }} />
        {/* Cinematic Haze Texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, rgba(255,240,200,0.1) 0%, rgba(0,0,0,0.5) 100%)',
          mixBlendMode: 'overlay'
        }} />
      </AbsoluteFill>

      {/* --- BACKGROUND SIDE PORTRAITS --- */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, transform: `translateY(${bgParallax}px)` }}>
        
        {/* Top Left Faded */}
        <div style={{
          position: 'absolute', top: '10%', left: '-15%', width: '80%', height: '50%',
          transform: `translateY(${p1}px)`, opacity: 0.35, filter: 'blur(12px) contrast(1.1) sepia(0.3)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)'
        }}>
          <Img src={sideImages[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Top Right Faded */}
        <div style={{
          position: 'absolute', top: '5%', right: '-20%', width: '80%', height: '55%',
          transform: `translateY(${p2}px)`, opacity: 0.4, filter: 'blur(10px) contrast(1.1) sepia(0.4)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
        }}>
          <Img src={sideImages[1]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Bottom Left Faded */}
        <div style={{
          position: 'absolute', bottom: '0%', left: '-20%', width: '70%', height: '45%',
          transform: `translateY(${p3}px)`, opacity: 0.4, filter: 'blur(8px) contrast(1.2) sepia(0.2)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
        }}>
          <Img src={sideImages[2]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* --- BACKGROUND FLOWERS --- */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15 }}>
        <Img src={bouquetPng} style={{ position: 'absolute', top: '25%', left: '5%', width: '500px', opacity: 0.6, filter: 'blur(6px) brightness(1.2)', transform: `translateY(${p1 * 0.5}px) rotate(15deg)` }} />
        <Img src={rosePng} style={{ position: 'absolute', top: '45%', right: '-10%', width: '600px', opacity: 0.5, filter: 'blur(8px) sepia(0.3)', transform: `translateY(${p2 * 0.5}px) rotate(-20deg)` }} />
      </div>

      {/* --- CENTER HERO SUBJECT --- */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', // Usually anchored lower
        zIndex: 20, pointerEvents: 'none',
        transform: `translate(${floatX}px, ${floatY}px)`
      }}>
        {/* Glow behind subject */}
        <div style={{
           position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
           width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)',
           filter: 'blur(40px)', zIndex: -1
        }} />
        <Img 
          src={centerImage} 
          style={{
            height: '75%', width: 'auto', maxWidth: '100%',
            objectFit: 'contain',
            // Strong warm drop-shadow for rim light effect, plus a dark drop shadow for realistic depth
            filter: 'drop-shadow(0px 0px 20px rgba(251, 191, 36, 0.4)) drop-shadow(0px 20px 40px rgba(0,0,0,0.6))',
            pointerEvents: 'auto',
            transformOrigin: 'bottom center'
          }}
        />
      </div>

      {/* --- FOREGROUND FLOWERS --- */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 25, pointerEvents: 'none' }}>
         <Img src={rosePng} style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '400px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))', transform: `translateY(${floatY * 0.3}px) rotate(10deg)` }} />
         <Img src={bouquetPng} style={{ position: 'absolute', bottom: '10%', right: '-15%', width: '500px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5)) brightness(1.1)', transform: `translateY(${floatY * -0.2}px) rotate(-15deg)` }} />
         
         {/* Soft Foreground Light Leaks */}
         <div style={{
            position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.3) 0%, transparent 70%)',
            filter: 'blur(50px)', mixBlendMode: 'screen', transform: `scale(${bgBreathing})`
         }} />
      </div>

      {/* --- FLOATING MUSIC PLAYER (TOP CENTER) --- */}
      <div style={{
        position: 'absolute', top: '8%', left: '50%', transform: `translateX(-50%) translateY(${uiY}px)`,
        width: '460px',
        backgroundColor: 'rgba(50, 30, 10, 0.25)', // Warm brown tint
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 230, 180, 0.2)',
        borderRadius: '24px', padding: '24px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)',
        zIndex: 40,
        opacity: uiOpacity,
        color: '#fff'
      }}>
        {/* Top Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Img 
            src={artworkSrc || images[0]} 
            style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}
          />
          <div style={{ marginLeft: '16px', flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600, letterSpacing: '-0.3px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{songTitle}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '15px', opacity: 0.8, fontWeight: 400 }}>{artistName}</p>
          </div>
          <SpotifyIcon size={24} style={{ opacity: 0.8 }} />
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '1.5px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, backgroundColor: '#fff', borderRadius: '1.5px', boxShadow: '0 0 8px rgba(255,255,255,0.8)' }} />
            <div style={{ position: 'absolute', left: `calc(${progress}% - 5px)`, top: '-3.5px', width: '10px', height: '10px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', opacity: 0.7, fontWeight: 500 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationInSeconds)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <Shuffle size={18} style={{ opacity: 0.6 }} />
          <SkipBack size={24} style={{ opacity: 0.9 }} />
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1610', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            <Pause size={24} fill="currentColor" />
          </div>
          <SkipForward size={24} style={{ opacity: 0.9 }} />
          <Heart size={18} style={{ opacity: 0.9 }} fill="#fff" />
        </div>
      </div>
      
    </AbsoluteFill>
  )
}
