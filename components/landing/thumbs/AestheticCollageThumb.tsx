'use client'
import { useEffect, useRef } from 'react'

export default function AestheticCollageThumb() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width   // 270
    const H = canvas.height  // 480
    let raf = 0
    let frame = 0

    // Try to load images to make it look realistic, but fallback to colored rectangles if they fail/take too long
    // For a simple thumbnail, we can just draw abstract shapes that represent the layout.
    const draw = () => {
      frame++
      const t = frame / 30
      ctx.clearRect(0, 0, W, H)

      // Background floral/warm texture
      ctx.fillStyle = '#2a1a15'
      ctx.fillRect(0, 0, W, H)

      const bgG = ctx.createLinearGradient(0, 0, 0, H)
      bgG.addColorStop(0, '#5a3b2a')
      bgG.addColorStop(1, '#2c150c')
      ctx.fillStyle = bgG
      ctx.fillRect(0, 0, W, H)

      // Warm Film Overlay/Vignette
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.2, W * 0.5, H * 0.5, H * 0.7)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(20,10,5,0.8)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      const float1 = Math.sin(t * 1.2) * 2
      const float2 = Math.cos(t * 1.5) * 2

      ctx.save()
      ctx.translate(W * 0.5, H * 0.45)
      
      // Top image
      ctx.save()
      ctx.translate(0, H * -0.2 + float1)
      ctx.rotate(1 * Math.PI / 180)
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5
      ctx.fillStyle = '#8b5a45'; ctx.fillRect(-W * 0.35, -H * 0.1, W * 0.7, H * 0.2)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(-W * 0.35, -H * 0.1, W * 0.7, H * 0.2)
      ctx.restore()

      // Middle image
      ctx.save()
      ctx.translate(0, H * -0.02 + float2)
      ctx.rotate(-2 * Math.PI / 180)
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5
      ctx.fillStyle = '#aa6c50'; ctx.fillRect(-W * 0.4, -H * 0.1, W * 0.8, H * 0.2)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(-W * 0.4, -H * 0.1, W * 0.8, H * 0.2)
      ctx.restore()

      // Bottom left image
      ctx.save()
      ctx.translate(-W * 0.15, H * 0.18 + float1)
      ctx.rotate(2 * Math.PI / 180)
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5
      ctx.fillStyle = '#c57d5c'; ctx.fillRect(-W * 0.2, -H * 0.12, W * 0.4, H * 0.24)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(-W * 0.2, -H * 0.12, W * 0.4, H * 0.24)
      ctx.restore()

      // Bottom right image
      ctx.save()
      ctx.translate(W * 0.15, H * 0.2 + float2)
      ctx.rotate(-1 * Math.PI / 180)
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5
      ctx.fillStyle = '#945b41'; ctx.fillRect(-W * 0.2, -H * 0.15, W * 0.4, H * 0.3)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(-W * 0.2, -H * 0.15, W * 0.4, H * 0.3)
      ctx.restore()

      ctx.restore()

      // Music player card
      const cW = W * 0.8
      const cH = H * 0.18
      const cX = W * 0.1
      const cY = H * 0.65

      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 15; ctx.shadowOffsetY = 8
      ctx.fillStyle = '#7a3e1b'
      ctx.beginPath(); ctx.roundRect(cX, cY, cW, cH, 12); ctx.fill()
      ctx.restore()

      // Player content
      // Thumbnail
      ctx.fillStyle = '#5c2d13'
      ctx.beginPath(); ctx.roundRect(cX + 12, cY + 12, cH * 0.4, cH * 0.4, 4); ctx.fill()

      // Text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText('Song Title', cX + 12 + cH * 0.4 + 10, cY + 24)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '10px sans-serif'
      ctx.fillText('Artist', cX + 12 + cH * 0.4 + 10, cY + 38)

      // Progress bar
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath(); ctx.roundRect(cX + 12, cY + cH * 0.65, cW - 24, 2, 1); ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.roundRect(cX + 12, cY + cH * 0.65, (cW - 24) * 0.4, 2, 1); ctx.fill()

      // Controls
      ctx.fillStyle = '#ffffff'
      const ctrlY = cY + cH * 0.85
      const cx = cX + cW * 0.5
      // Play button
      ctx.beginPath(); ctx.arc(cx, ctrlY, 8, 0, Math.PI * 2); ctx.fill()

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
