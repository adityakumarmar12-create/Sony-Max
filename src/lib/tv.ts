export type Dir = 'left' | 'right' | 'up' | 'down'
const SEL = 'button:not([disabled]),input,select,[tabindex="0"]'
/** Geometric D-pad navigation: focus the nearest focusable element in a direction, scoped to root. */
export function moveFocus(dir: Dir, root: ParentNode = document) {
  const cur = document.activeElement as HTMLElement | null
  const els = [...root.querySelectorAll<HTMLElement>(SEL)].filter(e => e !== cur && e.offsetParent !== null)
  if (!cur || !(root as Node).contains(cur)) { els[0]?.focus(); return }
  const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2
  let best: HTMLElement | null = null, bs = Infinity
  for (const e of els) {
    const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy
    const [p, s] = dir === 'left' ? [-dx, Math.abs(dy)] : dir === 'right' ? [dx, Math.abs(dy)] : dir === 'up' ? [-dy, Math.abs(dx)] : [dy, Math.abs(dx)]
    if (p <= 1) continue
    const score = p + 2 * s
    if (score < bs) { bs = score; best = e }
  }
  best?.focus(); best?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
