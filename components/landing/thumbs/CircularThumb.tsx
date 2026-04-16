'use client'
import { useEffect, useRef } from 'react'

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function CircularThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    let f = 0, raf: number
    let smoothBass = 0, smoothAmp = 0

    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // BG
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0a0000'); bg.addColorStop(0.4, '#1a0000'); bg.addColorStop(1, '#000')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Radial red glow
      const rg = ctx.createRadialGradient(W/2, H*0.68, 0, W/2, H*0.68, W*0.5)
      rg.addColorStop(0, 'rgba(180,0,0,0.25)'); rg.addColorStop(1, 'transparent')
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)

      // Blurred artwork top
      ctx.fillStyle = 'rgba(80,20,20,0.5)'
      ctx.fillRect(0, 0, W, H * 0.38)
      const fade = ctx.createLinearGradient(0, H*0.2, 0, H*0.38)
      fade.addColorStop(0, 'transparent'); fade.addColorStop(1, '#0a0000')
      ctx.fillStyle = fade; ctx.fillRect(0, H*0.2, W, H*0.18)

      // Fake bass
      const rawBass = 0.3 + 0.5 * Math.abs(Math.sin(t * 2.1))
      const rawAmp  = 0.2 + 0.4 * Math.abs(Math.sin(t * 1.8))
      smoothBass = smoothBass + (rawBass - smoothBass) * 0.1
      smoothAmp  = smoothAmp  + (rawAmp  - smoothAmp)  * 0.1

      const cx2 = W/2, arcCY = H * 0.68
      const arcR = W * 0.38
      const ARC_START = -160, ARC_END = -20
      const progress = (Math.sin(t * 0.3) * 0.5 + 0.5) * 0.7 + 0.05
      const progressDeg = ARC_START + (ARC_END - ARC_START) * progress

      // Dark disc
      ctx.beginPath(); ctx.arc(cx2, arcCY, arcR * 1.1, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(15,0,0,0.92)'; ctx.fill()

      // Inner reactive arc
      const innerR = arcR * (0.72 + smoothBass * 0.08)
      ctx.shadowColor = 'rgba(200,0,0,0.8)'; ctx.shadowBlur = 12
      ctx.strokeStyle = `rgba(200,0,0,${0.3 + smoothBass * 0.4})`
      ctx.lineWidth = innerR * 0.06; ctx.lineCap = 'round'
      const s1 = polar(cx2, arcCY, innerR, ARC_START)
      const e1 = polar(cx2, arcCY, innerR, ARC_END)
      ctx.beginPath(); ctx.moveTo(s1.x, s1.y)
      ctx.arc(cx2, arcCY, innerR, (ARC_START - 90) * Math.PI/180, (ARC_END - 90) * Math.PI/180)
      ctx.stroke(); ctx.shadowBlur = 0

      // Arc track
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5
      const s2 = polar(cx2, arcCY, arcR, ARC_START)
      ctx.beginPath()
      ctx.arc(cx2, arcCY, arcR, (ARC_START - 90) * Math.PI/180, (ARC_END - 90) * Math.PI/180)
      ctx.stroke()

      // Arc fill
      ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 4
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx2, arcCY, arcR, (ARC_START - 90) * Math.PI/180, (progressDeg - 90) * Math.PI/180)
      ctx.stroke(); ctx.shadowBlur = 0

      // Dot
      const dot = polar(cx2, arcCY, arcR, progressDeg)
      ctx.shadowColor = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 6
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dot.x, dot.y, 5, 0, Math.PI*2); ctx.fill()
      ctx.shadowBlur = 0

      // Heart
      ctx.fillStyle = 'rgba(220,30,30,0.9)'
      ctx.font = `${H*0.06}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♥', cx2, arcCY - arcR * 0.38)

      // Time
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = `300 ${H*0.07}px monospace`
      ctx.fillText('2:00 / 2:23', cx2, arcCY - arcR * 0.18)

      // Play button glow rings
      const btnR = W * 0.14, btnCY = arcCY + arcR * 0.18
      const glowScale = 1 + smoothAmp * 0.1
      ctx.shadowColor = 'rgba(180,0,0,0.6)'; ctx.shadowBlur = 20
      ctx.strokeStyle = `rgba(180,0,0,${0.4 + smoothAmp * 0.3})`
      ctx.lineWidth = btnR * 0.12
      ctx.beginPath(); ctx.arc(cx2, btnCY, btnR * 1.35 * glowScale, 0, Math.PI*2); ctx.stroke()
      ctx.shadowBlur = 0

      // Play button
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(cx2, btnCY, btnR, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#111'
      ctx.fillRect(cx2 - btnR*0.22, btnCY - btnR*0.32, btnR*0.14, btnR*0.64)
      ctx.fillRect(cx2 + btnR*0.08, btnCY - btnR*0.32, btnR*0.14, btnR*0.64)

      // Prev/Next
      ;[cx2 - W*0.28, cx2 + W*0.28].forEach((bx, i) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(bx, btnCY, W*0.065, 0, Math.PI*2); ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        if (i === 0) {
          ctx.beginPath(); ctx.moveTo(bx+6, btnCY-8); ctx.lineTo(bx-6, btnCY); ctx.lineTo(bx+6, btnCY+8); ctx.closePath(); ctx.fill()
        } else {
          ctx.beginPath(); ctx.moveTo(bx-6, btnCY-8); ctx.lineTo(bx+6, btnCY); ctx.lineTo(bx-6, btnCY+8); ctx.closePath(); ctx.fill()
        }
      })

      // Song info
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = `bold ${H*0.065}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
      ctx.fillText('HUNNY', cx2, H*0.44)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = `300 ${H*0.05}px sans-serif`
      ctx.fillText('FRENCH POLICE', cx2, H*0.5)

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
