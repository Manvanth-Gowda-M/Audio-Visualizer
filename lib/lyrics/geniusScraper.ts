import { LyricLine } from '../store'

export async function fetchFromGenius(
  title: string,
  artist: string,
  duration = 210
): Promise<LyricLine[] | null> {
  try {
    // Dynamic import to avoid SSR issues
    const lyricsFinder = (await import('lyrics-finder')).default
    const rawLyrics: string = await lyricsFinder(artist, title)
    if (!rawLyrics) return null

    const lines = rawLyrics.split('\n').filter((l) => l.trim())
    if (lines.length === 0) return null

    return lines.map((text, i) => ({
      time: (i / lines.length) * duration,
      text,
    }))
  } catch {
    return null
  }
}
