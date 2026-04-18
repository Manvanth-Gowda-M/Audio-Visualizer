'use client'
import dynamic from 'next/dynamic'

const CircleThumb      = dynamic(() => import('./thumbs/CircleThumb'),      { ssr: false })
const VinylThumb       = dynamic(() => import('./thumbs/VinylThumb'),       { ssr: false })
const WaveformThumb    = dynamic(() => import('./thumbs/WaveformThumb'),    { ssr: false })
const GlitchThumb      = dynamic(() => import('./thumbs/GlitchThumb'),      { ssr: false })
const ParticlesThumb   = dynamic(() => import('./thumbs/ParticlesThumb'),   { ssr: false })
const CassetteThumb    = dynamic(() => import('./thumbs/CassetteThumb'),    { ssr: false })
const NeonPlayerThumb  = dynamic(() => import('./NeonPlayerThumb'),         { ssr: false })
const ApplePlayerThumb = dynamic(() => import('./thumbs/ApplePlayerThumb'), { ssr: false })
const PosterThumb      = dynamic(() => import('./thumbs/PosterThumb'),      { ssr: false })
const DashboardThumb   = dynamic(() => import('./thumbs/DashboardThumb'),   { ssr: false })
const CircularThumb    = dynamic(() => import('./thumbs/CircularThumb'),    { ssr: false })

type TemplateId =
  | 'circle' | 'vinyl' | 'waveform' | 'glitch'
  | 'particles' | 'cassette' | 'neonplayer' | 'appleplayer' | 'poster' | 'dashboard' | 'circular'

interface Props {
  id: TemplateId
  accent: string
  name: string
  tag: string
  desc: string
  onClick: () => void
  selected?: boolean
}

function ThumbRenderer({ id, accent }: { id: TemplateId; accent: string }) {
  if (id === 'circle')      return <CircleThumb />
  if (id === 'vinyl')       return <VinylThumb />
  if (id === 'waveform')    return <WaveformThumb />
  if (id === 'glitch')      return <GlitchThumb />
  if (id === 'particles')   return <ParticlesThumb />
  if (id === 'cassette')    return <CassetteThumb />
  if (id === 'neonplayer')  return <NeonPlayerThumb accent={accent} />
  if (id === 'appleplayer') return <ApplePlayerThumb />
  if (id === 'poster')      return <PosterThumb />
  if (id === 'dashboard')   return <DashboardThumb />
  if (id === 'circular')    return <CircularThumb />
  return null
}

export default function TemplateCard({ id, accent, name, tag, desc, onClick, selected }: Props) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl overflow-hidden w-full transition-all duration-300"
      style={{
        background: '#0e0c0a',
        border: selected ? `1.5px solid ${accent}` : '1px solid rgba(201,168,76,0.1)',
        boxShadow: selected ? `0 0 28px ${accent}33` : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.borderColor = accent + '88'
        e.currentTarget.style.boxShadow = `0 16px 48px ${accent}22`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = selected ? accent : 'rgba(201,168,76,0.1)'
        e.currentTarget.style.boxShadow = selected ? `0 0 28px ${accent}33` : 'none'
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <ThumbRenderer id={id} accent={accent} />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.52)' }}
        >
          <span
            className="px-5 py-2 rounded-full text-sm font-bold"
            style={{ background: `linear-gradient(135deg,${accent},${accent}99)`, color: '#080808' }}
          >
            Use template →
          </span>
        </div>
        <span
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(8,8,8,0.75)', border: `1px solid ${accent}44`, color: accent }}
        >
          {tag}
        </span>
      </div>
      <div className="p-4" style={{ borderTop: '1px solid rgba(201,168,76,0.06)' }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm" style={{ color: '#e8e0d0' }}>{name}</h3>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        </div>
        <p className="text-xs leading-snug" style={{ color: '#4a4030' }}>{desc}</p>
      </div>
    </button>
  )
}
