import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

export interface EffectConfig {
  id: string
  name: string
  icon: string
  desc: string
  category: 'film' | 'light' | 'motion' | 'color'
}

export const EFFECTS: EffectConfig[] = [
  { id: 'film_grain',    name: 'Film Grain',      icon: '🎞',  desc: 'Organic 35mm noise texture',         category: 'film'   },
  { id: 'vintage',       name: 'Vintage',          icon: '📷',  desc: 'Warm sepia tones + vignette',        category: 'film'   },
  { id: 'vhs',           name: 'VHS',              icon: '📼',  desc: 'Scanlines + color bleed + tracking', category: 'film'   },
  { id: 'cinematic',     name: 'Cinematic Bars',   icon: '🎬',  desc: '2.39:1 letterbox black bars',        category: 'film'   },
  { id: 'light_leak',    name: 'Light Leak',       icon: '✨',  desc: 'Organic lens flare sweep',           category: 'light'  },
  { id: 'lens_flare',    name: 'Lens Flare',       icon: '🌟',  desc: 'Anamorphic streak on beat',          category: 'light'  },
  { id: 'vignette',      name: 'Vignette',         icon: '⬛',  desc: 'Deep cinematic edge darkening',      category: 'light'  },
  { id: 'bloom',         name: 'Bloom',            icon: '💫',  desc: 'Soft glow on bright areas',          category: 'light'  },
  { id: 'zoom_pulse',    name: 'Zoom Pulse',       icon: '🔍',  desc: 'Subtle scale pulse on bass',         category: 'motion' },
  { id: 'shake',         name: 'Camera Shake',     icon: '📳',  desc: 'Micro-jitter on transients',         category: 'motion' },
  { id: 'slow_zoom',     name: 'Slow Zoom',        icon: '🔭',  desc: 'Ken Burns slow push-in',             category: 'motion' },
  { id: 'duotone',       name: 'Duotone',          icon: '🎨',  desc: 'Two-color gradient overlay',         category: 'color'  },
  { id: 'cold',          name: 'Cold Grade',       icon: '🧊',  desc: 'Teal & blue cinematic grade',        category: 'color'  },
  { id: 'warm',          name: 'Warm Grade',       icon: '🔥',  desc: 'Golden hour orange tones',           category: 'color'  },
  { id: 'noir',          name: 'Noir',             icon: '🖤',  desc: 'High contrast black & white',        category: 'color'  },
]

interface Props {
  effects: string[]
  accentColor: string
  width: number
  height: number
  children?: React.ReactNode
}

export function EffectsLayer({ effects, accentColor, width, height }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = frame / fps

  const has = (id: string) => effects.includes(id)

  // Parse accent color
  const r = parseInt(accentColor.slice(1, 3), 16) || 168
  const g = parseInt(accentColor.slice(3, 5), 16) || 85
  const b = parseInt(accentColor.slice(5, 7), 16) || 247

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>

      {/* ── CINEMATIC BARS ── */}
      {has('cinematic') && (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: height * 0.115,
            background: '#000',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: height * 0.115,
            background: '#000',
          }} />
        </>
      )}

      {/* ── VIGNETTE ── */}
      {has('vignette') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)',
        }} />
      )}

      {/* ── VINTAGE ── */}
      {has('vintage') && (
        <>
          {/* Warm sepia overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(120,80,20,0.18)',
            mixBlendMode: 'multiply',
          }} />
          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(40,20,0,0.7) 100%)',
          }} />
          {/* Scratches — vertical lines */}
          {[0.22, 0.55, 0.78].map((x, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: 0, bottom: 0,
              width: 1,
              background: `rgba(255,220,150,${0.04 + Math.abs(Math.sin(t * 3 + i)) * 0.06})`,
            }} />
          ))}
          {/* Dust spots */}
          {[
            { x: 0.15, y: 0.3 }, { x: 0.7, y: 0.15 }, { x: 0.45, y: 0.7 },
            { x: 0.85, y: 0.55 }, { x: 0.3, y: 0.85 },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${p.x * 100}%`, top: `${p.y * 100}%`,
              width: 3, height: 3, borderRadius: '50%',
              background: `rgba(255,240,200,${0.15 + Math.abs(Math.sin(t * 2 + i * 1.3)) * 0.1})`,
            }} />
          ))}
        </>
      )}

      {/* ── VHS ── */}
      {has('vhs') && (
        <>
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
          }} />
          {/* Color bleed — RGB shift */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(255,0,80,0.04)`,
            transform: `translateX(${Math.sin(t * 0.7) * 3}px)`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(0,255,200,0.03)`,
            transform: `translateX(${-Math.sin(t * 0.7) * 2}px)`,
          }} />
          {/* Tracking glitch — random horizontal band */}
          {Math.sin(t * 11) > 0.85 && (
            <div style={{
              position: 'absolute',
              top: `${(Math.abs(Math.sin(t * 17)) * 80 + 5)}%`,
              left: 0, right: 0,
              height: 6 + Math.abs(Math.sin(t * 23)) * 12,
              background: `rgba(255,255,255,0.06)`,
              transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
            }} />
          )}
          {/* VHS timestamp */}
          <div style={{
            position: 'absolute', bottom: has('cinematic') ? height * 0.13 : 20, left: 20,
            fontFamily: 'monospace', fontSize: 14, color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
          }}>
            {String(Math.floor(t / 3600)).padStart(2,'0')}:
            {String(Math.floor((t % 3600) / 60)).padStart(2,'0')}:
            {String(Math.floor(t % 60)).padStart(2,'0')}
          </div>
        </>
      )}

      {/* ── FILM GRAIN ── */}
      {has('film_grain') && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}>
          <filter id={`grain-${frame % 4}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              seed={frame % 60}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${frame % 4})`} />
        </svg>
      )}

      {/* ── BLOOM ── */}
      {has('bloom') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(${r},${g},${b},0.08) 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }} />
      )}

      {/* ── LIGHT LEAK ── */}
      {has('light_leak') && (() => {
        const cycle = (t * 0.12) % 1
        const opacity = cycle < 0.15
          ? interpolate(cycle, [0, 0.07, 0.15], [0, 0.55, 0])
          : 0
        return opacity > 0 ? (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(${135 + cycle * 90}deg, rgba(255,200,80,${opacity * 0.8}) 0%, rgba(${r},${g},${b},${opacity * 0.6}) 40%, transparent 70%)`,
          }} />
        ) : null
      })()}

      {/* ── LENS FLARE ── */}
      {has('lens_flare') && (() => {
        const pulse = 0.5 + Math.abs(Math.sin(t * 1.8)) * 0.5
        const flareX = 0.7 + Math.sin(t * 0.3) * 0.1
        const flareY = 0.25 + Math.sin(t * 0.2) * 0.05
        return (
          <>
            {/* Main flare */}
            <div style={{
              position: 'absolute',
              left: `${flareX * 100}%`, top: `${flareY * 100}%`,
              width: 120, height: 120,
              transform: 'translate(-50%,-50%)',
              background: `radial-gradient(circle, rgba(255,255,255,${0.35 * pulse}) 0%, rgba(${r},${g},${b},${0.2 * pulse}) 40%, transparent 70%)`,
              filter: 'blur(4px)',
            }} />
            {/* Anamorphic streak */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: `${flareY * 100}%`,
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, rgba(${r},${g},${b},${0.15 * pulse}) 30%, rgba(255,255,255,${0.4 * pulse}) ${flareX * 100}%, rgba(${r},${g},${b},${0.15 * pulse}) 70%, transparent 100%)`,
              filter: 'blur(1px)',
            }} />
          </>
        )
      })()}

      {/* ── DUOTONE ── */}
      {has('duotone') && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(${r},${g},${b},0.22)`,
            mixBlendMode: 'color',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.15)',
            mixBlendMode: 'multiply',
          }} />
        </>
      )}

      {/* ── COLD GRADE ── */}
      {has('cold') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(20,60,120,0.2)',
          mixBlendMode: 'color',
        }} />
      )}

      {/* ── WARM GRADE ── */}
      {has('warm') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(180,90,10,0.18)',
          mixBlendMode: 'color',
        }} />
      )}

      {/* ── NOIR ── */}
      {has('noir') && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.1)',
            mixBlendMode: 'saturation',
            filter: 'saturate(0)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0)',
            filter: 'saturate(0) contrast(1.3)',
          }} />
          {/* High contrast overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.25)',
            mixBlendMode: 'multiply',
          }} />
        </>
      )}

      {/* ── SLOW ZOOM (Ken Burns) ── */}
      {/* Applied via CSS transform on parent — handled in wrapper */}

    </div>
  )
}

/* ── Wrapper that applies motion effects (scale/translate) ── */
export function EffectsWrapper({
  effects,
  accentColor,
  children,
}: {
  effects: string[]
  accentColor: string
  children: React.ReactNode
}) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const t = frame / fps
  const progress = frame / durationInFrames

  const has = (id: string) => effects.includes(id)

  let transform = ''

  // Slow zoom — Ken Burns push-in over full duration
  if (has('slow_zoom')) {
    const scale = interpolate(progress, [0, 1], [1, 1.08], { extrapolateRight: 'clamp' })
    transform += `scale(${scale}) `
  }

  // Zoom pulse — subtle scale on beat (every ~0.5s)
  if (has('zoom_pulse')) {
    const pulse = 1 + Math.abs(Math.sin(t * Math.PI * 2)) * 0.012
    transform += `scale(${pulse}) `
  }

  // Camera shake — micro jitter
  if (has('shake')) {
    const intensity = 3
    const sx = Math.sin(t * 47.3) * intensity * Math.abs(Math.sin(t * 2.1))
    const sy = Math.cos(t * 31.7) * intensity * Math.abs(Math.sin(t * 1.8))
    transform += `translate(${sx}px, ${sy}px) `
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      transform: transform || undefined,
      transformOrigin: 'center center',
      willChange: transform ? 'transform' : undefined,
    }}>
      {children}
    </div>
  )
}
