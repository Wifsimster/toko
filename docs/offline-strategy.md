# Offline strategy (business rule B9)

## Goal

The parent must be able to complete the evening check-in (rule B3) and
read the calm-minutes total (rule H1) even with flaky or no network.
The tunnel between 16h30 and 21h00 is exactly when rural Wi-Fi drops and
the parent is least able to wait for a retry.

## Implementation

All shipped via `vite-plugin-pwa` + Workbox (`apps/web/vite.config.ts`):

### Static assets

- `globPatterns: ['**/*.{js,css,html,svg,png,woff2}']` — precaches the
  entire built client.
- `navigateFallback: '/index.html'` + denylist on `/api/` — SPA routing
  keeps working offline.

### API calls

Runtime cache `toko-api`:

```ts
{
  urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
  handler: 'NetworkFirst',
  options: {
    networkTimeoutSeconds: 5,
    expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
    cacheableResponse: { statuses: [0, 200] },
  },
}
```

Behaviour:

- Online: always hits the network, caches the result (1 day TTL).
- Slow network: falls back to the cached response after 5 seconds so the
  UI never spins longer than that.
- Offline: serves the last cached response immediately.

### Images

Runtime cache `toko-images`, `CacheFirst`, 30-day TTL, 60-entry LRU.

## Test checklist

Playwright does not currently cover offline mode. When B1 (interaction
chronometer) lands, extend it with:

1. `context.setOffline(true)` before opening the dashboard
2. Verify `<EveningCheck />` renders and the calm-minutes card shows the
   last-known value
3. Log a check-in offline, then `context.setOffline(false)` and verify
   the POST replays (Workbox Background Sync — to be wired separately)

## Follow-up work

- Background Sync for offline check-ins (`/api/symptoms` PATCH/POST).
- Version the service worker precache filename via Vite hash (already
  the default). Add a visible "Mise à jour disponible" toast when a new
  SW takes control.
