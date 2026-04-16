'use client'
import { useEffect, useRef } from 'react'

export default function CircleThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W/2, cy = H/2
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0,0,W,H)
      // bg
      ctx.fillStyle = '#06030f'; ctx.fillRect(0,0,W,H)
      const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,W*0.6)
      bg.addColorStop(0,'rgba(168,85,247,0.18)'); bg.addColorStop(0.5,'rgba(99,102,241,0.08)'); bg.addColorStop(1,'transparent')
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H)

      // spinning concentric rings (tunnel)
      for (let i=7;i>=1;i--) {
        const spin = t*(i%2===0?0.5:-0.35)*(i*0.12)
        const rad = (i/7)*cy*0.88
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(spin)
        ctx.beginPath(); ctx.arc(0,0,rad,0,Math.PI*2)
        ctx.strokeStyle = `rgba(168,85,247,${0.06+i*0.04})`
        ctx.lineWidth = i===1?2:1; ctx.stroke()
        if(i>=4){
          for(let j=0;j<24;j++){
            const a=(j/24)*Math.PI*2
            ctx.beginPath()
            ctx.moveTo(Math.cos(a)*(rad-2),Math.sin(a)*(rad-2))
            ctx.lineTo(Math.cos(a)*(rad+2),Math.sin(a)*(rad+2))
            ctx.strokeStyle='rgba(168,85,247,0.2)'; ctx.lineWidth=0.5; ctx.stroke()
          }
        }
        ctx.restore()
      }

      // outer freq bars — multi-color
      const outerR = cy*0.9
      const bars = 72
      for(let i=0;i<bars;i++){
        const a = (i/bars)*Math.PI*2 - Math.PI/2
        const val = 0.15 + 0.75*Math.abs(Math.sin(t*2.8+i*0.19))
        const bh = val*26
        const hue = (i/bars)*280+200
        const x1=cx+Math.cos(a)*outerR, y1=cy+Math.sin(a)*outerR
        const x2=cx+Math.cos(a)*(outerR+bh), y2=cy+Math.sin(a)*(outerR+bh)
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
        ctx.strokeStyle=`hsl(${hue},90%,65%)`; ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.stroke()
      }

      // particles
      for(let i=0;i<25;i++){
        const seed=i*137.5
        const px=cx+Math.cos(seed+t*0.25)*(28+(i%6)*16)
        const py=cy+Math.sin(seed*0.7+t*0.2)*(18+(i%5)*12)
        ctx.beginPath(); ctx.arc(px,py,1.2+(i%2),0,Math.PI*2)
        ctx.fillStyle=`rgba(${168+i*3},${85+i*2},247,${0.3+(i%4)*0.15})`; ctx.fill()
      }

      // center circle
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cy*0.26)
      cg.addColorStop(0,'rgba(168,85,247,0.5)'); cg.addColorStop(1,'rgba(99,102,241,0.1)')
      ctx.beginPath(); ctx.arc(cx,cy,cy*0.26,0,Math.PI*2)
      ctx.fillStyle=cg; ctx.fill()
      ctx.strokeStyle='rgba(168,85,247,0.7)'; ctx.lineWidth=1.5; ctx.stroke()
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font=`${cy*0.22}px serif`
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('♪',cx,cy)

      // bottom text
      ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,H*0.74,W,H*0.26)
      ctx.fillStyle='rgba(168,85,247,0.95)'; ctx.font='bold 10px monospace'
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('AUDIO VISUALIZER',cx,H*0.83)
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px sans-serif'
      ctx.fillText('Artist · Track Name',cx,H*0.92)

      f++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block"/>
}
