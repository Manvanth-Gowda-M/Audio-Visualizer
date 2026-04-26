import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'


export const EditorialPolaroidVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Lost in Translation',
  artistName = 'Sofia Sofia',
  durationInSeconds,
  accentColor = '#ffffff',
  effects = [],
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = [
      personImages[0], // Front center: person image
      artworkSrc || fallbackImages[1], // Back right: artwork
      personImages.length > 1 ? personImages[1] : personImages[0], // Back left: person image
    ]
  } else {
    images = fallbackImages
  }

  // Floating animations for Polaroids
  const float1 = Math.sin(frame / 70) * 10
  const float2 = Math.cos(frame / 60) * 12
  const float3 = Math.sin(frame / 80) * 15

  const rotation1 = interpolate(frame, [0, durationInSeconds * fps], [-5, 5])
  const rotation2 = interpolate(frame, [0, durationInSeconds * fps], [8, -2])
  const rotation3 = interpolate(frame, [0, durationInSeconds * fps], [-12, -4])

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 360], {
    extrapolateRight: 'clamp',
  })

  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  const textTranslateY = interpolate(frame, [10, 40], [20, 0], { extrapolateRight: 'clamp' })

  // Custom Record/Vinyl progress indicator
  const VinylProgress = () => (
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #222, #000)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 0 5px rgba(255,255,255,0.2)',
      transform: `rotate(${progress * 2}deg)`,
    }}>
      {/* Vinyl Grooves */}
      <div style={{ position: 'absolute', inset: '4px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
      
      {/* Center Label */}
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: '4px', height: '4px', backgroundColor: '#000', borderRadius: '50%' }} />
      </div>
    </div>
  )

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <AbsoluteFill style={{ backgroundColor: '#1a1a1a', overflow: 'hidden', opacity }}>
        <EffectsLayer effects={effects} accentColor={accentColor} width={1080} height={1920} />
        {audioSrc && <Audio src={audioSrc} />}


      {/* Dark Texture Background */}
      <AbsoluteFill style={{
        backgroundColor: '#111',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: 'overlay',
      }} />

      {/* Polaroid Collage */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: 0,
        right: 0,
        height: '65%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        
        {/* Polaroid 3 (Back left) */}
        <div style={{
          position: 'absolute',
          width: '45%',
          backgroundColor: '#f5f5f5',
          padding: '12px 12px 40px 12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          transform: `translateX(-25%) translateY(${float3}px) rotate(${rotation3}deg)`,
          zIndex: 1,
        }}>
          <Img src={images[2]} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', filter: 'grayscale(100%) contrast(1.2)' }} />
        </div>

        {/* Polaroid 2 (Back right) */}
        <div style={{
          position: 'absolute',
          width: '50%',
          backgroundColor: '#f8f8f8',
          padding: '14px 14px 45px 14px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
          transform: `translateX(25%) translateY(${float2}px) rotate(${rotation2}deg)`,
          zIndex: 2,
        }}>
          <Img src={images[1]} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', filter: 'sepia(0.4) contrast(1.1)' }} />
        </div>

        {/* Polaroid 1 (Front center) */}
        <div style={{
          position: 'absolute',
          width: '60%',
          backgroundColor: '#ffffff',
          padding: '16px 16px 50px 16px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.05)',
          transform: `translateY(${float1}px) rotate(${rotation1}deg)`,
          zIndex: 3,
        }}>
          <Img src={images[0]} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
        </div>

      </div>

      {/* Bottom Editorial Content */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35%',
        background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, rgba(17,17,17,0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '10%',
        zIndex: 10,
      }}>
        <div style={{
          transform: `translateY(${textTranslateY}px)`,
          opacity: opacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
        }}>
          {/* Typography */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '32px',
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              letterSpacing: '-1px',
              textTransform: 'uppercase',
            }}>
              {songTitle}
            </h1>
            <h2 style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '20px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.6)',
              margin: '4px 0 0 0',
            }}>
              {artistName}
            </h2>
          </div>

          <VinylProgress />
        </div>
      </div>
      </AbsoluteFill>
    </EffectsWrapper>
  )
}
