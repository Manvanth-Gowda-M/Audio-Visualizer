'use client'
import { useEffect, useRef } from 'react'

export default function CassetteThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W/2, cy = H/2
    let f = 0, raf: number
    const draw = () => {
      const t = f/60
      ctx.clearRect(0,0,W,H)
      // warm bg
      const bg=ctx.createLinearGradient(0,0,W,H)
      bg.addColorStop(0,'#0d0800'); bg.addColorStop(1,'#1a0e00')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      const gl=ctx.createRadialGradient(cx,cy,0,cx,cy,W*0.55)
      gl.addColorStop(0,'rgba(245,158,11,0.1)'); gl.addColorStop(1,'transparent')
      ctx.fillStyle=gl; ctx.fillRect(0,0,W,H)

      // cassette body
      const bx=14,by=H*0.18,bw=W-28,bh=H*0.62
      const bodyGrad=ctx.createLinearGradient(0,by,0,by+bh)
      bodyGrad.addColorStop(0,'#1e1a12'); bodyGrad.addColorStop(1,'#0e0c08')
      ctx.fillStyle=bodyGrad
      ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,8); ctx.fill()
      ctx.strokeStyle='rgba(245,158,11,0.35)'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,8); ctx.stroke()

      // label
      ctx.fillStyle='#0a0800'
      ctx.beginPath(); ctx.roundRect(bx+8,by+8,bw-16,bh*0.32,5); ctx.fill()
      ctx.fillStyle='rgba(245,158,11,0.95)'; ctx.font='bold 9px serif'
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText('AUDIO VISUALIZER',cx,by+bh*0.16)
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='7px sans-serif'
      ctx.fillText('Side A  ·  60 min',cx,by+bh*0.27)

      // tape window
      ctx.fillStyle='#060400'
      ctx.beginPath(); ctx.roundRect(cx-52,by+bh*0.44,104,bh*0.4,5); ctx.fill()
      ctx.strokeStyle='rgba(245,158,11,0.2)'; ctx.lineWidth=1
      ctx.beginPath(); ctx.roundRect(cx-52,by+bh*0.44,104,bh*0.4,5); ctx.stroke()

      // tape path
      const reelY=by+bh*0.64
      ctx.beginPath()
      ctx.moveTo(cx-26,reelY); ctx.quadraticCurveTo(cx,reelY+14,cx+26,reelY)
      ctx.strokeStyle='rgba(60,40,10,0.8)'; ctx.lineWidth=4; ctx.stroke()

      // spinning reels
      const spin=t*2.2
      const drawReel=(rx:number,rr:number,dir:number)=>{
        ctx.save(); ctx.translate(rx,reelY); ctx.rotate(spin*dir)
        const rg=ctx.createRadialGradient(0,0,0,0,0,rr)
        rg.addColorStop(0,'#2a2010'); rg.addColorStop(1,'#181008')
        ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2); ctx.fillStyle=rg; ctx.fill()
        ctx.strokeStyle='rgba(245,158,11,0.4)'; ctx.lineWidth=1; ctx.stroke()
        for(let s=0;s<5;s++){
          const a=(s/5)*Math.PI*2
          ctx.beginPath()
          ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4)
          ctx.lineTo(Math.cos(a)*(rr-3),Math.sin(a)*(rr-3))
          ctx.strokeStyle='rgba(245,158,11,0.25)'; ctx.lineWidth=1; ctx.stroke()
        }
        ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2)
        ctx.fillStyle='rgba(245,158,11,0.5)'; ctx.fill()
        ctx.restore()
      }
      drawReel(cx-28,13,1); drawReel(cx+28,13,-1)

      // VU meters — left side
      for(let i=0;i<6;i++){
        const val=0.2+0.7*Math.abs(Math.sin(t*3.2+i*0.85))
        const lit=Math.round(val*5)
        for(let j=0;j<5;j++){
          const isLit=j<lit
          ctx.fillStyle=j>=4?(isLit?'#ff4444':'#1a0808'):(isLit?`hsl(${40+j*8},90%,55%)`:'#1a1208')
          ctx.beginPath(); ctx.roundRect(bx+8+j*8,by+bh*0.44+i*9,6,6,1); ctx.fill()
        }
      }

      // progress bar
      const prog=Math.sin(t*0.55)*0.5+0.5
      ctx.fillStyle='#1a1208'
      ctx.beginPath(); ctx.roundRect(bx+8,by+bh+6,bw-16,3,2); ctx.fill()
      const pg=ctx.createLinearGradient(bx+8,0,bx+8+(bw-16)*prog,0)
      pg.addColorStop(0,'rgba(245,158,11,0.9)'); pg.addColorStop(1,'rgba(251,191,36,0.5)')
      ctx.fillStyle=pg
      ctx.beginPath(); ctx.roundRect(bx+8,by+bh+6,(bw-16)*prog,3,2); ctx.fill()

      f++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block"/>
}
