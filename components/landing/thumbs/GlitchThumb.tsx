'use client'
import { useEffect, useRef } from 'react'

export default function GlitchThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W/2, cy = H/2
    let f = 0, raf: number
    const draw = () => {
      const t = f/60
      ctx.clearRect(0,0,W,H)
      ctx.fillStyle='#050000'; ctx.fillRect(0,0,W,H)

      // scanlines
      for(let y=0;y<H;y+=4){
        ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(0,y,W,2)
      }

      // RGB shift bg layers
      const glitch=0.4+Math.abs(Math.sin(t*4))*5
      ctx.save(); ctx.globalAlpha=0.12
      ctx.fillStyle='#ff0055'; ctx.fillRect(-glitch,0,W,H)
      ctx.fillStyle='#00ffff'; ctx.fillRect(glitch,0,W,H)
      ctx.restore()

      // spectrum bars — full rainbow
      const gc=52
      for(let i=0;i<gc;i++){
        const val=0.08+0.82*Math.abs(Math.sin(t*3.8+i*0.27+Math.sin(t*1.2)*0.4))
        const bh=val*H*0.58
        const hue=(i/gc)*360
        const grad=ctx.createLinearGradient(0,H-bh,0,H)
        grad.addColorStop(0,`hsla(${hue},100%,65%,0.9)`)
        grad.addColorStop(1,`hsla(${hue+40},100%,45%,0.4)`)
        ctx.fillStyle=grad
        ctx.fillRect(i*(W/gc)+1,H-bh,W/gc-2,bh)
      }

      // glitch slices
      if(Math.sin(t*9)>0.4){
        const sy=Math.abs(Math.sin(t*14))*H
        ctx.fillStyle='rgba(244,63,94,0.15)'; ctx.fillRect(0,sy,W,5+Math.abs(Math.sin(t*6))*12)
      }
      if(Math.sin(t*7+1)>0.5){
        const sy2=Math.abs(Math.sin(t*11+2))*H
        ctx.fillStyle='rgba(0,255,255,0.1)'; ctx.fillRect(0,sy2,W,3+Math.abs(Math.sin(t*8))*8)
      }

      // center box — triple RGB border
      ctx.strokeStyle='rgba(244,63,94,0.9)'; ctx.lineWidth=2
      ctx.strokeRect(cx-42,cy-42,84,84)
      ctx.strokeStyle='rgba(0,255,255,0.6)'; ctx.lineWidth=1
      ctx.strokeRect(cx-42+glitch*0.4,cy-42,84,84)
      ctx.strokeStyle='rgba(255,255,0,0.3)'; ctx.lineWidth=1
      ctx.strokeRect(cx-42-glitch*0.3,cy-42,84,84)
      ctx.fillStyle='rgba(244,63,94,0.08)'; ctx.fillRect(cx-42,cy-42,84,84)

      // glitch text
      ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillStyle='rgba(0,255,255,0.7)'; ctx.fillText('GLITCH',cx+glitch*0.5,cy)
      ctx.fillStyle='rgba(255,0,85,0.7)'; ctx.fillText('GLITCH',cx-glitch*0.4,cy)
      ctx.fillStyle='#fff'; ctx.fillText('GLITCH',cx,cy)

      f++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block"/>
}
