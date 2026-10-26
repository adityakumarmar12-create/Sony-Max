import { describe, it, expect } from 'vitest'
import { parseM3U, search } from './m3u'
const sample = `#EXTM3U
#EXTINF:-1 tvg-id="A.in" tvg-logo="https://x/logo.png" group-title="News" tvg-language="Hindi",Aaj <b>News</b>
https://example.com/a.m3u8
#EXTINF:-1 group-title="Kids",Pogo
javascript:alert(1)
#EXTINF:-1 group-title="Kids",Cartoon HD
#EXTVLCOPT:http-referrer=x
http://example.com/c.m3u8`
describe('parseM3U', () => {
  const r = parseM3U(sample)
  it('parses valid entries and drops unsafe URLs', () => { expect(r.map(c => c.url)).toEqual(['https://example.com/a.m3u8', 'http://example.com/c.m3u8']) })
  it('sanitizes names and categorizes', () => { expect(r[0].name).toBe('Aaj bNews/b'); expect(r[0].category).toBe('News'); expect(r[1].category).toBe('Kids & Cartoons') })
  it('searches loosely', () => { expect(search(r, 'cartoon-hd')).toHaveLength(1) })
})
