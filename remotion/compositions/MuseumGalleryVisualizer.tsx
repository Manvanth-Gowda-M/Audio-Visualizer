import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

export const MuseumGalleryVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Fine Art',
  artistName = 'The Curator',
  durationInSeconds,
  accentColor = '#d4af37', // Gold
  effects = [],
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  const fallbackImages = [
    artworkSrc || 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800&auto=format&fit=crop',
    artworkSrc || 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=800&auto=format&fit=crop',
  ]

  let images: string[] = []
  if (personImages && personImages.length > 0) {
    images = [
      personImages[0], // Main frame
      artworkSrc || fallbackImages[1], // Side frame
      personImages.length > 1 ? personImages[1] : personImages[0], // Other side frame
    ]
  } else {
    images = fallbackImages
  }

  // Animation values
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  })
  
  const camX = interpolate(frame, [0, durationInSeconds * fps], [-50, 50])

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], {
    extrapolateRight: 'clamp',
  })

  // Frame Component
  const ArtFrame = ({ src, style, caption }: { src: string, style: React.CSSProperties, caption?: string }) => (
    <div style={{
      position: 'absolute',
      backgroundColor: '#fff',
      padding: '40px',
      boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.1)',
      border: '2px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      ...style
    }}>
      {/* Inner Frame */}
      <div style={{
        width: '100%',
        height: caption ? 'calc(100% - 30px)' : '100%',
        boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)',
        border: '10px solid #1a1a1a',
        backgroundColor: '#000',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Glass Reflection */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
          pointerEvents: 'none'
        }} />
      </div>
      {caption && (
        <div style={{
          marginTop: '20px',
          fontFamily: '"Cinzel", "Times New Roman", serif',
          fontSize: '12px',
          color: '#333',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {caption}
        </div>
      )}
    </div>
  )

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <AbsoluteFill style={{ backgroundColor: '#2a2a2a', overflow: 'hidden' }}>
        <EffectsLayer effects={effects} accentColor={accentColor} width={1080} height={1920} />
        {audioSrc && <Audio src={audioSrc} />}

        {/* Gallery Wall Texture */}
        <AbsoluteFill style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        }} />

        {/* Spotlights */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '1000px',
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }} />

        {/* Moving Camera Container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${camX}px) scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          
          {/* Left Frame (Artwork) */}
          <ArtFrame src={images[1]} style={{
            left: '5%',
            top: '25%',
            width: '35%',
            aspectRatio: '3/4',
          }} />

          {/* Right Frame (Person 2) */}
          <ArtFrame src={images[2]} style={{
            right: '5%',
            top: '30%',
            width: '30%',
            aspectRatio: '1',
          }} />

          {/* Center Main Frame (Person 1) */}
          <ArtFrame src={images[0]} caption="Fig. 1" style={{
            width: '50%',
            aspectRatio: '4/5',
            top: '20%',
            zIndex: 10,
          }} />

        </div>

        {/* Museum Placard (Controls/Text) */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          backgroundColor: '#f9f9f9',
          padding: '30px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.5), inset 0 0 5px rgba(0,0,0,0.1)',
          border: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <h1 style={{
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#111',
            margin: 0,
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            {songTitle}
          </h1>
          <h2 style={{
            fontFamily: '"Lato", "Inter", sans-serif',
            fontSize: '16px',
            fontWeight: 300,
            color: '#555',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>
            {artistName}
          </h2>

          <div style={{ width: '100%', height: '1px', backgroundColor: '#ccc', margin: '10px 0' }} />

          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#888' }}>
              {(progress / 100 * durationInSeconds / 60).toFixed(0)}:{String(Math.floor((progress / 100 * durationInSeconds) % 60)).padStart(2, '0')}
            </span>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#eee', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progress}%`, backgroundColor: accentColor }} />
            </div>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#888' }}>
              {Math.floor(durationInSeconds / 60)}:{String(Math.floor(durationInSeconds % 60)).padStart(2, '0')}
            </span>
          </div>
        </div>

      </AbsoluteFill>
    </EffectsWrapper>
  )
}
