export default function VintageScrapbookThumb() {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#e8ddcb]">
      {/* Background Paper */}
      <div 
        className="absolute inset-[-10%] bg-cover bg-center opacity-60 mix-blend-multiply"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1603504344437-02ff49fcfaee?auto=format&fit=crop&q=80&w=600)',
        }}
      />
      
      {/* Earphones */}
      <div 
        className="absolute top-[-5%] left-[5%] w-[150px] h-[150px] bg-contain bg-no-repeat rotate-[-15deg]"
        style={{ 
          backgroundImage: 'url(https://cdn.pixabay.com/photo/2014/04/02/14/08/headphones-306282_1280.png)',
          filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.3)) hue-rotate(180deg) invert(0.8)'
        }}
      />

      {/* Piano */}
      <div 
        className="absolute top-[40%] right-[10%] w-[180px] h-[100px] bg-contain bg-no-repeat rotate-[25deg]"
        style={{ 
          backgroundImage: 'url(https://cdn.pixabay.com/photo/2013/07/13/11/52/piano-158866_1280.png)',
          filter: 'drop-shadow(5px 8px 10px rgba(0,0,0,0.3)) sepia(0.3)'
        }}
      />

      {/* Cassette Stack */}
      <div className="absolute bottom-[5%] right-[5%] w-[120px] rotate-[-4deg]">
         <img src="https://cdn.pixabay.com/photo/2013/07/12/18/17/cassette-153205_1280.png" className="w-full drop-shadow-lg sepia-[0.6] hue-rotate-[-20deg]" />
         <img src="https://cdn.pixabay.com/photo/2013/07/12/18/17/cassette-153205_1280.png" className="w-full -mt-[40px] rotate-[2deg] drop-shadow-lg sepia-[0.4] hue-rotate-[40deg]" />
      </div>

      {/* Vinyl */}
      <div className="absolute bottom-[10%] left-[5%] w-[200px] h-[200px]">
         <div className="absolute inset-2 rounded-full bg-black/40 blur-md translate-y-3" />
         <img src="https://cdn.pixabay.com/photo/2014/04/03/10/32/record-310869_1280.png" className="w-full h-full object-contain relative" />
         <div className="absolute top-[50%] left-[50%] w-[60px] h-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white overflow-hidden bg-white">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200')] bg-cover sepia-[0.3]" />
         </div>
      </div>

      {/* Text Cutouts */}
      <div className="absolute top-[35%] left-[30%] rotate-[-2deg] flex flex-col items-start">
         <div className="bg-[#f1ebd9] text-[#2d2d2d] px-2 py-0.5 font-mono text-sm font-bold shadow">dream a little</div>
         <div className="bg-[#f1ebd9] text-[#2d2d2d] px-2 py-0.5 font-mono text-sm font-bold shadow mt-1 ml-3">dream of me</div>
      </div>

      {/* Player Card (Volume HUD) */}
      <div className="absolute top-[10%] right-[10%] w-[100px] h-[100px] bg-white/70 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center shadow-xl border-t border-white/80">
        <span className="text-[10px] font-medium text-gray-700 mb-2">Headphones</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#555" className="mb-3">
           <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <div className="flex gap-[2px] px-3 w-full">
           {[...Array(16)].map((_, i) => (
              <div key={i} className={`flex-1 h-[4px] rounded-[1px] ${i < 10 ? 'bg-[#555]' : 'bg-black/10'}`} />
           ))}
        </div>
      </div>
    </div>
  )
}
