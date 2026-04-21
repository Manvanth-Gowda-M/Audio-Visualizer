import React from 'react'
import { useCurrentFrame, useVideoConfig, Img, Audio } from 'remotion'
import { useAudioData, visualizeAudio, type MediaUtilsAudioData } from '@remotion/media-utils'
import { VisualizerProps, getTypographyStyle } from './shared'
import { EffectsWrapper, EffectsLayer } from '../effects/EffectsLayer'

function safeVisualize(audioData: MediaUtilsAudioData | null, frame: number, fps: number, n: number): number[] {
  if (!audioData) return new Array(n).fill(0)
  try {
    return visualizeAudio({ audioData, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0)
  } catch {
    return new Array(n).fill(0)
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const CinematicVinylUIVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  songTitle,
  artistName,
  accentColor = '#aa1738',
  typoStyle,
  durationInSeconds,
  effects = [],
}) => {
  const imageUrl = artworkSrc
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const fftSize = 32
  const freq = safeVisualize(audioData, frame, fps, fftSize)

  const maxTime = durationInSeconds || 1
  const progress = Math.min(currentTime / maxTime, 1)

  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, 'inter')
  const formattedCurrentTime = formatTime(currentTime)
  const formattedTotalTime = maxTime ? formatTime(maxTime) : '00:00'

  // Vinyl Rotation (slow, constant)
  const rotation = frame * 0.25

  // Subtle audio reactivity for the tonearm or background element
  const audioEnergy = freq.reduce((a, b) => a + b, 0) / freq.length
  
  const vinylSize = 800
  const vinylX = width * 0.3 // Left side
  const vinylY = height / 2

  // Tonearm subtle vibration based on audio
  const tonearmAngle = 20 + (audioEnergy * 2)

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ 
        width, height, 
        position: 'relative', 
        overflow: 'hidden', 
        background: '#0a0508', 
        display: 'flex' 
      }}>
        
        {/* Blurred Cinematic Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 70% 50%, #2b111f 0%, #0a0508 70%)`
        }} />
        {imageUrl && (
           <div style={{
             position: 'absolute', inset: -100,
             backgroundImage: `url(${imageUrl})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             opacity: 0.15,
             filter: 'blur(40px)',
           }} />
        )}

        {/* Text and UI Information (Right Side) */}
        <div style={{
          position: 'absolute',
          right: width * 0.1,
          top: 0,
          bottom: 0,
          width: width * 0.4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ...typoStyle_,
          zIndex: 10,
        }}>
          <h2 style={{
             color: accentColor, 
             fontSize: 24, 
             letterSpacing: '4px', 
             textTransform: 'uppercase', 
             marginBottom: 16,
             fontWeight: 600,
             fontFamily: 'Inter, sans-serif'
          }}>Now Playing</h2>
          
          <h1 style={{ 
            color: '#FFFFFF', 
            fontSize: 72, 
            margin: 0, 
            fontWeight: 800, 
            lineHeight: 1.1,
            textShadow: '0px 4px 20px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, sans-serif' 
          }}>
            {songTitle || "SONG TITLE"}
          </h1>
          
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: 32, 
            marginTop: 16, 
            marginBottom: 60,
            fontWeight: 400, 
            letterSpacing: '1px',
            fontFamily: 'Inter, sans-serif' 
          }}>
            {artistName || "Artist Name"}
          </p>

          {/* Minimal Audio Spectrum */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60, marginBottom: 40 }}>
            {freq.slice(0, 24).map((val, i) => {
              const h = 4 + (val * 50)
              return (
                <div key={i} style={{
                  width: 6,
                  height: h,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 3,
                  boxShadow: `0 0 10px ${accentColor}80`
                }} />
              )
            })}
          </div>

          {/* Progress Bar & Constants */}
          <div style={{ position: 'relative', width: '100%', marginTop: 'auto', marginBottom: height * 0.2 }}>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div style={{ 
                width: `${progress * 100}%`, 
                height: '100%', 
                background: accentColor, 
                borderRadius: 2,
                boxShadow: `0 0 15px ${accentColor}`
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{formattedCurrentTime}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{formattedTotalTime}</span>
            </div>
            
            {/* Fake minimal controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 40 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="#0a0508"></polygon></svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
            </div>
          </div>
        </div>

        {/* Vector Elements (Vinyl + Tonearm) */}
        <svg style={{ position: 'absolute', inset: 0, zIndex: 5 }} width={width} height={height}>
          
          {/* Vinyl Container */}
          <g transform={`translate(${vinylX}, ${vinylY})`}>
            {/* Record shadow added behind */}
            <circle cx={20} cy={30} r={vinylSize / 2} fill="rgba(0,0,0,0.6)" filter="blur(30px)" />
            
            <g transform={`rotate(${rotation})`}>
              {/* Outer Black Record */}
              <circle cx={0} cy={0} r={vinylSize / 2} fill="#111" stroke="#050505" strokeWidth={4} />
              
              {/* Grooves */}
              {Array.from({ length: 40 }).map((_, i) => (
                <circle 
                  key={i} 
                  cx={0} 
                  cy={0} 
                  r={(vinylSize / 2) - 20 - (i * 8)} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.03)" 
                  strokeWidth={1} 
                />
              ))}

              {/* Light Reflections on Record */}
              <path d={`M 0 ${-vinylSize / 2} A ${vinylSize / 2} ${vinylSize / 2} 0 0 1 ${vinylSize / 2} 0`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={40} filter="blur(15px)" />
              <path d={`M 0 ${vinylSize / 2} A ${vinylSize / 2} ${vinylSize / 2} 0 0 1 ${-vinylSize / 2} 0`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={20} filter="blur(10px)" />

              {/* Center Artwork / Label Background */}
              <circle cx={0} cy={0} r={vinylSize / 5} fill={accentColor} />
            </g>
          </g>
          
          {/* Tonearm */}
          <g transform={`translate(${vinylX + vinylSize / 2 + 60}, ${vinylY - vinylSize / 2.5})`}>
             <circle cx={0} cy={0} r={35} fill="#222" stroke="#444" strokeWidth={2} />
             <circle cx={0} cy={0} r={20} fill="#111" />
             
             <g transform={`rotate(${tonearmAngle})`}>
                <rect x={-8} y={0} width={16} height={380} fill="#D1D5DB" rx={8} />
                {/* Needle head */}
                <path d="M -12 360 L 12 360 L 16 420 L -16 420 Z" fill="#374151" stroke="#1F2937" strokeWidth={2} />
                <rect x={-20} y={380} width={40} height={10} fill="#EF4444" rx={2} />
             </g>
          </g>

        </svg>

        {/* Remotion Img placed exactly over the SVG artwork area (requires precise absolute positioning) */}
        {imageUrl && (
          <div
            style={{
              position: 'absolute',
              left: vinylX - (vinylSize / 5),
              top: vinylY - (vinylSize / 5),
              width: (vinylSize / 5) * 2,
              height: (vinylSize / 5) * 2,
              borderRadius: '50%',
              overflow: 'hidden',
              transform: `rotate(${rotation}deg)`,
              zIndex: 6, // Above SVG base record, below tonearm if tonearm reached center (but it doesn't)
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000'
            }}
          >
            <Img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Center hole */}
            <div style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', background: '#111', border: '2px solid rgba(0,0,0,0.3)' }} />
          </div>
        )}

        <Audio src={audioSrc} />
        <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
      </div>
    </EffectsWrapper>
  )
}
