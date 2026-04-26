'use client'
import { useEffect, useRef } from 'react'

export default function EditorialPolaroidThumb() {
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
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, W, H)

      const float1 = Math.sin(t) * 3
      const float2 = Math.cos(t * 0.8) * 3

      // Back right
      ctx.save()
      ctx.translate(W * 0.7, H * 0.35 + float2)
      ctx.rotate(10 * Math.PI / 180)
      ctx.fillStyle = '#f8f8f8'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 10
      ctx.fillRect(-45, -55, 90, 110)
      ctx.fillStyle = '#555'
      ctx.fillRect(-40, -50, 80, 80)
      ctx.restore()

      // Back left
      ctx.save()
      ctx.translate(W * 0.3, H * 0.4 + float2)
      ctx.rotate(-15 * Math.PI / 180)
      ctx.fillStyle = '#f0f0f0'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 10
      ctx.fillRect(-45, -55, 90, 110)
      ctx.fillStyle = '#444'
      ctx.fillRect(-40, -50, 80, 80)
      ctx.restore()

      // Front
      ctx.save()
      ctx.translate(W * 0.5, H * 0.45 + float1)
      ctx.rotate(-2 * Math.PI / 180)
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 15
      ctx.fillRect(-55, -65, 110, 130)
      ctx.fillStyle = '#222'
      ctx.fillRect(-50, -60, 100, 100)
      ctx.restore()

      // Bottom Gradient
      const grad = ctx.createLinearGradient(0, H * 0.6, 0, H)
      grad.addColorStop(0, 'rgba(17,17,17,0)')
      grad.addColorStop(1, 'rgba(17,17,17,1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, H * 0.6, W, H * 0.4)

      // Typography
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('LOST IN', W * 0.1, H * 0.8)
      ctx.fillText('TRANSLATION', W * 0.1, H * 0.85)
      
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'italic 12px serif'
      ctx.fillText('Sofia Sofia', W * 0.1, H * 0.9)

      // Vinyl Progress
      ctx.save()
      ctx.translate(W * 0.8, H * 0.85)
      ctx.rotate(t)
      ctx.fillStyle = '#222'
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

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
