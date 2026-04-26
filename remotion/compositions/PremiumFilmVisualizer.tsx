import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

// Minimalist Audio Waveform
const SimpleWaveform = ({ audioData, color, width }: { audioData: number[], color: string, width: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', width, height: '40px' }}>
      {Array.from({ length: 30 }).map((_, i) => {
        // Mock audio data if actual not available/processed in this scope
        const height = 10 + Math.random() * 30
        return (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${height}px`,
              backgroundColor: color,
              borderRadius: '2px',
              opacity: 0.8,
            }}
          />
        )
      })}
    </div>
  )
}

export const PremiumFilmVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Interstellar',
  artistName = 'Hans Zimmer',
  durationInSeconds,
  accentColor = '#c9a84c', // Default to Gold
  effects = [],
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = [
      personImages[0],
      artworkSrc || fallbackImages[1],
      personImages.length > 1 ? personImages[1] : personImages[0],
      artworkSrc || fallbackImages[3],
    ]
  } else {
    images = fallbackImages
  }

  // Slow vertical panning effect for the film strip
  const scrollY = interpolate(frame, [0, durationInSeconds * fps], [0, -400], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], {
    extrapolateRight: 'clamp',
  })

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })

  // Floating text animation
  const textTranslateY = interpolate(frame, [0, 40], [20, 0], { extrapolateRight: 'clamp' })
  const textOpacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <AbsoluteFill style={{ backgroundColor: '#0a0a0a', overflow: 'hidden', opacity }}>
        <EffectsLayer effects={effects} accentColor={accentColor} width={1080} height={1920} />
        {audioSrc && <Audio src={audioSrc} />}


      {/* Deep blurred background for texture */}
      <AbsoluteFill>
        <Img
          src={artworkSrc || images[0]}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
            filter: 'blur(60px) grayscale(50%)',
            transform: 'scale(1.2)',
          }}
        />
        {/* Grain Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.05,
          pointerEvents: 'none',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 100%)',
        }} />
      </AbsoluteFill>

      {/* Vertical Film Strip */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: `translateX(-50%) translateY(${scrollY}px)`,
        width: '60%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        filter: 'sepia(0.2) contrast(1.1) brightness(0.9)', // Cinematic look
      }}>
        {images.map((img, i) => (
          <div key={i} style={{
            width: '100%',
            aspectRatio: '4/5',
            backgroundColor: '#111',
            padding: '12px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Img
              src={img}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(20%)',
              }}
            />
            {/* Film markings */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}>
              <span>KODAK 400</span>
              <span>{String(i + 1).padStart(2, '0')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Editorial UI */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '25%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '8%',
        zIndex: 10,
      }}>
        <div style={{
          transform: `translateY(${textTranslateY}px)`,
          opacity: textOpacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Typography */}
          <div style={{ textAlign: 'center', padding: '0 40px' }}>
            <h1 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '48px',
              fontWeight: 600,
              color: '#fff',
              margin: 0,
              letterSpacing: '1px',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}>
              {songTitle}
            </h1>
            <h2 style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '20px',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              margin: '8px 0 0 0',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}>
              {artistName}
            </h2>
          </div>

          {/* Minimalist Player & Progress */}
          <div style={{
            width: '80%',
            maxWidth: '500px',
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Elegant thin progress bar */}
            <div style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              position: 'relative',
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
            </div>
          </div>
        </div>
      </div>
      </AbsoluteFill>
    </EffectsWrapper>
  )
}
