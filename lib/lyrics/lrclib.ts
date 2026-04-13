import { LyricLine } from '../store'

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = []
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/g
  let match
  while ((match = regex.exec(lrc)) !== null) {
    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const ms = parseInt(match[3].padEnd(3, '0'))
    const time = minutes * 60 + seconds + ms / 1000
    const text = match[4].trim()
    if (text) lines.push({ time, text })
  }
  return lines
}

export async function fetchFromLrcLib(
  title: string,
  artist: string,
  duration?: number
): Promise<LyricLine[] | null> {
  try {
    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()

    if (data.syncedLyrics) {
      const parsed = parseLrc(data.syncedLyrics)
      if (parsed.length > 0) return parsed
    }

    if (data.plainLyrics) {
      const lines = data.plainLyrics.split('\n').filter((l: string) => l.trim())
      const dur = duration ?? 210
      return lines.map((text: string, i: number) => ({
        time: (i / lines.length) * dur,
        text,
      }))
    }

    return null
  } catch {
    return null
  }
}
