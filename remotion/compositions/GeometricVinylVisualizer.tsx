import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate } from 'remotion'
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

export const GeometricVinylVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  songTitle = 'VINYL RECORD',
  artistName = 'LOREM IPSUM',
  durationInSeconds,
}) => {
  const { fps, width, height } = useVideoConfig()
  const frame = useCurrentFrame()
  const audioData = useAudioData(audioSrc || '')

  // Audio visualization
  const numLines = 32
  const visualizerData = safeVisualize(audioData, frame, fps, numLines)

  // Canvas center and sizing
  const cx = width / 2
  const cy = height / 2 + 150 // Shifted down to leave room for the top waveforms
  const baseR = 40
  const spacing = 12

  // Animation for slight subtle breathing
  const globalScale = 1 + Math.sin(frame / 60) * 0.01

  return (
    <AbsoluteFill style={{ backgroundColor: '#161b2c', overflow: 'hidden' }}>
      {audioSrc && <Audio src={audioSrc} />}

      {/* Center Group */}
      <div style={{
         position: 'absolute', inset: 0,
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         transform: `scale(${globalScale})`
      }}>
         <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
               {/* Vertical Linear Gradient for the lines */}
               <linearGradient id="vinylGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#fde047" /> {/* Yellow */}
                  <stop offset="20%" stopColor="#fcd34d" />
                  <stop offset="50%" stopColor="#f97316" /> {/* Orange */}
                  <stop offset="100%" stopColor="#ef4444" /> {/* Coral/Red */}
               </linearGradient>
            </defs>

            {/* Typography */}
            <text x={cx} y={cy - 350} fill="#fcd34d" fontSize="56" fontWeight="bold" fontFamily="sans-serif" letterSpacing="8" textAnchor="middle">
               {songTitle.toUpperCase()}
            </text>
            <text x={cx} y={cy - 290} fill="#fcd34d" fontSize="24" fontWeight="600" fontFamily="sans-serif" letterSpacing="6" textAnchor="middle" opacity="0.8">
               {artistName.toUpperCase()}
            </text>

            {/* Geometric Lines */}
            {Array.from({ length: numLines }).map((_, i) => {
               const r = baseR + i * spacing
               
               // Calculate base height profile (inverted parabola / bell curve)
               const normalizedI = i / (numLines - 1)
               // The peak height should be around 60% of the way out
               const profile = Math.sin(normalizedI * Math.PI * 0.8 + 0.2)
               const baseH = 100 + profile * 450
               
               // Add audio reactivity
               // Smoothed audio value
               const audioVal = visualizerData[i] || 0.1
               const audioH = audioVal * 250 // Reactivity scale

               const totalH = baseH + audioH

               // Path:
               // Start at top left: (cx - r, cy - totalH)
               // Line down to left tangency: (cx - r, cy)
               // Arc counter-clockwise to right tangency: (cx + r, cy)
               // Line up to top right: (cx + r, cy - totalH)
               
               const d = `
                  M ${cx - r} ${cy - totalH} 
                  L ${cx - r} ${cy} 
                  A ${r} ${r} 0 0 0 ${cx + r} ${cy} 
                  L ${cx + r} ${cy - totalH}
               `

               return (
                  <path 
                     key={i}
                     d={d}
                     fill="none"
                     stroke="url(#vinylGrad)"
                     strokeWidth="4"
                     strokeLinecap="round"
                     style={{
                        transition: 'stroke-dasharray 0.1s linear'
                     }}
                  />
               )
            })}

            {/* Center Vinyl Spindle */}
            <circle cx={cx} cy={cy} r={baseR - 10} fill="#fcd34d" />
            <circle cx={cx} cy={cy} r="8" fill="#161b2c" />
         </svg>
      </div>

    </AbsoluteFill>
  )
}
