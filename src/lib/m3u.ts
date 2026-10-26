export interface Channel { id: string; name: string; logo: string; group: string; language: string; country: string; url: string; category: string }

const clean = (s: string) => s.replace(/[<>"'`]/g, '').trim().slice(0, 120)
export const safeUrl = (u: string) => { try { const p = new URL(u); return p.protocol === 'https:' || p.protocol === 'http:' ? p.href : '' } catch { return '' } }

export const CATEGORIES = ['All','Hindi Entertainment','Hindi Movies','Kids & Cartoons','News','Sports','Music','Educational','Regional Indian','International','My Links'] as const

export function categorize(name: string, group: string, language: string): string {
  const t = `${name} ${group}`.toLowerCase()
  if (/kids|cartoon|animation|pogo|nick|disney|hungama/.test(t)) return 'Kids & Cartoons'
  if (/news/.test(t)) return 'News'
  if (/sport/.test(t)) return 'Sports'
  if (/music/.test(t)) return 'Music'
  if (/movie|cinema|film/.test(t) && /hindi/i.test(language + t)) return 'Hindi Movies'
  if (/educ|learn|science|documentary|knowledge/.test(t)) return 'Educational'
  if (/hindi/i.test(language)) return 'Hindi Entertainment'
  if (/tamil|telugu|malayalam|kannada|bengali|marathi|gujarati|punjabi|odia|assamese|bhojpuri/i.test(language)) return 'Regional Indian'
  return 'International'
}

/** Pure parser: never evaluates anything from the playlist; only http(s) URLs are kept. */
export function parseM3U(text: string): Channel[] {
  const out: Channel[] = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim()
    if (!l.startsWith('#EXTINF')) continue
    const attrs: Record<string, string> = {}
    for (const m of l.matchAll(/([\w-]+)="([^"]*)"/g)) attrs[m[1]] = m[2]
    const name = clean(l.slice(l.lastIndexOf(',') + 1))
    let url = ''
    for (let j = i + 1; j < lines.length; j++) {
      const n = lines[j].trim()
      if (!n || n.startsWith('#')) continue
      url = safeUrl(n); i = j; break
    }
    if (!name || !url) continue
    const group = clean(attrs['group-title'] ?? ''), language = clean(attrs['tvg-language'] ?? '')
    out.push({ id: attrs['tvg-id'] ? clean(attrs['tvg-id']) + '|' + url : url, name, logo: safeUrl(attrs['tvg-logo'] ?? ''),
      group, language, country: clean(attrs['tvg-country'] ?? ''), url, category: categorize(name, group, language) })
  }
  return out
}

export function search(list: Channel[], q: string): Channel[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const n = norm(q); if (!n) return list
  return list.filter(c => norm(`${c.name} ${c.group} ${c.language} ${c.country} ${c.category}`).includes(n))
}
