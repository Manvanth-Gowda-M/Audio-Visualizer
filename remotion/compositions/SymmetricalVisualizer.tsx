import React from 'react'
import { useCurrentFrame, useVideoConfig, Img, interpolate, spring } from 'remotion'
import { Audio } from '@remotion/media'
import { visualizeAudio, useAudioData, type MediaUtilsAudioData } from '@remotion/media-utils'
import { VisualizerProps } from './shared'
import { EffectsLayer, EffectsWrapper } from '../effects/EffectsLayer'

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

export const SymmetricalVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  songTitle = 'Song Name',
  artistName = 'Author Name',
  durationInSeconds = 210,
  accentColor = '#ffffff',
  effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  // Higher sample count for smoother circles and wider spectrums
  const frequencyData = safeVisualize(audioData, frame, fps, 128)
  
  const cx = width / 2
  const cy = height / 2 - 50 // Shifted up slightly to leave room for text/progress

  // Calculate bass boost for whole element reaction
  const bassAvg = frequencyData.slice(0, 5).reduce((a, b) => a + b, 0) / 5
  // Smoothly damp the bass for expansion
  const beatScale = 1 + bassAvg * 0.15

  // Circular spectrum config
  const circleRadius = 250
  const numCircleBars = 64
  
  // Side waveform config
  const sideWaveH = 150
  const sideWaveW = 400
  const numSideBars = 48

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
        {/* Background Noise & Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1a100c 0%, #000000 50%, #200a0a 100%)',
            zIndex: 0,
          }}
        />
        
        {/* Very subtle noise texture layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* --- DYNAMIC VISUALS LAYER --- */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          
          {/* Left Side Waveform */}
          <svg
            style={{ position: 'absolute', left: cx - circleRadius - sideWaveW - 50, top: cy - sideWaveH / 2 }}
            width={sideWaveW}
            height={sideWaveH}
          >
            {frequencyData.slice(10, 10 + numSideBars).reverse().map((val, i) => {
              const barH = Math.max(val * sideWaveH * 0.8, 3)
              const barW = Math.floor(sideWaveW / numSideBars) - 2
              const xInfo = i * (barW + 2)
              return (
                <g key={`left-${i}`}>
                  <rect x={xInfo} y={(sideWaveH - barH) / 2} width={barW} height={barH} fill="#ffffff" rx={barW/2} opacity={0.9} />
                  {/* Subtle mirror glow/shadow below could be added, but keeping minimal */}
                   <rect x={xInfo} y={(sideWaveH - barH) / 2} width={barW} height={barH} fill={accentColor} rx={barW/2} opacity={0.3} style={{ filter: 'blur(4px)' }} />
                </g>
              )
            })}
          </svg>

          {/* Right Side Waveform */}
          <svg
            style={{ position: 'absolute', left: cx + circleRadius + 50, top: cy - sideWaveH / 2 }}
            width={sideWaveW}
            height={sideWaveH}
          >
            {frequencyData.slice(10, 10 + numSideBars).map((val, i) => {
              const barH = Math.max(val * sideWaveH * 0.8, 3)
              const barW = Math.floor(sideWaveW / numSideBars) - 2
              const xInfo = i * (barW + 2)
              return (
                <rect key={`right-${i}`} x={xInfo} y={(sideWaveH - barH) / 2} width={barW} height={barH} fill="#ffffff" rx={barW/2} opacity={0.9} />
              )
            })}
          </svg>

          {/* Central Circular Spectrum */}
          <svg style={{ position: 'absolute', inset: 0 }} overflow="visible">
            <g transform={`translate(${cx}, ${cy}) scale(${beatScale})`}>
              {Array.from({ length: numCircleBars }).map((_, i) => {
                const angle = (i * 360) / numCircleBars
                const val = frequencyData[i % frequencyData.length]
                const length = Math.max(val * 80, 5) // Max outward length
                
                return (
                  <line
                    key={`circlebar-${i}`}
                    x1={0}
                    y1={-circleRadius - 10}
                    x2={0}
                    y2={-circleRadius - 10 - length}
                    stroke="#ffffff"
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.8}
                    transform={`rotate(${angle})`}
                  />
                )
              })}
            </g>
          </svg>

          {/* Central Artwork */}
          <div
            style={{
              position: 'absolute',
              left: cx - circleRadius,
              top: cy - circleRadius,
              width: circleRadius * 2,
              height: circleRadius * 2,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(255,100,100,0.1)',
              transform: `scale(${beatScale})`,
            }}
          >
            <Img src={artworkSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Subtle inner dark ring for depth */}
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          </div>

          {/* Bottom Info Section */}
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: cx - 400,
              width: 800,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Title / Artist */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '30px' }}>
              <span style={{ fontSize: '32px', fontWeight: 500, color: '#dddddd', fontFamily: 'Inter, sans-serif' }}>
                {artistName}
              </span>
              <span style={{ fontSize: '32px', color: '#aaaaaa' }}>–</span>
              <span style={{ fontSize: '32px', fontWeight: 600, color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
                {songTitle}
              </span>
            </div>

            {/* Progress Bar & Time */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '2px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${(currentTime / durationInSeconds) * 100}%`,
                  backgroundColor: '#ffffff',
                  borderRadius: '2px'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '18px', fontWeight: 600, color: '#dddddd', fontFamily: 'monospace' }}>
                {formatTime(currentTime)} - {formatTime(durationInSeconds)}
              </div>
            </div>

          </div>

        </div>

        <Audio src={audioSrc} />
        <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
      </div>
    </EffectsWrapper>
  )
}
