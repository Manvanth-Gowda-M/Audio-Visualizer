'use client'
import { useEffect, useRef } from 'react'

export default function EditorialThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Warm editorial bg — sandy/ivory with warm amber
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#1a1008'); bg.addColorStop(0.4, '#120b04'); bg.addColorStop(1, '#0a0600')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Warm glow spot top-right
      const g1 = ctx.createRadialGradient(W * 0.82, H * 0.2, 0, W * 0.82, H * 0.2, W * 0.5)
      g1.addColorStop(0, 'rgba(232,170,120,0.22)'); g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Large album art square — left side
      const artX = 18, artY = 24, artS = H - 48
      const artG = ctx.createLinearGradient(artX, artY, artX + artS, artY + artS)
      artG.addColorStop(0, '#3a2010'); artG.addColorStop(0.5, '#201206'); artG.addColorStop(1, '#100800')
      ctx.fillStyle = artG
      ctx.fillRect(artX, artY, artS, artS)

      // Art detail — subtle vinyl grooves inside album art
      for (let i = 1; i <= 8; i++) {
        ctx.beginPath(); ctx.arc(artX + artS / 2, artY + artS / 2, i * (artS / 20), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,200,120,0.04)`; ctx.lineWidth = 1; ctx.stroke()
      }
      // Small spinning disc in album art
      ctx.save(); ctx.translate(artX + artS / 2, artY + artS / 2); ctx.rotate(t * 0.5)
      ctx.beginPath(); ctx.arc(0, 0, artS * 0.28, 0, Math.PI * 2)
      ctx.fillStyle = '#0a0400'; ctx.fill()
      ctx.strokeStyle = 'rgba(232,170,120,0.3)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#e8aa78'; ctx.fill()
      ctx.restore()

      // Art border
      ctx.strokeStyle = 'rgba(232,170,120,0.25)'; ctx.lineWidth = 1
      ctx.strokeRect(artX, artY, artS, artS)

      // Right side — editorial text layout
      const tx = artX + artS + 14
      const tw = W - tx - 10

      // "Editorial" label
      ctx.fillStyle = 'rgba(232,170,120,0.5)'; ctx.font = 'bold 7px sans-serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText('EDITORIAL ALBUM', tx, artY + 6)
      ctx.strokeStyle = 'rgba(232,170,120,0.2)'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(tx, artY + 16); ctx.lineTo(tx + tw, artY + 16); ctx.stroke()

      // Song title — big
      ctx.fillStyle = 'rgba(255,235,200,0.95)'; ctx.font = 'bold 15px serif'
      ctx.fillText('FAITHLESS', tx, artY + 22)
      ctx.fillStyle = 'rgba(200,160,100,0.6)'; ctx.font = '8px sans-serif'
      ctx.fillText('Tale of Us', tx, artY + 42)

      // Waveform bars — right column
      const wby = artY + 60, wbh = (H - artY - 80)
      const bc = 18
      for (let i = 0; i < bc; i++) {
        const val = 0.15 + 0.7 * Math.abs(Math.sin(t * 2.6 + i * 0.32))
        const bh = val * wbh
        const alpha = 0.4 + val * 0.5
        ctx.fillStyle = `rgba(232,170,120,${alpha})`
        ctx.fillRect(tx + i * (tw / bc), wby + (wbh - bh), (tw / bc) - 1.5, bh)
      }

      // Bottom metadata
      ctx.fillStyle = 'rgba(200,160,100,0.35)'; ctx.font = '6px monospace'
      ctx.fillText('2024 · 4:32 · LOSSLESS', tx, H - 14)

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
