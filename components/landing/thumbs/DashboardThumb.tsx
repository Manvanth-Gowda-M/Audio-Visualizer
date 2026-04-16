'use client'
import { useEffect, useRef } from 'react'

export default function DashboardThumb() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    let f = 0, raf: number
    let smoothed = new Array(32).fill(0)

    const draw = () => {
      const t = f / 60
      ctx.clearRect(0, 0, W, H)

      // Dark teal bg
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#0d2b2b')
      bg.addColorStop(0.5, '#0a2020')
      bg.addColorStop(1, '#0a1e2e')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Vignette
      const vg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7)
      vg.addColorStop(0.5, 'transparent')
      vg.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H)

      // Card
      const cW = W * 0.88, cH = H * 0.82
      const cX = (W - cW) / 2, cY = (H - cH) / 2
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 12); ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 12); ctx.stroke()

      // Artwork
      const aS = cH * 0.48
      const aX = cX + cW * 0.04, aY = cY + cH * 0.1
      ctx.fillStyle = 'rgba(0,180,150,0.2)'
      ctx.beginPath(); ctx.roundRect(aX, aY, aS, aS, 6); ctx.fill()
      ctx.fillStyle = 'rgba(0,230,118,0.5)'; ctx.font = `${aS * 0.4}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♪', aX + aS/2, aY + aS/2)

      // Text
      const tx = aX + aS + cW * 0.04
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#4dd0c4'; ctx.font = `${cH * 0.1}px sans-serif`
      ctx.fillText('Author Name', tx, aY + cH * 0.14)
      ctx.fillStyle = '#fff'; ctx.font = `bold ${cH * 0.18}px sans-serif`
      ctx.fillText('Song Name', tx, aY + cH * 0.34)

      // Time
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = `300 ${cH * 0.12}px monospace`
      ctx.textAlign = 'right'
      ctx.fillText('00:07', cX + cW - cW * 0.05, cY + cH * 0.58)

      // Smooth freq
      const SAMPLES = 32
      for (let i = 0; i < SAMPLES; i++) {
        const raw = 0.1 + 0.7 * Math.abs(Math.sin(t * 2.2 + i * 0.35))
        smoothed[i] = smoothed[i] + (raw - smoothed[i]) * 0.12
      }

      // Waveform path
      const wX = cX + cW * 0.04
      const wW = cW * 0.92
      const wBaseY = cY + cH * 0.82
      const wMaxH = cH * 0.28

      const pts = smoothed.map((v, i) => ({
        x: wX + (i / (SAMPLES - 1)) * wW,
        y: wBaseY - v * wMaxH,
      }))

      // Fill
      const wg = ctx.createLinearGradient(wX, 0, wX + wW, 0)
      wg.addColorStop(0, 'rgba(29,233,182,0.12)')
      wg.addColorStop(0.4, 'rgba(0,230,118,0.5)')
      wg.addColorStop(1, 'rgba(0,191,165,0.15)')
      ctx.fillStyle = wg
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        const cpx = (pts[i-1].x + pts[i].x) / 2
        ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y)
      }
      ctx.lineTo(pts[pts.length-1].x, wBaseY)
      ctx.lineTo(pts[0].x, wBaseY)
      ctx.closePath(); ctx.fill()

      // Stroke
      const sg = ctx.createLinearGradient(wX, 0, wX + wW, 0)
      sg.addColorStop(0, 'rgba(29,233,182,0.4)')
      sg.addColorStop(0.4, 'rgba(0,230,118,1)')
      sg.addColorStop(1, 'rgba(0,191,165,0.5)')
      ctx.strokeStyle = sg; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        const cpx = (pts[i-1].x + pts[i].x) / 2
        ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y)
      }
      ctx.stroke()

      // Progress bar
      const prog = (Math.sin(t * 0.4) * 0.5 + 0.5) * 0.4 + 0.05
      const bY = cY + cH * 0.88, bH = 3
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath(); ctx.roundRect(wX, bY, wW, bH, bH/2); ctx.fill()
      const pg = ctx.createLinearGradient(wX, 0, wX + wW * prog, 0)
      pg.addColorStop(0, '#00e676'); pg.addColorStop(1, '#1de9b6')
      ctx.fillStyle = pg
      ctx.beginPath(); ctx.roundRect(wX, bY, wW * prog, bH, bH/2); ctx.fill()
      ctx.fillStyle = '#00e676'
      ctx.beginPath(); ctx.arc(wX + wW * prog, bY + bH/2, bH * 1.5, 0, Math.PI * 2); ctx.fill()

      f++; raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} width={320} height={180} className="w-full h-full block" />
}
