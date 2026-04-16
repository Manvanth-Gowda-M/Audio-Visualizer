'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import type { AppState } from '@/lib/store'

type Template = AppState['template']

const templates: { id: Template; name: string; desc: string }[] = [
  { id: 'circle',     name: 'Circle',      desc: 'Frequency bars radiate from album art' },
  { id: 'waveform',   name: 'Waveform',    desc: 'Mirrored bars pulse with the beat' },
  { id: 'particles',  name: 'Particles',   desc: 'Particles burst with bass energy' },
  { id: 'vinyl',      name: 'Vinyl',       desc: 'Spinning record with aurora glow' },
  { id: 'glitch',     name: 'Glitch',      desc: 'RGB split & scanlines on the beat' },
  { id: 'cassette',   name: 'Cassette',    desc: 'Retro tape deck with VU meters' },
  { id: 'neonplayer',  name: 'Neon Player',  desc: 'Pyramid EQ bars with neon card' },
  { id: 'appleplayer', name: 'Apple Player', desc: 'iOS glassmorphism music player' },
]

function drawThumb(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  type: Template,
  color: string,
  frame: number
) {
  const { width: w, height: h } = canvas
  const cx = w / 2
  const cy = h / 2
  const t = frame / 60

  ctx.clearRect(0, 0, w, h)

  if (type === 'circle') {
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      const val = 0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i * 0.3))
      const r = 22
      const barH = val * 16
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
      ctx.lineTo(cx + Math.cos(angle) * (r + barH), cy + Math.sin(angle) * (r + barH))
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(cx, cy, 14, 0, Math.PI * 2)
    ctx.fillStyle = '#222'
    ctx.fill()

  } else if (type === 'waveform') {
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)
    const bars = 48
    const bw = w / bars - 1
    for (let i = 0; i < bars; i++) {
      const val = 0.2 + 0.6 * Math.abs(Math.sin(t * 3 + i * 0.25))
      const bh = val * cy * 0.75
      const x = i * (bw + 1)
      ctx.fillStyle = color
      ctx.globalAlpha = 0.85
      ctx.fillRect(x, cy - bh, bw, bh)
      ctx.globalAlpha = 0.35
      ctx.fillRect(x, cy, bw, bh)
      ctx.globalAlpha = 1
    }

  } else if (type === 'particles') {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 40; i++) {
      const seed = i * 137.5
      const angle = (seed % 360) * (Math.PI / 180)
      const dist = 15 + (i % 5) * 7
      const x = cx + Math.cos(angle + t * 0.5) * dist
      const y = cy + Math.sin(angle + t * 0.4) * dist
      ctx.beginPath()
      ctx.arc(x, y, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t + i))
      ctx.fill()
      ctx.globalAlpha = 1
    }

  } else if (type === 'vinyl') {
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, w, h)
    // Aurora glow
    const grad = ctx.createRadialGradient(cx * 0.4, cy, 0, cx * 0.4, cy, w * 0.6)
    grad.addColorStop(0, color + '44')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    // Vinyl disc
    const spinDeg = t * 33.3 * 6 * (Math.PI / 180)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(spinDeg)
    ctx.beginPath()
    ctx.arc(0, 0, 28, 0, Math.PI * 2)
    ctx.fillStyle = '#111'
    ctx.fill()
    ctx.strokeStyle = '#ffffff08'
    for (let r = 12; r < 28; r += 3) {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
    // Freq arcs
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2 - Math.PI / 2
      const val = 0.2 + 0.6 * Math.abs(Math.sin(t * 2 + i * 0.4))
      const r1 = 30, r2 = 30 + val * 14
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6 + val * 0.4
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1)
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    // Center hole
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a0f'
    ctx.fill()

  } else if (type === 'glitch') {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    // Scanlines
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, y, w, 1)
    }
    // Spectrum
    const bars = 48
    const bw = w / bars
    for (let i = 0; i < bars; i++) {
      const val = 0.1 + 0.7 * Math.abs(Math.sin(t * 4 + i * 0.3))
      const bh = val * h * 0.5
      const hue = (i / bars) * 60 + 260
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`
      ctx.globalAlpha = 0.7
      ctx.fillRect(i * bw, h - bh, bw - 1, bh)
      ctx.globalAlpha = 1
    }
    // Glitch slices
    if (Math.sin(t * 7) > 0.6) {
      const sliceY = Math.random() * h
      ctx.fillStyle = color + '33'
      ctx.fillRect(Math.random() * 10 - 5, sliceY, w, 4 + Math.random() * 8)
    }
    // Center box
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(cx - 20, cy - 20, 40, 40)
    ctx.strokeStyle = '#ff0055'
    ctx.strokeRect(cx - 20 + 1, cy - 20, 40, 40)
    ctx.strokeStyle = '#00ffff'
    ctx.strokeRect(cx - 20 - 1, cy - 20, 40, 40)

  } else if (type === 'cassette') {
    // Warm dark bg
    ctx.fillStyle = '#0d0800'
    ctx.fillRect(0, 0, w, h)
    // Cassette body
    const bx = 8, by = 18, bw2 = w - 16, bh2 = h - 30
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(bx, by, bw2, bh2, 4)
    } else {
      ctx.rect(bx, by, bw2, bh2)
    }
    ctx.fill()
    ctx.stroke()
    // Tape window
    ctx.fillStyle = '#0a0500'
    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(cx - 28, cy - 10, 56, 24, 3)
    } else {
      ctx.rect(cx - 28, cy - 10, 56, 24)
    }
    ctx.fill()
    // Reels
    const spinDeg = t * 120 * (Math.PI / 180)
    const drawReel = (rx: number, ry: number, r: number, spin: number) => {
      ctx.save()
      ctx.translate(rx, ry)
      ctx.rotate(spin)
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fillStyle = '#222'
      ctx.fill()
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 1
      ctx.stroke()
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3)
        ctx.lineTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2))
        ctx.strokeStyle = '#444'
        ctx.stroke()
      }
      ctx.restore()
    }
    drawReel(cx - 18, cy + 2, 10, -spinDeg)
    drawReel(cx + 18, cy + 2, 10, spinDeg)
    // VU bars
    for (let i = 0; i < 4; i++) {
      const val = 0.2 + 0.7 * Math.abs(Math.sin(t * 3 + i * 0.8))
      const filled = Math.round(val * 4)
      for (let j = 0; j < 4; j++) {
        const isLit = j < filled
        ctx.fillStyle = j >= 3 ? (isLit ? '#ff3333' : '#222') : (isLit ? color : '#222')
        ctx.fillRect(bx + 4 + j * 5, by + 4 + i * 6, 4, 4)
      }
    }
    // Progress bar
    const prog = (Math.sin(t * 0.3) * 0.5 + 0.5)
    ctx.fillStyle = '#222'
    ctx.fillRect(bx + 4, by + bh2 - 6, bw2 - 8, 3)
    ctx.fillStyle = color
    ctx.fillRect(bx + 4, by + bh2 - 6, (bw2 - 8) * prog, 3)
  } else if (type === 'neonplayer') {
    // mini neon player thumb
    ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, w, h)
    const gl = ctx.createRadialGradient(w*0.25, h*0.5, 0, w*0.25, h*0.5, w*0.5)
    gl.addColorStop(0, 'rgba(88,28,135,0.25)'); gl.addColorStop(1, 'transparent')
    ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h)
    const eqCols = 10, eqRows = 8, eqW = w*0.38, padL = 6
    const cellW = (eqW-padL)/eqCols, cellH = (h*0.5)/eqRows, eqBaseY = h*0.72
    for (let col=0;col<eqCols;col++) {
      const dist = Math.abs(col-(eqCols-1)/2)/((eqCols-1)/2)
      const maxRows = Math.round(eqRows*(1-dist*0.72))
      const val = 0.3+0.6*Math.abs(Math.sin(t*2.5+col*0.4))
      const lit = Math.round(maxRows*val)
      for (let row=0;row<maxRows;row++) {
        const isLit = row<lit; const rt = row/maxRows
        ctx.fillStyle = isLit ? `rgba(${Math.round(168+rt*60)},${Math.round(85-rt*30)},${Math.round(247-rt*80)},${0.7+rt*0.3})` : 'rgba(100,60,180,0.07)'
        ctx.beginPath(); ctx.roundRect(padL+col*cellW+cellW*0.15, eqBaseY-(row+1)*cellH+cellH*0.15, cellW*0.7, cellH*0.7, 1); ctx.fill()
      }
    }
    const lineY = h*0.5, artX = w*0.54, btnCX = artX-14
    ctx.setLineDash([5,4]); ctx.strokeStyle='rgba(168,85,247,0.25)'; ctx.lineWidth=1.2
    ctx.beginPath(); ctx.moveTo(padL,lineY); ctx.lineTo(btnCX-16,lineY); ctx.stroke()
    ctx.setLineDash([])
    ctx.shadowColor='rgba(168,85,247,0.7)'; ctx.shadowBlur=10
    ctx.strokeStyle=color; ctx.lineWidth=2
    ctx.beginPath(); ctx.roundRect(artX, h*0.1, w*0.42, h*0.78, 10); ctx.stroke()
    ctx.shadowBlur=0
    ctx.fillStyle='rgba(20,10,30,0.85)'; ctx.beginPath(); ctx.roundRect(artX, h*0.1, w*0.42, h*0.78, 10); ctx.fill()
    const bg2 = ctx.createLinearGradient(btnCX-14,lineY-14,btnCX+14,lineY+14)
    bg2.addColorStop(0,color); bg2.addColorStop(1,'rgba(236,72,153,1)')
    ctx.fillStyle=bg2; ctx.beginPath(); ctx.arc(btnCX,lineY,14,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#fff'; ctx.fillRect(btnCX-5,lineY-6,3,12); ctx.fillRect(btnCX+2,lineY-6,3,12)
  } else if (type === 'appleplayer') {
    // Apple Player mini thumb
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h)
    const abg = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w*0.7)
    abg.addColorStop(0,'rgba(40,35,30,1)'); abg.addColorStop(1,'rgba(10,10,12,1)')
    ctx.fillStyle=abg; ctx.fillRect(0,0,w,h)
    const cW=w*0.58, cH=h*0.92, cX=(w-cW)/2, cY=(h-cH)/2
    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=12
    ctx.fillStyle='rgba(28,28,30,0.85)'; ctx.beginPath(); ctx.roundRect(cX,cY,cW,cH,10); ctx.fill()
    ctx.shadowBlur=0
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.7
    ctx.beginPath(); ctx.roundRect(cX,cY,cW,cH,10); ctx.stroke()
    const artH=cH*0.52
    ctx.save(); ctx.beginPath(); ctx.roundRect(cX,cY,cW,artH,[10,10,0,0]); ctx.clip()
    const ag=ctx.createLinearGradient(cX,cY,cX+cW,cY+artH)
    ag.addColorStop(0,'#2a2520'); ag.addColorStop(1,'#0e0c0a')
    ctx.fillStyle=ag; ctx.fillRect(cX,cY,cW,artH)
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font=`${cW*0.22}px serif`
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('♪',cX+cW/2,cY+artH/2)
    ctx.restore()
    const pad=cW*0.1, tY=cY+artH+cH*0.04
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font=`${cW*0.075}px sans-serif`; ctx.textAlign='left'; ctx.textBaseline='top'
    ctx.fillText('Now Playing',cX+pad,tY)
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font=`bold ${cW*0.115}px sans-serif`
    ctx.fillText('The Greatest',cX+pad,tY+cH*0.055)
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font=`${cW*0.09}px sans-serif`
    ctx.fillText('Sia',cX+pad,tY+cH*0.13)
    const prog2=(Math.sin(t*0.35)*0.5+0.5)*0.4+0.05, barY=cY+artH+cH*0.285
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(cX+pad,barY,cW-pad*2,2,1); ctx.fill()
    ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.roundRect(cX+pad,barY,(cW-pad*2)*prog2,2,1); ctx.fill()
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cX+pad+(cW-pad*2)*prog2,barY+1,3.5,0,Math.PI*2); ctx.fill()
    const ctrlY=cY+artH+cH*0.44, ctrlCX=cX+cW/2
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.roundRect(ctrlCX-7,ctrlY-8,5,16,2); ctx.fill(); ctx.beginPath(); ctx.roundRect(ctrlCX+2,ctrlY-8,5,16,2); ctx.fill()
    const volY=cY+artH+cH*0.6
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(cX+pad+12,volY,cW-pad*2-24,2,1); ctx.fill()
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.roundRect(cX+pad+12,volY,(cW-pad*2-24)*0.7,2,1); ctx.fill()
  }
}

function useThumbAnimation(
  ref: React.RefObject<HTMLCanvasElement | null>,
  type: Template,
  color: string
) {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let frame = 0
    let raf: number
    const loop = () => {
      drawThumb(ctx, canvas, type, color, frame)
      frame++
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [ref, type, color])
}

function ThumbCanvas({ type, color }: { type: Template; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useThumbAnimation(ref, type, color)
  return (
    <canvas ref={ref} width={100} height={72} className="rounded-lg bg-zinc-950 w-full" />
  )
}

export default function TemplatePicker() {
  const { template, setTemplate, accentColor } = useStore()

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div
          key={t.id}
          onClick={() => setTemplate(t.id)}
          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border-2 transition-all ${
            template === t.id
              ? 'border-purple-500 bg-zinc-800'
              : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
          }`}
        >
          <div className="w-20 shrink-0">
            <ThumbCanvas type={t.id} color={accentColor} />
          </div>
          <div>
            <p className="text-zinc-100 font-medium text-sm">{t.name}</p>
            <p className="text-zinc-400 text-xs leading-snug">{t.desc}</p>
          </div>
          {template === t.id && (
            <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-purple-500" />
          )}
        </div>
      ))}
    </div>
  )
}
