const get = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? '') as T } catch { return d } }
const set = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage full/blocked */ } }
export const store = { get, set }
export const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u'
