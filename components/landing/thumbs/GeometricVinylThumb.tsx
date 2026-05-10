export default function GeometricVinylThumb() {
  const numLines = 14
  const cx = 150
  const cy = 200
  const baseR = 15
  const spacing = 8

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#161b2c] flex items-center justify-center">
      <svg width="300" height="400" viewBox="0 0 300 400">
        <defs>
           <linearGradient id="thumbGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="20%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
           </linearGradient>
        </defs>

        {/* Lines */}
        {Array.from({ length: numLines }).map((_, i) => {
           const r = baseR + i * spacing
           
           const normalizedI = i / (numLines - 1)
           const profile = Math.sin(normalizedI * Math.PI * 0.8 + 0.2)
           const baseH = 20 + profile * 100
           
           // Static waveform simulation
           const audioH = Math.sin(i * 1234) * 15 + 15
           const totalH = baseH + audioH

           const d = `
              M ${cx - r} ${cy - totalH} 
              L ${cx - r} ${cy} 
              A ${r} ${r} 0 0 0 ${cx + r} ${cy} 
              L ${cx + r} ${cy - totalH}
           `

           return (
              <path 
                 key={i}
                 d={d}
                 fill="none"
                 stroke="url(#thumbGrad)"
                 strokeWidth="3"
                 strokeLinecap="round"
              />
           )
        })}

        {/* Center */}
        <circle cx={cx} cy={cy} r={baseR - 4} fill="#fcd34d" />
        <circle cx={cx} cy={cy} r="3" fill="#161b2c" />
      </svg>
    </div>
  )
}
