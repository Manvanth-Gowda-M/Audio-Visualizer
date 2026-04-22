'use client'
import { useEffect, useRef } from 'react'

export default function RetroThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W / 2
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Retro flat UI background — dusty pink/cream
      ctx.fillStyle = '#1a0d16'; ctx.fillRect(0, 0, W, H)
      const g1 = ctx.createRadialGradient(cx, H * 0.3, 0, cx, H * 0.3, W * 0.6)
      g1.addColorStop(0, 'rgba(255,182,193,0.12)'); g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Player card — flat retro rectangle
      const px = 20, py = 16, pw = W - 40, ph = H - 32
      ctx.fillStyle = '#0f080d'; ctx.fillRect(px, py, pw, ph)
      ctx.strokeStyle = 'rgba(255,182,193,0.3)'; ctx.lineWidth = 1.5
      ctx.strokeRect(px, py, pw, ph)

      // Album art square (left)
      const artX = px + 12, artY = py + 12, artS = ph - 24
      const artG = ctx.createLinearGradient(artX, artY, artX + artS, artY + artS)
      artG.addColorStop(0, '#2d1a24'); artG.addColorStop(1, '#1a0d16')
      ctx.fillStyle = artG; ctx.fillRect(artX, artY, artS, artS)
      // Retro circle on art
      ctx.beginPath(); ctx.arc(artX + artS / 2, artY + artS / 2, artS * 0.35, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,182,193,0.4)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath(); ctx.arc(artX + artS / 2, artY + artS / 2, artS * 0.12, 0, Math.PI * 2)
      ctx.fillStyle = '#ffb6c1'; ctx.fill()
      // Music note
      ctx.fillStyle = 'rgba(255,182,193,0.6)'; ctx.font = `${artS * 0.3}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♪', artX + artS / 2, artY + artS / 2)

      // Text info — right side
      const tx = artX + artS + 12
      ctx.fillStyle = 'rgba(255,182,193,0.9)'; ctx.font = 'bold 13px monospace'
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText('FAITHLESS', tx, py + 16)
      ctx.fillStyle = 'rgba(255,182,193,0.4)'; ctx.font = '9px monospace'
      ctx.fillText('Tale of Us', tx, py + 32)

      // Progress bar
      const barY = py + ph - 26
      ctx.fillStyle = 'rgba(255,182,193,0.1)'; ctx.fillRect(tx, barY, W - tx - 24, 4)
      const prog = 0.4 + Math.sin(t * 0.3) * 0.15
      ctx.fillStyle = '#ffb6c1'; ctx.fillRect(tx, barY, (W - tx - 24) * prog, 4)
      // Progress knob
      ctx.beginPath(); ctx.arc(tx + (W - tx - 24) * prog, barY + 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#ffb6c1'; ctx.fill()

      // Time
      ctx.fillStyle = 'rgba(255,182,193,0.5)'; ctx.font = '7px monospace'; ctx.textAlign = 'left'
      ctx.fillText('1:47', tx, barY + 8)
      ctx.textAlign = 'right'
      ctx.fillText('4:32', W - 28, barY + 8)

      // Mini EQ bars below progress
      const eqY = barY - 20, eqCount = 16
      const eqW = (W - tx - 24) / eqCount
      for (let i = 0; i < eqCount; i++) {
        const bh = 4 + 12 * Math.abs(Math.sin(t * 3 + i * 0.4))
        const alpha = 0.3 + (bh / 16) * 0.6
        ctx.fillStyle = `rgba(255,182,193,${alpha})`
        ctx.fillRect(tx + i * eqW, eqY + (16 - bh), eqW - 1, bh)
      }

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
