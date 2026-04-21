import React from 'react'
import { useCurrentFrame, useVideoConfig, Img } from 'remotion'
import { Audio } from '@remotion/media'
import { VisualizerProps } from './shared'

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const RetroPlayerVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  songTitle = 'Unknown Title',
  artistName = 'Unknown Artist',
  durationInSeconds = 210,
  accentColor = '#fcd0d9', // Pastel pink default
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const progress = Math.min(currentTime / durationInSeconds, 1)

  // Layout params based on width (assuming 1080x1080 square)
  const isSquare = width === height

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#ffffff', // Background behind the card if it doesn't fill
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Background fill to match the pastel theme */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff' }} />

      {/* Main Container Card */}
      <div
        style={{
          width: isSquare ? width * 0.8 : 800,
          height: isSquare ? height * 0.9 : 1000,
          backgroundColor: accentColor,
          border: '8px solid #111',
          borderRadius: 16,
          boxShadow: '16px 16px 0px #111',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Artwork Area */}
        <div
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#ffb6c1',
            border: '6px solid #111',
            marginBottom: '40px',
            overflow: 'hidden',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
          }}
        >
          {artworkSrc ? (
            <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: '#111', fontWeight: 'bold' }}>NO ARTWORK</div>
          )}
        </div>

        {/* Text Info */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>
            {songTitle}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 500, color: '#111', opacity: 0.8 }}>
            {artistName}
          </div>
        </div>

        {/* Progress Slider */}
        <div style={{ marginBottom: '40px', position: 'relative', height: '30px', display: 'flex', alignItems: 'center' }}>
          {/* Track line line */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', backgroundColor: '#111', borderRadius: '2px' }} />
          
          {/* Knob */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${progress * 100}% - 12px)`,
              width: '24px',
              height: '24px',
              backgroundColor: '#111',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', marginBottom: '20px' }}>
          
          {/* Shuffle Icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="16 3 21 3 21 8"></polyline>
             <line x1="4" y1="20" x2="21" y2="3"></line>
             <polyline points="21 16 21 21 16 21"></polyline>
             <line x1="15" y1="15" x2="21" y2="21"></line>
             <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>

          {/* Previous Icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#111">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5" stroke="#111" strokeWidth="3" strokeLinecap="round"></line>
          </svg>

          {/* Play/Pause Button */}
          <div style={{ 
            width: '80px', height: '80px', backgroundColor: '#111', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </div>

          {/* Next Icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#111">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19" stroke="#111" strokeWidth="3" strokeLinecap="round"></line>
          </svg>

          {/* Repeat Icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="17 1 21 5 17 9"></polyline>
             <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
             <polyline points="7 23 3 19 7 15"></polyline>
             <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
        </div>
      </div>

      {audioSrc && <Audio src={audioSrc} />}
    </div>
  )
}
