import type { Caption } from '@/lib/store'

export interface VisualizerProps {
  audioSrc: string
  artworkSrc: string
  lyrics: Array<{ time: number; end?: number; text: string }>
  accentColor: string
  typoStyle: 'minimal' | 'bold' | 'neon'
  durationInSeconds: number
  lyricsFont?: string
  effects?: string[]
  captions?: Caption[]
  // Optional metadata for templates that display text
  songTitle?: string
  artistName?: string
  albumName?: string
  personImages?: string[]
}

export function getActiveLyric(
  lyrics: Array<{ time: number; end?: number; text: string }>,
  currentTime: number
): string {
  for (const line of lyrics) {
    const end = line.end ?? (line.time + 5)
    if (currentTime >= line.time && currentTime < end) return line.text
  }
  return ''
}

export function getTypographyStyle(style: 'minimal' | 'bold' | 'neon', accent: string, fontOverride?: string) {
  const FONT_MAP: Record<string, string> = {
    // Original 20
    inter:          'Inter, sans-serif',
    playfair:       '"Playfair Display", serif',
    montserrat:     'Montserrat, sans-serif',
    spacegrotesk:   '"Space Grotesk", sans-serif',
    bebas:          '"Bebas Neue", cursive',
    pacifico:       'Pacifico, cursive',
    cinzel:         'Cinzel, serif',
    orbitron:       'Orbitron, sans-serif',
    satisfy:        'Satisfy, cursive',
    rajdhani:       'Rajdhani, sans-serif',
    josefin:        '"Josefin Sans", sans-serif',
    ubuntu:         'Ubuntu, sans-serif',
    lobster:        'Lobster, cursive',
    permanentmarker: '"Permanent Marker", cursive',
    anton:          'Anton, sans-serif',
    abril:          '"Abril Fatface", cursive',
    righteous:      'Righteous, cursive',
    comfortaa:      'Comfortaa, cursive',
    russo:          '"Russo One", sans-serif',
    dancing:        '"Dancing Script", cursive',
    // Premium 6
    bigshoulders:   '"Big Shoulders Display", display',
    unbounded:      'Unbounded, sans-serif',
    cormorant:      '"Cormorant Garamond", serif',
    bodoni:         '"Bodoni Moda", serif',
    fraunces:       'Fraunces, serif',
    syne:           'Syne, sans-serif',
  }
  const fontFamily = fontOverride && FONT_MAP[fontOverride]
    ? FONT_MAP[fontOverride]
    : undefined

  if (style === 'minimal')
    return {
      fontFamily: fontFamily ?? 'Inter, sans-serif',
      fontWeight: 300,
      fontSize: 36,
      color: '#ffffff',
      textShadow: 'none',
    }
  if (style === 'bold')
    return {
      fontFamily: fontFamily ?? 'Montserrat, sans-serif',
      fontWeight: 800,
      fontSize: 52,
      color: '#ffffff',
      textShadow: `0 0 20px ${accent}88`,
    }
  return {
    fontFamily: fontFamily ?? 'Space Grotesk, sans-serif',
    fontWeight: 600,
    fontSize: 44,
    color: accent,
    textShadow: `0 0 30px ${accent}, 0 0 60px ${accent}55`,
  }
}

