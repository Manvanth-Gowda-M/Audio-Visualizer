'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const TemplateCard = dynamic(() => import('@/components/landing/TemplateCard'), { ssr: false })

/* ── animation variants ── */
const brutalSpring = { type: 'spring' as const, stiffness: 300, damping: 25 }
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  show:   { opacity: 1, y: 0, transition: brutalSpring },
}
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const TEMPLATES = [
  { id: 'circle',   name: 'Circle Pulse',  tag: 'Popular',  desc: 'Frequency bars radiate from spinning album art',   accent: '#ffcc00' },
  { id: 'vinyl',    name: 'Vinyl Aurora',  tag: 'Classic', desc: 'Spinning record with aura glow',     accent: '#2b8aff' },
  { id: 'waveform', name: 'Waveform',      tag: 'Clean',    desc: 'Mirrored spectrum bars with focused artwork',      accent: '#00ff66' },
  { id: 'glitch',   name: 'Glitch Out',   tag: 'Bold',     desc: 'RGB split & CRT scanlines driven by bass',          accent: '#ff3366' },
  { id: 'particles',name: 'Particles',    tag: 'Dynamic',  desc: 'Particle field that bursts with bass energy',       accent: '#9D4EDD' },
  { id: 'cassette',   name: 'Cassette',    tag: 'Retro',   desc: 'Tape deck with spinning reels and VU meters',        accent: '#ffcc00' },
  { id: 'neonplayer',  name: 'Neon Player',  tag: 'Premium', desc: 'Pyramid EQ bars, neon artwork card & progress line', accent: '#9D4EDD' },
  { id: 'appleplayer', name: 'Apple Player', tag: '✦ New',    desc: 'iOS-style music player card',  accent: '#2b8aff' },
  { id: 'poster',      name: 'Music Poster',  tag: '✦ Premium', desc: 'Pastel gradient with vinyl, waveforms & neumorphic controls', accent: '#ff3366' },
  { id: 'dashboard',   name: 'Dashboard',     tag: '✦ New',     desc: 'Minimal SaaS card with smooth curved waveform',               accent: '#00ff66' },
  { id: 'cinematic',   name: 'Cinematic Vinyl', tag: '✦ Premium', desc: 'Premium cinematic vinyl record with realistic motion', accent: '#ff8a00' },
  { id: 'editorial',   name: 'Editorial Album', tag: '✦ Premium', desc: 'Luxurious editorial album showcase with a warm tone', accent: '#e8aa78' },
  { id: 'symmetrical', name: 'Center Wave',     tag: '✦ Premium', desc: 'Immersive central spectrum and balanced side waveforms', accent: '#ffffff' },
  { id: 'retro',       name: 'Retro Player',    tag: '✦ Premium', desc: 'Flat UI music player inspired by classic interfaces', accent: '#ffb6c1' },
  { id: 'retro_cassette', name: 'Retro Cassette', tag: '✦ Premium', desc: 'Audio-driven vintage tape with mapped reel rotation', accent: '#6dd5ed' },
  { id: 'cinematic_vinyl_ui', name: 'Cinematic Vinyl UI', tag: '✦ Premium', desc: 'High-end vinyl visualizer with premium information display', accent: '#aa1738' },
  { id: 'neon_glass',        name: 'Neon Glass',         tag: '✦ New',     desc: 'Animated neon lines background with a centered glassmorphism card', accent: '#e040fb' },
  { id: 'neumorph_sphere',   name: 'Neumorphic Sphere',  tag: '✦ Premium', desc: 'Dark neumorphic card with audio-reactive 3D metallic sphere', accent: '#a0a0a0' },
]

export default function HomePage() {
  const router  = useRouter()
  const setTpl  = useStore((s) => s.setTemplate)
  const heroRef = useRef<HTMLDivElement>(null)
  
  const pick = (id: string) => {
    setTpl(id as Parameters<typeof setTpl>[0])
    router.push('/create')
  }

  return (
    <div className="grain min-h-screen overflow-x-hidden selection:bg-[var(--accent-yellow)] selection:text-black">

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={brutalSpring}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 h-20 bg-white border-b-4 border-black"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] md:border-4 border-black bg-[var(--accent-yellow)] shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-lg md:text-xl font-black">
            V
          </div>
          <span className="text-[1.15rem] md:text-2xl font-black tracking-tight display-font uppercase mt-1 whitespace-nowrap">
            Visualizer AI
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <a href="#templates" className="font-bold text-black border-b-4 border-transparent hover:border-black transition-colors hidden sm:block uppercase">
            Templates
          </a>
          <Link href="/create" className="neo-btn px-4 py-2 md:px-6 md:py-2 text-sm md:text-base bg-[var(--accent-green)] whitespace-nowrap">
            Open Editor
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 overflow-hidden bg-[var(--bg-color)]">
        
        {/* Brutalist Decorative Shapes */}
        <div className="absolute top-32 left-10 md:left-20 w-24 h-24 bg-[var(--accent-red)] border-4 border-black shadow-[4px_4px_0px_0px_#000] rotate-12 hidden md:block" />
        <div className="absolute bottom-40 right-10 md:right-20 w-32 h-32 bg-[var(--accent-blue)] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_#000] hidden lg:block" />
        <div className="absolute top-1/2 left-4 md:-left-10 w-16 h-[200px] bg-[var(--accent-yellow)] border-4 border-black shadow-[4px_4px_0px_0px_#000] -rotate-6 hidden lg:block" />

        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="flex justify-center mb-8 md:mb-10 w-full px-2">
              <span className="neo-box px-3 sm:px-6 py-2 text-[11px] sm:text-sm font-bold uppercase bg-white flex items-center justify-center gap-2 sm:gap-3 text-center w-full max-w-fit">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[var(--accent-red)] border-2 border-black inline-block animate-pulse shrink-0" />
                <span>Free · No watermark · Built for speed</span>
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-[2.5rem] min-[375px]:text-[3rem] leading-[1.05] sm:text-6xl md:text-8xl lg:text-[120px] md:leading-[0.9] text-black mb-6 md:mb-8 display-font uppercase relative text-center w-full">
              Turn <span className="inline-block bg-[var(--accent-yellow)] px-2 md:px-4 border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000] -rotate-2 transform hover:rotate-0 transition-transform mt-1 sm:mt-0">Music</span>
              <br />
              <span className="relative inline-block mt-1 sm:mt-0">
                Into Cinema
                {/* Harsh underline */}
                <svg className="absolute w-[110%] h-4 sm:h-8 -bottom-2 sm:-bottom-4 -left-[5%] text-black opacity-80 sm:opacity-100" viewBox="0 0 400 20" preserveAspectRatio="none">
                  <path d="M0,10 Q200,20 400,0" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="square"/>
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-black font-medium text-sm min-[375px]:text-base sm:text-lg md:text-2xl max-w-[95%] sm:max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed text-center opacity-90">
              Drop your audio & artwork, pick a brutally effective template, and export a 1080p video instantly in your browser.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center w-full max-w-xs sm:max-w-none mx-auto">
              <Link href="/create" className="neo-btn px-6 py-4 sm:px-10 sm:py-5 bg-[var(--accent-blue)] text-base md:text-xl text-center w-full sm:w-auto font-black shrink-0">
                Start Creating 🔥
              </Link>
              <a href="#templates" className="neo-btn px-6 py-4 sm:px-10 sm:py-5 bg-white text-base md:text-xl text-center w-full sm:w-auto font-black shrink-0">
                View Templates
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Marquee Ticker */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t-4 border-black bg-[var(--accent-yellow)] py-3 flex text-xl font-black uppercase whitespace-nowrap">
          <div className="animate-marquee flex gap-10 items-center">
            {Array(10).fill('BUILD MUSIC VIDEOS FAST ★ NO SERVER HEADACHE ★ EXPORT MP4 IN BROWSER ★ 100% FREE ★ STYLISH AF ★').map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b-4 border-black bg-[var(--bg-color)]">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black border-b-4 border-black">
          {[
            { n: '6+',    label: 'Brutal Templates', bg: 'bg-white' },
            { n: '1080p', label: 'Export Quality', bg: 'bg-[var(--accent-green)]' },
            { n: '100%',  label: 'Free & Local', bg: 'bg-[var(--accent-red)]' },
          ].map((s) => (
            <div key={s.label} className={`py-20 px-8 text-center ${s.bg} border-b-4 border-black md:border-none`}>
              <div className="text-6xl md:text-7xl font-black mb-4 display-font">{s.n}</div>
              <div className="text-xl font-bold uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 md:px-12 bg-[#eee]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex justify-between items-end border-b-8 border-black pb-6 flex-wrap gap-4">
            <h2 className="text-5xl md:text-7xl font-black display-font uppercase leading-none">The Setup</h2>
            <p className="text-2xl font-bold max-w-sm">4 steps to absolute cinema.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Pick IT',  desc: 'Choose from aggressive visual styles.', bg: 'bg-[var(--accent-yellow)]' },
              { n: '02', title: 'Feed IT',      desc: 'Drop your MP3, WAV or FLAC track.', bg: 'bg-[var(--accent-blue)]' },
              { n: '03', title: 'Style IT',     desc: 'Pump the lyrics and swap colors.', bg: 'bg-[var(--accent-red)]' },
              { n: '04', title: 'Ship IT',    desc: 'Render locally, download MP4.', bg: 'bg-[var(--accent-green)]' },
            ].map((s) => (
              <div key={s.n} className={`neo-card flex flex-col p-8 h-full ${s.bg}`}>
                <div className="text-6xl font-black display-font mb-auto pb-8 border-b-4 border-black text-black">{s.n}</div>
                <div className="pt-8">
                  <div className="font-black text-2xl mb-2 uppercase">{s.title}</div>
                  <div className="font-medium text-lg leading-snug text-black/80">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="py-24 px-6 md:px-12 bg-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-black display-font uppercase mb-6 inline-block relative">
              Visual <span className="bg-black text-white px-4 py-1">Arsenal</span>
            </h2>
            <p className="text-2xl font-bold max-w-2xl mx-auto border-4 border-black p-4 bg-[var(--accent-yellow)] shadow-[6px_6px_0px_0px_#000]">
              Click any module to lock it in and open the studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                id={t.id as Parameters<typeof setTpl>[0]}
                accent={t.accent}
                name={t.name}
                tag={t.tag}
                desc={t.desc}
                onClick={() => pick(t.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-[var(--accent-red)] border-b-4 border-black flex flex-col items-center justify-center text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl neo-box p-12 md:p-20 bg-white inline-block">
          <h2 className="text-5xl md:text-7xl font-black display-font uppercase mb-6 text-black">
            End the silence.
          </h2>
          <p className="text-2xl font-bold mb-10 text-black">
            100% Free. No sign-ups. Strictly business.
          </p>
          <Link href="/create" className="neo-btn px-12 py-6 bg-[var(--accent-yellow)] text-3xl">
            Launch Studio →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 bg-black text-white flex flex-col items-center gap-6">
        <div className="text-4xl font-black display-font">VISUALIZER AI</div>
        <p className="font-bold text-center border-t-2 border-white/20 pt-6 w-full max-w-xl text-lg">
          No watermark. No accounts. Pure export.
        </p>
      </footer>
    </div>
  )
}
