import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import React from 'react'
import { VisualizerProps } from './shared'

// --- Assets (High Quality Placeholders) ---
const paperBg = 'https://images.unsplash.com/photo-1603504344437-02ff49fcfaee?auto=format&fit=crop&q=80&w=1200' // Lined paper texture
const vinylPng = 'https://cdn.pixabay.com/photo/2014/04/03/10/32/record-310869_1280.png'
const cassettePng = 'https://cdn.pixabay.com/photo/2013/07/12/18/17/cassette-153205_1280.png'
const butterflyPng = 'https://cdn.pixabay.com/photo/2016/08/21/21/53/butterfly-1610777_1280.png'
const flowerPng = 'https://cdn.pixabay.com/photo/2014/04/05/11/40/daisy-316618_1280.png'
const pianoPng = 'https://cdn.pixabay.com/photo/2013/07/13/11/52/piano-158866_1280.png'
const earphonePng = 'https://cdn.pixabay.com/photo/2014/04/02/14/08/headphones-306282_1280.png' // Usually black, we'll invert or use as is
const guitarPng = 'https://cdn.pixabay.com/photo/2012/04/13/20/46/electric-guitar-33583_1280.png'
const musicNotesPng = 'https://cdn.pixabay.com/photo/2014/04/02/10/43/music-notes-304323_1280.png'

export const VintageScrapbookVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  durationInSeconds,
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  // Process Images for Photo Strip
  const fallbacks = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
  ]
  const images = Array.from({ length: 3 }).map((_, i) => 
    personImages && personImages.length > i ? personImages[i] : 
    (personImages && personImages.length > 0 ? personImages[i % personImages.length] : fallbacks[i])
  )

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 1], { extrapolateRight: 'clamp' })
  
  // Animations
  const vinylRotation = frame * 1.5
  const bgDrift = Math.sin(frame / 200) * 10
  
  // Parallax offsets
  const floatY = Math.sin(frame / 60) * 5
  
  const p1 = Math.sin(frame / 50) * 8
  const p2 = Math.cos(frame / 45) * -6

  // iOS Volume HUD rendering logic
  const totalBars = 16
  const filledBars = Math.floor(progress * totalBars)

  // Paper cutout typography style
  const CutoutText = ({ text, style }: { text: string, style?: React.CSSProperties }) => (
    <div style={{
      display: 'inline-block',
      backgroundColor: '#f1ebd9', // Warm aged paper color
      color: '#2d2d2d',
      padding: '4px 12px',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '24px',
      fontWeight: 'bold',
      boxShadow: '2px 3px 5px rgba(0,0,0,0.15)',
      ...style
    }}>
      {text}
    </div>
  )

  return (
    <AbsoluteFill style={{ backgroundColor: '#e8ddcb', overflow: 'hidden' }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* --- BACKGROUND --- */}
      <AbsoluteFill>
        <div style={{
          position: 'absolute', inset: -20,
          backgroundImage: `url(${paperBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          mixBlendMode: 'multiply',
          transform: `translateY(${bgDrift}px)`
        }} />
        {/* Lined paper lines simulation */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(transparent, transparent 38px, rgba(150, 150, 150, 0.2) 38px, rgba(150, 150, 150, 0.2) 40px)'
        }} />
        {/* Grain/Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, transparent 40%, rgba(100, 80, 50, 0.3) 100%)',
          pointerEvents: 'none'
        }} />
      </AbsoluteFill>

      {/* --- STATIC SCRAPBOOK ASSETS --- */}
      
      {/* Earphones (Top Left) */}
      <Img src={earphonePng} style={{
         position: 'absolute', top: '-5%', left: '5%', width: '300px',
         transform: `translateY(${p1}px) rotate(-15deg)`, filter: 'drop-shadow(5px 10px 15px rgba(0,0,0,0.3)) hue-rotate(180deg) invert(0.8)' // Trying to make it look white/vintage
      }} />

      {/* Music Notes */}
      <Img src={musicNotesPng} style={{
         position: 'absolute', top: '35%', right: '25%', width: '180px',
         transform: `rotate(10deg)`, opacity: 0.85, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))'
      }} />

      {/* Piano Keys (Mid Right) */}
      <Img src={pianoPng} style={{
         position: 'absolute', top: '45%', right: '15%', width: '400px',
         transform: `translateY(${p2}px) rotate(25deg)`, filter: 'drop-shadow(10px 15px 20px rgba(0,0,0,0.3)) sepia(0.3)'
      }} />

      {/* Guitar (Bottom Center) */}
      <Img src={guitarPng} style={{
         position: 'absolute', bottom: '-5%', left: '45%', width: '220px',
         transform: `rotate(15deg)`, filter: 'drop-shadow(8px 12px 20px rgba(0,0,0,0.4)) sepia(0.2)'
      }} />

      {/* Butterflies & Flowers */}
      <Img src={butterflyPng} style={{ position: 'absolute', top: '8%', left: '35%', width: '200px', transform: `translateY(${floatY}px) rotate(-10deg)`, filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.2)) grayscale(0.5) sepia(0.4)' }} />
      <Img src={flowerPng} style={{ position: 'absolute', top: '15%', right: '5%', width: '250px', opacity: 0.8, filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.2)) sepia(0.5)', transform: 'rotate(45deg)' }} />
      <Img src={flowerPng} style={{ position: 'absolute', bottom: '15%', left: '-5%', width: '250px', opacity: 0.7, filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.2)) sepia(0.5)', transform: 'rotate(-30deg)' }} />

      {/* --- PHOTO STRIP (Right Edge) --- */}
      <div style={{
         position: 'absolute', top: '45%', right: '2%', width: '220px',
         backgroundColor: '#111', padding: '10px 10px 30px 10px',
         boxShadow: '5px 10px 20px rgba(0,0,0,0.3)', transform: 'rotate(3deg)',
         display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
         <Img src={images[0]} style={{ width: '100%', height: '150px', objectFit: 'cover', filter: 'grayscale(0.3) sepia(0.3)' }} />
         <Img src={images[1]} style={{ width: '100%', height: '150px', objectFit: 'cover', filter: 'grayscale(0.3) sepia(0.3)' }} />
      </div>

      {/* --- CASSETTE STACK (Bottom Right) --- */}
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '280px', transform: 'rotate(-4deg)', zIndex: 10 }}>
         <Img src={cassettePng} style={{ width: '100%', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4)) sepia(0.6) hue-rotate(-20deg)' }} />
         <Img src={cassettePng} style={{ width: '100%', marginTop: '-80px', transform: 'rotate(2deg)', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4)) sepia(0.4) hue-rotate(40deg)' }} />
         <Img src={cassettePng} style={{ width: '100%', marginTop: '-80px', transform: 'rotate(-3deg)', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4)) sepia(0.2)' }} />
      </div>

      {/* --- VINYL RECORD (Bottom Left) --- */}
      <div style={{
         position: 'absolute', bottom: '15%', left: '5%', width: '450px', height: '450px',
         zIndex: 10
      }}>
         {/* Vinyl Shadow */}
         <div style={{
            position: 'absolute', inset: '10px', borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.5)', filter: 'blur(15px)',
            transform: 'translateY(20px)'
         }} />
         {/* Vinyl Graphic */}
         <Img src={vinylPng} style={{
            width: '100%', height: '100%', objectFit: 'contain',
            transform: `rotate(${vinylRotation}deg)`
         }} />
         {/* Center Artwork */}
         <div style={{
            position: 'absolute', top: '50%', left: '50%', width: '150px', height: '150px',
            transform: `translate(-50%, -50%) rotate(${vinylRotation}deg)`,
            borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff'
         }}>
            <Img src={artworkSrc || images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3)' }} />
         </div>
      </div>

      {/* --- TYPOGRAPHY CUTOUTS --- */}
      <div style={{ position: 'absolute', top: '38%', left: '30%', zIndex: 15, transform: 'rotate(-2deg)' }}>
         <CutoutText text="dream a little" />
         <br/>
         <CutoutText text="dream of me" style={{ marginTop: '4px', marginLeft: '12px' }} />
      </div>

      <div style={{ position: 'absolute', top: '55%', left: '42%', zIndex: 15, transform: 'rotate(3deg)' }}>
         <CutoutText text="you are my" style={{ fontSize: '18px', padding: '2px 8px' }} />
         <br/>
         <CutoutText text="FAVORITE" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '36px', marginTop: '4px' }} />
         <br/>
         <CutoutText text="person" style={{ fontFamily: '"Dancing Script", cursive', fontSize: '28px', marginTop: '-10px', marginLeft: '60px', backgroundColor: 'transparent', boxShadow: 'none' }} />
      </div>

      <div style={{ position: 'absolute', bottom: '25%', left: '38%', zIndex: 15, transform: 'rotate(-4deg)' }}>
         <CutoutText text="ROCK 'N' ROLL" style={{ fontFamily: '"Arial Black", sans-serif', fontSize: '28px', letterSpacing: '2px', backgroundColor: '#e2e2e2' }} />
      </div>

      {/* --- IOS VOLUME HUD PROGRESS WIDGET --- */}
      <div style={{
         position: 'absolute', top: '10%', right: '10%', zIndex: 30,
         width: '200px', height: '200px',
         backgroundColor: 'rgba(230, 230, 230, 0.85)',
         backdropFilter: 'blur(20px)',
         WebkitBackdropFilter: 'blur(20px)',
         borderRadius: '30px',
         display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
         boxShadow: '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
         <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontSize: '20px', fontWeight: 500, color: '#333', marginBottom: '16px' }}>
            Headphones
         </span>
         
         {/* Speaker Icon (Simplified SVG) */}
         <svg width="60" height="60" viewBox="0 0 24 24" fill="#555" style={{ marginBottom: '24px' }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
         </svg>

         {/* Volume / Progress Squares */}
         <div style={{ display: 'flex', gap: '3px', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
            {Array.from({ length: totalBars }).map((_, i) => (
               <div key={i} style={{
                  flex: 1, height: '10px',
                  backgroundColor: i < filledBars ? '#555' : 'rgba(0,0,0,0.1)',
                  borderRadius: '1px'
               }} />
            ))}
         </div>
      </div>

    </AbsoluteFill>
  )
}
