'use client'
import dynamic from 'next/dynamic'

const CircleThumb         = dynamic(() => import('./thumbs/CircleThumb'),           { ssr: false })
const VinylThumb          = dynamic(() => import('./thumbs/VinylThumb'),            { ssr: false })
const WaveformThumb       = dynamic(() => import('./thumbs/WaveformThumb'),         { ssr: false })
const GlitchThumb         = dynamic(() => import('./thumbs/GlitchThumb'),           { ssr: false })
const ParticlesThumb      = dynamic(() => import('./thumbs/ParticlesThumb'),        { ssr: false })
const CassetteThumb       = dynamic(() => import('./thumbs/CassetteThumb'),         { ssr: false })
const NeonPlayerThumb     = dynamic(() => import('./NeonPlayerThumb'),              { ssr: false })
const ApplePlayerThumb    = dynamic(() => import('./thumbs/ApplePlayerThumb'),      { ssr: false })
const PosterThumb         = dynamic(() => import('./thumbs/PosterThumb'),           { ssr: false })
const DashboardThumb      = dynamic(() => import('./thumbs/DashboardThumb'),        { ssr: false })
const CircularThumb       = dynamic(() => import('./thumbs/CircularThumb'),         { ssr: false })
const CinematicThumb      = dynamic(() => import('./thumbs/CinematicThumb'),        { ssr: false })
const EditorialThumb      = dynamic(() => import('./thumbs/EditorialThumb'),        { ssr: false })
const SymmetricalThumb    = dynamic(() => import('./thumbs/SymmetricalThumb'),      { ssr: false })
const RetroThumb          = dynamic(() => import('./thumbs/RetroThumb'),            { ssr: false })
const RetroCassetteThumb  = dynamic(() => import('./thumbs/RetroCassetteThumb'),   { ssr: false })
const CinematicVinylUIThumb = dynamic(() => import('./thumbs/CinematicVinylUIThumb'), { ssr: false })
const NeonGlassThumb        = dynamic(() => import('./thumbs/NeonGlassThumb'),       { ssr: false })
const NeumorphicSphereThumb = dynamic(() => import('./thumbs/NeumorphicSphereThumb'), { ssr: false })

type TemplateId =
  | 'circle' | 'vinyl' | 'waveform' | 'glitch'
  | 'particles' | 'cassette' | 'neonplayer' | 'appleplayer' | 'poster' | 'dashboard' | 'circular'
  | 'cinematic' | 'editorial' | 'symmetrical' | 'retro' | 'retro_cassette' | 'cinematic_vinyl_ui' | 'neon_glass' | 'neumorph_sphere'

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
  if (id === 'circle')           return <CircleThumb />
  if (id === 'vinyl')            return <VinylThumb />
  if (id === 'waveform')         return <WaveformThumb />
  if (id === 'glitch')           return <GlitchThumb />
  if (id === 'particles')        return <ParticlesThumb />
  if (id === 'cassette')         return <CassetteThumb />
  if (id === 'neonplayer')       return <NeonPlayerThumb accent={accent} />
  if (id === 'appleplayer')      return <ApplePlayerThumb />
  if (id === 'poster')           return <PosterThumb />
  if (id === 'dashboard')        return <DashboardThumb />
  if (id === 'circular')         return <CircularThumb />
  if (id === 'cinematic')        return <CinematicThumb />
  if (id === 'editorial')        return <EditorialThumb />
  if (id === 'symmetrical')      return <SymmetricalThumb />
  if (id === 'retro')            return <RetroThumb />
  if (id === 'retro_cassette')   return <RetroCassetteThumb />
  if (id === 'cinematic_vinyl_ui') return <CinematicVinylUIThumb />
  if (id === 'neon_glass')         return <NeonGlassThumb />
  if (id === 'neumorph_sphere')     return <NeumorphicSphereThumb />
  return null
}

export default function TemplateCard({ id, accent, name, tag, desc, onClick, selected }: Props) {
  return (
    <button
      onClick={onClick}
      className={`group text-left w-full transition-all duration-150 ${
        selected
          ? 'translate-x-1 translate-y-1 shadow-none border-4 border-black bg-[var(--accent-yellow)]'
          : 'border-4 border-black shadow-[6px_6px_0px_0px_#000] bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000]'
      }`}
    >
      <div className="relative overflow-hidden border-b-4 border-black bg-black" style={{ height: 180 }}>
        {/* Render dark thumbs effectively */}
        <ThumbRenderer id={id} accent={accent} />
        
        {/* Overlay hover effect */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="neo-btn px-6 py-2" style={{ backgroundColor: accent, color: '#000' }}>
            USE THIS →
          </span>
        </div>
        
        {/* Tag block */}
        <span
          className="absolute top-2 left-2 px-3 py-1 text-xs font-black uppercase text-black border-2 border-black"
          style={{ backgroundColor: accent }}
        >
          {tag}
        </span>
      </div>
      
      <div className={`p-5 ${selected ? 'bg-transparent' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-xl display-font uppercase text-black">{name}</h3>
          <div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: accent }} />
        </div>
        <p className="text-sm font-medium leading-snug text-black/80">{desc}</p>
      </div>
    </button>
  )
}
