'use client'
import { useEffect, useRef } from 'react'

export default function PremiumFilmThumb() {
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
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, W, H)

      // Scrolling Film Strip
      const scrollY = (t * 10) % (H * 0.4)
      
      ctx.save()
      ctx.translate(W * 0.5, -scrollY)

      for (let i = 0; i < 4; i++) {
        const yPos = i * (H * 0.35)
        ctx.fillStyle = '#000'
        ctx.fillRect(-W * 0.35, yPos, W * 0.7, H * 0.3)
        ctx.strokeStyle = '#333'
        ctx.strokeRect(-W * 0.35, yPos, W * 0.7, H * 0.3)
        
        ctx.fillStyle = i % 2 === 0 ? '#332' : '#223'
        ctx.fillRect(-W * 0.3, yPos + H * 0.02, W * 0.6, H * 0.26)
        
        // markings
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.font = '8px monospace'
        ctx.fillText('KODAK', -W * 0.3, yPos + H * 0.015)
      }
      ctx.restore()

      // Bottom Gradient
      const grad = ctx.createLinearGradient(0, H * 0.7, 0, H)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.9)')
      ctx.fillStyle = grad
      ctx.fillRect(0, H * 0.6, W, H * 0.4)

      // Typography
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px serif'
      ctx.textAlign = 'center'
      ctx.fillText('Interstellar', W * 0.5, H * 0.85)
      
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '10px sans-serif'
      ctx.fillText('HANS ZIMMER', W * 0.5, H * 0.9)

      // Progress bar
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.fillRect(W * 0.2, H * 0.95, W * 0.6, 2)
      ctx.fillStyle = '#c9a84c'
      ctx.fillRect(W * 0.2, H * 0.95, W * 0.3, 2)

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
