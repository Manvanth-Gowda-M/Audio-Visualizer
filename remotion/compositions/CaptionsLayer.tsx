import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion'
import type { Caption, CaptionPosition } from '@/lib/store'

interface CaptionsLayerProps {
  captions: Caption[]
  fps: number
}

function positionToStyle(pos: CaptionPosition): React.CSSProperties {
  const map: Record<CaptionPosition, React.CSSProperties> = {
    'top-left':      { top: '8%', left: '5%' },
    'top-center':    { top: '8%', left: '50%', transform: 'translateX(-50%)' },
    'top-right':     { top: '8%', right: '5%' },
    'middle-left':   { top: '50%', left: '5%', transform: 'translateY(-50%)' },
    'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'middle-right':  { top: '50%', right: '5%', transform: 'translateY(-50%)' },
    'bottom-left':   { bottom: '10%', left: '5%' },
    'bottom-center': { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right':  { bottom: '10%', right: '5%' },
  }
  return map[pos] || map['bottom-center']
}

function captionCSSStyle(cap: Caption): React.CSSProperties {
  const shadows: string[] = []
  if (cap.glow) {
    shadows.push(
      `0 0 ${cap.glowIntensity}px ${cap.glowColor}`,
      `0 0 ${cap.glowIntensity * 2}px ${cap.glowColor}66`,
    )
  }
  if (cap.shadow) shadows.push('2px 4px 16px rgba(0,0,0,0.9)')

  const base: React.CSSProperties = {
    fontFamily: cap.fontFamily,
    fontSize: cap.fontSize * 1.5, // scale up for 1920-wide canvas
    fontWeight: cap.bold ? 700 : 400,
    fontStyle: cap.italic ? 'italic' : 'normal',
    textAlign: cap.textAlign,
    letterSpacing: `${cap.letterSpacing}em`,
    textTransform: cap.uppercase ? 'uppercase' : 'none',
    maxWidth: '80%',
    wordBreak: 'break-word',
    padding: '6px 20px',
    borderRadius: 6,
  }

  if (cap.outline) {
    base.WebkitTextStroke = `${cap.outlineWidth * 1.5}px ${cap.outlineColor}`
  }
  if (shadows.length) base.textShadow = shadows.join(', ')

  if (cap.useGradient) {
    base.background = `linear-gradient(to right, ${cap.gradientFrom}, ${cap.gradientTo})`
    base.WebkitBackgroundClip = 'text'
    base.WebkitTextFillColor = 'transparent'
  } else {
    base.color = cap.color
  }

  if (cap.backgroundColor) {
    const hex = cap.backgroundColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    base.backgroundColor = `rgba(${r},${g},${b},${cap.backgroundOpacity})`
  }

  return base
}

function CaptionItem({ caption, fps }: { caption: Caption; fps: number }) {
  const frame = useCurrentFrame()
  const totalFrames = Math.round((caption.endTime - caption.startTime) * fps)
  const introFrames = Math.min(18, Math.floor(totalFrames * 0.25))
  const outroFrames = Math.min(18, Math.floor(totalFrames * 0.25))

  let opacity = 1
  let translateY = 0
  let translateX = 0
  let scale = 1

  switch (caption.animation) {
    case 'fade':
      opacity = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      opacity = Math.min(opacity, interpolate(frame, [totalFrames - outroFrames, totalFrames], [1, 0], { extrapolateLeft: 'clamp' }))
      break
    case 'slideUp':
      translateY = interpolate(frame, [0, introFrames], [50, 0], { extrapolateRight: 'clamp' })
      opacity = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      opacity = Math.min(opacity, interpolate(frame, [totalFrames - outroFrames, totalFrames], [1, 0], { extrapolateLeft: 'clamp' }))
      break
    case 'slideDown':
      translateY = interpolate(frame, [0, introFrames], [-50, 0], { extrapolateRight: 'clamp' })
      opacity = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      opacity = Math.min(opacity, interpolate(frame, [totalFrames - outroFrames, totalFrames], [1, 0], { extrapolateLeft: 'clamp' }))
      break
    case 'slideLeft':
      translateX = interpolate(frame, [0, introFrames], [60, 0], { extrapolateRight: 'clamp' })
      opacity = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      break
    case 'slideRight':
      translateX = interpolate(frame, [0, introFrames], [-60, 0], { extrapolateRight: 'clamp' })
      opacity = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      break
    case 'zoom':
      scale = interpolate(frame, [0, introFrames], [0.6, 1], { extrapolateRight: 'clamp' })
      opacity = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      opacity = Math.min(opacity, interpolate(frame, [totalFrames - outroFrames, totalFrames], [1, 0], { extrapolateLeft: 'clamp' }))
      break
    case 'bounce': {
      const t = interpolate(frame, [0, introFrames], [0, 1], { extrapolateRight: 'clamp' })
      translateY = interpolate(t, [0, 0.6, 0.8, 1], [40, -12, 4, 0])
      opacity = interpolate(frame, [0, introFrames * 0.5], [0, 1], { extrapolateRight: 'clamp' })
      break
    }
    case 'typewriter':
      // Full text revealed progressively
      opacity = 1
      break
    case 'none':
    default:
      opacity = 1
  }

  const xPos = positionToStyle(caption.position)
  const textStyle = captionCSSStyle(caption)

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          ...xPos,
          opacity,
          transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
          ...textStyle,
        }}
      >
        {caption.animation === 'typewriter'
          ? caption.text.slice(0, Math.floor(interpolate(frame, [0, introFrames * 3], [0, caption.text.length], { extrapolateRight: 'clamp' })))
          : caption.text
        }
      </div>
    </AbsoluteFill>
  )
}

export function CaptionsLayer({ captions, fps }: CaptionsLayerProps) {
  if (!captions || captions.length === 0) return null
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
      {captions.map(cap => (
        <Sequence
          key={cap.id}
          from={Math.round(cap.startTime * fps)}
          durationInFrames={Math.max(1, Math.round((cap.endTime - cap.startTime) * fps))}
        >
          <CaptionItem caption={cap} fps={fps} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
