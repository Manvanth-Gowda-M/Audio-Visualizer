import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'


export const LuxuryGlassVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'The Greatest',
  artistName = 'Sia',
  durationInSeconds,
  accentColor = '#ffffff',
  effects = [],
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = [
      personImages[0], // Center main card: person image
      artworkSrc || fallbackImages[1], // Back left card: artwork
      personImages.length > 1 ? personImages[1] : personImages[0], // Back right card: person image
    ]
  } else {
    images = fallbackImages
  }

  // Floating animations for glass cards
  const float1 = Math.sin(frame / 60) * 15
  const float2 = Math.cos(frame / 50) * 15
  const float3 = Math.sin(frame / 70) * 15

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], {
    extrapolateRight: 'clamp',
  })

  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  const contentOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: 'clamp' })
  const contentY = interpolate(frame, [15, 45], [20, 0], { extrapolateRight: 'clamp' })

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden', opacity }}>
        <EffectsLayer effects={effects} accentColor={accentColor} width={1080} height={1920} />
        {audioSrc && <Audio src={audioSrc} />}


      {/* Immersive Blurred Background */}
      <AbsoluteFill>
        <Img
          src={artworkSrc || images[0]}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.6,
            filter: 'blur(80px) saturate(1.5)',
            transform: 'scale(1.2)',
          }}
        />
        {/* Deep darkening overlay for luxury feel */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)',
        }} />
      </AbsoluteFill>

      {/* Floating Glass Cards */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: 0,
        right: 0,
        height: '55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px',
      }}>
        
        {/* Back left card */}
        <div style={{
          position: 'absolute',
          width: '55%',
          aspectRatio: '3/4',
          transform: `translateX(-35%) translateY(${float2}px) translateZ(-100px) rotateY(15deg)`,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          opacity: 0.7,
        }}>
          <Img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px' }} />
        </div>

        {/* Back right card */}
        <div style={{
          position: 'absolute',
          width: '55%',
          aspectRatio: '3/4',
          transform: `translateX(35%) translateY(${float3}px) translateZ(-100px) rotateY(-15deg)`,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          opacity: 0.7,
        }}>
          <Img src={images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px' }} />
        </div>

        {/* Center Main Card */}
        <div style={{
          position: 'absolute',
          width: '65%',
          aspectRatio: '3/4',
          transform: `translateY(${float1}px) translateZ(0)`,
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 10,
        }}>
          <Img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
            pointerEvents: 'none'
          }} />
          {/* Subtle inner shadow for glass thickness */}
          <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)', borderRadius: '32px' }} />
        </div>

      </div>

      {/* Glassmorphic Bottom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '8%',
        left: '8%',
        right: '8%',
        padding: '32px',
        borderRadius: '32px',
        background: 'rgba(20, 20, 20, 0.4)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        transform: `translateY(${contentY}px)`,
        opacity: contentOpacity,
      }}>
        {/* Typography */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            {songTitle}
          </h1>
          <h2 style={{
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            margin: '4px 0 0 0',
          }}>
            {artistName}
          </h2>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progress}%`,
              backgroundColor: accentColor,
              borderRadius: '2px',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: '"Inter", sans-serif' }}>
            <span>{(progress / 100 * durationInSeconds / 60).toFixed(0)}:{String(Math.floor((progress / 100 * durationInSeconds) % 60)).padStart(2, '0')}</span>
            <span>{Math.floor(durationInSeconds / 60)}:{String(Math.floor(durationInSeconds % 60)).padStart(2, '0')}</span>
          </div>
        </div>

      </div>
      </AbsoluteFill>
    </EffectsWrapper>
  )
}
