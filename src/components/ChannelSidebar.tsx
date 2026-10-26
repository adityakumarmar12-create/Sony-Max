import type { Channel } from '../lib/m3u'
export default function ChannelSidebar({ list, current, favs, onPick, onFav }: { list: Channel[]; current?: string; favs: string[]; onPick: (c: Channel) => void; onFav: (id: string) => void }) {
  if (!list.length) return <p className="muted pad">No channels match.</p>
  return (
    <ul className="channels">
      {list.slice(0, 400).map(c => (
        <li key={c.id} className={c.id === current ? 'active' : ''}>
          <button className="ch" onClick={() => onPick(c)}>
            {c.logo ? <img src={c.logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => (e.currentTarget.style.visibility = 'hidden')} /> : <span className="img" />}
            <span><b>{c.name}</b><small>{c.category}</small></span>
          </button>
          <button className="star" onClick={() => onFav(c.id)} aria-label="Favorite">{favs.includes(c.id) ? '★' : '☆'}</button>
        </li>
      ))}
    </ul>
  )
}
