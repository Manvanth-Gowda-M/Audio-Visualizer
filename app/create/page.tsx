'use client'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import Step1Upload from '@/components/steps/Step1Upload'
import Step2Lyrics from '@/components/steps/Step2Lyrics'
import Step3Customize from '@/components/steps/Step3Customize'
import Step4Export from '@/components/steps/Step4Export'

const STEPS = [
  { n: 1, icon: '🎵', label: 'Media' },
  { n: 2, icon: '📝', label: 'Lyrics' },
  { n: 3, icon: '🎨', label: 'Style' },
  { n: 4, icon: '⬇️', label: 'Export' },
]

export default function CreatePage() {
  const { currentStep, setCurrentStep, songTitle, artist, template } = useStore()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="h-14 glass border-b border-white/5 flex items-center px-6 gap-4 shrink-0 z-40">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-sm">🎵</div>
          <span className="font-bold text-zinc-100 tracking-tight hidden sm:block">VisualizerAI</span>
        </Link>

        {/* Step tabs */}
        <div className="flex items-center gap-1 flex-1">
          {STEPS.map((s, i) => {
            const done = currentStep > s.n
            const active = currentStep === s.n
            return (
              <button
                key={s.n}
                onClick={() => done && setCurrentStep(s.n as 1|2|3|4)}
                disabled={!done && !active}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-600 text-white'
                    : done
                    ? 'text-zinc-300 hover:bg-zinc-800 cursor-pointer'
                    : 'text-zinc-600 cursor-default'
                }`}
              >
                <span>{done ? '✓' : s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Song info pill */}
        {songTitle && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm">
            <span className="text-zinc-400">🎵</span>
            <span className="text-zinc-200 font-medium truncate max-w-[160px]">{songTitle}</span>
            {artist && <span className="text-zinc-500">— {artist}</span>}
          </div>
        )}

        {/* Template badge */}
        <div className="px-2.5 py-1 rounded-md bg-zinc-800 text-xs text-zinc-400 capitalize hidden sm:block">
          {template}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar progress (desktop) */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 p-4 gap-2 shrink-0">
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-2 px-2">Steps</p>
          {STEPS.map((s) => {
            const done = currentStep > s.n
            const active = currentStep === s.n
            return (
              <button
                key={s.n}
                onClick={() => done && setCurrentStep(s.n as 1|2|3|4)}
                disabled={!done && !active}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                  active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : done
                    ? 'text-zinc-400 hover:bg-zinc-800 cursor-pointer'
                    : 'text-zinc-700 cursor-default'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  active ? 'bg-purple-600 text-white' : done ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {done ? '✓' : s.n}
                </span>
                <div>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    {s.n === 1 && 'Audio + Artwork'}
                    {s.n === 2 && <span>Lyrics <span className="text-zinc-700">(optional)</span></span>}
                    {s.n === 3 && 'Template & colors'}
                    {s.n === 4 && 'Render & download'}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Template mini preview */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <p className="text-xs text-zinc-600 mb-2 px-2">Template</p>
            <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/5">
              <p className="text-sm font-medium text-zinc-300 capitalize">{template}</p>
              <Link href="/" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Change template →
              </Link>
            </div>
          </div>
        </aside>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
            {/* Step header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-zinc-100">
                {currentStep === 1 && 'Upload your media'}
                {currentStep === 2 && 'Add lyrics'}
                {currentStep === 3 && 'Customize your style'}
                {currentStep === 4 && 'Export your video'}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {currentStep === 1 && 'Drop your audio file and album artwork to get started'}
                {currentStep === 2 && 'Lyrics are auto-fetched — edit, adjust timing, or skip entirely'}
                {currentStep === 3 && 'Pick a template, accent color, and typography style'}
                {currentStep === 4 && 'Your video is being rendered — this takes 1–3 minutes'}
              </p>
            </div>

            {/* Animated step content */}
            <div key={currentStep} className="animate-fade-in">
              {currentStep === 1 && <Step1Upload />}
              {currentStep === 2 && <Step2Lyrics />}
              {currentStep === 3 && <Step3Customize />}
              {currentStep === 4 && <Step4Export />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
