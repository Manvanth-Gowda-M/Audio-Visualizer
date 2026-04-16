import { LyricLine } from '../store'
import { fetchFromLrcLib } from './lrclib'
import { fetchFromMegalobiz } from './megalobiz'
import { fetchFromRcLyricsBand } from './rclyricsband'
import { fetchFromGenius } from './geniusScraper'

export type LyricsSource = 'lrclib' | 'megalobiz' | 'rclyricsband' | 'genius' | 'manual'

export async function fetchLyrics(
  title: string,
  artist: string,
  duration: number
): Promise<{ lyrics: LyricLine[]; source: LyricsSource; synced: boolean }> {

  // 1. LRCLib — best source, has synced timestamps
  try {
    const result = await fetchFromLrcLib(title, artist, duration)
    if (result && result.length > 0) {
      const synced = result.some(l => l.time > 0)
      return { lyrics: result, source: 'lrclib', synced }
    }
  } catch {}

  // 2. Megalobiz — good LRC source
  try {
    const result = await fetchFromMegalobiz(title, artist, duration)
    if (result && result.length > 0) {
      const synced = result.some(l => l.time > 0)
      return { lyrics: result, source: 'megalobiz', synced }
    }
  } catch {}

  // 3. RCLyricsBand — another LRC source
  try {
    const result = await fetchFromRcLyricsBand(title, artist, duration)
    if (result && result.length > 0) {
      const synced = result.some(l => l.time > 0)
      return { lyrics: result, source: 'rclyricsband', synced }
    }
  } catch {}

  // 4. Genius scraper — plain lyrics, no timestamps
  try {
    const result = await fetchFromGenius(title, artist, duration)
    if (result && result.length > 0) {
      return { lyrics: result, source: 'genius', synced: false }
    }
  } catch {}

  // 5. Manual — user types them
  return { lyrics: [], source: 'manual', synced: false }
}
