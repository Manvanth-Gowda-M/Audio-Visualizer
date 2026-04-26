import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

export const CyberpunkHologramVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Neon City',
  artistName = 'Synthwave Pulse',
  durationInSeconds,
  accentColor = '#00ffcc', // Default cyan/neon
  effects = [],
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = [
      personImages[0], // Front screen
      artworkSrc || fallbackImages[1], // Back left screen
      personImages.length > 1 ? personImages[1] : personImages[0], // Back right screen
    ]
  } else {
    images = fallbackImages
  }

  // Animation values
  const float1 = Math.sin(frame / 30) * 10
  const float2 = Math.cos(frame / 40) * 15
  const float3 = Math.sin(frame / 50) * 12

  const glitchOffsetX = frame % 60 < 3 ? Math.random() * 10 - 5 : 0
  const scanlineY = (frame * 5) % 1920

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], {
    extrapolateRight: 'clamp',
  })

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <AbsoluteFill style={{ backgroundColor: '#050510', overflow: 'hidden' }}>
        <EffectsLayer effects={effects} accentColor={accentColor} width={1080} height={1920} />
        {audioSrc && <Audio src={audioSrc} />}

        {/* Perspective Grid Background */}
        <AbsoluteFill style={{
          backgroundImage: `linear-gradient(${accentColor}22 1px, transparent 1px), linear-gradient(90deg, ${accentColor}22 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
          transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)',
          transformOrigin: 'top',
          opacity: 0.5,
        }} />

        {/* Floating Holographic Screens */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1500px',
        }}>
          
          {/* Back Left Screen (Artwork) */}
          <div style={{
            position: 'absolute',
            width: '55%',
            aspectRatio: '1',
            transform: `translateX(-30%) translateY(${float2 - 150}px) translateZ(-300px) rotateY(25deg)`,
            border: `2px solid ${accentColor}88`,
            boxShadow: `0 0 30px ${accentColor}44, inset 0 0 20px ${accentColor}44`,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}>
            <Img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, filter: `sepia(1) hue-rotate(180deg) saturate(2)` }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 50%, ${accentColor}22 50%)`, backgroundSize: '100% 4px' }} />
          </div>

          {/* Back Right Screen (Person 2) */}
          <div style={{
            position: 'absolute',
            width: '45%',
            aspectRatio: '9/16',
            transform: `translateX(40%) translateY(${float3 - 50}px) translateZ(-400px) rotateY(-30deg)`,
            border: `2px solid ${accentColor}88`,
            boxShadow: `0 0 30px ${accentColor}44, inset 0 0 20px ${accentColor}44`,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}>
            <Img src={images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, filter: `contrast(1.5) brightness(0.8)` }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 50%, ${accentColor}22 50%)`, backgroundSize: '100% 4px' }} />
          </div>

          {/* Front Center Screen (Person 1) */}
          <div style={{
            position: 'absolute',
            width: '65%',
            aspectRatio: '3/4',
            transform: `translateY(${float1}px) translateZ(0) translateX(${glitchOffsetX}px)`,
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 50px ${accentColor}66, inset 0 0 30px ${accentColor}66`,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 10,
          }}>
            <Img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.2) saturate(1.2)' }} />
            {/* Holographic lines */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 50%, ${accentColor}33 50%)`, backgroundSize: '100% 6px', pointerEvents: 'none' }} />
            {/* Moving scanline */}
            <div style={{ position: 'absolute', top: scanlineY, left: 0, right: 0, height: '4px', backgroundColor: accentColor, opacity: 0.8, boxShadow: `0 0 20px 5px ${accentColor}`, pointerEvents: 'none' }} />
          </div>
        </div>

        {/* HUD Elements */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '5%',
          right: '5%',
          padding: '30px',
          border: `1px solid ${accentColor}66`,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: `0 0 20px ${accentColor}22`,
        }}>
          {/* Top decorative tech bar */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '20px', height: '4px', backgroundColor: accentColor }} />
            <div style={{ width: '40px', height: '4px', backgroundColor: accentColor }} />
            <div style={{ width: '10px', height: '4px', backgroundColor: accentColor, opacity: 0.5 }} />
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: '"Courier New", monospace', color: accentColor, fontSize: '12px' }}>SYS.AUDIO.VISUALIZER_v2.4</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontFamily: '"Orbitron", "Courier New", sans-serif',
              fontSize: '42px',
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              textTransform: 'uppercase',
              textShadow: `0 0 10px ${accentColor}`,
            }}>
              {songTitle}
            </h1>
            <h2 style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '20px',
              color: accentColor,
              margin: '5px 0 0 0',
              letterSpacing: '2px',
            }}>
              {artistName}
            </h2>
          </div>

          {/* Tech Progress Bar */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: `1px solid ${accentColor}44`,
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
                boxShadow: `0 0 10px ${accentColor}`,
              }} />
              {/* Segment markers */}
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.5) 10px, rgba(0,0,0,0.5) 12px)' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Courier New", monospace', color: '#fff', fontSize: '14px' }}>
              <span>T-{(progress / 100 * durationInSeconds / 60).toFixed(0)}:{String(Math.floor((progress / 100 * durationInSeconds) % 60)).padStart(2, '0')}</span>
              <span>[{Math.floor(progress).toString().padStart(3, '0')}%]</span>
            </div>
          </div>
        </div>

      </AbsoluteFill>
    </EffectsWrapper>
  )
}
