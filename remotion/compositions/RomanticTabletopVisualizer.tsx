import { AbsoluteFill, Img, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import { visualizeAudio, useAudioData, type MediaUtilsAudioData } from '@remotion/media-utils'
import React from 'react'
import { VisualizerProps } from './shared'

function safeVisualize(audioData: MediaUtilsAudioData | null, frame: number, fps: number, n: number): number[] {
  if (!audioData) return new Array(n).fill(0.1)
  try {
    return visualizeAudio({ audioData, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0.1)
  } catch {
    return new Array(n).fill(0.1)
  }
}

// --- Assets ---
// High quality photorealistic romantic dinner background
const bgImage = 'https://images.unsplash.com/photo-1579549557404-36ea3a47900b?auto=format&fit=crop&q=80&w=1080' // A warm, slightly blurred background (we'll tint it to look like candles)
const fallbackImage = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600' // Couple

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


export const RomanticTabletopVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  personImages,
  songTitle = 'Pehli Bhi Main',
  artistName = 'Vishal Mishra',
  durationInSeconds,
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const audioData = useAudioData(audioSrc || '')

  const mainImage = personImages && personImages.length > 0 ? personImages[0] : (artworkSrc || fallbackImage)

  const progress = interpolate(frame, [0, durationInSeconds * fps], [0, 100], { extrapolateRight: 'clamp' })
  
  // Animations
  const bgDrift = Math.sin(frame / 300) * 15
  const glowPulse = Math.sin(frame / 45) * 0.3 + 0.7 // 0.4 to 1.0

  // Audio visualization
  const numBars = 16
  const visualizerData = safeVisualize(audioData, frame, fps, numBars)

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1610', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* --- BACKGROUND SCENE --- */}
      <AbsoluteFill>
        <div style={{
          position: 'absolute', inset: -30,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) contrast(1.1) sepia(0.4)', // Warm, moody atmosphere
          transform: `scale(1.05) translateX(${bgDrift}px)`,
        }} />
        {/* Soft vignette/bloom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,200,100,0.1) 0%, rgba(30,15,0,0.7) 100%)',
          pointerEvents: 'none'
        }} />
      </AbsoluteFill>

      {/* --- CENTER ASSEMBLY --- */}
      <div style={{
         position: 'absolute', inset: 0,
         display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
         transform: `translateY(40px)` // Shift down slightly for table perspective
      }}>

         {/* --- ACRYLIC PLAQUE --- */}
         <div style={{
            width: '460px',
            height: '660px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px) brightness(1.1)',
            WebkitBackdropFilter: 'blur(12px) brightness(1.1)',
            border: '2px solid rgba(255, 255, 255, 0.8)', // Glowing edge
            borderRadius: '24px',
            padding: '32px',
            boxSizing: 'border-box',
            boxShadow: `
               inset 0 0 20px rgba(255, 255, 255, 0.3),
               0 0 50px rgba(255, 220, 150, ${0.4 * glowPulse}),
               0 30px 60px rgba(0,0,0,0.4)
            `,
            zIndex: 20,
            display: 'flex', flexDirection: 'column',
            color: '#fff',
            position: 'relative'
         }}>
            {/* Edge highlights */}
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '3px', background: 'linear-gradient(90deg, transparent, rgba(255,220,150,1), transparent)', filter: 'blur(1px)' }} />

            {/* Photo */}
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
               <Img src={mainImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Song Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{songTitle}</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', opacity: 0.8, fontWeight: 400 }}>{artistName}</p>
               </div>
               <Heart size={24} style={{ opacity: 0.9 }} fill="currentColor" />
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', marginBottom: '24px' }}>
               <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, backgroundColor: '#fff', borderRadius: '2px', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }} />
               </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', marginBottom: '32px' }}>
               <Shuffle size={20} style={{ opacity: 0.7 }} />
               <SkipBack size={28} style={{ opacity: 0.9 }} />
               <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1610', boxShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                  <Pause size={28} fill="currentColor" />
               </div>
               <SkipForward size={28} style={{ opacity: 0.9 }} />
               <Shuffle size={20} style={{ opacity: 0.7 }} /> {/* Repeat icon placeholder */}
            </div>

            {/* Bottom Spotify & Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flex: 1 }}>
               <SpotifyIcon size={28} />
               <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
                  {visualizerData.map((v: number, i: number) => (
                     <div key={i} style={{
                        width: '3px',
                        height: `${Math.max(4, v * 24)}px`,
                        backgroundColor: '#fff',
                        borderRadius: '1.5px',
                        boxShadow: '0 0 5px rgba(255,255,255,0.5)'
                     }} />
                  ))}
               </div>
            </div>
         </div>

         {/* --- WOODEN BASE --- */}
         <div style={{
            position: 'relative',
            width: '500px',
            height: '80px',
            marginTop: '-10px', // Overlap slightly to look like it's slotted in
            zIndex: 10,
            borderRadius: '50%', // Gives the cylinder top/bottom perspective
            background: 'linear-gradient(180deg, #b07e5b 0%, #6e4428 100%)', // Wood color
            boxShadow: `
               0 20px 40px rgba(0,0,0,0.6),
               inset 0 5px 15px rgba(255, 220, 150, ${0.3 * glowPulse}) /* Light bleeding down from acrylic */
            `,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center'
         }}>
            {/* Base top surface inner shadow */}
            <div style={{
               position: 'absolute', inset: '2px', borderRadius: '50%',
               background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
            }} />
            
            {/* Slot for acrylic */}
            <div style={{
               width: '420px', height: '6px', backgroundColor: '#3d2312', borderRadius: '3px',
               marginTop: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(255,220,150,0.8)'
            }} />
         </div>
      </div>
    </AbsoluteFill>
  )
}
