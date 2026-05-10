export default function SunlightDiaryThumb() {
  return (
    <div className="w-full h-full bg-[#111] relative overflow-hidden flex items-center justify-center">
      {/* Background with blur and vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1444464666168-49b626f8627c?auto=format&fit=crop&q=80&w=600)',
          filter: 'grayscale(0.8) blur(4px) brightness(0.6) contrast(1.2)'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,180,0,0.15)_0%,rgba(0,0,0,0.7)_100%)] mix-blend-multiply" />

      {/* Typography */}
      <div className="absolute top-2 w-full text-center z-10 flex flex-col items-center">
        <div className="font-['Anton'] text-[40px] leading-[0.8] text-[#eab308] uppercase tracking-tighter drop-shadow-lg">
          SUNLIGHT
        </div>
        <div className="font-['Anton'] text-[40px] leading-[0.8] text-[#eab308] uppercase tracking-tighter drop-shadow-lg">
          DIARY
        </div>
      </div>

      {/* Quote Box Placeholder */}
      <div className="absolute top-8 left-2 w-[60px] h-[80px] bg-[#eab308] rounded-md rotate-[-3deg] shadow-lg flex flex-col p-2 z-10">
         <div className="text-[20px] font-black leading-none text-black">“</div>
         <div className="w-full h-1 bg-black/20 mt-1 rounded-full" />
         <div className="w-3/4 h-1 bg-black/20 mt-1 rounded-full" />
         <div className="w-full h-1 bg-black/20 mt-1 rounded-full" />
      </div>

      {/* Phone Frame Mockup */}
      <div className="relative w-[180px] h-[90px] border-[4px] border-[#222] bg-black rounded-[12px] shadow-2xl rotate-2 z-20 overflow-hidden flex items-center justify-center mt-4">
         <div 
           className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400)' }}
         />
         <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Foreground Sunflowers (Placeholder shapes or images) */}
      <div 
        className="absolute bottom-[-10px] left-[-20px] w-[100px] h-[100px] bg-cover bg-center rotate-[10deg] filter blur-[1px] z-30 drop-shadow-xl"
        style={{ backgroundImage: 'url(https://cdn.pixabay.com/photo/2014/04/05/11/40/sunflower-316620_1280.png)' }}
      />
      <div 
        className="absolute bottom-[-5px] right-[-15px] w-[90px] h-[90px] bg-cover bg-center rotate-[-15deg] filter blur-[2px] z-30 drop-shadow-xl"
        style={{ backgroundImage: 'url(https://cdn.pixabay.com/photo/2014/04/05/11/40/sunflower-316620_1280.png)' }}
      />

      {/* Music Player Mockup */}
      <div className="absolute bottom-2 left-6 right-6 h-[45px] bg-[#141414]/90 backdrop-blur-md rounded-xl shadow-xl z-40 flex items-center px-2">
        <div className="w-6 h-6 bg-white/20 rounded object-cover shadow-md" />
        <div className="ml-2 flex-1">
          <div className="w-12 h-1.5 bg-white/80 rounded-full mb-1" />
          <div className="w-8 h-1 bg-white/40 rounded-full" />
        </div>
        <div className="w-6 h-6 bg-[#eab308] rounded-full flex items-center justify-center shadow-[0_0_5px_rgba(234,179,8,0.5)]">
           <div className="w-2 h-2 bg-black rounded-[1px] ml-0.5" />
        </div>
      </div>
    </div>
  )
}
