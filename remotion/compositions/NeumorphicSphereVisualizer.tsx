import {
  useCurrentFrame,
  useVideoConfig,
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

// ── Audio helper ───────────────────────────────────────────────────────────
function safeVisualize(d: MediaUtilsAudioData | null, frame: number, fps: number, n: number): number[] {
  if (!d) return new Array(n).fill(0)
  try { return visualizeAudio({ audioData: d, frame, fps, numberOfSamples: n }) ?? new Array(n).fill(0) }
  catch { return new Array(n).fill(0) }
}

// ── Component ──────────────────────────────────────────────────────────────
export const NeumorphicSphereVisualizer: React.FC<VisualizerProps> = ({
  audioSrc,
  songTitle  = '0928B',
  artistName = 'My new project 02',
  durationInSeconds,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const t = frame / fps

  // ── Audio analysis ────────────────────────────────────────────────────
  const audioData  = useAudioData(audioSrc)
  const allFreq    = safeVisualize(audioData, frame, fps, 64)
  const bassFreq   = allFreq.slice(0, 5)
  const midFreq    = allFreq.slice(5, 24)
  const bass       = Math.min(bassFreq.reduce((a, b) => a + b, 0) / bassFreq.length, 1)
  const mid        = Math.min(midFreq.reduce((a, b) => a + b, 0) / midFreq.length, 1)
  const overall    = Math.min(allFreq.reduce((a, b) => a + b, 0) / allFreq.length, 1)

  // ── Entry animation ───────────────────────────────────────────────────
  const entry = spring({ frame, fps, config: { damping: 26, stiffness: 80, mass: 1.1 }, durationInFrames: 55 })

  // ── Layout ────────────────────────────────────────────────────────────
  const cardW  = Math.round(width  * 0.78)
  const cardH  = Math.round(height * 0.68)
  const cardX  = (width  - cardW) / 2
  const cardY  = (height - cardH) / 2
  const cardR  = 44

  // Sphere
  const sphereR  = Math.round(cardW * 0.38)
  const sphereCX = width / 2
  const sphereCY = cardY + sphereR + cardH * 0.04

  // Bass scale pulse on sphere
  const sphereScale = 1 + bass * 0.045

  // Metallic deformation — feTurbulence baseFrequency driven by audio
  const turbBase = 0.008 + mid * 0.018
  const turbScale = 8 + bass * 22

  // Knob rotation — accumulates over time, mid audio influence
  const knobAngle = (t * 18 + mid * 60) % 360

  // Play button "pressed" state on strong bass
  const btnScale = 1 - bass * 0.06

  // Text section
  const textY  = sphereCY + sphereR + cardH * 0.06
  const ctrlY  = cardY + cardH - cardH * 0.21

  // Control bar dims
  const ctrlW  = cardW - 48
  const ctrlH  = Math.round(cardH * 0.17)
  const ctrlX  = cardX + 24
  const ctrlR  = ctrlH / 2

  // Colors — strict neumorphic palette
  const BG      = '#090909'
  const CARD_BG = '#181818'
  const CTRL_BG = '#141414'
  const SHADOW_D = '#080808'   // dark shadow
  const SHADOW_L = '#242424'   // light shadow
  const TEXT_1  = '#e8e8e8'
  const TEXT_2  = '#787878'
  const BTN_BG  = '#1c1c1c'

  return (
    <div style={{
      width, height,
      position: 'relative',
      overflow: 'hidden',
      background: BG,
      fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    }}>

      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>

          {/* ── Card neumorphic shadows ── */}
          <filter id="ns-card-shadow" x="-12%" y="-8%" width="124%" height="120%">
            {/* Dark shadow top-left */}
            <feDropShadow dx="-8" dy="-8" stdDeviation="18" floodColor={SHADOW_D} floodOpacity="0.95" result="dark" />
            {/* Light shadow bottom-right */}
            <feDropShadow dx="8"  dy="8"  stdDeviation="18" floodColor={SHADOW_L} floodOpacity="0.60" result="light" />
            <feMerge><feMergeNode in="dark" /><feMergeNode in="light" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Button neumorphic filter ── */}
          <filter id="ns-btn-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-3" dy="-3" stdDeviation="5" floodColor={SHADOW_D} floodOpacity="1"    result="d" />
            <feDropShadow dx="3"  dy="3"  stdDeviation="5" floodColor={SHADOW_L} floodOpacity="0.55" result="l" />
            <feMerge><feMergeNode in="d" /><feMergeNode in="l" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Inset shadow (for concave areas) ── */}
          <filter id="ns-inset" x="-5%" y="-5%" width="110%" height="110%">
            <feComposite in="SourceGraphic" in2="SourceGraphic" operator="arithmetic" k2="-1" k3="1" result="inv" />
            <feGaussianBlur in="inv" stdDeviation="6" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="in" result="shadow" />
            <feBlend in="shadow" in2="SourceGraphic" mode="multiply" />
          </filter>

          {/* ── Sphere metallic radial gradient ── */}
          {/* Primary highlight — top-right */}
          <radialGradient id="ns-sphere-base" cx="62%" cy="30%" r="70%" fx="62%" fy="28%">
            <stop offset="0%"   stopColor="#d8d8d8" />
            <stop offset="18%"  stopColor="#a0a0a0" />
            <stop offset="45%"  stopColor="#585858" />
            <stop offset="72%"  stopColor="#282828" />
            <stop offset="100%" stopColor="#101010" />
          </radialGradient>

          {/* Specular hot-spot */}
          <radialGradient id="ns-sphere-spec" cx="58%" cy="26%" r="22%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.88)" />
            <stop offset="40%"  stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </radialGradient>

          {/* Rim light — bottom-left */}
          <radialGradient id="ns-sphere-rim" cx="22%" cy="78%" r="45%">
            <stop offset="0%"   stopColor="rgba(160,160,160,0.35)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)"          />
          </radialGradient>

          {/* Secondary reflected light — bottom */}
          <radialGradient id="ns-sphere-refl" cx="50%" cy="95%" r="38%">
            <stop offset="0%"   stopColor="rgba(120,120,120,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)"          />
          </radialGradient>

          {/* ── Metallic sphere deformation via turbulence ── */}
          <filter id="ns-sphere-deform" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${turbBase} ${turbBase * 1.3}`}
              numOctaves="4"
              seed={Math.floor(t * 2) % 60}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={turbScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* ── Sphere drop shadow ── */}
          <filter id="ns-sphere-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy={sphereR * 0.15} stdDeviation={sphereR * 0.18}
              floodColor="#000" floodOpacity="0.8" />
          </filter>

          {/* ── Volume knob metallic gradient ── */}
          <radialGradient id="ns-knob-metal" cx="38%" cy="30%" r="65%">
            <stop offset="0%"   stopColor="#606060" />
            <stop offset="35%"  stopColor="#3a3a3a" />
            <stop offset="70%"  stopColor="#222222" />
            <stop offset="100%" stopColor="#181818" />
          </radialGradient>

          {/* Knob specular */}
          <radialGradient id="ns-knob-spec" cx="35%" cy="28%" r="28%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.65)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </radialGradient>

          {/* ── Sphere viewing window clip (black upper half of card) ── */}
          <clipPath id="ns-sphere-clip">
            <rect x={cardX} y={cardY} width={cardW} height={sphereR * 2.3} rx={cardR} />
          </clipPath>

        </defs>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* CARD — neumorphic raised dark surface                            */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <g
          opacity={interpolate(entry, [0, 1], [0, 1])}
          transform={`translate(${(1 - entry) * 24} 0)`}
        >
          <rect
            x={cardX} y={cardY}
            width={cardW} height={cardH}
            rx={cardR}
            fill={CARD_BG}
            filter="url(#ns-card-shadow)"
          />

          {/* Sphere display area — near-black recess inside card */}
          <rect
            x={cardX + 8} y={cardY + 8}
            width={cardW - 16} height={sphereR * 2.25}
            rx={cardR - 4}
            fill="#0c0c0c"
          />

          {/* ─── 3D METALLIC SPHERE ─── */}
          {/* Outer glow shadow beneath sphere */}
          <ellipse
            cx={sphereCX} cy={sphereCY + sphereR * 0.92}
            rx={sphereR * 0.72}
            ry={sphereR * 0.12}
            fill="#000"
            opacity={0.65}
          />

          {/* Sphere base — audio deformation applied here */}
          <g
            transform={`translate(${sphereCX} ${sphereCY}) scale(${sphereScale}) translate(${-sphereCX} ${-sphereCY})`}
          >
            {/* Deformed metallic sphere */}
            <circle
              cx={sphereCX} cy={sphereCY} r={sphereR}
              fill="url(#ns-sphere-base)"
              filter="url(#ns-sphere-deform)"
            />
          </g>

          {/* Specular highlight — no deformation, stays crisp */}
          <circle
            cx={sphereCX} cy={sphereCY} r={sphereR}
            fill="url(#ns-sphere-spec)"
            transform={`translate(${sphereCX} ${sphereCY}) scale(${sphereScale}) translate(${-sphereCX} ${-sphereCY})`}
          />

          {/* Rim light */}
          <circle
            cx={sphereCX} cy={sphereCY} r={sphereR}
            fill="url(#ns-sphere-rim)"
            transform={`translate(${sphereCX} ${sphereCY}) scale(${sphereScale}) translate(${-sphereCX} ${-sphereCY})`}
          />

          {/* Reflected bottom light */}
          <circle
            cx={sphereCX} cy={sphereCY} r={sphereR}
            fill="url(#ns-sphere-refl)"
          />

          {/* ─── EDIT BUTTON (pencil icon, neumorphic pill) ─── */}
          {(() => {
            const bR  = width * 0.048
            const bCX = cardX + bR + 24
            const bCY = sphereCY + sphereR + bR * 1.1
            return (
              <g>
                <circle cx={bCX} cy={bCY} r={bR} fill={BTN_BG} filter="url(#ns-btn-shadow)" />
                {/* Pencil icon */}
                <g transform={`translate(${bCX - bR * 0.28} ${bCY - bR * 0.35}) rotate(-45 ${bR * 0.28} ${bR * 0.55})`}>
                  <rect x={0} y={bR * 0.08} width={bR * 0.38} height={bR * 0.88} rx={2} fill={TEXT_2} />
                  <polygon points={`0,${bR * 0.08} ${bR * 0.38},${bR * 0.08} ${bR * 0.19},${-bR * 0.18}`} fill={TEXT_2} />
                </g>
              </g>
            )
          })()}

          {/* ─── TEXT ─── */}
          {/* Song title */}
          <text
            x={cardX + 32}
            y={textY}
            fill={TEXT_1}
            fontSize={height * 0.046}
            fontWeight={600}
            fontFamily='"Inter", "SF Pro Display", Arial, sans-serif'
            letterSpacing="-0.01em"
          >
            {songTitle}
          </text>

          {/* Artist / project */}
          <text
            x={cardX + 32}
            y={textY + height * 0.042}
            fill={TEXT_2}
            fontSize={height * 0.026}
            fontWeight={400}
            fontFamily='"Inter", "SF Pro Display", Arial, sans-serif'
          >
            {artistName}
          </text>

          {/* Heart / favorite button */}
          {(() => {
            const bR  = width * 0.048
            const bCX = cardX + cardW - bR - 24
            const bCY = textY + height * 0.01
            return (
              <g>
                <circle cx={bCX} cy={bCY} r={bR} fill={BTN_BG} filter="url(#ns-btn-shadow)" />
                {/* Heart icon */}
                <text
                  x={bCX} y={bCY + bR * 0.38}
                  textAnchor="middle"
                  fontSize={bR * 0.85}
                  fill={TEXT_2}
                  fontFamily="Arial, sans-serif"
                >♥</text>
              </g>
            )
          })()}

          {/* ─── CONTROLS BAR ─── */}
          {/* Neumorphic pill container */}
          <rect
            x={ctrlX} y={ctrlY}
            width={ctrlW} height={ctrlH}
            rx={ctrlR}
            fill={CTRL_BG}
            filter="url(#ns-btn-shadow)"
          />

          {/* ── PLAY BUTTON ── */}
          {(() => {
            const bR  = ctrlH * 0.42
            const bCX = ctrlX + bR + ctrlH * 0.2
            const bCY = ctrlY + ctrlH / 2
            const sc  = btnScale
            return (
              <g transform={`translate(${bCX} ${bCY}) scale(${sc}) translate(${-bCX} ${-bCY})`}>
                <circle cx={bCX} cy={bCY} r={bR} fill={BTN_BG} filter="url(#ns-btn-shadow)" />
                {/* Play triangle */}
                <polygon
                  points={`${bCX - bR * 0.32},${bCY - bR * 0.42} ${bCX - bR * 0.32},${bCY + bR * 0.42} ${bCX + bR * 0.45},${bCY}`}
                  fill={TEXT_1}
                />
              </g>
            )
          })()}

          {/* ── PREV / NEXT — elongated neumorphic pill ── */}
          {(() => {
            const pillW = ctrlW * 0.30
            const pillH = ctrlH * 0.60
            const pillX = ctrlX + ctrlW * 0.30
            const pillY = ctrlY + (ctrlH - pillH) / 2
            const pillR = pillH / 2
            return (
              <g>
                <rect
                  x={pillX} y={pillY}
                  width={pillW} height={pillH}
                  rx={pillR}
                  fill={CTRL_BG}
                  filter="url(#ns-btn-shadow)"
                />
                {/* Prev ◄◄ */}
                <g>
                  <polygon
                    points={`${pillX + pillW * 0.28},${pillY + pillH * 0.30} ${pillX + pillW * 0.28},${pillY + pillH * 0.70} ${pillX + pillW * 0.14},${pillY + pillH * 0.50}`}
                    fill={TEXT_2}
                  />
                  <polygon
                    points={`${pillX + pillW * 0.42},${pillY + pillH * 0.30} ${pillX + pillW * 0.42},${pillY + pillH * 0.70} ${pillX + pillW * 0.28},${pillY + pillH * 0.50}`}
                    fill={TEXT_2}
                  />
                </g>
                {/* Next ►► */}
                <g>
                  <polygon
                    points={`${pillX + pillW * 0.58},${pillY + pillH * 0.30} ${pillX + pillW * 0.58},${pillY + pillH * 0.70} ${pillX + pillW * 0.72},${pillY + pillH * 0.50}`}
                    fill={TEXT_2}
                  />
                  <polygon
                    points={`${pillX + pillW * 0.72},${pillY + pillH * 0.30} ${pillX + pillW * 0.72},${pillY + pillH * 0.70} ${pillX + pillW * 0.86},${pillY + pillH * 0.50}`}
                    fill={TEXT_2}
                  />
                </g>
              </g>
            )
          })()}

          {/* ── VOLUME KNOB ── */}
          {(() => {
            const knobR = ctrlH * 0.44
            const knobCX = ctrlX + ctrlW - knobR - ctrlH * 0.18
            const knobCY = ctrlY + ctrlH / 2
            // Indicator line angle (points UP = 0°, rotates clockwise)
            const indicatorAngle = (knobAngle - 90) * (Math.PI / 180)
            const lineLen = knobR * 0.6
            const ix = knobCX + Math.cos(indicatorAngle) * lineLen
            const iy = knobCY + Math.sin(indicatorAngle) * lineLen
            return (
              <g>
                {/* Knob base shadow */}
                <circle cx={knobCX} cy={knobCY} r={knobR} fill={BTN_BG} filter="url(#ns-btn-shadow)" />
                {/* Metallic fill */}
                <circle cx={knobCX} cy={knobCY} r={knobR} fill="url(#ns-knob-metal)" />
                {/* Specular */}
                <circle cx={knobCX} cy={knobCY} r={knobR} fill="url(#ns-knob-spec)" />
                {/* Indicator dot */}
                <circle cx={ix} cy={iy} r={knobR * 0.11} fill={TEXT_1} opacity={0.9} />
              </g>
            )
          })()}

          {/* ─── PROGRESS / TIME STRIP ─── */}
          {(() => {
            const progress = Math.min(t / durationInSeconds, 1)
            const barY = ctrlY - ctrlH * 0.38
            const barH = 3
            const barX = ctrlX
            const barW = ctrlW
            return (
              <g>
                {/* Track */}
                <rect x={barX} y={barY} width={barW} height={barH} rx={barH / 2} fill={CTRL_BG} />
                {/* Fill */}
                <rect x={barX} y={barY} width={barW * progress} height={barH} rx={barH / 2} fill={TEXT_2} />
                {/* Thumb */}
                <circle
                  cx={barX + barW * progress}
                  cy={barY + barH / 2}
                  r={6}
                  fill={TEXT_1}
                />
              </g>
            )
          })()}

        </g>

      </svg>

      <Audio src={audioSrc} />
    </div>
  )
}
