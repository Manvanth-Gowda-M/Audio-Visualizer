export default function DreamyCollageThumb() {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#a5c9e2]">
      {/* Background Gradient & Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          background: 'linear-gradient(135deg, #a5c9e2 0%, #d4eaf7 50%, #90b8d6 100%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,rgba(130,170,200,0.6)_100%)] mix-blend-multiply" />

      {/* Side Images */}
      {/* Top Left */}
      <div className="absolute top-[10%] left-[5%] w-[35%] h-[20%] border-[3px] border-white rounded shadow-lg rotate-[-3deg] overflow-hidden bg-white">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>
      
      {/* Mid Left */}
      <div className="absolute top-[35%] left-[8%] w-[25%] h-[18%] border-[3px] border-white rounded shadow-lg rotate-[2deg] overflow-hidden bg-white">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-[20%] left-[5%] w-[30%] h-[22%] border-[3px] border-white rounded shadow-lg rotate-[-1deg] overflow-hidden bg-white">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>

      {/* Top Right */}
      <div className="absolute top-[30%] right-[5%] w-[30%] h-[20%] border-[3px] border-white rounded shadow-lg rotate-[4deg] overflow-hidden bg-white">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-[10%] right-[5%] w-[32%] h-[18%] border-[3px] border-white rounded shadow-lg rotate-[-2deg] overflow-hidden bg-white">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center" />
      </div>

      {/* Center Subject Outline Mock */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div 
           className="w-[80%] h-[80%] bg-contain bg-no-repeat bg-center"
           style={{ 
             backgroundImage: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600)',
             filter: 'drop-shadow(0px 0px 0px 4px #ffffff) drop-shadow(0px 10px 15px rgba(0,0,0,0.25))'
           }}
        />
      </div>

      {/* Decorative Text */}
      <div className="absolute top-[25%] right-[10%] z-20 font-['Dancing_Script',cursive] text-lg text-[#475569] rotate-[-5deg] leading-tight text-center">
        Collect beautiful<br/>moments<br/>
        <span className="text-sm">♡</span>
      </div>

      {/* Player Card */}
      <div className="absolute top-[5%] right-[5%] w-[160px] h-[60px] bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-xl z-30 flex items-center px-2">
        <div className="w-8 h-8 bg-black/20 rounded object-cover shadow-sm" />
        <div className="ml-2 flex-1">
          <div className="w-16 h-1.5 bg-white rounded-full mb-1" />
          <div className="w-10 h-1 bg-white/60 rounded-full" />
        </div>
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
           <div className="w-1.5 h-1.5 bg-[#82aac8] rounded-[1px] ml-[1px]" />
        </div>
      </div>
    </div>
  )
}
