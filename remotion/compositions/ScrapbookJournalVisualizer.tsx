import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

export const ScrapbookJournalVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Memories',
  artistName = 'The Vintage Band',
  durationInSeconds,
  accentColor = '#8c7355',
  effects = [],
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1524230659092-07f99a75c013?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?q=80&w=800&auto=format&fit=crop',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = [
      personImages[0], // Main focus
      artworkSrc || fallbackImages[1], // Secondary
      personImages.length > 1 ? personImages[1] : personImages[0], // Tertiary
      artworkSrc || fallbackImages[3], // Background element
    ]
  } else {
    images = fallbackImages
  }

  // Animation values
  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5 },
  })

  const titleOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: 'clamp' })
  const float1 = Math.sin(frame / 40) * 5
  const float2 = Math.cos(frame / 50) * 6
  const float3 = Math.sin(frame / 60) * 4

  const MaskingTape = ({ style }: { style: React.CSSProperties }) => (
    <div style={{
      position: 'absolute',
      width: '120px',
      height: '35px',
      backgroundColor: 'rgba(235, 230, 210, 0.7)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid rgba(200, 195, 175, 0.4)',
      ...style
    }} />
  )

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], {
    extrapolateRight: 'clamp',
  })

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <AbsoluteFill style={{ backgroundColor: '#eaddc5', overflow: 'hidden' }}>
        <EffectsLayer effects={effects} accentColor={accentColor} width={1080} height={1920} />
        {audioSrc && <Audio src={audioSrc} />}

        {/* Paper Texture Overlay */}
        <AbsoluteFill style={{
          opacity: 0.4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }} />

        {/* Collage Elements */}
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${interpolate(entrance, [0, 1], [1.1, 1])})` }}>
          
          {/* Back Right Photo (Artwork) */}
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '5%',
            width: '60%',
            aspectRatio: '1',
            transform: `rotate(12deg) translateY(${float2}px)`,
            backgroundColor: '#f4f1ea',
            padding: '16px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          }}>
            <Img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3) contrast(1.1)' }} />
            <MaskingTape style={{ top: '-15px', left: '10%', transform: 'rotate(-5deg)' }} />
          </div>

          {/* Back Left Photo (Person 2) */}
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '2%',
            width: '50%',
            aspectRatio: '4/5',
            transform: `rotate(-8deg) translateY(${float3}px)`,
            backgroundColor: '#f4f1ea',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          }}>
            <Img src={images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.5)' }} />
            <MaskingTape style={{ top: '-10px', right: '10%', transform: 'rotate(10deg)' }} />
            <MaskingTape style={{ bottom: '-10px', left: '20%', transform: 'rotate(-15deg)' }} />
          </div>

          {/* Front Center Photo (Person 1) */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '15%',
            width: '70%',
            aspectRatio: '3/4',
            transform: `rotate(3deg) translateY(${float1}px)`,
            backgroundColor: '#fffcf7',
            padding: '24px 24px 60px 24px', // Polaroid style padding
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          }}>
            <Img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <MaskingTape style={{ top: '-20px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }} />
            
            {/* Scribble / Note on Polaroid */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '24px',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: '24px',
              color: '#333',
              transform: 'rotate(-2deg)',
            }}>
              {artistName}
            </div>
          </div>

          {/* Post-it Note for Song Title */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '45%',
            aspectRatio: '1',
            backgroundColor: '#fcefa1',
            boxShadow: '2px 10px 20px rgba(0,0,0,0.15), inset 0 0 40px rgba(200,180,50,0.2)',
            transform: 'rotate(-10deg)',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: titleOpacity,
          }}>
            <MaskingTape style={{ top: '-15px', left: '50%', transform: 'translateX(-50%) rotate(5deg)' }} />
            <h1 style={{
              fontFamily: '"Caveat", "Comic Sans MS", cursive',
              fontSize: '48px',
              color: '#1a1a1a',
              margin: 0,
              lineHeight: 1.1,
              transform: 'rotate(-3deg)',
            }}>
              {songTitle}
            </h1>
            
            <div style={{ marginTop: '30px', width: '100%', height: '3px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '2px' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: accentColor, borderRadius: '2px' }} />
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '20px', fontFamily: '"Courier New", Courier, monospace', color: '#555', transform: 'rotate(-2deg)' }}>
              {(progress / 100 * durationInSeconds / 60).toFixed(0)}:{String(Math.floor((progress / 100 * durationInSeconds) % 60)).padStart(2, '0')} / {Math.floor(durationInSeconds / 60)}:{String(Math.floor(durationInSeconds % 60)).padStart(2, '0')}
            </div>
          </div>
          
        </div>
      </AbsoluteFill>
    </EffectsWrapper>
  )
}
