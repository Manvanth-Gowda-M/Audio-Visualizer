'use client'
import { useEffect, useRef } from 'react'

export default function LuxuryGlassThumb() {
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
      const t = frame / 30
      ctx.clearRect(0, 0, W, H)

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H)
      bgGrad.addColorStop(0, '#2b1055')
      bgGrad.addColorStop(1, '#000000')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      const float1 = Math.sin(t) * 5
      const float2 = Math.cos(t * 0.8) * 5

      // Back cards
      ctx.save()
      ctx.translate(W * 0.25, H * 0.35 + float2)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath(); ctx.roundRect(-40, -60, 80, 120, 10); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.translate(W * 0.75, H * 0.4 + float2)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath(); ctx.roundRect(-40, -60, 80, 120, 10); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke()
      ctx.restore()

      // Front card
      ctx.save()
      ctx.translate(W * 0.5, H * 0.45 + float1)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 20
      ctx.beginPath(); ctx.roundRect(-60, -80, 120, 160, 16); ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke()
      
      // inner image mock
      ctx.fillStyle = '#4b2075'
      ctx.beginPath(); ctx.roundRect(-60, -80, 120, 160, 16); ctx.fill()
      ctx.restore()

      // Bottom glass UI
      ctx.fillStyle = 'rgba(20,20,20,0.6)'
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath(); ctx.roundRect(W * 0.1, H * 0.75, W * 0.8, H * 0.18, 16); ctx.fill(); ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('The Greatest', W * 0.5, H * 0.82)
      
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Sia', W * 0.5, H * 0.86)

      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillRect(W * 0.2, H * 0.89, W * 0.6, 3)
      ctx.fillStyle = '#fff'
      ctx.fillRect(W * 0.2, H * 0.89, W * 0.25, 3)

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
