'use client'
import { useEffect, useRef } from 'react'

export default function NeumorphicSphereThumb() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width   // 270 (portrait thumb)
    const H = canvas.height  // 480
    let raf  = 0
    let frame = 0

    const draw = () => {
      frame++
      const t = frame / 30

      ctx.clearRect(0, 0, W, H)

      // Background — pure black
      ctx.fillStyle = '#090909'
      ctx.fillRect(0, 0, W, H)

      // ── CARD ──
      const cW = W * 0.78
      const cH = H * 0.70
      const cX = (W - cW) / 2
      const cY = (H - cH) / 2
      const cR = 18

      // Card shadow
      ctx.save()
      ctx.shadowOffsetX = -5; ctx.shadowOffsetY = -5
      ctx.shadowBlur    = 14;  ctx.shadowColor   = '#050505'
      ctx.fillStyle     = '#181818'
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, cR); ctx.fill()
      ctx.shadowOffsetX = 5;  ctx.shadowOffsetY = 5
      ctx.shadowColor   = '#272727'
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, cR); ctx.fill()
      ctx.restore()

      // Card black recess (sphere display area)
      const recessH = cH * 0.56
      ctx.save()
      ctx.fillStyle = '#0c0c0c'
      ctx.beginPath(); ctx.roundRect(cX + 4, cY + 4, cW - 8, recessH, cR - 3); ctx.fill()
      ctx.restore()

      // ── METALLIC SPHERE ──
      const sR  = cW * 0.36
      const sCX = W / 2
      const sCY = cY + sR + cH * 0.04

      // Subtle audio pulse
      const amp = 0.025 * Math.abs(Math.sin(t * 2.8))
      const sc  = 1 + amp

      // Drop shadow
      ctx.save()
      ctx.globalAlpha = 0.6
      const sh = ctx.createRadialGradient(sCX, sCY + sR * 0.85, 0, sCX, sCY + sR * 0.85, sR * 0.72)
      sh.addColorStop(0, 'rgba(0,0,0,0.75)')
      sh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = sh
      ctx.beginPath()
      ctx.ellipse(sCX, sCY + sR * 0.88, sR * 0.68 * sc, sR * 0.12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Sphere base — metallic radial gradient
      ctx.save()
      ctx.translate(sCX, sCY)
      ctx.scale(sc, sc)
      const g = ctx.createRadialGradient(sR * 0.24, -sR * 0.36, 0, 0, 0, sR)
      g.addColorStop(0,    '#d0d0d0')
      g.addColorStop(0.18, '#989898')
      g.addColorStop(0.45, '#505050')
      g.addColorStop(0.72, '#252525')
      g.addColorStop(1,    '#0e0e0e')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, sR, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Specular highlight — small bright spot
      ctx.save()
      ctx.translate(sCX, sCY)
      ctx.scale(sc, sc)
      const specG = ctx.createRadialGradient(sR * 0.22, -sR * 0.3, 0, sR * 0.22, -sR * 0.3, sR * 0.26)
      specG.addColorStop(0, 'rgba(255,255,255,0.85)')
      specG.addColorStop(0.5,'rgba(255,255,255,0.2)')
      specG.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = specG
      ctx.beginPath()
      ctx.arc(0, 0, sR, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Rim light — bottom left
      ctx.save()
      ctx.translate(sCX, sCY)
      ctx.scale(sc, sc)
      const rimG = ctx.createRadialGradient(-sR * 0.35, sR * 0.55, 0, -sR * 0.35, sR * 0.55, sR * 0.55)
      rimG.addColorStop(0, 'rgba(140,140,140,0.30)')
      rimG.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = rimG
      ctx.beginPath(); ctx.arc(0, 0, sR, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // Liquid ripple effect (animated lines on sphere surface)
      ctx.save()
      ctx.translate(sCX, sCY)
      ctx.scale(sc, sc)
      ctx.globalAlpha = 0.12
      ctx.strokeStyle = '#aaaaaa'
      ctx.lineWidth   = 0.8
      for (let i = 0; i < 4; i++) {
        const waveOffset = Math.sin(t * 1.4 + i * 1.1) * sR * 0.06
        ctx.beginPath()
        ctx.ellipse(0, -sR * 0.1 + i * sR * 0.22 + waveOffset, sR * 0.85, sR * 0.18, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // ── TEXT ──
      const textY = sCY + sR * sc + cH * 0.06
      ctx.fillStyle    = '#e8e8e8'
      ctx.font         = `600 ${H * 0.055}px Inter, Arial, sans-serif`
      ctx.textBaseline = 'top'
      ctx.textAlign    = 'left'
      ctx.fillText('TRACK TITLE', cX + 12, textY)

      ctx.fillStyle = '#787878'
      ctx.font      = `400 ${H * 0.034}px Inter, Arial, sans-serif`
      ctx.fillText('Artist Name', cX + 12, textY + H * 0.056)

      // ── CONTROLS BAR ──
      const ctrlY = cY + cH - cH * 0.24
      const ctrlH = cH * 0.18
      const ctrlX = cX + 8
      const ctrlW = cW - 16
      const ctrlR = ctrlH / 2

      // Bar background with neumorphic shadow
      ctx.save()
      ctx.shadowOffsetX = -3; ctx.shadowOffsetY = -3
      ctx.shadowBlur    = 8;   ctx.shadowColor   = '#080808'
      ctx.fillStyle     = '#141414'
      ctx.beginPath(); ctx.roundRect(ctrlX, ctrlY, ctrlW, ctrlH, ctrlR); ctx.fill()
      ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3
      ctx.shadowColor   = '#222222'
      ctx.beginPath(); ctx.roundRect(ctrlX, ctrlY, ctrlW, ctrlH, ctrlR); ctx.fill()
      ctx.restore()

      // Play button
      const bR  = ctrlH * 0.42
      const bCX = ctrlX + bR + ctrlH * 0.2
      const bCY = ctrlY + ctrlH / 2

      ctx.save()
      ctx.shadowOffsetX = -2; ctx.shadowOffsetY = -2; ctx.shadowBlur = 5; ctx.shadowColor = '#050505'
      ctx.fillStyle = '#1c1c1c'
      ctx.beginPath(); ctx.arc(bCX, bCY, bR, 0, Math.PI * 2); ctx.fill()
      ctx.shadowOffsetX = 2; ctx.shadowColor = '#272727'
      ctx.beginPath(); ctx.arc(bCX, bCY, bR, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.fillStyle = '#e8e8e8'
      ctx.beginPath()
      ctx.moveTo(bCX - bR * 0.32, bCY - bR * 0.42)
      ctx.lineTo(bCX - bR * 0.32, bCY + bR * 0.42)
      ctx.lineTo(bCX + bR * 0.45, bCY)
      ctx.closePath(); ctx.fill()

      // Skip pill
      const pillW = ctrlW * 0.30
      const pillH = ctrlH * 0.60
      const pillX = ctrlX + ctrlW * 0.30
      const pillY = ctrlY + (ctrlH - pillH) / 2

      ctx.save()
      ctx.shadowOffsetX = -2; ctx.shadowOffsetY = -2; ctx.shadowBlur = 5; ctx.shadowColor = '#050505'
      ctx.fillStyle = '#141414'
      ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2); ctx.fill()
      ctx.shadowOffsetX = 2; ctx.shadowColor = '#222222'
      ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2); ctx.fill()
      ctx.restore()
      ctx.fillStyle = '#787878'
      // ◄◄
      for (let s = 0; s < 2; s++) {
        const ox = pillX + pillW * (0.14 + s * 0.14)
        ctx.beginPath()
        ctx.moveTo(ox + pillW * 0.14, pillY + pillH * 0.25)
        ctx.lineTo(ox + pillW * 0.14, pillY + pillH * 0.75)
        ctx.lineTo(ox,                pillY + pillH * 0.50)
        ctx.closePath(); ctx.fill()
      }
      // ►►
      for (let s = 0; s < 2; s++) {
        const ox = pillX + pillW * (0.58 + s * 0.14)
        ctx.beginPath()
        ctx.moveTo(ox, pillY + pillH * 0.25)
        ctx.lineTo(ox, pillY + pillH * 0.75)
        ctx.lineTo(ox + pillW * 0.14, pillY + pillH * 0.50)
        ctx.closePath(); ctx.fill()
      }

      // Volume knob
      const knobR  = ctrlH * 0.44
      const knobCX = ctrlX + ctrlW - knobR - ctrlH * 0.18
      const knobCY = ctrlY + ctrlH / 2
      const knobAngle = (t * 18) % 360
      const knobAng   = (knobAngle - 90) * (Math.PI / 180)

      ctx.save()
      ctx.shadowOffsetX = -2; ctx.shadowOffsetY = -2; ctx.shadowBlur = 5; ctx.shadowColor = '#050505'
      ctx.fillStyle     = '#1c1c1c'
      ctx.beginPath(); ctx.arc(knobCX, knobCY, knobR, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      const kg = ctx.createRadialGradient(
        knobCX - knobR * 0.25, knobCY - knobR * 0.3, 0,
        knobCX, knobCY, knobR
      )
      kg.addColorStop(0, '#606060')
      kg.addColorStop(0.35,'#3a3a3a')
      kg.addColorStop(1, '#181818')
      ctx.fillStyle = kg
      ctx.beginPath(); ctx.arc(knobCX, knobCY, knobR, 0, Math.PI * 2); ctx.fill()

      const ks = ctx.createRadialGradient(
        knobCX - knobR * 0.28, knobCY - knobR * 0.32, 0,
        knobCX - knobR * 0.28, knobCY - knobR * 0.32, knobR * 0.3
      )
      ks.addColorStop(0, 'rgba(255,255,255,0.60)')
      ks.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = ks
      ctx.beginPath(); ctx.arc(knobCX, knobCY, knobR, 0, Math.PI * 2); ctx.fill()

      // Indicator
      const ix = knobCX + Math.cos(knobAng) * knobR * 0.60
      const iy = knobCY + Math.sin(knobAng) * knobR * 0.60
      ctx.fillStyle = '#e8e8e8'
      ctx.beginPath(); ctx.arc(ix, iy, knobR * 0.11, 0, Math.PI * 2); ctx.fill()

      // Progress bar
      const progress = (t / 30) % 1
      const barY2 = ctrlY - ctrlH * 0.38
      const barH2 = 2
      ctx.fillStyle = '#141414'
      ctx.beginPath(); ctx.roundRect(ctrlX, barY2, ctrlW, barH2, 1); ctx.fill()
      ctx.fillStyle = '#787878'
      ctx.beginPath(); ctx.roundRect(ctrlX, barY2, ctrlW * progress, barH2, 1); ctx.fill()
      ctx.fillStyle = '#e8e8e8'
      ctx.beginPath(); ctx.arc(ctrlX + ctrlW * progress, barY2 + 1, 4.5, 0, Math.PI * 2); ctx.fill()

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
