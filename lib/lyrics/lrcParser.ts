import { LyricLine } from '../store'

/**
 * Parse LRC format into LyricLine[] with proper start/end times.
 * Each line ends when the next line starts.
 * Last line ends at songDuration (or start + 5s fallback).
 *
 * Supports:
 *   [mm:ss.xx]  text
 *   [mm:ss:xx]  text
 *   [mm:ss.xxx] text
 */
export function parseLrc(lrc: string, songDuration = 0): LyricLine[] {
  const regex = /\[(\d{1,2}):(\d{2})[.:](\d{2,3})\]\s*(.*)/g
  const raw: { time: number; text: string }[] = []
  let match

  while ((match = regex.exec(lrc)) !== null) {
    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const ms = parseInt(match[3].padEnd(3, '0'))
    const time = minutes * 60 + seconds + ms / 1000
    const text = match[4].trim()
    // Include empty lines as gaps (no text shown)
    raw.push({ time, text })
  }

  if (raw.length === 0) return []

  // Sort by time
  raw.sort((a, b) => a.time - b.time)

  // Build lines with end times
  const lines: LyricLine[] = raw.map((item, i) => {
    const next = raw[i + 1]
    const end = next
      ? next.time
      : songDuration > item.time
        ? songDuration
        : item.time + 5

    return { time: item.time, end, text: item.text }
  })

  // Filter out empty-text lines (they act as gaps — no lyric shown)
  return lines.filter(l => l.text.length > 0)
}

/**
 * Get the active lyric at a given currentTime using start/end.
 * Returns null if no line is active (gap period).
 */
export function getActiveLyricLine(
  lyrics: LyricLine[],
  currentTime: number
): LyricLine | null {
  for (const line of lyrics) {
    const end = line.end ?? (line.time + 5)
    if (currentTime >= line.time && currentTime < end) {
      return line
    }
  }
  return null
}

/**
 * Serialize LyricLine[] back to LRC format string.
 */
export function toLrc(lines: LyricLine[]): string {
  return lines
    .map(l => {
      const m = Math.floor(l.time / 60)
      const s = Math.floor(l.time % 60)
      const ms = Math.round((l.time % 1) * 100)
      return `[${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}] ${l.text}`
    })
    .join('\n')
}

/**
 * Distribute plain text lines evenly across duration.
 */
export function distributeLines(lines: string[], duration: number): LyricLine[] {
  return lines.map((text, i) => {
    const time = (i / lines.length) * duration
    const end = ((i + 1) / lines.length) * duration
    return { time, end, text }
  })
}
