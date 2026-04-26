export default function CyberpunkHologramThumb() {
  return (
    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-2 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-purple-900/20" />
      
      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        transform: 'perspective(500px) rotateX(60deg)',
        transformOrigin: 'bottom'
      }} />

      <div className="w-24 h-24 border border-cyan-500/50 rounded flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-black/60">
        <div className="w-20 h-20 border border-purple-500/50 rounded flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-zinc-900/50">
          <div className="w-16 h-16 bg-cyan-900/40 rounded border border-cyan-400/30 backdrop-blur-sm" />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center z-10 w-full px-4">
        <div className="w-24 h-1.5 bg-cyan-500/80 rounded-full mb-1 shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
        <div className="w-16 h-1 bg-purple-500/80 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
      </div>
      
      {/* Scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-10 animate-pulse" style={{ top: '30%' }} />
    </div>
  )
}
