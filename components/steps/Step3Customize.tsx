'use client'
import { useStore } from '@/lib/store'
import PreviewPlayer from '@/components/visualizer/PreviewPlayer'
import Link from 'next/link'
import { EFFECTS } from '@/remotion/effects/EffectsLayer'

const typoOptions: { id: 'minimal' | 'bold' | 'neon'; label: string; desc: string }[] = [
  { id: 'minimal', label: 'Minimal', desc: 'Light, clean' },
  { id: 'bold',    label: 'Bold',    desc: 'Heavy, punchy' },
  { id: 'neon',    label: 'Neon',    desc: 'Glowing accent' },
]

const ACCENT_PRESETS = ['#a855f7', '#ec4899', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ffffff']

const THEME_PRESETS: { id: 'white' | 'gold' | 'blue' | 'purple'; label: string; color: string }[] = [
  { id: 'white',  label: 'White',  color: '#ffffff' },
  { id: 'gold',   label: 'Gold',   color: '#c9a84c' },
  { id: 'blue',   label: 'Blue',   color: '#60a5fa' },
  { id: 'purple', label: 'Purple', color: '#a855f7' },
]

const FONT_PRESETS: { id: 'minimal' | 'serif' | 'mono'; label: string; preview: string }[] = [
  { id: 'minimal', label: 'Modern',  preview: 'Aa' },
  { id: 'serif',   label: 'Serif',   preview: 'Aa' },
  { id: 'mono',    label: 'Mono',    preview: 'Aa' },
]

/* Which templates have text placeholders */
const TEMPLATE_META: Record<string, {
  name: string
  icon: string
  hasTypo: boolean
  hasAccent: boolean
  hasAppleFields: boolean
  textFields: { key: 'songTitle' | 'artist' | 'labelText'; label: string; placeholder: string }[]
}> = {
  circle:      { name: 'Circle Pulse',  icon: '⭕', hasTypo: true,  hasAccent: true,  hasAppleFields: false, textFields: [] },
  waveform:    { name: 'Waveform',      icon: '〰️', hasTypo: true,  hasAccent: true,  hasAppleFields: false, textFields: [] },
  particles:   { name: 'Particles',     icon: '✨', hasTypo: true,  hasAccent: true,  hasAppleFields: false, textFields: [] },
  vinyl:       { name: 'Vinyl Aurora',  icon: '💿', hasTypo: true,  hasAccent: true,  hasAppleFields: false, textFields: [] },
  glitch:      { name: 'Glitch RGB',    icon: '📺', hasTypo: true,  hasAccent: true,  hasAppleFields: false, textFields: [] },
  cassette:    { name: 'Cassette',      icon: '📼', hasTypo: true,  hasAccent: true,  hasAppleFields: false, textFields: [] },
  neonplayer:  { name: 'Neon Player',   icon: '🎛️', hasTypo: false, hasAccent: true,  hasAppleFields: false,
    textFields: [
      { key: 'songTitle', label: 'Artist Name', placeholder: 'e.g. Faithless' },
      { key: 'artist',    label: 'Track Name',  placeholder: 'e.g. Solomun Set' },
    ],
  },
  appleplayer: { name: 'Apple Player',  icon: '🍎', hasTypo: false, hasAccent: false, hasAppleFields: true,
    textFields: [
      { key: 'labelText', label: 'Label',       placeholder: 'e.g. Now Playing, AirPods Pro' },
      { key: 'songTitle', label: 'Song Title',  placeholder: 'e.g. The Greatest' },
      { key: 'artist',    label: 'Artist Name', placeholder: 'e.g. Sia' },
    ],
  },
  poster: { name: 'Music Poster', icon: '🎨', hasTypo: false, hasAccent: false, hasAppleFields: false,
    textFields: [
      { key: 'songTitle', label: 'Song Title',  placeholder: 'e.g. Tale of Us' },
      { key: 'artist',    label: 'Artist Name', placeholder: 'e.g. Faithless' },
      { key: 'labelText', label: 'Album Name',  placeholder: 'e.g. Love' },
    ],
  },
  dashboard: { name: 'Dashboard', icon: '📊', hasTypo: false, hasAccent: false, hasAppleFields: false,
    textFields: [
      { key: 'songTitle', label: 'Song Name',   placeholder: 'e.g. Song Name' },
      { key: 'artist',    label: 'Author Name', placeholder: 'e.g. Author Name' },
    ],
  },
  circular: { name: 'Circular Player', icon: '🔴', hasTypo: false, hasAccent: false, hasAppleFields: false,
    textFields: [
      { key: 'songTitle', label: 'Song Title',  placeholder: 'e.g. Hunny' },
      { key: 'artist',    label: 'Artist Name', placeholder: 'e.g. French Police' },
    ],
  },
}

export default function Step3Customize() {
  const store = useStore()
  const meta = TEMPLATE_META[store.template] ?? TEMPLATE_META.circle

  const getFieldValue = (key: 'songTitle' | 'artist' | 'labelText') => {
    if (key === 'songTitle') return store.songTitle
    if (key === 'artist')    return store.artist
    if (key === 'labelText') return store.labelText
    return ''
  }

  const setFieldValue = (key: 'songTitle' | 'artist' | 'labelText', val: string) => {
    if (key === 'songTitle') store.setMetadata(val, store.artist, store.duration)
    if (key === 'artist')    store.setMetadata(store.songTitle, val, store.duration)
    if (key === 'labelText') store.setLabelText(val)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ── LEFT PANEL ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Locked template badge */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4">Template</p>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-2xl shadow-inner">
                  {meta.icon}
                </div>
                <div>
                  <p className="text-zinc-100 font-semibold text-base">{meta.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Selected on home page</p>
                </div>
              </div>
              <Link
                href="/"
                className="text-xs text-purple-400 hover:text-white transition-all px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20"
              >
                Change
              </Link>
            </div>
          </div>

          {/* Text fields — only shown if template has them */}
          {meta.textFields.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 space-y-4 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold relative z-10">Text Content</p>
              <div className="space-y-3 relative z-10">
                {meta.textFields.map((field) => (
                  <div key={field.key} className="group">
                    <label className="text-xs text-zinc-400 mb-1.5 block group-focus-within:text-purple-400 transition-colors">{field.label}</label>
                    <input
                      type="text"
                      value={getFieldValue(field.key)}
                      onChange={(e) => setFieldValue(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={60}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all hover:border-white/20 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apple Player — theme + font */}
          {meta.hasAppleFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Theme Color</p>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {THEME_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => store.setThemeColor(t.id)}
                      className={`relative overflow-hidden py-3 rounded-xl text-xs font-medium transition-all duration-300 border ${
                        store.themeColor === t.id
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'border-white/5 bg-black/20 text-zinc-400 hover:bg-black/40 hover:border-white/10'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full mx-auto mb-2 shadow-inner" style={{ background: t.color }} />
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Font Style</p>
                <div className="flex flex-col gap-3 relative z-10">
                  {FONT_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => store.setFontStyle(f.id)}
                      className={`py-2 px-4 rounded-xl flex items-center justify-between transition-all duration-300 border ${
                        store.fontStyle === f.id
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'border-white/5 bg-black/20 text-zinc-400 hover:bg-black/40 hover:border-white/10'
                      }`}
                    >
                      <div className="text-base font-bold" style={{
                        fontFamily: f.id === 'serif' ? 'Georgia,serif' : f.id === 'mono' ? 'monospace' : 'sans-serif'
                      }}>{f.preview}</div>
                      <div className="text-xs opacity-70">{f.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Typography — for non-apple templates */}
          {meta.hasTypo && (
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Lyrics Typography</p>
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {typoOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => store.setTypoStyle(opt.id)}
                    className={`py-4 px-2 rounded-xl text-center transition-all duration-300 border ${
                      store.typoStyle === opt.id
                        ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'border-white/5 bg-black/20 text-zinc-400 hover:bg-black/40 hover:border-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500 leading-tight">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accent color — for non-apple templates */}
          {meta.hasAccent && (
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10">Accent Color</p>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-xl opacity-50 blur group-hover:opacity-100 transition-opacity" style={{ background: store.accentColor }} />
                  <input
                    type="color"
                    value={store.accentColor}
                    onChange={(e) => store.setAccentColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white/10 bg-transparent p-1 relative z-10 shadow-inner"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-100 font-mono text-[13px] uppercase tracking-wider">{store.accentColor}</span>
                  <span className="text-zinc-500 text-[11px]">Custom Hex</span>
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap relative z-10 bg-black/20 p-3 rounded-xl border border-white/5">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => store.setAccentColor(c)}
                    className={`w-8 h-8 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm ${
                      store.accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:ring-1 hover:ring-white/50 hover:ring-offset-1 hover:ring-offset-zinc-900'
                    }`}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Effects */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Visual Effects</p>
              {store.effects.length > 0 && (
                <button onClick={() => store.effects.forEach(e => store.toggleEffect(e))}
                  className="text-[11px] font-medium text-pink-400 hover:text-pink-300 transition-colors px-2 py-1 rounded bg-pink-500/10 hover:bg-pink-500/20">
                  Clear {store.effects.length} enabled
                </button>
              )}
            </div>
            
            {/* Category groups */}
            <div className="space-y-5 relative z-10">
              {(['film', 'light', 'motion', 'color'] as const).map(cat => {
                const effectsInCat = EFFECTS.filter(e => e.category === cat)
                if (effectsInCat.length === 0) return null
                
                return (
                  <div key={cat} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-white/5 flex-grow" />
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold shrink-0">
                        {cat === 'film' ? '🎞 Film' : cat === 'light' ? '✨ Light' : cat === 'motion' ? '🎬 Motion' : '🎨 Color'}
                      </p>
                      <div className="h-px bg-white/5 flex-grow" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {effectsInCat.map(effect => {
                        const active = store.effects.includes(effect.id)
                        return (
                          <button
                            key={effect.id}
                            onClick={() => store.toggleEffect(effect.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-300 border ${
                              active
                                ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                : 'border-white/5 bg-black/20 text-zinc-400 hover:bg-black/40 hover:border-white/10'
                            }`}
                          >
                            <span className="text-lg shrink-0 mt-0.5">{effect.icon}</span>
                            <div className="min-w-0 flex-grow">
                              <div className={`text-xs font-semibold truncate ${active ? 'text-white' : 'text-zinc-200'}`}>{effect.name}</div>
                              <div className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-snug">{effect.desc}</div>
                            </div>
                            {active && (
                              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── PREVIEW ── */}
        <div className="xl:col-span-3">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 sticky top-4 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-4 relative z-10 flex items-center justify-between">
              Live Preview
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20正常">Auto-syncing</span>
            </p>
            <div className="relative z-10 ring-1 ring-white/10 rounded-xl overflow-hidden shadow-2xl">
              <PreviewPlayer />
            </div>
            <p className="text-zinc-500 text-[11px] text-center mt-4 relative z-10 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Preview plays up to 60s · Final render uses full duration
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => store.setCurrentStep(4)}
        className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
      >
        Render Video
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  )
}
