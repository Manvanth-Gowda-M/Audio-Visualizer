'use client'
import { useEffect, useRef } from 'react'

export default function CinematicVinylUIThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height, cx = W / 2, cy = H / 2
    let f = 0, raf: number
    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Deep crimson/dark luxury bg
      ctx.fillStyle = '#06000a'; ctx.fillRect(0, 0, W, H)
      const g1 = ctx.createRadialGradient(cx * 0.35, cy * 1.3, 0, cx * 0.35, cy * 1.3, W * 0.6)
      g1.addColorStop(0, 'rgba(170,23,56,0.2)'); g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Thin top accent bar
      const abg = ctx.createLinearGradient(0, 0, W, 0)
      abg.addColorStop(0, 'transparent'); abg.addColorStop(0.5, '#aa1738'); abg.addColorStop(1, 'transparent')
      ctx.fillStyle = abg; ctx.fillRect(0, 0, W, 2)

      // Vinyl record — left-center
      const vR = 56, vx = cx * 0.55, vy = cy + 4
      ctx.save(); ctx.translate(vx, vy); ctx.rotate(t * 0.65)
      const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, vR)
      vg.addColorStop(0, '#140008'); vg.addColorStop(0.4, '#0a0006'); vg.addColorStop(1, '#030002')
      ctx.beginPath(); ctx.arc(0, 0, vR, 0, Math.PI * 2)
      ctx.fillStyle = vg; ctx.fill()
      // Groove rings
      for (let i = 3; i <= 22; i++) {
        ctx.beginPath(); ctx.arc(0, 0, i * (vR / 24), 0, Math.PI * 2)
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(170,23,56,0.15)' : 'rgba(255,255,255,0.02)'
        ctx.lineWidth = 1; ctx.stroke()
      }
      // Sheen
      ctx.beginPath(); ctx.ellipse(-12, -14, 38, 12, -0.3, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,50,80,0.08)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.restore()

      // Center label
      const lcg = ctx.createRadialGradient(vx, vy, 0, vx, vy, 16)
      lcg.addColorStop(0, 'rgba(170,23,56,0.7)'); lcg.addColorStop(1, 'rgba(100,10,30,0.3)')
      ctx.beginPath(); ctx.arc(vx, vy, 16, 0, Math.PI * 2)
      ctx.fillStyle = lcg; ctx.fill()
      ctx.strokeStyle = 'rgba(170,23,56,0.8)'; ctx.lineWidth = 1.2; ctx.stroke()
      ctx.beginPath(); ctx.arc(vx, vy, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#06000a'; ctx.fill()

      // Frequency arcs around vinyl
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2 - Math.PI / 2
        const val = 0.1 + 0.75 * Math.abs(Math.sin(t * 2.6 + i * 0.2))
        const bh = val * 18
        ctx.beginPath()
        ctx.moveTo(vx + Math.cos(a) * (vR + 3), vy + Math.sin(a) * (vR + 3))
        ctx.lineTo(vx + Math.cos(a) * (vR + 3 + bh), vy + Math.sin(a) * (vR + 3 + bh))
        // crimson → rose gradient per bar
        const hue = 340 + (i / 48) * 20
        ctx.strokeStyle = `hsl(${hue},85%,${50 + val * 20}%)`, ctx.lineWidth = 1.8, ctx.lineCap = 'round', ctx.stroke()
      }

      // Right side: premium info panel
      const px = vx + vR + 22
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(px, 18, W - px - 10, H - 36)
      ctx.strokeStyle = 'rgba(170,23,56,0.3)'; ctx.lineWidth = 1
      ctx.strokeRect(px, 18, W - px - 10, H - 36)

      // Artist name
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.font = 'bold 12px serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText('FAITHLESS', px + 8, 26)
      ctx.fillStyle = 'rgba(170,23,56,0.8)'; ctx.font = '8px sans-serif'
      ctx.fillText('Tale of Us', px + 8, 42)

      // Divider
      ctx.strokeStyle = 'rgba(170,23,56,0.25)'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(px + 8, 56); ctx.lineTo(W - 18, 56); ctx.stroke()

      // Mini stats
      ctx.fillStyle = 'rgba(200,100,120,0.6)'; ctx.font = '6.5px monospace'
      ctx.fillText('BPM 128', px + 8, 62)
      ctx.fillText('KEY  Am', px + 8, 72)
      ctx.fillText('4:32', px + 8, 82)

      // Progress bar
      const pbY = H - 26, prog = 0.4 + Math.sin(t * 0.35) * 0.12
      ctx.fillStyle = 'rgba(170,23,56,0.15)'; ctx.fillRect(px + 8, pbY, W - px - 18, 3)
      ctx.fillStyle = '#aa1738'; ctx.fillRect(px + 8, pbY, (W - px - 18) * prog, 3)
      ctx.beginPath(); ctx.arc(px + 8 + (W - px - 18) * prog, pbY + 1.5, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#cc2050'; ctx.fill()

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
