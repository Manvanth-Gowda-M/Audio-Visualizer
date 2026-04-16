'use client'
import { useEffect, useRef } from 'react'

export default function PosterThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    let f = 0, raf: number

    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Pastel gradient bg
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0,    '#f8f0ff')
      bg.addColorStop(0.3,  '#fce4f0')
      bg.addColorStop(0.6,  '#ede0ff')
      bg.addColorStop(1,    '#dce8ff')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Top waveform
      const bars = 60
      const bw = (W - 16) / bars - 1
      for (let i = 0; i < bars; i++) {
        const val = 0.15 + 0.65 * Math.abs(Math.sin(t * 2.5 + i * 0.22))
        const bh = val * H * 0.1
        const x = 8 + i * (bw + 1)
        const hue = 320 + (i / bars) * 80
        ctx.fillStyle = `hsl(${hue}, 80%, 65%)`
        ctx.beginPath()
        ctx.roundRect(x, 0, bw, bh, bw / 2)
        ctx.fill()
      }

      // Bottom waveform
      for (let i = 0; i < bars; i++) {
        const val = 0.15 + 0.65 * Math.abs(Math.sin(t * 2.5 + i * 0.22 + 1))
        const bh = val * H * 0.1
        const x = 8 + i * (bw + 1)
        const hue = 320 + (i / bars) * 80
        ctx.fillStyle = `hsl(${hue}, 80%, 65%)`
        ctx.beginPath()
        ctx.roundRect(x, H - bh, bw, bh, bw / 2)
        ctx.fill()
      }

      // Vinyl
      const vR = H * 0.28
      const vCX = W * 0.3, vCY = H * 0.5
      ctx.save()
      ctx.translate(vCX, vCY)
      ctx.rotate(t * 0.5)
      const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, vR)
      vg.addColorStop(0, '#2a2a2a'); vg.addColorStop(1, '#111')
      ctx.beginPath(); ctx.arc(0, 0, vR, 0, Math.PI * 2)
      ctx.fillStyle = vg; ctx.fill()
      for (let i = 3; i <= 10; i++) {
        ctx.beginPath(); ctx.arc(0, 0, vR * (i / 11), 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1; ctx.stroke()
      }
      ctx.beginPath(); ctx.arc(0, 0, vR * 0.18, 0, Math.PI * 2)
      ctx.fillStyle = '#3a2a5a'; ctx.fill()
      ctx.beginPath(); ctx.arc(0, 0, vR * 0.05, 0, Math.PI * 2)
      ctx.fillStyle = '#111'; ctx.fill()
      ctx.restore()

      // Artwork
      const aSize = H * 0.52
      const aX = W * 0.08, aY = (H - aSize) / 2
      ctx.shadowColor = 'rgba(100,60,140,0.3)'; ctx.shadowBlur = 12
      ctx.fillStyle = 'rgba(180,160,210,0.4)'
      ctx.beginPath(); ctx.roundRect(aX, aY, aSize, aSize, 6); ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(120,80,180,0.3)'; ctx.font = `${aSize * 0.35}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♪', aX + aSize / 2, aY + aSize / 2)

      // Text right
      const tx = W * 0.56
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#7c3aed'; ctx.font = `bold ${H * 0.07}px sans-serif`
      ctx.fillText('FAITHLESS', tx, H * 0.38)
      ctx.fillStyle = '#2d1b4e'; ctx.font = `300 ${H * 0.1}px sans-serif`
      ctx.fillText('TALE OF US', tx, H * 0.52)

      // Pill
      const pillW = W * 0.28, pillH = H * 0.1
      const pillX = tx, pillY = H * 0.56
      const pg = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0)
      pg.addColorStop(0, '#7c3aed'); pg.addColorStop(1, '#ec4899')
      ctx.fillStyle = pg
      ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = `600 ${H * 0.055}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('ALBUM · LOVE', pillX + pillW / 2, pillY + pillH / 2)

      // Neumorphic buttons
      const btnY2 = H * 0.82
      const btns = [W * 0.62, W * 0.72, W * 0.82]
      const sizes = [H * 0.09, H * 0.11, H * 0.09]
      btns.forEach((bx, i) => {
        const r = sizes[i] / 2
        ctx.shadowColor = 'rgba(160,120,200,0.35)'; ctx.shadowBlur = 6
        ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3
        ctx.fillStyle = '#ede8f8'
        ctx.beginPath(); ctx.arc(bx, btnY2, r, 0, Math.PI * 2); ctx.fill()
        ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowOffsetX = -2; ctx.shadowOffsetY = -2
        ctx.fill()
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0
      })

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
