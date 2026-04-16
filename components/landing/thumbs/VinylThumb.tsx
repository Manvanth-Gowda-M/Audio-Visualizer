'use client'
import { useEffect, useRef } from 'react'

export default function VinylThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W/2, cy = H/2
    let f = 0, raf: number
    const draw = () => {
      const t = f/60
      ctx.clearRect(0,0,W,H)
      ctx.fillStyle='#06040f'; ctx.fillRect(0,0,W,H)

      // aurora blobs
      const a1=ctx.createRadialGradient(cx*0.3,cy,0,cx*0.3,cy,W*0.55)
      a1.addColorStop(0,'rgba(129,140,248,0.22)'); a1.addColorStop(1,'transparent')
      ctx.fillStyle=a1; ctx.fillRect(0,0,W,H)
      const a2=ctx.createRadialGradient(cx*1.6,cy*0.4,0,cx*1.6,cy*0.4,W*0.4)
      a2.addColorStop(0,'rgba(236,72,153,0.12)'); a2.addColorStop(1,'transparent')
      ctx.fillStyle=a2; ctx.fillRect(0,0,W,H)

      // spinning vinyl
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*0.55)
      const dg=ctx.createRadialGradient(0,0,0,0,0,cy*0.72)
      dg.addColorStop(0,'#1c1c1c'); dg.addColorStop(0.5,'#111'); dg.addColorStop(1,'#050505')
      ctx.beginPath(); ctx.arc(0,0,cy*0.72,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill()
      // grooves
      for(let i=3;i<=16;i++){
        ctx.beginPath(); ctx.arc(0,0,i*(cy*0.72/18),0,Math.PI*2)
        ctx.strokeStyle='rgba(255,255,255,0.035)'; ctx.lineWidth=1; ctx.stroke()
      }
      // sheen
      ctx.beginPath(); ctx.ellipse(-18,-22,52,20,-0.5,0,Math.PI*2)
      ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=2; ctx.stroke()
      ctx.restore()

      // freq arcs — rainbow
      const vR=cy*0.72
      for(let i=0;i<56;i++){
        const a=(i/56)*Math.PI*2-Math.PI/2
        const val=0.12+0.75*Math.abs(Math.sin(t*2.2+i*0.2))
        const bh=val*20
        const hue=(i/56)*360
        ctx.beginPath()
        ctx.moveTo(cx+Math.cos(a)*(vR+3),cy+Math.sin(a)*(vR+3))
        ctx.lineTo(cx+Math.cos(a)*(vR+3+bh),cy+Math.sin(a)*(vR+3+bh))
        ctx.strokeStyle=`hsl(${hue},85%,62%)`; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke()
      }

      // label
      const lg=ctx.createRadialGradient(cx,cy,0,cx,cy,cy*0.22)
      lg.addColorStop(0,'rgba(129,140,248,0.6)'); lg.addColorStop(1,'rgba(99,102,241,0.15)')
      ctx.beginPath(); ctx.arc(cx,cy,cy*0.22,0,Math.PI*2); ctx.fillStyle=lg; ctx.fill()
      ctx.strokeStyle='rgba(129,140,248,0.6)'; ctx.lineWidth=1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fillStyle='#06040f'; ctx.fill()

      // text
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='bold 10px serif'
      ctx.textAlign='left'; ctx.textBaseline='middle'
      ctx.fillText('FAITHLESS',cx+cy*0.78,cy-10)
      ctx.fillStyle='rgba(129,140,248,0.8)'; ctx.font='8px sans-serif'
      ctx.fillText('Tale of Us',cx+cy*0.78,cy+5)

      f++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block"/>
}
