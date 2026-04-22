'use client'
import { useEffect, useRef } from 'react'

export default function NeonGlassThumb() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    let raf = 0
    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#0a0010'
      ctx.fillRect(0, 0, W, H)

      // Radial bg glow
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.55)
      bg.addColorStop(0, 'rgba(120,0,160,0.32)')
      bg.addColorStop(1, 'transparent')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Animated diagonal neon lines
      const offset = (frame * 0.45) % (W * 0.14)
      const LINE_COUNT = 18
      for (let i = 0; i < LINE_COUNT; i++) {
        const frac  = i / LINE_COUNT
        const baseX = frac * W * 1.5 - W * 0.25 + offset
        const x1    = baseX - H * 0.7
        const x2    = baseX + H * 0.1
        const far   = i % 3 !== 0
        ctx.save()
        ctx.globalAlpha = far ? 0.1 + frac * 0.07 : 0.22 + frac * 0.12
        ctx.strokeStyle = far ? '#7b1fa2' : '#e040fb'
        ctx.lineWidth   = far ? 1.2 : 1.8
        if (far) ctx.filter = 'blur(2px)'
        ctx.beginPath()
        ctx.moveTo(x1, 0)
        ctx.lineTo(x2, H)
        ctx.stroke()
        ctx.filter = 'none'
        ctx.restore()
      }

      // Glass card
      const cW = W * 0.38
      const cH = H * 0.82
      const cX = (W - cW) / 2
      const cY = (H - cH) / 2
      const r  = 10

      // Card glow
      ctx.save()
      ctx.shadowColor  = '#e040fb'
      ctx.shadowBlur   = 18
      ctx.globalAlpha  = 0.35
      ctx.strokeStyle  = '#e040fb'
      ctx.lineWidth    = 1.5
      ctx.beginPath()
      ctx.roundRect(cX, cY, cW, cH, r)
      ctx.stroke()
      ctx.restore()

      // Card blur bg
      ctx.save()
      ctx.globalAlpha = 0.06
      ctx.fillStyle   = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(cX, cY, cW, cH, r)
      ctx.fill()
      ctx.restore()

      // Card border gradient
      const borderGrad = ctx.createLinearGradient(cX, cY, cX + cW, cY + cH)
      borderGrad.addColorStop(0, 'rgba(224,64,251,0.60)')
      borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.10)')
      borderGrad.addColorStop(1, 'rgba(224,64,251,0.40)')
      ctx.save()
      ctx.strokeStyle = borderGrad
      ctx.lineWidth   = 1.2
      ctx.beginPath()
      ctx.roundRect(cX, cY, cW, cH, r)
      ctx.stroke()
      ctx.restore()

      // Artwork placeholder (gradient rectangle)
      const aX = cX + 8
      const aY = cY + 8
      const aW = cW - 16
      const aH = cH * 0.54
      const aR = 6
      const artGrad = ctx.createLinearGradient(aX, aY, aX + aW, aY + aH)
      artGrad.addColorStop(0, '#3a0050')
      artGrad.addColorStop(0.5, '#7b1fa2')
      artGrad.addColorStop(1, '#1a0030')
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(aX, aY, aW, aH, aR)
      ctx.fillStyle = artGrad
      ctx.fill()
      // Artwork glow edge
      ctx.strokeStyle = 'rgba(224,64,251,0.22)'
      ctx.lineWidth   = 1
      ctx.stroke()
      ctx.restore()

      // Music note icon in artwork
      ctx.save()
      ctx.globalAlpha  = 0.35
      ctx.fillStyle    = '#e040fb'
      ctx.font         = `${H * 0.15}px sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('♪', aX + aW / 2, aY + aH / 2)
      ctx.restore()

      // Song title text
      const titleY = aY + aH + H * 0.062
      ctx.save()
      ctx.fillStyle    = '#ffffff'
      ctx.font         = `700 ${H * 0.07}px Inter, Arial, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Song Name', W / 2, titleY)
      ctx.restore()

      // Artist text
      ctx.save()
      ctx.fillStyle    = 'rgba(230,180,255,0.7)'
      ctx.font         = `400 ${H * 0.045}px Inter, Arial, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('ARTIST NAME', W / 2, titleY + H * 0.08)
      ctx.restore()

      // Waveform bars at bottom of card
      const wfBars = 28
      const wfY    = cY + cH - H * 0.14
      const wfH2   = H * 0.07
      const wfX    = cX + 8
      const wfW    = cW - 16
      for (let i = 0; i < wfBars; i++) {
        const t     = i / wfBars
        const amp   = 0.2 + 0.55 * Math.abs(Math.sin(t * Math.PI * 3 + frame * 0.08))
        const barH  = Math.max(2, amp * wfH2 * 0.85)
        const barX  = wfX + t * wfW
        const barW  = (wfW / wfBars) * 0.5
        const cy    = wfY + wfH2 / 2
        const alpha = 0.4 + amp * 0.6
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle   = amp > 0.5 ? '#e040fb' : 'rgba(255,255,255,0.8)'
        ctx.beginPath()
        ctx.roundRect(barX, cy - barH, barW, barH, 1)
        ctx.fill()
        ctx.globalAlpha = alpha * 0.35
        ctx.beginPath()
        ctx.roundRect(barX, cy, barW, barH, 1)
        ctx.fill()
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={ref}
      width={480}
      height={270}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
