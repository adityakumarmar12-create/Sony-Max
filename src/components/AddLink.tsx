import { useState } from 'react'
interface Props { onStream: (url: string, name: string) => string; onPlaylist: (url: string) => Promise<number>; onClear: () => void; count: number }
export default function AddLink({ onStream, onPlaylist, onClear, count }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(''); const [name, setName] = useState('')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const stream = () => { const e = onStream(url.trim(), name.trim()); setMsg(e); if (!e) { setUrl(''); setName('') } }
  const list = async () => {
    setBusy(true); setMsg('')
    try { const n = await onPlaylist(url.trim()); setMsg(`Imported ${n} channels into "My Links".`); setUrl('') }
    catch (e) { setMsg(`Could not import: ${(e as Error).message}`) }
    setBusy(false)
  }
  return (
    <div className="add">
      <button onClick={() => setOpen(o => !o)}>{open ? '✕ Close' : '＋ Add link'}</button>
      {open && <>
        <input placeholder="Paste stream (.m3u8) or playlist (.m3u) link" value={url} onChange={e => setUrl(e.target.value)} />
        <input placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <div className="row">
          <button onClick={stream} disabled={!url.trim()}>▶ Play this stream</button>
          <button onClick={list} disabled={!url.trim() || busy}>{busy ? '…' : '☰ Import as playlist'}</button>
          {count > 0 && <button onClick={onClear}>🗑 Clear my links ({count})</button>}
        </div>
        {msg && <small>{msg}</small>}
        <small className="muted">Only add streams you have the right to watch. Premium or DRM-protected links will not play.</small>
      </>}
    </div>
  )
}
