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

export async function fetchFromRcLyricsBand(
  title: string,
  artist: string,
  duration = 210
): Promise<LyricLine[] | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`)
    const searchUrl = `https://rclyricsband.com/?s=${query}`

    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!searchRes.ok) return null
    const html = await searchRes.text()

    // Extract first post link
    const linkMatch = html.match(/href="(https:\/\/rclyricsband\.com\/[^"]+)"[^>]*class="[^"]*post[^"]*"/i)
      ?? html.match(/<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>[\s\S]*?href="(https:\/\/rclyricsband\.com\/[^"]+)"/i)
      ?? html.match(/class="[^"]*entry-title[^"]*"[\s\S]*?href="(https:\/\/rclyricsband\.com\/[^"]+)"/i)
    if (!linkMatch) return null

    const postRes = await fetch(linkMatch[1], {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!postRes.ok) return null
    const postHtml = await postRes.text()

    // Look for LRC block inside <pre> or <code> or .entry-content
    const preMatch = postHtml.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
      ?? postHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/i)
    
    if (preMatch) {
      const raw = preMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
      const parsed = parseLrc(raw)
      if (parsed.length > 0) return parsed
    }

    // Fallback: extract plain lyrics from entry-content
    const contentMatch = postHtml.match(/class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    if (contentMatch) {
      const plain = contentMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .trim()
      const lines = plain.split('\n').map(l => l.trim()).filter(l => l.length > 1)
      if (lines.length > 0) {
        return lines.map((text, i) => ({
          time: (i / lines.length) * duration,
          text,
        }))
      }
    }

    return null
  } catch {
    return null
  }
}
