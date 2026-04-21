import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { Audio } from '@remotion/media'
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

export const RetroCassetteVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  songTitle,
  artistName,
  accentColor = '#6dd5ed',
  typoStyle,
  durationInSeconds,
  effects = [],
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const currentTime = frame / fps

  const audioData = useAudioData(audioSrc)
  const fftSize = 40
  const freq = safeVisualize(audioData, frame, fps, fftSize)

  const cx = width / 2
  const cy = height / 2

  // Reel rotation calculations
  // left rotates clockwise, right rotates counter-clockwise
  // Speed multiplier = 2 for realistic smooth continuous rotation
  const speed = 2
  const maxTime = durationInSeconds || 1
  // Use duration in calculation to make the exact bounds
  const progress = Math.min(currentTime / maxTime, 1)
  const leftReelRotation = progress * 360 * speed
  const rightReelRotation = -progress * 360 * speed

  // Tape fullness
  const leftReelR = 45 - (progress * 25)
  const rightReelR = 20 + (progress * 25)

  const typoStyle_ = getTypographyStyle(typoStyle, accentColor, 'inter')

  const formattedCurrentTime = formatTime(currentTime)
  // Let the maxTime default cleanly to total expected lengths
  const formattedTotalTime = maxTime ? formatTime(maxTime) : '00:00'

  const cassetteWidth = 600
  const cassetteHeight = 380
  const cassetteX = cx - cassetteWidth / 2
  const cassetteY = cy - cassetteHeight / 2 - 20

  const reelCY = cassetteY + 160
  const leftReelCX = cx - 110
  const rightReelCX = cx + 110

  const drawWaveform = (isLeft: boolean) => {
    return freq.map((val, i) => {
      const baseHeight = 4
      const scale = 250
      const barHeight = baseHeight + (val * scale)
      const xOffset = isLeft ? (cx - cassetteWidth / 2 - 40 - (i * 12)) : (cx + cassetteWidth / 2 + 40 + (i * 12))
      
      return (
        <rect
          key={i}
          x={xOffset}
          y={cy - barHeight / 2 - 20}
          width={6}
          height={barHeight}
          rx={3}
          fill={accentColor}
          opacity={0.8}
        />
      )
    })
  }

  // Common UI to draw cassette and waveform so it can be duplicated for reflection
  const SharedVisuals = () => (
    <>
      {/* Waveforms */}
      {drawWaveform(true)}
      {drawWaveform(false)}

      {/* Cassette Tape */}
      <g>
        {/* Main Body */}
        <rect x={cassetteX} y={cassetteY} width={cassetteWidth} height={cassetteHeight} rx={24} fill="#62A4B8" stroke="#488193" strokeWidth={4} />
        
        {/* Top/Bottom Indents */}
        <rect x={cassetteX + 40} y={cassetteY + 10} width={cassetteWidth - 80} height={20} rx={10} fill="#4E8C94" />
        <path d={`M ${cx - 150} ${cassetteY + cassetteHeight} L ${cx - 130} ${cassetteY + cassetteHeight - 40} L ${cx + 130} ${cassetteY + cassetteHeight - 40} L ${cx + 150} ${cassetteY + cassetteHeight} Z`} fill="#4E8C94" />
        
        {/* Label Area (white) */}
        <rect x={cassetteX + 40} y={cassetteY + 50} width={cassetteWidth - 80} height={210} rx={12} fill="#F0F4F8" />
        
        {/* Tape Accent Strip on Label */}
        <rect x={cassetteX + 40} y={cassetteY + 160} width={cassetteWidth - 80} height={40} fill="#B0E6F0" />
        <rect x={cassetteX + 40} y={cassetteY + 160} width={cassetteWidth - 80} height={20} fill="#80D6E6" />

        {/* Center Tape Window */}
        <rect x={cx - 170} y={reelCY - 60} width={340} height={120} rx={16} fill="#24303B" />
        
        {/* Visible Tape Inside Window */}
        <path d={`M ${leftReelCX + leftReelR} ${reelCY} Q ${cx} ${reelCY + 40} ${rightReelCX - rightReelR} ${reelCY}`} fill="none" stroke="#161B21" strokeWidth={10} />

        {/* Left Tape Mass */}
        <circle cx={leftReelCX} cy={reelCY} r={leftReelR} fill="#35404A" />
        {/* Right Tape Mass */}
        <circle cx={rightReelCX} cy={reelCY} r={rightReelR} fill="#35404A" />

        {/* Left Reel */}
        <g transform={`rotate(${leftReelRotation}, ${leftReelCX}, ${reelCY})`}>
          <circle cx={leftReelCX} cy={reelCY} r={28} fill="#D6E0E9" />
          <circle cx={leftReelCX} cy={reelCY} r={8} fill="#24303B" />
          <circle cx={leftReelCX} cy={reelCY} r={16} fill="none" stroke="#24303B" strokeWidth={2} strokeDasharray="4 6" />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={leftReelCX + Math.cos(i * Math.PI / 3) * 18} cy={reelCY + Math.sin(i * Math.PI / 3) * 18} r={4} fill="#24303B" />
          ))}
        </g>

        {/* Right Reel */}
        <g transform={`rotate(${rightReelRotation}, ${rightReelCX}, ${reelCY})`}>
          <circle cx={rightReelCX} cy={reelCY} r={28} fill="#D6E0E9" />
          <circle cx={rightReelCX} cy={reelCY} r={8} fill="#24303B" />
          <circle cx={rightReelCX} cy={reelCY} r={16} fill="none" stroke="#24303B" strokeWidth={2} strokeDasharray="4 6" />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={rightReelCX + Math.cos(i * Math.PI / 3) * 18} cy={reelCY + Math.sin(i * Math.PI / 3) * 18} r={4} fill="#24303B" />
          ))}
        </g>
        
        {/* Screws */}
        <circle cx={cassetteX + 24} cy={cassetteY + 24} r={6} fill="#82A6AD" />
        <circle cx={cassetteX + cassetteWidth - 24} cy={cassetteY + 24} r={6} fill="#82A6AD" />
        <circle cx={cassetteX + 24} cy={cassetteY + cassetteHeight - 24} r={6} fill="#82A6AD" />
        <circle cx={cassetteX + cassetteWidth - 24} cy={cassetteY + cassetteHeight - 24} r={6} fill="#82A6AD" />
        <circle cx={cx} cy={cassetteY + cassetteHeight - 16} r={6} fill="#82A6AD" />
      </g>
    </>
  )

  return (
    <EffectsWrapper effects={effects} accentColor={accentColor}>
      <div style={{ width, height, position: 'relative', overflow: 'hidden', background: '#0B1C2E', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Smooth background gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, #18415F 0%, #173A53 50%, #0F2535 100%)`,
        }} />
        
        {/* Subtle blur across the background */}
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: 'blur(50px)',
          WebkitBackdropFilter: 'blur(50px)',
        }} />

        {/* Text (Top) */}
        <div style={{
          position: 'absolute', top: '10%', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10,
          ...typoStyle_,
        }}>
          <h1 style={{ color: '#FFFFFF', fontSize: 84, margin: 0, fontWeight: 800, letterSpacing: '2px', textShadow: '0px 4px 20px rgba(0,0,0,0.5)', fontFamily: 'Inter, sans-serif' }}>
            {songTitle || "SONG NAME"}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 36, margin: '8px 0 0 0', fontWeight: 400, letterSpacing: '1px', fontFamily: 'Inter, sans-serif' }}>
            {artistName || "AUTHOR NAME"}
          </p>
        </div>

        {/* Scalable Vector Graphics Container */}
        <svg style={{ position: 'absolute', inset: 0, zIndex: 5 }} width={width} height={height}>
          {/* Reflection Graphic (rendered first so it's behind if they overlap somehow) */}
          <g transform={`translate(0, ${(cy * 2) + 30}) scale(1, -1)`} opacity={0.2} filter="blur(8px)">
            <SharedVisuals />
          </g>

          {/* Real Graphic */}
          <SharedVisuals />
        </svg>

        {/* Time Display (Bottom) */}
        <div style={{
          position: 'absolute', top: cassetteY + cassetteHeight + 30, left: 0, right: 0,
          textAlign: 'center', zIndex: 10,
          ...typoStyle_,
        }}>
          <span style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 500, opacity: 0.9, fontFamily: 'Inter, sans-serif' }}>
            {formattedCurrentTime} – {formattedTotalTime}
          </span>
        </div>

        <Audio src={audioSrc} />
        <EffectsLayer effects={effects} accentColor={accentColor} width={width} height={height} />
      </div>
    </EffectsWrapper>
  )
}
