'use client'
import { useEffect, useRef } from 'react'

export default function WarmFloatingPlayerThumb() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width   // 270
    const H = canvas.height  // 480
    let raf = 0
    let frame = 0

    const draw = () => {
      frame++
      const t = frame / 30
      ctx.clearRect(0, 0, W, H)

      // ── BACKGROUND warm radial gradient ──
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.38, H * 0.68)
      bg.addColorStop(0,    '#c8824a')
      bg.addColorStop(0.25, '#a86030')
      bg.addColorStop(0.55, '#7a4020')
      bg.addColorStop(0.82, '#3a1e0c')
      bg.addColorStop(1,    '#1a0a04')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Bottom warm glow
      const bgl = ctx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, W * 0.55)
      bgl.addColorStop(0, 'rgba(210,110,40,0.42)')
      bgl.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bgl; ctx.fillRect(0, H * 0.72, W, H * 0.28)

      // Vignette overlay
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.33, 0, W * 0.5, H * 0.35, H * 0.52)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(0.5,'rgba(0,0,0,0.18)')
      vig.addColorStop(1, 'rgba(0,0,0,0.72)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      // ── ARTWORK CARD (floating) ──
      const artW  = W * 0.73
      const artH  = artW
      const artX  = (W - artW) / 2
      const artBy = H * 0.12
      const floatY = Math.sin(t * 0.65) * H * 0.008
      const artY  = artBy + floatY
      const artR  = 12

      // Artwork shadow
      ctx.save()
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 14
      ctx.shadowBlur    = 32; ctx.shadowColor   = 'rgba(0,0,0,0.42)'
      ctx.beginPath(); ctx.roundRect(artX, artY, artW, artH, artR)
      ctx.fillStyle = '#6b4428'; ctx.fill()
      ctx.restore()

      // Artwork content — warm aesthetic gradient (placeholder)
      const artG = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH)
      artG.addColorStop(0, '#9b7355')
      artG.addColorStop(0.4,'#7d5a3c')
      artG.addColorStop(0.7,'#5c3d22')
      artG.addColorStop(1, '#3a2614')
      ctx.save()
      ctx.beginPath(); ctx.roundRect(artX, artY, artW, artH, artR); ctx.clip()
      ctx.fillStyle = artG; ctx.fillRect(artX, artY, artW, artH)

      // Warm texture lines
      ctx.globalAlpha = 0.12
      ctx.strokeStyle = '#f0d0a0'; ctx.lineWidth = 0.6
      for (let i = 0; i < 10; i++) {
        const ly = artY + i * artH / 9
        ctx.beginPath(); ctx.moveTo(artX, ly); ctx.lineTo(artX + artW, ly + artH * 0.06); ctx.stroke()
      }
      ctx.restore()

      // Inner shadow on artwork
      ctx.save()
      ctx.beginPath(); ctx.roundRect(artX, artY, artW, artH, artR); ctx.clip()
      const isg = ctx.createRadialGradient(artX + artW * 0.5, artY + artH * 0.5, artW * 0.2, artX + artW * 0.5, artY + artH * 0.5, artW * 0.72)
      isg.addColorStop(0, 'rgba(0,0,0,0)')
      isg.addColorStop(1, 'rgba(0,0,0,0.20)')
      ctx.fillStyle = isg; ctx.fillRect(artX, artY, artW, artH)
      ctx.restore()

      // ── MINI PLAYER CARD ──
      const pW = W * 0.84
      const pH = H * 0.225
      const pX = (W - pW) / 2
      const pY = H * 0.624
      const pR = 22

      // Card shadow
      ctx.save()
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 12
      ctx.shadowBlur    = 28; ctx.shadowColor   = 'rgba(0,0,0,0.55)'
      ctx.fillStyle     = 'rgba(18,12,8,0.93)'
      ctx.beginPath(); ctx.roundRect(pX, pY, pW, pH, pR); ctx.fill()
      ctx.restore()

      // Card body (no shadow this time, clean fill)
      ctx.save()
      ctx.fillStyle = 'rgba(18,12,8,0.93)'
      ctx.beginPath(); ctx.roundRect(pX, pY, pW, pH, pR); ctx.fill()
      ctx.restore()

      // Top subtle edge
      ctx.save()
      const edgeG = ctx.createLinearGradient(pX, pY, pX, pY + pR * 1.5)
      edgeG.addColorStop(0, 'rgba(255,255,255,0.07)')
      edgeG.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = edgeG
      ctx.beginPath(); ctx.roundRect(pX + 1, pY + 1, pW - 2, pR, pR); ctx.fill()
      ctx.restore()

      // Three dots
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(pX + pW * 0.10 + i * 7, pY + pH * 0.225, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill()
      }

      // Song title
      ctx.fillStyle = '#ffffff'
      ctx.font      = `700 ${H * 0.038}px Inter, Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('SONG TITLE', pX + pW / 2, pY + pH * 0.22)

      // Artist name
      ctx.fillStyle = 'rgba(255,255,255,0.50)'
      ctx.font      = `400 ${H * 0.024}px Inter, Arial, sans-serif`
      ctx.fillText('Artist Name', pX + pW / 2, pY + pH * 0.37)

      // Airplay-ish icon (top right)
      const ax = pX + pW * 0.89
      const ay = pY + pH * 0.23
      const ar = pH * 0.065
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.38)'
      ctx.lineWidth   = 1.5
      ctx.lineCap     = 'round'
      ctx.beginPath(); ctx.arc(ax, ay, ar * 1.6, Math.PI + 0.4, -0.4); ctx.stroke()
      ctx.beginPath(); ctx.arc(ax, ay, ar * 0.9, Math.PI + 0.55, -0.55); ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.beginPath()
      ctx.moveTo(ax - ar * 0.38, ay + ar * 0.68)
      ctx.lineTo(ax + ar * 0.38, ay + ar * 0.68)
      ctx.lineTo(ax, ay + ar * 1.25); ctx.closePath(); ctx.fill()
      ctx.restore()

      // Progress bar
      const progress = (t / 30) % 1
      const bX = pX + pW * 0.06
      const bW2 = pW * 0.88
      const bY = pY + pH * 0.555
      const bH2 = 2.2

      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.beginPath(); ctx.roundRect(bX, bY, bW2, bH2, 1); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.90)'
      ctx.beginPath(); ctx.roundRect(bX, bY, bW2 * progress, bH2, 1); ctx.fill()
      ctx.beginPath(); ctx.arc(bX + bW2 * progress, bY + bH2 / 2, 4, 0, Math.PI * 2); ctx.fill()

      // Time stamps
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font      = `400 ${H * 0.018}px Inter, Arial, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText('0:00', bX, bY - 7)
      ctx.textAlign = 'right'
      ctx.fillText('-0:30', bX + bW2, bY - 7)

      // Controls
      const ctrlY2 = pY + pH * 0.80
      const icSz   = pH * 0.14
      const positions = [pX + pW * 0.27, pX + pW * 0.50, pX + pW * 0.73]

      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'

      // Prev ◄◄
      const pcx = positions[0]
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.rect(pcx - icSz * 0.72, ctrlY2 - icSz * 0.55, icSz * 0.14, icSz * 1.1); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(pcx - icSz * 0.52, ctrlY2)
      ctx.lineTo(pcx - icSz * 0.08, ctrlY2 - icSz * 0.50)
      ctx.lineTo(pcx - icSz * 0.08, ctrlY2 + icSz * 0.50); ctx.closePath(); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(pcx + icSz * 0.04, ctrlY2)
      ctx.lineTo(pcx + icSz * 0.48, ctrlY2 - icSz * 0.50)
      ctx.lineTo(pcx + icSz * 0.48, ctrlY2 + icSz * 0.50); ctx.closePath(); ctx.fill()

      // Pause ⏸
      const ppcx = positions[1]
      const bww = icSz * 0.22
      const bhh = icSz * 1.05
      const gpp = icSz * 0.30
      ctx.fillRect(ppcx - gpp / 2 - bww, ctrlY2 - bhh / 2, bww, bhh)
      ctx.fillRect(ppcx + gpp / 2, ctrlY2 - bhh / 2, bww, bhh)

      // Next ►►
      const ncx = positions[2]
      ctx.beginPath()
      ctx.moveTo(ncx - icSz * 0.48, ctrlY2 - icSz * 0.50)
      ctx.lineTo(ncx - icSz * 0.48, ctrlY2 + icSz * 0.50)
      ctx.lineTo(ncx - icSz * 0.04, ctrlY2); ctx.closePath(); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(ncx + icSz * 0.08, ctrlY2 - icSz * 0.50)
      ctx.lineTo(ncx + icSz * 0.08, ctrlY2 + icSz * 0.50)
      ctx.lineTo(ncx + icSz * 0.52, ctrlY2); ctx.closePath(); ctx.fill()
      ctx.fillRect(ncx + icSz * 0.55, ctrlY2 - icSz * 0.55, icSz * 0.14, icSz * 1.1)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={ref}
      width={270}
      height={480}
      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
    />
  )
}
