'use client'
import { useEffect, useRef } from 'react'

export default function RetroCassetteThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W / 2, cy = H / 2
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Teal/cyan retro bg
      ctx.fillStyle = '#030e14'; ctx.fillRect(0, 0, W, H)
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55)
      g1.addColorStop(0, 'rgba(109,213,237,0.1)'); g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Cassette tape body
      const bw = W * 0.72, bh = H * 0.52
      const bx = cx - bw / 2, by = cy - bh / 2 - 4
      // outer body
      ctx.fillStyle = '#0c1f28'; ctx.fillRect(bx, by, bw, bh)
      ctx.strokeStyle = 'rgba(109,213,237,0.5)'; ctx.lineWidth = 1.5
      ctx.strokeRect(bx, by, bw, bh)

      // Tape window cutout (center rectangle)
      const wx = bx + 16, wy = by + 12, ww = bw - 32, wh = bh - 30
      ctx.fillStyle = '#050f15'; ctx.fillRect(wx, wy, ww, wh)
      ctx.strokeStyle = 'rgba(109,213,237,0.2)'; ctx.lineWidth = 1
      ctx.strokeRect(wx, wy, ww, wh)

      // Left reel
      const r1x = cx - 34, r1y = by + bh / 2 - 2
      ctx.save(); ctx.translate(r1x, r1y); ctx.rotate(t * 1.8)
      ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2)
      ctx.fillStyle = '#0c1f28'; ctx.fill()
      ctx.strokeStyle = 'rgba(109,213,237,0.4)'; ctx.lineWidth = 1.5; ctx.stroke()
      for (let s = 0; s < 6; s++) {
        const sa = (s / 6) * Math.PI * 2
        ctx.beginPath(); ctx.moveTo(Math.cos(sa) * 5, Math.sin(sa) * 5)
        ctx.lineTo(Math.cos(sa) * 16, Math.sin(sa) * 16)
        ctx.strokeStyle = 'rgba(109,213,237,0.3)'; ctx.lineWidth = 1.5; ctx.stroke()
      }
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#6dd5ed'; ctx.fill()
      ctx.restore()

      // Right reel
      const r2x = cx + 34, r2y = r1y
      ctx.save(); ctx.translate(r2x, r2y); ctx.rotate(-t * 1.8)
      ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2)
      ctx.fillStyle = '#0c1f28'; ctx.fill()
      ctx.strokeStyle = 'rgba(109,213,237,0.4)'; ctx.lineWidth = 1.5; ctx.stroke()
      for (let s = 0; s < 6; s++) {
        const sa = (s / 6) * Math.PI * 2
        ctx.beginPath(); ctx.moveTo(Math.cos(sa) * 5, Math.sin(sa) * 5)
        ctx.lineTo(Math.cos(sa) * 16, Math.sin(sa) * 16)
        ctx.strokeStyle = 'rgba(109,213,237,0.3)'; ctx.lineWidth = 1.5; ctx.stroke()
      }
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#6dd5ed'; ctx.fill()
      ctx.restore()

      // Tape line connecting reels
      ctx.beginPath()
      ctx.moveTo(r1x, r1y + 5); ctx.quadraticCurveTo(cx, r1y + 16, r2x, r2y + 5)
      ctx.strokeStyle = 'rgba(109,213,237,0.3)'; ctx.lineWidth = 1.5; ctx.stroke()

      // Label area (top of cassette)
      const lx = bx + 8, ly = by + 4, lw = bw - 16, lh = 10
      ctx.fillStyle = 'rgba(109,213,237,0.08)'; ctx.fillRect(lx, ly, lw, lh)
      ctx.fillStyle = 'rgba(109,213,237,0.8)'; ctx.font = 'bold 7px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('FAITHLESS · TALE OF US', cx, ly + lh / 2)

      // Waveform below cassette
      const wby2 = by + bh + 8
      const wbCount = 36
      for (let i = 0; i < wbCount; i++) {
        const val = 0.2 + 0.7 * Math.abs(Math.sin(t * 3 + i * 0.26))
        const bht = val * 18
        const alpha = 0.3 + val * 0.5
        ctx.fillStyle = `rgba(109,213,237,${alpha})`
        ctx.fillRect(bx + i * (bw / wbCount), wby2 + (18 - bht), bw / wbCount - 1, bht)
      }

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
