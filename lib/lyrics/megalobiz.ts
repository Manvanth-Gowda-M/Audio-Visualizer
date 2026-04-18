import { LyricLine } from '../store'

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = []
  const regex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]\s*(.*)/g
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

export async function fetchFromMegalobiz(
  title: string,
  artist: string,
  duration = 210
): Promise<LyricLine[] | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title} lrc`)
    const searchUrl = `https://www.megalobiz.com/search/all?qry=${query}&display=more`

    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!searchRes.ok) return null
    const html = await searchRes.text()

    // Extract first LRC link from search results
    const linkMatch = html.match(/href="(\/lrc\/maker\/[^"]+)"/)
    if (!linkMatch) return null

    const lrcUrl = `https://www.megalobiz.com${linkMatch[1]}`
    const lrcRes = await fetch(lrcUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!lrcRes.ok) return null
    const lrcHtml = await lrcRes.text()

    // Extract LRC content from the page
    const lrcMatch = lrcHtml.match(/class="[^"]*lrc[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    if (!lrcMatch) return null

    // Strip HTML tags and decode entities
    const raw = lrcMatch[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')

    const parsed = parseLrc(raw)
    if (parsed.length > 0) return parsed

    // Fallback: plain text lines
    const plainLines = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('['))
    if (plainLines.length > 0) {
      return plainLines.map((text, i) => ({
        time: (i / plainLines.length) * duration,
        text,
      }))
    }

    return null
  } catch {
    return null
  }
}
