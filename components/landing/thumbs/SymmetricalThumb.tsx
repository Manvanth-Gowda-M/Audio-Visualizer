'use client'
import { useEffect, useRef } from 'react'

export default function SymmetricalThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W / 2, cy = H / 2
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Deep black bg with center glow
      ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, W, H)
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.4)
      g1.addColorStop(0, 'rgba(255,255,255,0.07)'); g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Center album art circle
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.4)
      const ag = ctx.createRadialGradient(0, 0, 0, 0, 0, 28)
      ag.addColorStop(0, '#2a2a3a'); ag.addColorStop(1, '#0f0f18')
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2)
      ctx.fillStyle = ag; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.restore()

      // Symmetrical spectrum bars — mirrored left/right
      const bars = 40
      for (let i = 0; i < bars; i++) {
        const val = 0.08 + 0.85 * Math.abs(Math.sin(t * 2.8 + i * 0.22 + Math.sin(t * 1.4) * 0.5))
        const bh = val * (cy - 30)
        const bw = (cx - 40) / bars
        const x1 = cx - 40 - i * bw  // left bar
        const x2 = cx + 40 + i * bw  // right bar
        const y = cy - bh / 2
        const alpha = 0.5 + val * 0.45

        // White bars — left and right mirrored
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fillRect(x1 - bw + 1, y, bw - 1.5, bh)
        ctx.fillRect(x2, y, bw - 1.5, bh)
      }

      // Horizontal center line (the axis)
      const gl = ctx.createLinearGradient(0, cy, W, cy)
      gl.addColorStop(0, 'transparent'); gl.addColorStop(0.5, 'rgba(255,255,255,0.25)'); gl.addColorStop(1, 'transparent')
      ctx.fillStyle = gl; ctx.fillRect(0, cy - 0.5, W, 1)

      // Bottom metadata strip
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(0, H - 28, W, 28)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('FAITHLESS', cx, H - 18)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px sans-serif'
      ctx.fillText('Center Wave · Symmetrical', cx, H - 8)

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
