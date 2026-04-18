'use client'
import { useEffect, useRef } from 'react'

export default function WaveformThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W/2, cy = H/2
    let f = 0, raf: number
    const draw = () => {
      const t = f/60
      ctx.clearRect(0,0,W,H)
      // bg gradient
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#020a06'); bg.addColorStop(1,'rgba(16,185,129,0.1)')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      // bars — gradient per bar, mirrored
      const bCount=60, bw=(W-16)/bCount
      for(let i=0;i<bCount;i++){
        const val=0.08+0.82*Math.abs(Math.sin(t*2.6+i*0.21+Math.cos(t*0.8+i*0.05)*0.5))
        const bh=val*(H*0.4)
        const x=8+i*bw
        const hue=140+(i/bCount)*60
        const grad=ctx.createLinearGradient(0,cy-bh,0,cy)
        grad.addColorStop(0,`hsl(${hue},90%,60%)`)
        grad.addColorStop(1,`hsl(${hue+30},70%,40%)`)
        ctx.fillStyle=grad
        ctx.beginPath(); ctx.roundRect(x,cy-bh,bw-1,bh,2); ctx.fill()
        // mirror
        const mg=ctx.createLinearGradient(0,cy,0,cy+bh*0.45)
        mg.addColorStop(0,`hsla(${hue},80%,50%,0.35)`)
        mg.addColorStop(1,`hsla(${hue},80%,50%,0)`)
        ctx.fillStyle=mg
        ctx.beginPath(); ctx.roundRect(x,cy,bw-1,bh*0.45,2); ctx.fill()
      }

      // center artwork box with glow
      ctx.shadowColor='rgba(16,185,129,0.5)'; ctx.shadowBlur=16
      ctx.strokeStyle='rgba(16,185,129,0.6)'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.roundRect(cx-28,cy-H*0.38,56,56,8); ctx.stroke()
      ctx.shadowBlur=0
      ctx.fillStyle='rgba(16,185,129,0.12)'
      ctx.beginPath(); ctx.roundRect(cx-28,cy-H*0.38,56,56,8); ctx.fill()
      ctx.fillStyle='rgba(16,185,129,0.8)'; ctx.font=`22px serif`
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('♪',cx,cy-H*0.38+28)

      // progress bar
      const prog=Math.sin(t*0.5)*0.5+0.5
      ctx.fillStyle='rgba(255,255,255,0.06)'
      ctx.beginPath(); ctx.roundRect(16,H-16,W-32,3,2); ctx.fill()
      const pg=ctx.createLinearGradient(16,0,16+(W-32)*prog,0)
      pg.addColorStop(0,'rgba(16,185,129,0.9)'); pg.addColorStop(1,'rgba(52,211,153,0.5)')
      ctx.fillStyle=pg
      ctx.beginPath(); ctx.roundRect(16,H-16,(W-32)*prog,3,2); ctx.fill()

      f++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block"/>
}
