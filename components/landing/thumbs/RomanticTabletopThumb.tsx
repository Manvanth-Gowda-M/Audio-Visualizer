export default function RomanticTabletopThumb() {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#1a1610]">
      {/* Background Dinner Scene */}
      <div 
        className="absolute inset-[-10%] bg-cover bg-center opacity-80 blur-sm mix-blend-screen"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1579549557404-36ea3a47900b?auto=format&fit=crop&q=80&w=600)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Assembly Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-6">
        
        {/* Acrylic Plaque */}
        <div className="w-[140px] h-[200px] bg-white/5 backdrop-blur-md rounded-xl border border-white/60 p-2 flex flex-col shadow-[inset_0_0_10px_rgba(255,255,255,0.2),0_0_20px_rgba(255,220,150,0.3)] z-20">
          {/* Top highlight */}
          <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          
          {/* Photo */}
          <div className="w-full aspect-square rounded-md overflow-hidden shadow-md mb-2">
            <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
          </div>

          {/* Text lines */}
          <div className="w-16 h-1.5 bg-white rounded-full mb-1" />
          <div className="w-10 h-1 bg-white/60 rounded-full mb-3" />

          {/* Progress bar */}
          <div className="w-full h-[2px] bg-white/20 rounded-full mb-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-white rounded-full" />
          </div>

          {/* Controls mock */}
          <div className="flex justify-between items-center px-1">
             <div className="w-2 h-2 rounded-full bg-white/60" />
             <div className="w-4 h-4 rounded-full bg-white" />
             <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>

          {/* Bottom Edge Glow */}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-amber-200 to-transparent blur-[1px]" />
        </div>

        {/* Wooden Base */}
        <div className="relative w-[160px] h-[24px] -mt-2 z-10 rounded-full bg-gradient-to-b from-[#b07e5b] to-[#6e4428] shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex justify-center items-start pt-1">
           <div className="w-[130px] h-[2px] bg-[#3d2312] rounded-full shadow-[0_0_10px_rgba(255,220,150,0.5)]" />
        </div>
      </div>
    </div>
  )
}
