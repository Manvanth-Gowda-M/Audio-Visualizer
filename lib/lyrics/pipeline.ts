import { LyricLine } from '../store'
import { fetchFromLrcLib } from './lrclib'
import { fetchFromGenius } from './geniusScraper'

export async function fetchLyrics(
  title: string,
  artist: string,
  duration: number
): Promise<{ lyrics: LyricLine[]; source: string }> {
  try {
    const lrclib = await fetchFromLrcLib(title, artist, duration)
    if (lrclib && lrclib.length > 0) return { lyrics: lrclib, source: 'lrclib' }
  } catch {}

  try {
    const genius = await fetchFromGenius(title, artist, duration)
    if (genius && genius.length > 0) return { lyrics: genius, source: 'genius' }
  } catch {}

  return { lyrics: [], source: 'manual' }
}
