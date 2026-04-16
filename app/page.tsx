'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const TemplateCard = dynamic(() => import('@/components/landing/TemplateCard'), { ssr: false })

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { show: { transition: { staggerChildren: 0.12 } } }
const fadeIn  = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } }

/* ── template data ── */
const TEMPLATES = [
  { id: 'circle',   name: 'Circle Pulse',  tag: 'Popular',  desc: 'Frequency bars radiate from spinning album art',   accent: '#c9a84c' },
  { id: 'vinyl',    name: 'Vinyl Aurora',  tag: 'Aesthetic', desc: 'Spinning record with aurora glow on the beat',     accent: '#818cf8' },
  { id: 'waveform', name: 'Waveform',      tag: 'Clean',    desc: 'Mirrored spectrum bars with centered artwork',      accent: '#10b981' },
  { id: 'glitch',   name: 'Glitch RGB',   tag: 'Bold',     desc: 'RGB split & CRT scanlines driven by bass',          accent: '#f43f5e' },
  { id: 'particles',name: 'Particles',    tag: 'Dynamic',  desc: 'Particle field that bursts with bass energy',       accent: '#6366f1' },
  { id: 'cassette',   name: 'Cassette',    tag: 'Retro',   desc: 'Tape deck with spinning reels and VU meters',        accent: '#f59e0b' },
  { id: 'neonplayer',  name: 'Neon Player',  tag: 'Premium', desc: 'Pyramid EQ bars, neon artwork card & progress line', accent: '#a855f7' },
  { id: 'appleplayer', name: 'Apple Player', tag: '✦ New',    desc: 'Premium iOS-style glassmorphism music player card',  accent: '#e8e0d0' },
  { id: 'poster',      name: 'Music Poster',  tag: '✦ Premium', desc: 'Pastel gradient with vinyl, waveforms & neumorphic controls', accent: '#a855f7' },
  { id: 'dashboard',   name: 'Dashboard',     tag: '✦ New',     desc: 'Minimal SaaS card with smooth curved waveform',               accent: '#00e676' },
]

export default function HomePage() {
  const router  = useRouter()
  const setTpl  = useStore((s) => s.setTemplate)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY   = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroO   = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const pick = (id: string) => {
    setTpl(id as Parameters<typeof setTpl>[0])
    router.push('/create')
  }

  return (
    <div className="grain bg-[#080808] min-h-screen overflow-x-hidden">

      {/* ── NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(8,8,8,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6f2e)' }}>🎵</div>
          <span className="font-semibold tracking-tight text-[#e8e0d0]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Visualizer<span className="gold-text">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#templates" className="text-sm text-[#8a7a60] hover:text-[#c9a84c] transition-colors hidden sm:block">
            Templates
          </a>
          <Link href="/create"
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6f2e)', color: '#080808' }}>
            Open Editor
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">

        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
        </div>

        {/* Animated waveform bars — bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-40 pointer-events-none overflow-hidden">
          {Array.from({ length: 90 }, (_, i) => {
            const h   = +(15 + Math.abs(Math.sin(i * 0.45 + 1)) * 75).toFixed(2)
            const dur = +(0.6 + Math.abs(Math.sin(i * 0.7)) * 1.2).toFixed(3)
            const del = +((i * 0.02) % 1.2).toFixed(2)
            const bg  = +(0.08 + Math.abs(Math.sin(i * 0.3)) * 0.12).toFixed(3)
            return (
              <div key={i} className="bar-anim rounded-t-sm w-[5px] shrink-0"
                style={{
                  height: `${h}%`,
                  '--d': `${dur}s`,
                  '--delay': `${del}s`,
                  background: `rgba(201,168,76,${bg})`,
                } as React.CSSProperties}
              />
            )
          })}
        </div>

        {/* Spinning ring decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="spin-slow w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ border: '1px solid #c9a84c' }} />
          <div className="absolute inset-8 spin-slow w-[420px] h-[420px] rounded-full opacity-[0.03]"
            style={{ border: '1px dashed #c9a84c', animationDirection: 'reverse', animationDuration: '20s' }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroO }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] pulse-ring inline-block" />
                Free · No watermark · No account needed
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="text-[#e8e0d0]">Turn music</span>
              <br />
              <span className="gold-text">into cinema.</span>
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-[#6b5f4a] text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
              Pick a visual template, drop your audio and artwork, add lyrics — export a stunning 1080p MP4 in minutes.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create"
                className="group relative px-8 py-4 rounded-full font-semibold text-base overflow-hidden transition-all"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6f2e)', color: '#080808' }}>
                <span className="relative z-10">Start Creating →</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#e8c97a,#c9a84c)' }} />
              </Link>
              <a href="#templates"
                className="px-8 py-4 rounded-full font-semibold text-base transition-all text-[#8a7a60] hover:text-[#c9a84c]"
                style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
                Browse Templates
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-xs text-[#3a3020] tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-[#c9a84c33] to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="py-16 px-6"
        style={{ borderTop: '1px solid rgba(201,168,76,0.08)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { n: '6',     label: 'Visual Templates' },
            { n: '1080p', label: 'Export Quality' },
            { n: '100%',  label: 'Free Forever' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="text-3xl font-black gold-text mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{s.n}</div>
              <div className="text-sm text-[#4a4030]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-xs tracking-[0.3em] uppercase text-[#c9a84c] mb-4">Templates</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-4xl md:text-5xl font-black text-[#e8e0d0]"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Choose your aesthetic
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#4a4030] mt-4 text-base">
              Click any template to open the editor
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <motion.div key={t.id} variants={fadeUp}>
                <TemplateCard
                  id={t.id as Parameters<typeof setTpl>[0]}
                  accent={t.accent}
                  name={t.name}
                  tag={t.tag}
                  desc={t.desc}
                  onClick={() => pick(t.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(201,168,76,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-xs tracking-[0.3em] uppercase text-[#c9a84c] mb-4">Process</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-4xl font-black text-[#e8e0d0]"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Four steps to your video
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: '01', icon: '🎨', title: 'Pick template',  desc: 'Choose from 6 visual styles' },
              { n: '02', icon: '🎵', title: 'Add audio',      desc: 'Drop your MP3 or WAV' },
              { n: '03', icon: '📝', title: 'Add lyrics',     desc: 'Auto-fetched or manual' },
              { n: '04', icon: '⬇️', title: 'Export MP4',    desc: 'Download your video' },
            ].map((s, i) => (
              <motion.div key={s.n} variants={fadeUp} className="text-center">
                <div className="relative w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                  {s.icon}
                  {i < 3 && (
                    <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 w-full h-px"
                      style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.2), transparent)' }} />
                  )}
                </div>
                <div className="text-xs font-mono text-[#c9a84c] mb-1">{s.n}</div>
                <div className="font-semibold text-[#e8e0d0] text-sm mb-1">{s.title}</div>
                <div className="text-xs text-[#4a4030]">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0e0c08 0%, #1a1508 50%, #0e0c08 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
          {/* Corner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />
          <motion.div variants={fadeUp} className="text-5xl mb-6">🎬</motion.div>
          <motion.h2 variants={fadeUp}
            className="text-3xl font-black mb-3 text-[#e8e0d0]"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to create?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#4a4030] mb-8">
            No sign-up. No watermark. Completely free.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/create"
              className="inline-block px-10 py-4 rounded-full font-semibold text-base transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6f2e)', color: '#080808' }}>
              Open Editor →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 text-center text-xs text-[#2a2018]"
        style={{ borderTop: '1px solid rgba(201,168,76,0.06)' }}>
        VisualizerAI · Free to use · No watermark · No account needed
      </footer>
    </div>
  )
}



