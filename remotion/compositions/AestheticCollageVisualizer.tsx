import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps, getTypographyStyle } from './shared'
// Inline SVG Icons (replacing lucide-react)
const Heart = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
)

const SkipBack = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="19 20 9 12 19 4 19 20"></polygon>
    <line x1="5" y1="19" x2="5" y2="5"></line>
  </svg>
)

const SkipForward = ({ size = 24, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="5 4 15 12 5 20 5 4"></polygon>
    <line x1="19" y1="5" x2="19" y2="19"></line>
  </svg>
)

const Pause = ({ size = 24, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
)

export const AestheticCollageVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Khat',
  artistName = 'Navzot Ahuja',
  durationInSeconds,
}) => {
  const { fps, height, width } = useVideoConfig()
  const frame = useCurrentFrame()

  // Default images if personImages are not provided or not enough
  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800',
    artworkSrc || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    artworkSrc || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    artworkSrc || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = Array.from({ length: 4 }).map((_, i) => personImages[i % personImages.length])
  } else {
    images = fallbackImages
  }

  // Subtle Parallax & Floating Animation
  const floatOffset1 = Math.sin(frame / 60) * 5
  const floatOffset2 = Math.cos(frame / 50) * 5
  const floatOffset3 = Math.sin(frame / 70) * 5
  const floatOffset4 = Math.cos(frame / 80) * 5

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], {
    extrapolateRight: 'clamp',
  })
  
  // Format time for progress bar
  const currentTime = frame / fps
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: '#2a1a15', overflow: 'hidden', opacity }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* Background Pattern / Texture */}
      <AbsoluteFill>
        <Img
          src={artworkSrc || 'https://images.unsplash.com/photo-1558235213-98918237fc38?auto=format&fit=crop&q=80'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.5,
            filter: 'blur(40px)',
            transform: 'scale(1.2)', // Prevents blurred edges from showing background
          }}
        />
        {/* Warm Film Filter Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#8a4b27',
          mixBlendMode: 'color',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(20,10,5,0.7) 100%)', // Vignette
        }} />
      </AbsoluteFill>

      {/* Collage Container */}
      <div style={{
        position: 'absolute',
        top: '5%',
        bottom: '5%',
        left: '25%',
        right: '25%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'sepia(0.3) contrast(1.1) brightness(0.9)', // Warm film look
      }}>
        
        {/* Top Image (Landscape) */}
        <Img 
          src={images[0]} 
          style={{
            width: '100%',
            height: '35%',
            objectFit: 'cover',
            transform: `translateY(${floatOffset1}px) rotate(1deg)`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            zIndex: 4,
            border: '8px solid rgba(255,255,255,0.05)',
          }}
        />

        {/* Middle Image (Zoomed, underneath) */}
        <Img 
          src={images[1]} 
          style={{
            width: '110%',
            height: '30%',
            objectFit: 'cover',
            objectPosition: 'center 30%', // zoom into face area
            marginTop: '-5%',
            transform: `translateY(${floatOffset2}px) rotate(-2deg)`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            zIndex: 3,
            border: '8px solid rgba(255,255,255,0.05)',
          }}
        />

        {/* Bottom Container */}
        <div style={{
          display: 'flex',
          width: '100%',
          height: '40%',
          marginTop: '-5%',
          zIndex: 5,
        }}>
          {/* Bottom Left Image (Close-up, square-ish) */}
          <Img 
            src={images[2]} 
            style={{
              width: '55%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '20% 50%',
              transform: `translateY(${floatOffset3}px) rotate(2deg)`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 6,
              border: '8px solid rgba(255,255,255,0.05)',
            }}
          />
          {/* Bottom Right Image (Portrait) */}
          <Img 
            src={images[3]} 
            style={{
              width: '50%',
              height: '105%',
              marginLeft: '-5%',
              marginTop: '-5%',
              objectFit: 'cover',
              transform: `translateY(${floatOffset4}px) rotate(-1deg)`,
              boxShadow: '-10px 20px 40px rgba(0,0,0,0.6)',
              zIndex: 5,
              border: '8px solid rgba(255,255,255,0.05)',
            }}
          />
        </div>
      </div>

      {/* Decorative Flowers (Placeholder SVGs / Emojis to match reference) */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        fontSize: '120px',
        transform: `rotate(-15deg) translateY(${floatOffset2}px)`,
        filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5)) sepia(0.5)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>🌺</div>
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '22%',
        fontSize: '150px',
        transform: `rotate(10deg) translateY(${floatOffset1}px)`,
        filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5)) sepia(0.5) brightness(1.2)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>🌸</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '18%',
        fontSize: '130px',
        transform: `rotate(-25deg) translateY(${floatOffset3}px)`,
        filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5)) sepia(0.5) brightness(0.8)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>🍂</div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '20%',
        fontSize: '160px',
        transform: `rotate(15deg) translateY(${floatOffset4}px)`,
        filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5)) sepia(0.3) brightness(0.7)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>🥀</div>

      {/* Music Player Card */}
      <div style={{
        position: 'absolute',
        left: '15%',
        top: '55%',
        width: '420px',
        backgroundColor: '#7a3e1b', // Solid warm tone matching reference
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        zIndex: 20,
        color: '#fdfbf7',
        fontFamily: '"Inter", sans-serif',
      }}>
        {/* Top section: Artwork & Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Img 
            src={artworkSrc || images[0]} 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            }}
          />
          <div style={{ marginLeft: '16px', flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>
              {songTitle}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', opacity: 0.8, fontWeight: 400 }}>
              {artistName}
            </p>
          </div>
          <Heart size={28} style={{ opacity: 0.8 }} />
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: '12px' }}>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              backgroundColor: '#ffffff',
              borderRadius: '2px',
            }} />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px',
            fontSize: '12px',
            opacity: 0.7,
            fontWeight: 500
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationInSeconds)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0 16px'
        }}>
          <SkipBack size={24} style={{ opacity: 0.8 }} />
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7a3e1b'
          }}>
            <Pause size={24} fill="currentColor" />
          </div>
          <SkipForward size={24} style={{ opacity: 0.8 }} />
        </div>
      </div>

    </AbsoluteFill>
  )
}
