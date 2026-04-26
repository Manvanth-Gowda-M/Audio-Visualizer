export default function MuseumGalleryThumb() {
  return (
    <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-2 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950" />
      
      {/* Spotlight */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-60 bg-white/5 blur-3xl rounded-full" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-40 bg-gradient-to-b from-yellow-100/10 to-transparent" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />

      <div className="w-24 h-28 bg-black border-4 border-zinc-700 rounded shadow-2xl flex items-center justify-center relative z-10 mb-2">
        <div className="absolute inset-0 border border-white/10 m-1" />
        <div className="w-16 h-20 bg-zinc-800 rounded-sm" />
      </div>

      <div className="w-20 h-4 bg-zinc-800 border border-zinc-700 rounded-sm z-10 flex flex-col items-center justify-center mt-2 shadow-lg">
         <div className="w-12 h-0.5 bg-zinc-500 rounded-full mb-0.5" />
         <div className="w-8 h-0.5 bg-zinc-600 rounded-full" />
      </div>
    </div>
  )
}
