'use client'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import Step1Upload from '@/components/steps/Step1Upload'
import Step2Lyrics from '@/components/steps/Step2Lyrics'
import Step3Customize from '@/components/steps/Step3Customize'
import Step4Export from '@/components/steps/Step4Export'

const STEPS = [
  { n: 1, icon: '🎵', label: 'Media',  sub: 'Audio + Artwork' },
  { n: 2, icon: '📝', label: 'Lyrics', sub: 'Lyrics (optional)' },
  { n: 3, icon: '🎨', label: 'Style',  sub: 'Style' },
  { n: 4, icon: '⬇️', label: 'Export', sub: 'Render' },
]

export default function CreatePage() {
  const { currentStep, setCurrentStep, songTitle, artist, template } = useStore()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Top bar ── */}
      <header style={{
        height: 60,
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 0 16px rgba(168,85,247,0.4)',
          }}>🎶</div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', color: '#fff', display: 'none' }}
            className="sm:block">VisualizerAI</span>
        </Link>

        {/* Mobile step tabs */}
        <div style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto' }} className="lg:hidden">
          {STEPS.map((s) => {
            const done = currentStep > s.n
            const active = currentStep === s.n
            return (
              <button
                key={s.n}
                onClick={() => done && setCurrentStep(s.n as 1|2|3|4)}
                disabled={!done && !active}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px',
                  borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0,
                  border: active
                    ? '1px solid rgba(168,85,247,0.6)'
                    : done
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px dashed rgba(255,255,255,0.08)',
                  background: active
                    ? 'rgba(168,85,247,0.15)'
                    : done
                    ? 'rgba(255,255,255,0.05)'
                    : 'transparent',
                  color: active ? '#c084fc' : done ? '#a1a1aa' : '#3f3f46',
                  fontSize: 12, fontWeight: 700,
                  cursor: done ? 'pointer' : active ? 'default' : 'not-allowed',
                  transition: 'all 0.2s', outline: 'none',
                }}
              >
                <span>{done ? '✓' : s.n}</span>
                <span style={{ display: 'none' }} className="sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Song info pill */}
        {songTitle && (
          <div style={{
            display: 'none', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            fontSize: 12, fontWeight: 600,
          }} className="md:flex">
            <span>🎵</span>
            <span style={{ color: '#e4e4e7', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {songTitle}
            </span>
            {artist && <span style={{ color: '#71717a' }}>— {artist}</span>}
          </div>
        )}

        {/* Template badge */}
        <div style={{
          padding: '5px 12px',
          borderRadius: 8,
          background: 'rgba(168,85,247,0.15)',
          border: '1px solid rgba(168,85,247,0.3)',
          color: '#c084fc', fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          display: 'none', whiteSpace: 'nowrap',
        }} className="sm:block">
          {template}
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar — desktop only */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          padding: '24px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflowY: 'auto',
        }} className="hidden lg:flex">
          <p style={{
            fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
          }}>Steps</p>

          {STEPS.map((s) => {
            const done = currentStep > s.n
            const active = currentStep === s.n
            return (
              <button
                key={s.n}
                onClick={() => done && setCurrentStep(s.n as 1|2|3|4)}
                disabled={!done && !active}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: active
                    ? '1px solid rgba(168,85,247,0.5)'
                    : done
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px dashed rgba(255,255,255,0.06)',
                  background: active
                    ? 'rgba(168,85,247,0.1)'
                    : done
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                  cursor: done ? 'pointer' : active ? 'default' : 'not-allowed',
                  textAlign: 'left', outline: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  background: active
                    ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                    : done
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  color: active ? '#fff' : done ? '#a1a1aa' : '#3f3f46',
                  boxShadow: active ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                }}>
                  {done ? '✓' : s.n}
                </span>
                <div>
                  <div style={{
                    fontWeight: 700, fontSize: 12,
                    color: active ? '#e4e4e7' : done ? '#71717a' : '#3f3f46',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{s.label}</div>
                  <div style={{
                    fontSize: 10, marginTop: 2,
                    color: active ? 'rgba(196,132,252,0.6)' : 'rgba(255,255,255,0.15)',
                  }}>{s.sub}</div>
                </div>
              </button>
            )
          })}

          {/* Template mini card */}
          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{
              fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
            }}>Template</p>
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#e4e4e7', textTransform: 'uppercase' }}>{template}</p>
              <Link href="/" style={{
                fontSize: 11, fontWeight: 700, color: '#f43f5e',
                textDecoration: 'none', display: 'block', marginTop: 6,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>Change Template →</Link>
            </div>
          </div>
        </aside>

        {/* Step content area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
          {/* Ambient glow */}
          <div style={{
            position: 'fixed', top: '30%', left: '55%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <div style={{
            maxWidth: 880,
            margin: '0 auto',
            padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) 60px',
            position: 'relative', zIndex: 1,
          }}>
            {/* Step header */}
            <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h1 style={{
                fontSize: 'clamp(22px, 4vw, 34px)',
                fontWeight: 900, color: '#fff',
                textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {currentStep === 1 && '1. Upload Media'}
                {currentStep === 2 && '2. Add Lyrics'}
                {currentStep === 3 && '3. Pick Style'}
                {currentStep === 4 && '4. Export'}
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 12, marginTop: 8,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {currentStep === 1 && 'Drop your audio file and album artwork to get started'}
                {currentStep === 2 && 'Lyrics are auto-fetched — edit, adjust timing, or skip entirely'}
                {currentStep === 3 && 'Pick a template, accent color, and typography style'}
                {currentStep === 4 && 'Your video is being rendered — this takes 1–3 minutes'}
              </p>
            </div>

            {/* Step component */}
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
