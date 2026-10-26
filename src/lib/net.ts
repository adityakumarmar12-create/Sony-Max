import { Capacitor, CapacitorHttp } from '@capacitor/core'
/** Text fetch. In the Android app the request is made natively (no browser CORS limit); in a browser it is a normal fetch. */
export async function fetchText(url: string): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const r = await CapacitorHttp.get({ url, responseType: 'text' })
    if (r.status >= 400) throw new Error(`HTTP ${r.status}`)
    return String(r.data)
  }
  const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.text()
}
