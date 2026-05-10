export default function GoldenFloralThumb() {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#1a1610]">
      {/* Background Gradient & Vignette */}
      <div 
        className="absolute inset-[-10%] bg-cover bg-center opacity-80"
        style={{ 
          background: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.6) 0%, rgba(180,100,20,0.4) 40%, #1a1610 80%)',
        }}
      />
      
      {/* Side Images (Faded & Blurred) */}
      <div className="absolute top-[10%] left-[-15%] w-[80%] h-[50%] opacity-40 blur-[8px] mix-blend-screen"
           style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)' }}>
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>
      
      <div className="absolute top-[5%] right-[-20%] w-[80%] h-[55%] opacity-40 blur-[6px] mix-blend-screen"
           style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)' }}>
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>

      <div className="absolute bottom-[0%] left-[-20%] w-[70%] h-[45%] opacity-40 blur-[4px] mix-blend-screen"
           style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)' }}>
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>

      {/* Center Subject Outline Mock */}
      <div className="absolute inset-0 flex items-end justify-center z-20 pb-4">
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-amber-400/30 blur-2xl z-[-1]" />
        <div 
           className="w-[90%] h-[75%] bg-contain bg-no-repeat bg-bottom"
           style={{ 
             backgroundImage: 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600)',
             filter: 'drop-shadow(0px 0px 10px rgba(251,191,36,0.5)) drop-shadow(0px 10px 15px rgba(0,0,0,0.5))'
           }}
        />
      </div>

      {/* Player Card */}
      <div className="absolute top-[8%] left-[50%] -translate-x-1/2 w-[160px] h-[60px] bg-[#321e0a]/40 backdrop-blur-md border border-amber-100/20 rounded-xl shadow-2xl z-30 flex items-center px-2">
        <div className="w-8 h-8 bg-black/40 rounded object-cover shadow-md" />
        <div className="ml-2 flex-1">
          <div className="w-16 h-1.5 bg-white rounded-full mb-1" />
          <div className="w-10 h-1 bg-white/60 rounded-full" />
        </div>
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
           <div className="w-1.5 h-1.5 bg-amber-900 rounded-[1px] ml-[1px]" />
        </div>
      </div>
    </div>
  )
}
