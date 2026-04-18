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
        <div className="xl:col-span-2 space-y-4">

          {/* Locked template badge */}
          <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Template</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl">
                  {meta.icon}
                </div>
                <div>
                  <p className="text-zinc-100 font-semibold text-sm">{meta.name}</p>
                  <p className="text-zinc-600 text-xs">Selected on home page</p>
                </div>
              </div>
              <Link
                href="/"
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Change
              </Link>
            </div>
          </div>

          {/* Text fields — only shown if template has them */}
          {meta.textFields.length > 0 && (
            <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4 space-y-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Text Content</p>
              {meta.textFields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-zinc-400 mb-1.5 block">{field.label}</label>
                  <input
                    type="text"
                    value={getFieldValue(field.key)}
                    onChange={(e) => setFieldValue(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={60}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Apple Player — theme + font */}
          {meta.hasAppleFields && (
            <>
              <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Theme Color</p>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_PRESETS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => store.setThemeColor(t.id)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                        store.themeColor === t.id
                          ? 'border-purple-500/60 bg-purple-600/15 text-purple-300'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Font Style</p>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => store.setFontStyle(f.id)}
                      className={`py-2.5 rounded-xl text-center transition-all border ${
                        store.fontStyle === f.id
                          ? 'border-purple-500/60 bg-purple-600/15 text-purple-300'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-base font-bold" style={{
                        fontFamily: f.id === 'serif' ? 'Georgia,serif' : f.id === 'mono' ? 'monospace' : 'sans-serif'
                      }}>{f.preview}</div>
                      <div className="text-xs mt-0.5 opacity-70">{f.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Typography — for non-apple templates */}
          {meta.hasTypo && (
            <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Lyrics Typography</p>
              <div className="grid grid-cols-3 gap-2">
                {typoOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => store.setTypoStyle(opt.id)}
                    className={`py-2.5 px-2 rounded-xl text-center transition-all border ${
                      store.typoStyle === opt.id
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                        : 'bg-zinc-800 border-transparent text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accent color — for non-apple templates */}
          {meta.hasAccent && (
            <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Accent Color</p>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={store.accentColor}
                  onChange={(e) => store.setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-zinc-300 font-mono text-sm">{store.accentColor}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => store.setAccentColor(c)}
                    className={`w-7 h-7 rounded-lg transition-all ${
                      store.accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Effects */}
          <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Visual Effects</p>
              {store.effects.length > 0 && (
                <button onClick={() => store.effects.forEach(e => store.toggleEffect(e))}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  Clear all
                </button>
              )}
            </div>
            {/* Category groups */}
            {(['film', 'light', 'motion', 'color'] as const).map(cat => (
              <div key={cat} className="mb-3">
                <p className="text-[10px] text-zinc-700 uppercase tracking-widest mb-1.5 font-semibold">
                  {cat === 'film' ? '🎞 Film' : cat === 'light' ? '✨ Light' : cat === 'motion' ? '🎬 Motion' : '🎨 Color'}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {EFFECTS.filter(e => e.category === cat).map(effect => {
                    const active = store.effects.includes(effect.id)
                    return (
                      <button
                        key={effect.id}
                        onClick={() => store.toggleEffect(effect.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border ${
                          active
                            ? 'border-purple-500/50 bg-purple-600/15 text-purple-300'
                            : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-base shrink-0">{effect.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{effect.name}</div>
                          <div className="text-[10px] opacity-50 truncate">{effect.desc}</div>
                        </div>
                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PREVIEW ── */}
        <div className="xl:col-span-3">
          <div className="rounded-2xl bg-zinc-900 border border-white/5 p-4 sticky top-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Live Preview</p>
            <PreviewPlayer />
            <p className="text-zinc-600 text-xs text-center mt-3">
              Preview plays up to 60s · Final render uses full duration
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => store.setCurrentStep(4)}
        className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
      >
        Render Video →
      </button>
    </div>
  )
}
