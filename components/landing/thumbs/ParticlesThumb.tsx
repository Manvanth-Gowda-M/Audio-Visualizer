'use client'
import { useEffect, useRef } from 'react'

export default function ParticlesThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W/2, cy = H/2
    let f = 0, raf: number
    const draw = () => {
      const t = f/60
      ctx.clearRect(0,0,W,H)
      ctx.fillStyle='#02020f'; ctx.fillRect(0,0,W,H)

      // bass pulse rings
      for(let r=0;r<3;r++){
        const pulse=0.4+Math.abs(Math.sin(t*1.8+r*1.2))*0.55
        const pr=ctx.createRadialGradient(cx,cy,0,cx,cy,cy*pulse*(0.6+r*0.2))
        pr.addColorStop(0,`rgba(99,102,241,${0.18-r*0.04})`)
        pr.addColorStop(1,'transparent')
        ctx.fillStyle=pr; ctx.fillRect(0,0,W,H)
      }

      // outer ring
      ctx.beginPath(); ctx.arc(cx,cy,cy*0.84,0,Math.PI*2)
      ctx.strokeStyle='rgba(99,102,241,0.15)'; ctx.lineWidth=1; ctx.stroke()

      // particles — multi-color orbiting
      for(let i=0;i<70;i++){
        const seed=i*137.5
        const angle=(seed%360)*(Math.PI/180)
        const dist=18+(i%8)*13*(0.7+Math.abs(Math.sin(t*1.8))*0.3)
        const px=cx+Math.cos(angle+t*(0.3+i%3*0.1))*dist
        const py=cy+Math.sin(angle+t*(0.25+i%4*0.08))*dist
        const size=1+(i%3)*0.7
        const hue=(i/70)*360
        ctx.beginPath(); ctx.arc(px,py,size,0,Math.PI*2)
        ctx.fillStyle=`hsla(${hue},80%,65%,${0.25+(i%5)*0.12})`; ctx.fill()
      }

      // center glow circle
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cy*0.28)
      cg.addColorStop(0,'rgba(99,102,241,0.55)'); cg.addColorStop(0.6,'rgba(139,92,246,0.2)'); cg.addColorStop(1,'transparent')
      ctx.beginPath(); ctx.arc(cx,cy,cy*0.28,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill()
      ctx.strokeStyle='rgba(139,92,246,0.6)'; ctx.lineWidth=1.5; ctx.stroke()
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font=`${cy*0.2}px serif`
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('♪',cx,cy)

      // trailing streaks
      for(let i=0;i<12;i++){
        const a=(i/12)*Math.PI*2+t*0.4
        const r1=cy*0.3, r2=cy*0.55
        ctx.beginPath()
        ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1)
        ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2)
        const hue=(i/12)*360
        ctx.strokeStyle=`hsla(${hue},80%,60%,0.15)`; ctx.lineWidth=1; ctx.stroke()
      }

      f++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block"/>
}
