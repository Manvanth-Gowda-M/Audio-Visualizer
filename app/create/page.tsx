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
    <div className="min-h-screen bg-[#fcfcfc] text-black flex flex-col font-inter selection:bg-[#fbff12] selection:text-black">
      {/* Top bar */}
      <header className="h-16 bg-white border-b-4 border-black flex items-center px-6 gap-4 shrink-0 z-40">
        <Link href="/" className="flex items-center gap-2 mr-4 hover:scale-105 transition-transform">
          <div className="w-8 h-8 flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-[#fbff12]">🎶</div>
          <span className="font-black uppercase tracking-tight text-xl hidden sm:block">VisualizerAI</span>
        </Link>

        {/* Step tabs (Mobile) */}
        <div className="flex items-center gap-2 flex-1 lg:hidden">
          {STEPS.map((s) => {
            const done = currentStep > s.n
            const active = currentStep === s.n
            return (
              <button
                key={s.n}
                onClick={() => done && setCurrentStep(s.n as 1|2|3|4)}
                disabled={!done && !active}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-sm font-bold uppercase transition-all border-2 border-black ${
                  active
                    ? 'bg-[#fbff12] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : done
                    ? 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-gray-400 border-dashed cursor-default'
                }`}
              >
                <span>{done ? '✓' : s.n}</span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Song info pill */}
        {songTitle && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-sm font-bold">
            <span className="text-black">🎵</span>
            <span className="text-black uppercase truncate max-w-[160px]">{songTitle}</span>
            {artist && <span className="text-gray-600">— {artist}</span>}
          </div>
        )}

        {/* Template badge */}
        <div className="px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#06d6a0] text-sm font-bold text-black uppercase hidden sm:block">
          {template}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar progress (desktop) */}
        <aside className="hidden lg:flex flex-col w-64 border-r-4 border-black bg-white p-6 gap-3 shrink-0">
          <p className="text-sm text-black font-black uppercase tracking-widest mb-4">Steps</p>
          {STEPS.map((s) => {
            const done = currentStep > s.n
            const active = currentStep === s.n
            return (
              <button
                key={s.n}
                onClick={() => done && setCurrentStep(s.n as 1|2|3|4)}
                disabled={!done && !active}
                className={`group flex items-center gap-3 p-3 text-left transition-all border-4 border-black ${
                  active
                    ? 'bg-[#06d6a0] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                    : done
                    ? 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-gray-100 text-gray-400 border-dashed cursor-default'
                }`}
              >
                <span className={`w-8 h-8 flex items-center justify-center text-sm font-black border-2 border-black ${
                  active ? 'bg-white text-black' : done ? 'bg-white text-black' : 'bg-transparent text-gray-400 border-dashed'
                }`}>
                  {done ? '✓' : s.n}
                </span>
                <div>
                  <div className="font-black uppercase text-base">{s.label}</div>
                  <div className={`text-xs uppercase font-bold mt-1 ${active ? 'text-black' : done ? 'text-gray-300' : 'text-gray-400'}`}>
                    {s.n === 1 && 'Audio + Artwork'}
                    {s.n === 2 && 'Lyrics (optional)'}
                    {s.n === 3 && 'Style'}
                    {s.n === 4 && 'Render'}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Template mini preview */}
          <div className="mt-auto pt-6 border-t-4 border-black">
            <p className="text-xs font-black uppercase tracking-widest text-black mb-3">Template</p>
            <div className="p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <p className="text-lg font-black text-black uppercase">{template}</p>
              <Link href="/" className="text-sm font-bold text-[#ff2056] hover:text-black transition-colors uppercase block mt-2">
                Change Template →
              </Link>
            </div>
          </div>
        </aside>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 md:py-12">
            {/* Step header */}
            <div className="mb-8 border-b-4 border-black pb-6">
              <h1 className="text-3xl md:text-4xl font-black text-black uppercase">
                {currentStep === 1 && '1. Upload Media'}
                {currentStep === 2 && '2. Add Lyrics'}
                {currentStep === 3 && '3. Pick Style'}
                {currentStep === 4 && '4. Export'}
              </h1>
              <p className="text-black font-bold uppercase mt-2 text-sm max-w-2xl">
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
