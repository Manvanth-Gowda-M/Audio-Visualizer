import { LyricLine } from '../store'
import { parseLrc, distributeLines } from './lrcParser'

export async function fetchFromLrcLib(
  title: string,
  artist: string,
  duration = 210
): Promise<LyricLine[] | null> {
  try {
    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()

    if (data.syncedLyrics) {
      const parsed = parseLrc(data.syncedLyrics, duration)
      if (parsed.length > 0) return parsed
    }

    if (data.plainLyrics) {
      const lines = data.plainLyrics.split('\n').filter((l: string) => l.trim())
      if (lines.length > 0) return distributeLines(lines, duration)
    }

    return null
  } catch {
    return null
  }
}
