'use client'
import { useEffect, useRef } from 'react'

export default function CinematicThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W / 2, cy = H / 2
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Cinematic dark bg with warm amber glow
      ctx.fillStyle = '#0a0500'; ctx.fillRect(0, 0, W, H)
      const g1 = ctx.createRadialGradient(cx * 0.5, cy * 1.2, 0, cx * 0.5, cy * 1.2, W * 0.7)
      g1.addColorStop(0, 'rgba(255,138,0,0.18)'); g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Cinematic bars (letterbox)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 22)
      ctx.fillStyle = '#000'; ctx.fillRect(0, H - 22, W, 22)

      // Spinning vinyl record — large, centered
      ctx.save(); ctx.translate(cx, cy + 10); ctx.rotate(t * 0.7)
      const vgrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cy * 0.8)
      vgrad.addColorStop(0, '#1a0d00'); vgrad.addColorStop(0.4, '#0d0800'); vgrad.addColorStop(1, '#050200')
      ctx.beginPath(); ctx.arc(0, 0, cy * 0.8, 0, Math.PI * 2)
      ctx.fillStyle = vgrad; ctx.fill()

      // Groove rings
      for (let i = 3; i <= 20; i++) {
        ctx.beginPath(); ctx.arc(0, 0, i * (cy * 0.8 / 22), 0, Math.PI * 2)
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(255,138,0,0.08)' : 'rgba(255,255,255,0.025)'
        ctx.lineWidth = 1; ctx.stroke()
      }

      // Warm amber sheen on vinyl
      ctx.beginPath(); ctx.ellipse(-15, -20, 55, 18, -0.4, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,160,60,0.1)'; ctx.lineWidth = 3; ctx.stroke()
      ctx.restore()

      // Frequency arcs around record — warm orange/amber
      const vR = cy * 0.8
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2
        const val = 0.1 + 0.7 * Math.abs(Math.sin(t * 2.4 + i * 0.18))
        const bh = val * 22
        const hue = 25 + (i / 60) * 30  // warm range
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * (vR + 4), cy + 10 + Math.sin(a) * (vR + 4))
        ctx.lineTo(cx + Math.cos(a) * (vR + 4 + bh), cy + 10 + Math.sin(a) * (vR + 4 + bh))
        ctx.strokeStyle = `hsl(${hue},90%,58%)`; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke()
      }

      // Center label — amber glow
      const lg = ctx.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, cy * 0.2)
      lg.addColorStop(0, 'rgba(255,138,0,0.6)'); lg.addColorStop(1, 'rgba(180,80,0,0.15)')
      ctx.beginPath(); ctx.arc(cx, cy + 10, cy * 0.2, 0, Math.PI * 2)
      ctx.fillStyle = lg; ctx.fill()
      ctx.strokeStyle = 'rgba(255,138,0,0.8)'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy + 10, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#0a0500'; ctx.fill()

      // Text overlay
      ctx.fillStyle = 'rgba(255,200,100,0.95)'; ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('FAITHLESS', cx, cy + 10 - 4)
      ctx.fillStyle = 'rgba(255,138,0,0.7)'; ctx.font = '7px sans-serif'
      ctx.fillText('Tale of Us', cx, cy + 10 + 6)

      // Film grain overlay
      if (f % 3 === 0) {
        ctx.globalAlpha = 0.03
        for (let px = 0; px < 60; px++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
          ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
        }
        ctx.globalAlpha = 1
      }

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
