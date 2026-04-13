export interface VisualizerProps {
  audioSrc: string
  artworkSrc: string
  lyrics: Array<{ time: number; text: string }>
  accentColor: string
  typoStyle: 'minimal' | 'bold' | 'neon'
  durationInSeconds: number
}

export function getActiveLyric(
  lyrics: Array<{ time: number; text: string }>,
  currentTime: number
): string {
  const active = [...lyrics].reverse().find((line) => line.time <= currentTime)
  return active?.text ?? ''
}

export function getTypographyStyle(style: 'minimal' | 'bold' | 'neon', accent: string) {
  if (style === 'minimal')
    return {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 300,
      fontSize: 36,
      color: '#ffffff',
      textShadow: 'none',
    }
  if (style === 'bold')
    return {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 800,
      fontSize: 52,
      color: '#ffffff',
      textShadow: `0 0 20px ${accent}88`,
    }
  return {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 600,
    fontSize: 44,
    color: accent,
    textShadow: `0 0 30px ${accent}, 0 0 60px ${accent}55`,
  }
}
