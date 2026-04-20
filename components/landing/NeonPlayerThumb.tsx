'use client'
import { useEffect, useRef } from 'react'

export default function NeonPlayerThumb({ accent }: { accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    const hexMap: Record<string, string> = {
      'var(--accent-yellow)': '#fbff12',
      'var(--accent-red)': '#ff2056',
      'var(--accent-blue)': '#4361ee',
      'var(--accent-green)': '#06d6a0',
      'var(--accent-purple)': '#a855f7',
    }
    const hex = hexMap[accent] || ((accent && accent.startsWith('#') && accent.length >= 7) ? accent : '#a855f7')
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    let frame = 0
    let raf: number

    const draw = () => {
      const t = frame / 60
      ctx.clearRect(0, 0, W, H)

      // BG
      ctx.fillStyle = '#0a0a14'
      ctx.fillRect(0, 0, W, H)
      const gl = ctx.createRadialGradient(W * 0.25, H * 0.5, 0, W * 0.25, H * 0.5, W * 0.5)
      gl.addColorStop(0, 'rgba(88,28,135,0.28)')
      gl.addColorStop(1, 'transparent')
      ctx.fillStyle = gl
      ctx.fillRect(0, 0, W, H)

      // EQ PYRAMID
      const eqCols = 12, eqRows = 10
      const eqW = W * 0.38, padL = 12
      const cellW = (eqW - padL) / eqCols
      const cellH = (H * 0.52) / eqRows
      const eqBaseY = H * 0.72
      for (let col = 0; col < eqCols; col++) {
        const dist = Math.abs(col - (eqCols - 1) / 2) / ((eqCols - 1) / 2)
        const maxRows = Math.round(eqRows * (1 - dist * 0.72))
        const val = 0.3 + 0.6 * Math.abs(Math.sin(t * 2.5 + col * 0.4))
        const lit = Math.round(maxRows * val)
        for (let row = 0; row < maxRows; row++) {
          const isLit = row < lit
          const x = padL + col * cellW + cellW * 0.15
          const y = eqBaseY - (row + 1) * cellH + cellH * 0.15
          const rt = row / maxRows
          ctx.fillStyle = isLit
            ? `rgba(${Math.round(168 + rt * 60)},${Math.round(85 - rt * 30)},${Math.round(247 - rt * 80)},${0.7 + rt * 0.3})`
            : 'rgba(100,60,180,0.07)'
          ctx.beginPath()
          ctx.roundRect(x, y, cellW * 0.7, cellH * 0.7, 1.5)
          ctx.fill()
        }
      }

      // DASHED LINE
      const lineY = H * 0.5
      const artX = W * 0.54
      const btnCX = artX - 18
      ctx.setLineDash([6, 5])
      ctx.strokeStyle = 'rgba(168,85,247,0.2)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(padL, lineY)
      ctx.lineTo(btnCX - 20, lineY)
      ctx.stroke()
      const prog = Math.sin(t * 0.4) * 0.5 + 0.5
      ctx.strokeStyle = `rgba(${r},${g},${b},0.8)`
      ctx.beginPath()
      ctx.moveTo(padL, lineY)
      ctx.lineTo(padL + (btnCX - 20 - padL) * prog, lineY)
      ctx.stroke()
      ctx.setLineDash([])

      // ARTWORK CARD
      const aY = H * 0.1, aW = W * 0.42, aH = H * 0.78, aR = 14
      ctx.shadowColor = `rgba(${r},${g},${b},0.7)`
      ctx.shadowBlur = 20
      ctx.strokeStyle = `rgba(${r},${g},${b},1)`
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.roundRect(artX, aY, aW, aH, aR)
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(236,72,153,0.7)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(artX + 2, aY + 2, aW - 4, aH - 4, aR - 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(20,10,30,0.9)'
      ctx.beginPath()
      ctx.roundRect(artX, aY, aW, aH, aR)
      ctx.fill()
      ctx.fillStyle = `rgba(${r},${g},${b},0.35)`
      ctx.font = `${aH * 0.35}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('\u266A', artX + aW / 2, aY + aH / 2)

      // PAUSE BUTTON
      const bR = 16, bCY = lineY
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`
      ctx.shadowBlur = 14
      const bg = ctx.createLinearGradient(btnCX - bR, bCY - bR, btnCX + bR, bCY + bR)
      bg.addColorStop(0, `rgba(${r},${g},${b},1)`)
      bg.addColorStop(1, 'rgba(236,72,153,1)')
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.arc(btnCX, bCY, bR, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.fillRect(btnCX - 6, bCY - 7, 4, 14)
      ctx.fillRect(btnCX + 2, bCY - 7, 4, 14)

      // TEXT
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${H * 0.12}px sans-serif`
      ctx.fillText('Faithles', padL, H * 0.86)
      ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
      ctx.font = `${H * 0.07}px sans-serif`
      ctx.fillText('Solomun Set', padL, H * 0.94)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [accent])

  return (
    <canvas
      ref={ref}
      width={320}
      height={180}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
