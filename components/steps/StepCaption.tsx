'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import type { Caption, CaptionPosition, CaptionAnimation, CaptionStylePreset } from '@/lib/store'

// ─── Google Fonts URL for all 26 premium/free fonts ────────────────────────
const GFONTS_URL =
  'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Unbounded:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Bodoni+Moda:ital,wght@0,400;0,700;0,900;1,400&family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=Syne:wght@400;700;800&family=Bebas+Neue&family=Cinzel:wght@400;700;900&family=Orbitron:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Grotesk:wght@400;600;700&family=Montserrat:wght@400;700;800;900&family=Satisfy&family=Josefin+Sans:wght@400;700&family=Ubuntu:wght@400;700&family=Rajdhani:wght@400;600;700&family=Pacifico&family=Lobster&family=Permanent+Marker&family=Anton&family=Abril+Fatface&family=Righteous&family=Comfortaa:wght@400;700&family=Russo+One&family=Dancing+Script:wght@400;700&display=swap'

// ─── Font Catalog (26 fonts — all free Google Fonts) ────────────────────────
const CAPTION_FONTS = [
  // ✦ Premium 6 (replacing requested custom fonts — all Google Fonts)
  { id: 'bigshoulders',  name: 'Big Shoulders',      family: '"Big Shoulders Display", display',  cat: 'Impact',   tag: '🏆', desc: 'Ultra-cinematic condensed' },
  { id: 'unbounded',     name: 'Unbounded',           family: '"Unbounded", sans-serif',            cat: 'Futuristic', tag: '🚀', desc: 'Bold geometric tech' },
  { id: 'cormorant',     name: 'Cormorant Garamond',  family: '"Cormorant Garamond", serif',        cat: 'Luxury',   tag: '💎', desc: 'Louis Vuitton vibes' },
  { id: 'bodoni',        name: 'Bodoni Moda',         family: '"Bodoni Moda", serif',               cat: 'Fashion',  tag: '✨', desc: 'Italian Vogue style' },
  { id: 'fraunces',      name: 'Fraunces',            family: '"Fraunces", serif',                  cat: 'Premium',  tag: '🎭', desc: 'Sophisticated variable' },
  { id: 'syne',          name: 'Syne',                family: '"Syne", sans-serif',                 cat: 'Avant',    tag: '🎨', desc: 'Avant-garde modern' },
  // ─ Standard 20
  { id: 'bebas',         name: 'Bebas Neue',          family: '"Bebas Neue", cursive',              cat: 'Display',  tag: '', desc: 'Bold condensed' },
  { id: 'cinzel',        name: 'Cinzel',              family: '"Cinzel", serif',                    cat: 'Luxury',   tag: '', desc: 'Ancient Roman' },
  { id: 'orbitron',      name: 'Orbitron',            family: '"Orbitron", sans-serif',             cat: 'Sci-Fi',   tag: '', desc: 'Space & tech' },
  { id: 'playfair',      name: 'Playfair Display',    family: '"Playfair Display", serif',          cat: 'Editorial',tag: '', desc: 'Newspaper elegant' },
  { id: 'spacegrotesk',  name: 'Space Grotesk',       family: '"Space Grotesk", sans-serif',        cat: 'Tech',     tag: '', desc: 'Modern tech' },
  { id: 'montserrat',    name: 'Montserrat',          family: '"Montserrat", sans-serif',           cat: 'Bold',     tag: '', desc: 'Clean bold sans' },
  { id: 'satisfy',       name: 'Satisfy',             family: '"Satisfy", cursive',                 cat: 'Script',   tag: '', desc: 'Flowing script' },
  { id: 'josefin',       name: 'Josefin Sans',        family: '"Josefin Sans", sans-serif',         cat: 'Minimal',  tag: '', desc: 'Geometric minimal' },
  { id: 'ubuntu',        name: 'Ubuntu',              family: '"Ubuntu", sans-serif',               cat: 'Clean',    tag: '', desc: 'Humanist sans' },
  { id: 'rajdhani',      name: 'Rajdhani',            family: '"Rajdhani", sans-serif',             cat: 'Hindi',    tag: '', desc: 'Hindi-friendly' },
  { id: 'pacifico',      name: 'Pacifico',            family: '"Pacifico", cursive',                cat: 'Retro',    tag: '', desc: 'Surf retro' },
  { id: 'lobster',       name: 'Lobster',             family: '"Lobster", cursive',                 cat: 'Display',  tag: '', desc: 'Bold script' },
  { id: 'permanentmarker',name:'Permanent Marker',    family: '"Permanent Marker", cursive',        cat: 'Hand',     tag: '', desc: 'Marker pen' },
  { id: 'anton',         name: 'Anton',               family: '"Anton", sans-serif',                cat: 'Impact',   tag: '', desc: 'Newspaper headline' },
  { id: 'abril',         name: 'Abril Fatface',       family: '"Abril Fatface", cursive',           cat: 'Magazine', tag: '', desc: 'Heavy magazine' },
  { id: 'righteous',     name: 'Righteous',           family: '"Righteous", cursive',               cat: 'Funky',    tag: '', desc: '70s groovy' },
  { id: 'comfortaa',     name: 'Comfortaa',           family: '"Comfortaa", cursive',               cat: 'Round',    tag: '', desc: 'Soft rounded' },
  { id: 'russo',         name: 'Russo One',           family: '"Russo One", sans-serif',            cat: 'Military', tag: '', desc: 'Bold military' },
  { id: 'dancing',       name: 'Dancing Script',      family: '"Dancing Script", cursive',          cat: 'Script',   tag: '', desc: 'Elegant flow' },
  { id: 'inter',         name: 'Inter',               family: '"Inter", sans-serif',                cat: 'Sans',     tag: '', desc: 'Modern clean' },
]

// ─── Style Presets ──────────────────────────────────────────────────────────
type StylePreset = {
  id: CaptionStylePreset
  name: string
  desc: string
  icon: string
  sampleBg: string
  sampleText: string
  apply: () => Partial<Caption>
}
const STYLE_PRESETS: StylePreset[] = [
  { id: 'minimal',   name: 'Minimal',    desc: 'Clean white', icon: '⬜', sampleBg: 'transparent', sampleText: '#ffffff',
    apply: () => ({ color:'#ffffff', useGradient:false, glow:false, outline:false, shadow:false, backgroundColor:'', backgroundOpacity:0, bold:false, italic:false, uppercase:false }) },
  { id: 'cinema',    name: 'Cinematic',  desc: 'Film subtitle', icon: '🎬', sampleBg: 'rgba(0,0,0,0.6)', sampleText: '#ffffff',
    apply: () => ({ color:'#ffffff', useGradient:false, glow:false, outline:false, shadow:true, backgroundColor:'#000000', backgroundOpacity:0.6, bold:false, italic:false, uppercase:false }) },
  { id: 'neon',      name: 'Neon Glow',  desc: 'Electric glow', icon: '💫', sampleBg: 'transparent', sampleText: '#00fff5',
    apply: () => ({ color:'#00fff5', useGradient:false, glow:true, glowColor:'#00fff5', glowIntensity:18, outline:false, shadow:false, backgroundColor:'', backgroundOpacity:0, bold:true, italic:false, uppercase:false }) },
  { id: 'brutalist',  name: 'Brutalist', desc: 'Black & yellow', icon: '🖤', sampleBg: '#fbff12', sampleText: '#000000',
    apply: () => ({ color:'#000000', useGradient:false, glow:false, outline:false, shadow:false, backgroundColor:'#fbff12', backgroundOpacity:1, bold:true, italic:false, uppercase:true, letterSpacing: 0.04 }) },
  { id: 'gradient',  name: 'Gradient',   desc: 'Purple→Pink', icon: '🌈', sampleBg: 'transparent', sampleText: 'gradient',
    apply: () => ({ useGradient:true, gradientFrom:'#a855f7', gradientTo:'#ec4899', glow:false, outline:false, shadow:true, backgroundColor:'', backgroundOpacity:0, bold:true, italic:false, uppercase:false }) },
  { id: 'vintage',   name: 'Vintage',    desc: 'Sepia & warm', icon: '📷', sampleBg: 'transparent', sampleText: '#d4a853',
    apply: () => ({ color:'#d4a853', useGradient:false, glow:false, outline:true, outlineColor:'#8b6914', outlineWidth:1, shadow:true, backgroundColor:'', backgroundOpacity:0, bold:false, italic:false, uppercase:false }) },
  { id: 'hiphop',    name: 'Hip-Hop',    desc: 'Street bold', icon: '🔥', sampleBg: 'transparent', sampleText: '#ff2056',
    apply: () => ({ color:'#ff2056', useGradient:false, glow:false, outline:true, outlineColor:'#000000', outlineWidth:3, shadow:true, backgroundColor:'', backgroundOpacity:0, bold:true, italic:false, uppercase:true, letterSpacing:0.05 }) },
  { id: 'lyric',     name: 'Lyric Card', desc: 'Italic poetic', icon: '🎵', sampleBg: 'transparent', sampleText: '#f0f0f0',
    apply: () => ({ color:'#f0f0f0', useGradient:false, glow:false, outline:false, shadow:false, backgroundColor:'', backgroundOpacity:0, bold:false, italic:true, uppercase:false }) },
  { id: 'studio',    name: 'Studio',     desc: 'Broadcast bar', icon: '📺', sampleBg: '#a855f7', sampleText: '#ffffff',
    apply: () => ({ color:'#ffffff', useGradient:false, glow:false, outline:false, shadow:false, backgroundColor:'#a855f7', backgroundOpacity:0.92, bold:true, italic:false, uppercase:false }) },
  { id: 'glitch',    name: 'Glitch',     desc: 'RGB offset', icon: '👾', sampleBg: 'transparent', sampleText: '#ff2056',
    apply: () => ({ color:'#ff2056', useGradient:false, glow:true, glowColor:'#00fff5', glowIntensity:10, outline:false, shadow:true, backgroundColor:'', backgroundOpacity:0, bold:true, italic:false, uppercase:false }) },
]

// ─── Animations ─────────────────────────────────────────────────────────────
const ANIMATIONS: { id: CaptionAnimation; name: string; icon: string }[] = [
  { id: 'none',       name: 'Instant',    icon: '⚡' },
  { id: 'fade',       name: 'Fade',       icon: '🌫' },
  { id: 'slideUp',    name: 'Slide Up',   icon: '⬆️' },
  { id: 'slideDown',  name: 'Slide Down', icon: '⬇️' },
  { id: 'slideLeft',  name: 'From Right', icon: '◀️' },
  { id: 'slideRight', name: 'From Left',  icon: '▶️' },
  { id: 'zoom',       name: 'Zoom In',    icon: '🔍' },
  { id: 'typewriter', name: 'Typewriter', icon: '⌨️' },
  { id: 'bounce',     name: 'Bounce',     icon: '🏀' },
]

// ─── Positions ──────────────────────────────────────────────────────────────
const POSITIONS: { id: CaptionPosition; icon: string }[] = [
  { id: 'top-left',      icon: '↖' }, { id: 'top-center',    icon: '↑' }, { id: 'top-right',     icon: '↗' },
  { id: 'middle-left',   icon: '←' }, { id: 'center',        icon: '◉' }, { id: 'middle-right',  icon: '→' },
  { id: 'bottom-left',   icon: '↙' }, { id: 'bottom-center', icon: '↓' }, { id: 'bottom-right',  icon: '↘' },
]

// ─── Color Presets ──────────────────────────────────────────────────────────
const COLOR_PRESETS = ['#ffffff','#000000','#ff2056','#fbff12','#4361ee','#06d6a0','#a855f7','#ec4899','#f97316','#10b981','#d4a853','#00fff5']
const GRADIENT_PRESETS = [
  { from: '#a855f7', to: '#ec4899' },
  { from: '#4361ee', to: '#06d6a0' },
  { from: '#ff2056', to: '#fbff12' },
  { from: '#000000', to: '#a855f7' },
  { from: '#ffffff', to: '#d4a853' },
  { from: '#00fff5', to: '#4361ee' },
]

// ─── Default Caption Factory ────────────────────────────────────────────────
function createCaption(startTime = 0, endTime = 5): Caption {
  return {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `cap_${Date.now()}`,
    text: 'Your caption here',
    startTime,
    endTime,
    font: 'bigshoulders',
    fontFamily: '"Big Shoulders Display", display',
    stylePreset: 'minimal',
    color: '#ffffff',
    gradientFrom: '#a855f7',
    gradientTo: '#ec4899',
    useGradient: false,
    position: 'bottom-center',
    fontSize: 48,
    animation: 'fade',
    bold: true,
    italic: false,
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 2,
    glow: false,
    glowColor: '#00fff5',
    glowIntensity: 15,
    shadow: true,
    textAlign: 'center',
    backgroundColor: '',
    backgroundOpacity: 0.7,
    letterSpacing: 0,
    uppercase: false,
  }
}

// ─── CSS Helper ─────────────────────────────────────────────────────────────
function captionToCSS(cap: Caption): React.CSSProperties {
  const fontEntry = CAPTION_FONTS.find(f => f.id === cap.font)
  const shadows: string[] = []
  if (cap.glow) {
    shadows.push(
      `0 0 ${cap.glowIntensity}px ${cap.glowColor}`,
      `0 0 ${cap.glowIntensity * 2}px ${cap.glowColor}66`,
    )
  }
  if (cap.shadow) shadows.push('2px 4px 14px rgba(0,0,0,0.85)')

  const base: React.CSSProperties = {
    fontFamily: fontEntry?.family ?? cap.fontFamily ?? 'Inter, sans-serif',
    fontSize: cap.fontSize,
    fontWeight: cap.bold ? 700 : 400,
    fontStyle: cap.italic ? 'italic' : 'normal',
    textAlign: cap.textAlign,
    letterSpacing: `${cap.letterSpacing}em`,
    textTransform: cap.uppercase ? 'uppercase' : 'none',
    maxWidth: '88%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    padding: '4px 14px',
    borderRadius: 4,
    lineHeight: 1.2,
    userSelect: 'none',
  }

  if (cap.outline) base.WebkitTextStroke = `${cap.outlineWidth}px ${cap.outlineColor}`
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

function positionToCSS(pos: CaptionPosition): React.CSSProperties {
  const map: Record<CaptionPosition, React.CSSProperties> = {
    'top-left':      { top: '8%', left: '4%' },
    'top-center':    { top: '8%', left: '50%', transform: 'translateX(-50%)' },
    'top-right':     { top: '8%', right: '4%', textAlign: 'right' },
    'middle-left':   { top: '50%', left: '4%', transform: 'translateY(-50%)' },
    'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    'middle-right':  { top: '50%', right: '4%', transform: 'translateY(-50%)', textAlign: 'right' },
    'bottom-left':   { bottom: '10%', left: '4%' },
    'bottom-center': { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right':  { bottom: '10%', right: '4%', textAlign: 'right' },
  }
  return map[pos] ?? map['bottom-center']
}

// ─── Section Label ───────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] text-white/30 uppercase tracking-[0.14em] font-bold mb-2 mt-5 first:mt-0">
      {label}
    </p>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StepCaption() {
  const store = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'font' | 'style' | 'pos' | 'color' | 'anim' | 'fx'>('font')
  const prevCaptions = useRef<Caption[]>([])

  // Load all Google Fonts on mount
  useEffect(() => {
    if (document.getElementById('caption-gfonts')) return
    const link = document.createElement('link')
    link.id = 'caption-gfonts'
    link.rel = 'stylesheet'
    link.href = GFONTS_URL
    document.head.appendChild(link)
  }, [])

  const captions = store.captions
  const selected = captions.find(c => c.id === selectedId) ?? null

  const addCaption = () => {
    const lastEnd = captions.length > 0 ? captions[captions.length - 1].endTime : 0
    const nc = createCaption(lastEnd, lastEnd + 5)
    store.addCaption(nc)
    setSelectedId(nc.id)
    setActiveTab('font')
  }

  const update = useCallback((updates: Partial<Caption>) => {
    if (!selectedId) return
    store.updateCaption(selectedId, updates)
  }, [selectedId, store])

  const applyPreset = (preset: StylePreset) => {
    if (!selected) return
    update({ stylePreset: preset.id, ...preset.apply() })
  }

  const selectFont = (fontId: string) => {
    const f = CAPTION_FONTS.find(f => f.id === fontId)
    if (!f) return
    update({ font: f.id, fontFamily: f.family })
  }

  // ─── Preview ───────────────────────────────────────────────────────────────
  const Preview = () => (
    <div className="relative w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/8"
      style={{ aspectRatio: '16/9' }}>
      {/* Video bg simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      {store.artworkUrl && (
        <img src={store.artworkUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
      )}
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Render all captions */}
      {captions.map(cap => (
        <div
          key={cap.id}
          onClick={() => { setSelectedId(cap.id); setActiveTab('font') }}
          className={`absolute cursor-pointer transition-all duration-150 ${cap.id === selectedId ? 'ring-2 ring-purple-500 ring-offset-1 ring-offset-transparent rounded' : ''}`}
          style={{ ...positionToCSS(cap.position), ...captionToCSS(cap) }}
        >
          {cap.text || 'Caption'}
        </div>
      ))}

      {captions.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="text-4xl">✍️</div>
          <p className="text-white/40 text-sm font-medium">Click "Add Caption" to start</p>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-white/40 font-mono">PREVIEW</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✍️</span>
            <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Caption Studio</span>
            <span className="text-[10px] text-white/20 font-semibold">26 Premium Fonts</span>
          </div>
          <p className="text-white/40 text-xs">Add styled text overlays with animations · Click any caption in the preview to select</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={addCaption}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold transition-all duration-200 shadow-[0_0_16px_rgba(168,85,247,0.3)] hover:shadow-[0_0_24px_rgba(168,85,247,0.5)]"
          >
            <span className="text-base">+</span> Add Caption
          </button>
          <button
            onClick={() => store.setCurrentStep(4)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-sm font-semibold hover:bg-white/10 transition-all"
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">

        {/* LEFT: Caption list + Editor */}
        <div className="space-y-4">

          {/* Caption Timeline */}
          {captions.length > 0 && (
            <div className="rounded-xl bg-zinc-900/40 border border-white/8 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Captions ({captions.length})</p>
              </div>
              <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                {captions.map((cap, i) => (
                  <div
                    key={cap.id}
                    onClick={() => { setSelectedId(cap.id); setActiveTab('font') }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all group ${cap.id === selectedId ? 'bg-purple-500/10 border-l-2 border-purple-500' : 'hover:bg-white/4 border-l-2 border-transparent'}`}
                  >
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black bg-white/5 text-white/50 flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate font-medium ${cap.id === selectedId ? 'text-white' : 'text-zinc-300'}`}
                        style={{ fontFamily: CAPTION_FONTS.find(f => f.id === cap.font)?.family }}>
                        {cap.text || '(empty)'}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{cap.startTime}s – {cap.endTime}s · {CAPTION_FONTS.find(f => f.id === cap.font)?.name}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); store.removeCaption(cap.id); if (selectedId === cap.id) setSelectedId(null) }}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all flex-shrink-0 text-sm"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor Panel */}
          {selected ? (
            <div className="rounded-xl bg-zinc-900/40 border border-white/8 overflow-hidden">

              {/* Text & Timing */}
              <div className="p-4 border-b border-white/6 space-y-3">
                <div>
                  <SectionLabel label="Caption Text" />
                  <textarea
                    value={selected.text}
                    onChange={e => update({ text: e.target.value })}
                    rows={2}
                    placeholder="Type your caption..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm resize-none outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: 'Start (sec)', key: 'startTime' as const }, { label: 'End (sec)', key: 'endTime' as const }].map(f => (
                    <div key={f.key}>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1.5">{f.label}</p>
                      <input
                        type="number" min={0} step={0.5}
                        value={selected[f.key]}
                        onChange={e => update({ [f.key]: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500/60 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor Tabs */}
              <div className="flex border-b border-white/6 overflow-x-auto">
                {([
                  { id: 'font',  label: 'Font' },
                  { id: 'style', label: 'Style' },
                  { id: 'pos',   label: 'Position' },
                  { id: 'color', label: 'Color' },
                  { id: 'anim',  label: 'Animation' },
                  { id: 'fx',    label: 'Effects' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border-b-2 ${activeTab === tab.id ? 'border-purple-500 text-purple-400 bg-purple-500/8' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* FONT TAB */}
                {activeTab === 'font' && (
                  <div>
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {CAPTION_FONTS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => selectFont(f.id)}
                          className={`relative text-left p-3 rounded-xl border transition-all group ${selected.font === f.id ? 'border-purple-500 bg-purple-500/12 shadow-[0_0_14px_rgba(168,85,247,0.2)]' : 'border-white/6 bg-black/20 hover:border-white/15 hover:bg-black/30'}`}
                        >
                          {f.tag && (
                            <span className="absolute -top-1.5 -right-1.5 text-[11px] bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full w-4 h-4 flex items-center justify-center shadow-md">{f.tag}</span>
                          )}
                          <div className="text-sm font-bold truncate" style={{ fontFamily: f.family, color: selected.font === f.id ? '#e4e4e7' : '#a1a1aa' }}>
                            {f.name}
                          </div>
                          <div style={{ fontFamily: f.family, fontSize: 22, lineHeight: 1.1, color: selected.font === f.id ? '#fff' : '#71717a', marginTop: 2 }}>
                            Aa
                          </div>
                          <div className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider">{f.cat} · {f.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Size */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Size</p>
                        <span className="text-xs text-purple-400 font-mono font-bold">{selected.fontSize}px</span>
                      </div>
                      <input type="range" min={16} max={120} value={selected.fontSize}
                        onChange={e => update({ fontSize: parseInt(e.target.value) })}
                        className="w-full accent-purple-500" />
                    </div>

                    {/* Text toggles */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {[
                        { label: 'Bold', key: 'bold' as const },
                        { label: 'Italic', key: 'italic' as const },
                        { label: 'UPPER', key: 'uppercase' as const },
                      ].map(t => (
                        <button key={t.key} onClick={() => update({ [t.key]: !selected[t.key] })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selected[t.key] ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/20 border-white/8 text-zinc-500 hover:text-zinc-300'}`}>
                          {t.label}
                        </button>
                      ))}
                      {/* Align */}
                      {(['left','center','right'] as const).map(a => (
                        <button key={a} onClick={() => update({ textAlign: a })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selected.textAlign === a ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/20 border-white/8 text-zinc-500 hover:text-zinc-300'}`}>
                          {a === 'left' ? '⬅' : a === 'center' ? '≡' : '➡'}
                        </button>
                      ))}
                    </div>

                    {/* Letter spacing */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Letter Spacing</p>
                        <span className="text-xs text-purple-400 font-mono">{selected.letterSpacing.toFixed(2)}em</span>
                      </div>
                      <input type="range" min={-0.05} max={0.4} step={0.01} value={selected.letterSpacing}
                        onChange={e => update({ letterSpacing: parseFloat(e.target.value) })}
                        className="w-full accent-purple-500" />
                    </div>
                  </div>
                )}

                {/* STYLE PRESET TAB */}
                {activeTab === 'style' && (
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_PRESETS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={`relative p-3 rounded-xl border transition-all text-left ${selected.stylePreset === p.id ? 'border-purple-500 bg-purple-500/12' : 'border-white/6 bg-black/20 hover:border-white/15'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{p.icon}</span>
                          <span className={`text-xs font-bold ${selected.stylePreset === p.id ? 'text-white' : 'text-zinc-300'}`}>{p.name}</span>
                        </div>
                        {/* Mini visual preview */}
                        <div className="h-7 rounded flex items-center justify-center overflow-hidden"
                          style={{ background: p.sampleBg || 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="text-sm font-bold px-2"
                            style={{
                              color: p.sampleText === 'gradient' ? undefined : p.sampleText,
                              background: p.sampleText === 'gradient' ? 'linear-gradient(to right,#a855f7,#ec4899)' : undefined,
                              WebkitBackgroundClip: p.sampleText === 'gradient' ? 'text' : undefined,
                              WebkitTextFillColor: p.sampleText === 'gradient' ? 'transparent' : undefined,
                              fontFamily: CAPTION_FONTS.find(f => f.id === selected.font)?.family,
                            }}
                          >Sample</span>
                        </div>
                        <p className="text-[9px] text-zinc-600 mt-1">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* POSITION TAB */}
                {activeTab === 'pos' && (
                  <div className="max-w-xs mx-auto">
                    <div className="grid grid-cols-3 gap-2 aspect-video rounded-xl overflow-hidden border border-white/8 bg-zinc-950/50 p-3">
                      {POSITIONS.map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => update({ position: pos.id })}
                          className={`rounded-lg text-lg font-bold flex items-center justify-center transition-all duration-150 ${selected.position === pos.id ? 'bg-purple-500/30 border border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]' : 'bg-white/4 border border-white/6 text-zinc-600 hover:bg-white/8 hover:text-zinc-300'}`}
                        >
                          {pos.icon}
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-zinc-600 mt-3">Selected: <span className="text-purple-400 font-semibold">{selected.position}</span></p>
                  </div>
                )}

                {/* COLOR TAB */}
                {activeTab === 'color' && (
                  <div className="space-y-4">
                    {/* Gradient toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/6">
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">Gradient Text</p>
                        <p className="text-[10px] text-zinc-500">Apply gradient fill to text</p>
                      </div>
                      <button onClick={() => update({ useGradient: !selected.useGradient })}
                        className={`w-11 h-6 rounded-full transition-all duration-200 relative ${selected.useGradient ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${selected.useGradient ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {!selected.useGradient ? (
                      <>
                        <div>
                          <SectionLabel label="Solid Color" />
                          <div className="grid grid-cols-6 gap-2">
                            {COLOR_PRESETS.map(c => (
                              <button key={c} onClick={() => update({ color: c })}
                                className={`w-full aspect-square rounded-lg transition-all ${selected.color === c ? 'ring-2 ring-offset-1 ring-offset-zinc-900 ring-purple-400 scale-110' : 'hover:scale-105'}`}
                                style={{ background: c === '#ffffff' ? '#fff' : c === '#000000' ? '#222' : c, border: '1px solid rgba(255,255,255,0.1)' }} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input type="color" value={selected.color} onChange={e => update({ color: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0.5" />
                            <input type="text" value={selected.color} onChange={e => e.target.value.match(/^#[0-9a-fA-F]{6}$/) && update({ color: e.target.value })}
                              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono outline-none focus:border-purple-500/60 transition-all" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <SectionLabel label="Gradient Presets" />
                          <div className="grid grid-cols-3 gap-2">
                            {GRADIENT_PRESETS.map((g, i) => (
                              <button key={i} onClick={() => update({ gradientFrom: g.from, gradientTo: g.to })}
                                className={`h-8 rounded-lg transition-all hover:scale-105 ${selected.gradientFrom === g.from && selected.gradientTo === g.to ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-zinc-900' : ''}`}
                                style={{ background: `linear-gradient(to right, ${g.from}, ${g.to})` }} />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[{ label: 'From', key: 'gradientFrom' as const }, { label: 'To', key: 'gradientTo' as const }].map(f => (
                            <div key={f.key}>
                              <SectionLabel label={f.label} />
                              <div className="flex gap-2">
                                <input type="color" value={selected[f.key]} onChange={e => update({ [f.key]: e.target.value })}
                                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0 p-0.5 flex-shrink-0" />
                                <input type="text" value={selected[f.key]}
                                  onChange={e => e.target.value.match(/^#[0-9a-fA-F]{6}$/) && update({ [f.key]: e.target.value })}
                                  className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-white text-xs font-mono outline-none" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Background */}
                    <div className="border-t border-white/6 pt-3">
                      <SectionLabel label="Background" />
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {['', '#000000', '#1a1a2e', '#a855f7', '#312e81', '#4a1942'].map(bg => (
                          <button key={bg || 'none'} onClick={() => update({ backgroundColor: bg })}
                            className={`h-7 rounded-lg text-[10px] font-bold transition-all ${selected.backgroundColor === bg ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-zinc-900' : 'hover:scale-105'}`}
                            style={{ background: bg || 'repeating-conic-gradient(#333 0%25%,#444 0%50%) 0 0/12px 12px', border: bg ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)' }}>
                            {!bg && <span className="text-zinc-500">None</span>}
                          </button>
                        ))}
                      </div>
                      {selected.backgroundColor && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Opacity</p>
                            <span className="text-xs text-purple-400 font-mono">{Math.round(selected.backgroundOpacity * 100)}%</span>
                          </div>
                          <input type="range" min={0} max={1} step={0.05} value={selected.backgroundOpacity}
                            onChange={e => update({ backgroundOpacity: parseFloat(e.target.value) })}
                            className="w-full accent-purple-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ANIMATION TAB */}
                {activeTab === 'anim' && (
                  <div className="grid grid-cols-3 gap-2">
                    {ANIMATIONS.map(a => (
                      <button key={a.id} onClick={() => update({ animation: a.id })}
                        className={`p-3 rounded-xl border text-center transition-all ${selected.animation === a.id ? 'border-purple-500 bg-purple-500/12' : 'border-white/6 bg-black/20 hover:border-white/15'}`}>
                        <div className="text-2xl mb-1">{a.icon}</div>
                        <div className={`text-xs font-bold ${selected.animation === a.id ? 'text-white' : 'text-zinc-400'}`}>{a.name}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* EFFECTS (Outline / Glow / Shadow) */}
                {activeTab === 'fx' && (
                  <div className="space-y-4">
                    {/* Outline */}
                    <div className="p-3 rounded-xl bg-black/20 border border-white/6 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">Text Outline</p>
                          <p className="text-[10px] text-zinc-500">Stroke around letters</p>
                        </div>
                        <button onClick={() => update({ outline: !selected.outline })}
                          className={`w-11 h-6 rounded-full transition-all relative ${selected.outline ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${selected.outline ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {selected.outline && (
                        <div className="flex gap-3 pt-1">
                          <div className="flex gap-2 items-center">
                            <input type="color" value={selected.outlineColor} onChange={e => update({ outlineColor: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0.5" />
                            <span className="text-xs text-zinc-500">Color</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-zinc-500">Width</span>
                              <span className="text-xs text-purple-400 font-mono">{selected.outlineWidth}px</span>
                            </div>
                            <input type="range" min={1} max={8} value={selected.outlineWidth}
                              onChange={e => update({ outlineWidth: parseInt(e.target.value) })}
                              className="w-full accent-purple-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Glow */}
                    <div className="p-3 rounded-xl bg-black/20 border border-white/6 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">Neon Glow</p>
                          <p className="text-[10px] text-zinc-500">Luminous light halo</p>
                        </div>
                        <button onClick={() => update({ glow: !selected.glow })}
                          className={`w-11 h-6 rounded-full transition-all relative ${selected.glow ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${selected.glow ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {selected.glow && (
                        <div className="flex gap-3 pt-1">
                          <div className="flex gap-2 items-center">
                            <input type="color" value={selected.glowColor} onChange={e => update({ glowColor: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0.5" />
                            <span className="text-xs text-zinc-500">Color</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-zinc-500">Intensity</span>
                              <span className="text-xs text-purple-400 font-mono">{selected.glowIntensity}px</span>
                            </div>
                            <input type="range" min={5} max={40} value={selected.glowIntensity}
                              onChange={e => update({ glowIntensity: parseInt(e.target.value) })}
                              className="w-full accent-purple-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shadow */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/6">
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">Drop Shadow</p>
                        <p className="text-[10px] text-zinc-500">Depth shadow for readability</p>
                      </div>
                      <button onClick={() => update({ shadow: !selected.shadow })}
                        className={`w-11 h-6 rounded-full transition-all relative ${selected.shadow ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${selected.shadow ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-zinc-900/40 border border-dashed border-white/10 p-8 text-center">
              {captions.length === 0 ? (
                <>
                  <div className="text-5xl mb-3">✍️</div>
                  <p className="text-zinc-300 font-semibold mb-1.5">No Captions Yet</p>
                  <p className="text-zinc-600 text-sm mb-4">Add text overlays with custom fonts, styles, colors & animations</p>
                  <button onClick={addCaption}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    + Add First Caption
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">👆</div>
                  <p className="text-zinc-400 text-sm">Click a caption in the list or preview to edit it</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview */}
        <div className="lg:sticky lg:top-20 h-fit space-y-3">
          <Preview />

          {captions.length > 0 && (
            <div className="flex flex-col gap-2 text-xs text-zinc-600 bg-zinc-900/30 border border-white/5 rounded-xl p-3">
              <p className="font-semibold text-zinc-500">💡 Tips</p>
              <p>· Click any caption in preview to select it</p>
              <p>· Drag handle not available in preview — use Position tab</p>
              <p>· Captions render on top of your visualizer template</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-end pt-2 border-t border-white/6">
        <button onClick={() => store.setCurrentStep(2)}
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-semibold hover:bg-white/10 transition-all">
          ← Back to Lyrics
        </button>
        <button onClick={() => store.setCurrentStep(4)}
          className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold transition-all shadow-[0_0_18px_rgba(168,85,247,0.35)] hover:shadow-[0_0_28px_rgba(168,85,247,0.55)]">
          Continue to Style →
        </button>
      </div>
    </div>
  )
}
