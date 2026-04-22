import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  spring,
} from 'remotion'
import { Audio } from '@remotion/media'
import {
  visualizeAudio,
  useAudioData,
  type MediaUtilsAudioData,
} from '@remotion/media-utils'
import { VisualizerProps } from './shared'

function safeVisualize(
  d: MediaUtilsAudioData | null,
  frame: number, fps: number, n: number,
): number[] {
  if (!d) return new Array(n).fill(0)
  try { return visualizeAudio({ audioData: d, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0) }
  catch { return new Array(n).fill(0) }
}

function fmt(sec: number, signed = false): string {
  const neg = sec < 0
  const s = Math.abs(Math.floor(sec))
  const m = Math.floor(s / 60)
  const ss = (s % 60).toString().padStart(2, '0')
  return `${signed ? (neg ? '-' : '') : ''}${m}:${ss}`
}

export const WarmFloatingPlayerVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  artworkSrc,
  songTitle   = 'Perfect',
  artistName  = 'Ed Sheeran',
  durationInSeconds,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const t = frame / fps

  // ── Audio ──────────────────────────────────────────────────────────────
  const audioData = useAudioData(audioSrc)
  const freq      = safeVisualize(audioData, frame, fps, 16)
  const bass      = Math.min(freq.slice(0, 3).reduce((a, b) => a + b, 0) / 3, 1)

  // ── Entry spring ───────────────────────────────────────────────────────
  const entry = spring({ frame, fps, config: { damping: 30, stiffness: 60, mass: 1 }, durationInFrames: 60 })

  // ── Progress ───────────────────────────────────────────────────────────
  const progress     = Math.min(t / durationInSeconds, 1)
  const currentFmt   = fmt(t)
  const remainingFmt = fmt(t - durationInSeconds, true)

  // ── Artwork floating animation ─────────────────────────────────────────
  const floatAmt  = height * 0.012
  const floatY    = Math.sin(t * 0.65) * floatAmt
  const floatScl  = 1 + Math.sin(t * 0.48) * 0.008   // almost imperceptible scale

  // ── Shadow pulse with bass ─────────────────────────────────────────────
  const shadowBlur = 40 + bass * 20
  const shadowOp   = 0.32 + bass * 0.1

  // ── Layout constants ───────────────────────────────────────────────────
  const artW = Math.round(width * 0.73)
  const artH = artW   // square
  const artX = (width - artW) / 2
  const artBaseY = height * 0.155
  const artR = 26

  const playerW  = Math.round(width * 0.84)
  const playerH  = Math.round(height * 0.225)
  const playerX  = (width - playerW) / 2
  const playerY  = height * 0.624
  const playerR  = 38

  // Colors — strict warm/dark palette
  const CARD_BG = '#120c08'   // very dark brown-black
  const TEXT_W  = '#ffffff'
  const TEXT_S  = 'rgba(255,255,255,0.52)'  // subtitle gray
  const TEXT_T  = 'rgba(255,255,255,0.38)'  // timestamp gray
  const PROG_BG = 'rgba(255,255,255,0.18)'
  const PROG_FG = 'rgba(255,255,255,0.92)'

  // Control button positions (within player card)
  const ctrlY    = playerY + playerH * 0.72
  const prevCX   = playerX + playerW * 0.27
  const playCX   = playerX + playerW * 0.50
  const nextCX   = playerX + playerW * 0.73
  const ctrlIconSz = playerH * 0.14

  // Progress bar
  const progBarY  = playerY + playerH * 0.56
  const progBarX  = playerX + playerW * 0.06
  const progBarW  = playerW * 0.88
  const progBarH  = 2.5
  const thumbR    = 4.5

  return (
    <div style={{
      width, height,
      position: 'relative',
      overflow: 'hidden',
      background: '#2a1408',
      fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    }}>

      {/* ── WARM BACKGROUND GRADIENT ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 95% 80% at 50% 38%,
          #c8824a 0%,
          #a86030 22%,
          #7a4020 52%,
          #3a1e0c 80%,
          #1a0a04 100%)`,
      }} />

      {/* Warm glow top-right (subtle lens-flare like) */}
      <div style={{
        position: 'absolute',
        top: -height * 0.06, right: -width * 0.10,
        width: width * 0.70, height: height * 0.40,
        background: 'radial-gradient(ellipse 65% 55% at 70% 25%, rgba(220,140,60,0.28) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />

      {/* Warm glow bottom */}
      <div style={{
        position: 'absolute',
        bottom: -height * 0.04, left: '15%', right: '15%',
        height: height * 0.20,
        background: 'radial-gradient(ellipse 100% 70% at 50% 100%, rgba(210,110,40,0.45) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      {/* Vignette — edges to center fade */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 35%,
          transparent 25%,
          rgba(10,5,2,0.30) 60%,
          rgba(5,2,0,0.72) 100%)`,
      }} />

      {/* ── ARTWORK CARD (HTML layer for real image)────────────────────── */}
      <div style={{
        position: 'absolute',
        left: artX,
        top: artBaseY + floatY,
        width: artW,
        height: artH,
        borderRadius: artR,
        overflow: 'hidden',
        transform: `scale(${floatScl * (0.85 + entry * 0.15)})`,
        transformOrigin: 'center center',
        opacity: interpolate(entry, [0, 1], [0, 1]),
        boxShadow: [
          `0 ${shadowBlur}px ${shadowBlur * 2.2}px rgba(0,0,0,${shadowOp})`,
          `0 6px 24px rgba(0,0,0,0.28)`,
          `0 2px 8px rgba(0,0,0,0.20)`,
        ].join(', '),
      }}>
        <Img
          src={artworkSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Subtle warm film overlay on artwork */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(180, 100, 40, 0.06)',
          mixBlendMode: 'multiply',
        }} />
        {/* Very soft inner shadow on artwork edges */}
        <div style={{
          position: 'absolute', inset: 0,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.18)',
          borderRadius: artR,
        }} />
      </div>

      {/* ── MINI PLAYER + CONTROLS (SVG layer) ───────────────────────── */}
      <svg
        width={width} height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Player card drop shadow */}
          <filter id="wfp-card-shadow" x="-12%" y="-15%" width="124%" height="135%">
            <feDropShadow dx="0" dy="12" stdDeviation="28"
              floodColor="rgba(0,0,0,0.55)" floodOpacity="1" result="s1" />
            <feDropShadow dx="0" dy="4" stdDeviation="10"
              floodColor="rgba(0,0,0,0.35)" floodOpacity="1" result="s2" />
            <feMerge>
              <feMergeNode in="s1" />
              <feMergeNode in="s2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── PLAYER CARD ── */}
        <g
          opacity={interpolate(entry, [0, 1], [0, 1])}
          transform={`translate(0 ${interpolate(entry, [0, 1], [height * 0.06, 0])})`}
        >
          {/* Card glass body */}
          <rect
            x={playerX} y={playerY}
            width={playerW} height={playerH}
            rx={playerR}
            fill={CARD_BG}
            fillOpacity={0.92}
            filter="url(#wfp-card-shadow)"
          />
          {/* Subtle top edge highlight — glass feel */}
          <rect
            x={playerX + 1} y={playerY + 1}
            width={playerW - 2} height={playerR}
            rx={playerR}
            fill="url(#wfp-top-edge)"
            fillOpacity={0.12}
          />

          {/* ── TOP ROW: dots / title / airplay ── */}
          {/* Three dots */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={playerX + playerW * 0.09 + i * 8}
              cy={playerY + playerH * 0.235}
              r={2.8}
              fill={TEXT_T}
            />
          ))}

          {/* Song title — centered */}
          <text
            x={playerX + playerW / 2}
            y={playerY + playerH * 0.23}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={TEXT_W}
            fontSize={height * 0.032}
            fontWeight={700}
            fontFamily='"Inter", "SF Pro Display", Arial, sans-serif'
            letterSpacing="-0.01em"
          >
            {songTitle}
          </text>

          {/* Artist name — centered */}
          <text
            x={playerX + playerW / 2}
            y={playerY + playerH * 0.385}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={TEXT_S}
            fontSize={height * 0.022}
            fontWeight={400}
            fontFamily='"Inter", "SF Pro Display", Arial, sans-serif'
          >
            {artistName}
          </text>

          {/* Airplay icon — top right */}
          {(() => {
            const ax = playerX + playerW * 0.895
            const ay = playerY + playerH * 0.24
            const r  = playerH * 0.065
            return (
              <g>
                {/* Outer arc top */}
                <path
                  d={`M ${ax - r * 1.4} ${ay + r * 0.2}
                      A ${r * 1.8} ${r * 1.8} 0 0 1 ${ax + r * 1.4} ${ay + r * 0.2}`}
                  fill="none"
                  stroke={TEXT_S}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
                {/* Inner arc */}
                <path
                  d={`M ${ax - r * 0.80} ${ay + r * 0.5}
                      A ${r * 1.0} ${r * 1.0} 0 0 1 ${ax + r * 0.80} ${ay + r * 0.5}`}
                  fill="none"
                  stroke={TEXT_S}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
                {/* Down triangle */}
                <polygon
                  points={`${ax - r * 0.4},${ay + r * 0.72} ${ax + r * 0.4},${ay + r * 0.72} ${ax},${ay + r * 1.35}`}
                  fill={TEXT_S}
                />
              </g>
            )
          })()}

          {/* ── PROGRESS BAR ── */}
          {/* Track */}
          <rect
            x={progBarX} y={progBarY}
            width={progBarW} height={progBarH}
            rx={progBarH / 2}
            fill={PROG_BG}
          />
          {/* Fill */}
          <rect
            x={progBarX} y={progBarY}
            width={progBarW * progress} height={progBarH}
            rx={progBarH / 2}
            fill={PROG_FG}
          />
          {/* Thumb */}
          <circle
            cx={progBarX + progBarW * progress}
            cy={progBarY + progBarH / 2}
            r={thumbR}
            fill={PROG_FG}
          />

          {/* ── TIME STAMPS ── */}
          <text
            x={progBarX}
            y={progBarY - 8}
            fill={TEXT_T}
            fontSize={height * 0.018}
            fontFamily='"Inter", Arial, sans-serif'
            textAnchor="start"
          >
            {currentFmt}
          </text>
          <text
            x={progBarX + progBarW}
            y={progBarY - 8}
            fill={TEXT_T}
            fontSize={height * 0.018}
            fontFamily='"Inter", Arial, sans-serif'
            textAnchor="end"
          >
            {remainingFmt}
          </text>

          {/* ── CONTROLS ── */}
          {/* PREV ◄◄ */}
          {(() => {
            const sz = ctrlIconSz
            const cx = prevCX
            const cy = ctrlY
            return (
              <g>
                {/* Left bar */}
                <rect x={cx - sz * 0.72} y={cy - sz * 0.55} width={sz * 0.17} height={sz * 1.1} rx={2} fill={TEXT_W} />
                {/* Left triangle */}
                <polygon
                  points={`${cx - sz * 0.52},${cy} ${cx - sz * 0.08},${cy - sz * 0.52} ${cx - sz * 0.08},${cy + sz * 0.52}`}
                  fill={TEXT_W}
                />
                {/* Right triangle */}
                <polygon
                  points={`${cx + sz * 0.04},${cy} ${cx + sz * 0.48},${cy - sz * 0.52} ${cx + sz * 0.48},${cy + sz * 0.52}`}
                  fill={TEXT_W}
                />
              </g>
            )
          })()}

          {/* PAUSE ⏸ (two rects) */}
          {(() => {
            const sz  = ctrlIconSz * 1.3
            const cx  = playCX
            const cy  = ctrlY
            const gap = sz * 0.28
            const bW  = sz * 0.22
            const bH  = sz * 1.05
            return (
              <g>
                <rect x={cx - gap / 2 - bW} y={cy - bH / 2} width={bW} height={bH} rx={3} fill={TEXT_W} />
                <rect x={cx + gap / 2}       y={cy - bH / 2} width={bW} height={bH} rx={3} fill={TEXT_W} />
              </g>
            )
          })()}

          {/* NEXT ►► */}
          {(() => {
            const sz = ctrlIconSz
            const cx = nextCX
            const cy = ctrlY
            return (
              <g>
                {/* Left triangle */}
                <polygon
                  points={`${cx - sz * 0.48},${cy - sz * 0.52} ${cx - sz * 0.48},${cy + sz * 0.52} ${cx - sz * 0.04},${cy}`}
                  fill={TEXT_W}
                />
                {/* Right triangle */}
                <polygon
                  points={`${cx + sz * 0.08},${cy - sz * 0.52} ${cx + sz * 0.08},${cy + sz * 0.52} ${cx + sz * 0.52},${cy}`}
                  fill={TEXT_W}
                />
                {/* Right bar */}
                <rect x={cx + sz * 0.55} y={cy - sz * 0.55} width={sz * 0.17} height={sz * 1.1} rx={2} fill={TEXT_W} />
              </g>
            )
          })()}
        </g>
      </svg>

      <Audio src={audioSrc} />
    </div>
  )
}
