'use client'
import { useEffect, useRef } from 'react'

export default function ApplePlayerThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    // Canvas is 320x180 (16:9) but we draw a 9:16 card centered
    const W = c.width, H = c.height
    let f = 0, raf: number

    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // BG — dark blurred gradient
      const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7)
      bg.addColorStop(0, 'rgba(40,35,30,1)')
      bg.addColorStop(1, 'rgba(10,10,12,1)')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Blurred artwork bg simulation
      ctx.fillStyle = 'rgba(60,50,40,0.4)'; ctx.fillRect(0, 0, W, H)

      // Card dimensions — portrait card centered
      const cW = W * 0.58, cH = H * 0.92
      const cX = (W - cW) / 2, cY = (H - cH) / 2

      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 20
      ctx.fillStyle = 'rgba(28,28,30,0.82)'
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 12); ctx.fill()
      ctx.shadowBlur = 0

      // Card border
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 12); ctx.stroke()

      // Artwork area (top 52% of card)
      const artH = cH * 0.52
      ctx.save()
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, artH, [12, 12, 0, 0]); ctx.clip()
      // Artwork placeholder gradient
      const ag = ctx.createLinearGradient(cX, cY, cX + cW, cY + artH)
      ag.addColorStop(0, '#2a2520'); ag.addColorStop(0.5, '#1a1510'); ag.addColorStop(1, '#0e0c0a')
      ctx.fillStyle = ag; ctx.fillRect(cX, cY, cW, artH)
      // Slow scale breathe
      const scale = 1 + 0.015 * Math.sin(t * 0.4 * Math.PI)
      ctx.save(); ctx.translate(cX + cW/2, cY + artH/2); ctx.scale(scale, scale)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath(); ctx.arc(0, 0, cW*0.3, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.beginPath(); ctx.arc(0, 0, cW*0.18, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `${cW*0.18}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♪', 0, 0)
      ctx.restore()
      // Bottom fade
      const fade = ctx.createLinearGradient(0, cY+artH-20, 0, cY+artH)
      fade.addColorStop(0, 'transparent'); fade.addColorStop(1, 'rgba(28,28,30,0.95)')
      ctx.fillStyle = fade; ctx.fillRect(cX, cY+artH-20, cW, 20)
      ctx.restore()

      const pad = cW * 0.1
      const textY = cY + artH + cH * 0.04

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = `${cW*0.075}px -apple-system,sans-serif`
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText('Now Playing', cX + pad, textY)

      // Title
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = `bold ${cW*0.115}px -apple-system,sans-serif`
      ctx.fillText('The Greatest', cX + pad, textY + cH*0.055)

      // Artist
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `${cW*0.09}px -apple-system,sans-serif`
      ctx.fillText('Sia', cX + pad, textY + cH*0.13)

      // Progress bar
      const prog = (Math.sin(t * 0.35) * 0.5 + 0.5) * 0.4 + 0.05
      const barY = cY + artH + cH * 0.285
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.roundRect(cX+pad, barY, cW-pad*2, 2, 1); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.beginPath(); ctx.roundRect(cX+pad, barY, (cW-pad*2)*prog, 2, 1); ctx.fill()
      // Scrubber dot
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cX+pad+(cW-pad*2)*prog, barY+1, 4, 0, Math.PI*2); ctx.fill()
      // Timestamps
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = `${cW*0.07}px -apple-system,sans-serif`
      ctx.textAlign = 'left'; ctx.fillText('0:21', cX+pad, barY+8)
      ctx.textAlign = 'right'; ctx.fillText('-3:10', cX+cW-pad, barY+8)

      // Controls row
      const ctrlY = cY + artH + cH * 0.44
      const ctrlCX = cX + cW/2
      // Rewind
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.beginPath(); ctx.moveTo(ctrlCX-cW*0.22, ctrlY-7); ctx.lineTo(ctrlCX-cW*0.22+10, ctrlY); ctx.lineTo(ctrlCX-cW*0.22, ctrlY+7); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(ctrlCX-cW*0.22-6, ctrlY-7); ctx.lineTo(ctrlCX-cW*0.22+4, ctrlY); ctx.lineTo(ctrlCX-cW*0.22-6, ctrlY+7); ctx.closePath(); ctx.fill()
      // Pause
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.beginPath(); ctx.roundRect(ctrlCX-8, ctrlY-9, 6, 18, 2); ctx.fill()
      ctx.beginPath(); ctx.roundRect(ctrlCX+2, ctrlY-9, 6, 18, 2); ctx.fill()
      // Forward
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.beginPath(); ctx.moveTo(ctrlCX+cW*0.22, ctrlY-7); ctx.lineTo(ctrlCX+cW*0.22-10, ctrlY); ctx.lineTo(ctrlCX+cW*0.22, ctrlY+7); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(ctrlCX+cW*0.22+6, ctrlY-7); ctx.lineTo(ctrlCX+cW*0.22-4, ctrlY); ctx.lineTo(ctrlCX+cW*0.22+6, ctrlY+7); ctx.closePath(); ctx.fill()

      // Volume bar
      const volY = cY + artH + cH * 0.6
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.roundRect(cX+pad+14, volY, cW-pad*2-28, 2, 1); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.beginPath(); ctx.roundRect(cX+pad+14, volY, (cW-pad*2-28)*0.7, 2, 1); ctx.fill()
      // Vol icons
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `${cW*0.08}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('◁', cX+pad+6, volY+1)
      ctx.fillText('▷', cX+cW-pad-6, volY+1)

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
