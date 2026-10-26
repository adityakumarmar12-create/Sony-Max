import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { CATEGORIES, parseM3U, safeUrl, search, type Channel } from './lib/m3u'
import { fetchText } from './lib/net'
import AddLink from './components/AddLink'
import { PLAYLIST_URL, store } from './lib/store'
import { moveFocus } from './lib/tv'
import VideoPlayer from './components/VideoPlayer'
import ChannelSidebar from './components/ChannelSidebar'

type View = 'Home' | 'Favorites' | 'Recent'
const TV = Capacitor.isNativePlatform() || new URLSearchParams(location.search).has('tv')
const DIRS: Record<string, 'left' | 'right' | 'up' | 'down'> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

export default function App() {
  const [pl, setPl] = useState<Channel[]>(() => store.get('cache', []))
  const [custom, setCustom] = useState<Channel[]>(() => store.get('custom', []))
  const all = useMemo(() => [...custom, ...pl], [custom, pl])
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [q, setQ] = useState(''); const [cat, setCat] = useState<string>('All'); const [view, setView] = useState<View>('Home')
  const [favs, setFavs] = useState<string[]>(() => store.get('favs', []))
  const [recent, setRecent] = useState<string[]>(() => store.get('recent', []))
  const [curId, setCurId] = useState<string | undefined>(() => store.get('last', undefined))
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(''); const [reload, setReload] = useState(0)
  const stage = useRef<HTMLDivElement>(null); const tt = useRef(0); const lastBack = useRef(0)

  const say = (m: string) => { setToast(m); clearTimeout(tt.current); tt.current = window.setTimeout(() => setToast(''), 2500) }

  const load = useCallback(async () => {
    setBusy(true); setErr('')
    try {
      const list = parseM3U(await fetchText(PLAYLIST_URL)); setPl(list); store.set('cache', list)
    } catch (e) { setErr(`Could not refresh playlist (${(e as Error).message}).${all.length ? ' Showing cached channels.' : ''}`) }
    setBusy(false)
  }, [all.length])
  useEffect(() => { void load() }, []) // eslint-disable-line

  const byId = useMemo(() => new Map(all.map(c => [c.id, c])), [all])
  const visible = useMemo(() => {
    let l = view === 'Favorites' ? favs.map(i => byId.get(i)).filter(Boolean) as Channel[]
      : view === 'Recent' ? recent.map(i => byId.get(i)).filter(Boolean) as Channel[] : all
    if (cat !== 'All') l = l.filter(c => c.category === cat)
    return search(l, q)
  }, [all, byId, favs, recent, cat, q, view])
  const current = curId ? byId.get(curId) : undefined

  const play = (c: Channel) => {
    setCurId(c.id); store.set('last', c.id); if (TV) say(c.name)
    const r = [c.id, ...recent.filter(i => i !== c.id)].slice(0, 20); setRecent(r); store.set('recent', r)
  }
  const step = (d: number) => {
    // zap through the full list while the overlay is closed on TV, else the visible list
    const list = TV && !open ? all : visible
    if (!list.length) return
    const i = list.findIndex(c => c.id === curId); play(list[(i + d + list.length) % list.length])
  }
  const fav = (id: string) => { const f = favs.includes(id) ? favs.filter(i => i !== id) : [id, ...favs]; setFavs(f); store.set('favs', f) }

  const saveCustom = (n: Channel[]) => { setCustom(n); store.set('custom', n) }
  const addStream = (url: string, name: string) => {
    const u = safeUrl(url); if (!u) return 'Enter a valid http(s) link.'
    let label = name; if (!label) { try { label = new URL(u).hostname } catch { label = 'Custom stream' } }
    const c: Channel = { id: 'custom|' + u, name: label.slice(0, 80), logo: '', group: 'My Links', language: '', country: '', url: u, category: 'My Links' }
    saveCustom([c, ...custom.filter(x => x.id !== c.id)]); setCurId(c.id); store.set('last', c.id); if (TV) setOpen(false)
    return ''
  }
  const addPlaylist = async (url: string) => {
    const u = safeUrl(url); if (!u) throw new Error('Enter a valid http(s) link.')
    const list = parseM3U(await fetchText(u)).map(c => ({ ...c, id: 'custom|' + c.url, category: 'My Links' }))
    if (!list.length) throw new Error('no channels found. Is this a playlist link?')
    const ids = new Set(list.map(c => c.id)); saveCustom([...list, ...custom.filter(x => !ids.has(x.id))])
    setCat('My Links'); return list.length
  }

  // TV: first launch with no remembered channel starts the first one
  useEffect(() => { if (TV && !current && all.length) play(all[0]) }, [all.length]) // eslint-disable-line

  const back = () => {
    if (open) { setOpen(false); return }
    if (!TV) { if (view !== 'Home' || cat !== 'All' || q) { setView('Home'); setCat('All'); setQ('') } return }
    if (Date.now() - lastBack.current < 2000) void CapApp.exitApp()
    else { lastBack.current = Date.now(); say('Press Back again to exit') }
  }
  const latest = useRef({ back, step, open }); latest.current = { back, step, open }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const L = latest.current, t = e.target as HTMLElement, typing = t.tagName === 'INPUT'
      if (['Escape', 'GoBack', 'BrowserBack'].includes(e.key) || e.keyCode === 4) { e.preventDefault(); L.back(); return }
      if (e.key === 'ContextMenu' || e.keyCode === 82) { e.preventDefault(); if (TV) setOpen(o => !o); return }
      if (e.key === 'PageDown' || e.key === 'ChannelDown' || e.keyCode === 167) { L.step(-1); return }
      if (e.key === 'PageUp' || e.key === 'ChannelUp' || e.keyCode === 166) { L.step(1); return }
      if (!TV) {
        if (typing || t.tagName === 'SELECT') return
        if (e.key === 'ArrowRight') L.step(1); if (e.key === 'ArrowLeft') L.step(-1)
        if (e.key === 'f') document.querySelector('video')?.requestFullscreen?.()
        return
      }
      if (!L.open) return
      const dir = DIRS[e.key]
      if (dir) { if (typing && (dir === 'left' || dir === 'right')) return; e.preventDefault(); moveFocus(dir, document.querySelector('.panel')!) }
      else if (typing && e.key === 'Enter') { t.blur(); moveFocus('down', document.querySelector('.panel')!) }
    }
    window.addEventListener('keydown', h)
    const sub = CapApp.addListener('backButton', () => latest.current.back())
    return () => { window.removeEventListener('keydown', h); void sub.then(s => s.remove()) }
  }, [])

  useEffect(() => {
    if (!TV) return
    requestAnimationFrame(() => open
      ? ((document.querySelector('.panel li.active .ch') ?? document.querySelector('.panel button')) as HTMLElement | null)?.focus()
      : stage.current?.focus())
  }, [open])

  const onStageKey = (e: React.KeyboardEvent) => {
    if (open) return
    const k = e.key
    if (k === 'Enter' || k === ' ' || k === 'ArrowRight') { e.preventDefault(); setOpen(true) }
    else if (k === 'ArrowUp') { e.preventDefault(); step(1) }
    else if (k === 'ArrowDown') { e.preventDefault(); step(-1) }
    else if (k === 'ArrowLeft') { e.preventDefault(); setReload(r => r + 1); say('Reconnecting…') }
  }

  const top = (<>
    <header>
      <div className="logo">📺 <b>Live</b>TV</div>
      <input type="search" placeholder="Search channel, language, category…" value={q} onChange={e => setQ(e.target.value)} />
      <nav>{(['Home', 'Favorites', 'Recent'] as View[]).map(v => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}
        <button onClick={load} disabled={busy}>{busy ? '…' : '↻ Refresh'}</button></nav>
    </header>
    <div className="cats">{CATEGORIES.map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
    <AddLink onStream={addStream} onPlaylist={addPlaylist} onClear={() => saveCustom([])} count={custom.length} />
    {err && <div className="banner">{err}</div>}
  </>)
  const list = <aside><ChannelSidebar list={visible} current={curId} favs={favs} onPick={c => { play(c); if (TV) setOpen(false) }} onFav={fav} /></aside>
  const player = current
    ? <VideoPlayer channel={current} tv={TV} reloadKey={reload} onNext={() => step(1)} onPrev={() => step(-1)} />
    : <div className="player empty">{all.length ? 'Pick a channel to start watching' : busy ? 'Loading channels…' : 'No channels loaded'}</div>

  if (TV) return (
    <div className="app tv">
      <div className="stage" ref={stage} tabIndex={0} onKeyDown={onStageKey}>{player}</div>
      {open && <div className="panel">{top}{list}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
  return (
    <div className="app">
      {top}
      <main>
        <section>{player}
          <p className="muted pad">Quality depends on the source stream; only resolutions the stream offers are listed. Keys: ← → switch channel, F fullscreen.
            Some streams are geo-restricted or blocked by CORS. Sony, Zee, Star and Colors are not in free playlists; use JioHotstar, SonyLIV or ZEE5 officially.</p>
        </section>
        {list}
      </main>
    </div>
  )
}
