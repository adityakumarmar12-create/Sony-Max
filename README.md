# Live TV (iptv-org)
React + TS + Vite app that loads the public India playlist from https://github.com/iptv-org/iptv
(`https://iptv-org.github.io/iptv/countries/in.m3u`) and plays HLS via hls.js (native HLS on Safari).

## Run
    npm install
    npm run dev      # http://localhost:5173
    npm test         # parser tests (vitest)
    npm run build

## Architecture
- `src/lib/m3u.ts` pure parser/categorizer/search (no DOM, tested). Keeps only http(s) URLs, strips markup chars.
- `src/lib/store.ts` localStorage (cache, favorites, recent, last channel).
- `components/VideoPlayer.tsx` hls.js, loading/playing/error states, retry, quality list (only levels the stream offers, Auto default).
- `components/ChannelSidebar.tsx` list, logos, favorite toggle. `App.tsx` state, header, categories, shortcuts.

## Not yet implemented
EPG/XMLTV guide, "recommended"/"continue watching" rows, settings (auto-next), stream health checks, TV D-pad focus management, component tests for player states.

## Needs backend / platform support
Many streams send no CORS headers or are geo-locked; browsers cannot play those. A proxy would be needed, which this project deliberately does not include. Native Android TV (ExoPlayer) avoids CORS and gives better remote navigation.

## Troubleshooting
Playlist fails: check network, cached list is shown. Channel errors: press Retry, many free streams are offline. Premium channels (Sony, Zee, Star, Colors, Disney) are not in free playlists; use their official apps.
