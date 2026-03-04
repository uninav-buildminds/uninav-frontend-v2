/// <reference lib="WebWorker" />
/// <reference types="vite-plugin-pwa/client" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

// Injected by VitePWA at build time — do not remove
precacheAndRoute(self.__WB_MANIFEST);

// Clean up precache entries from older SW versions on activation
cleanupOutdatedCaches();

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Kill Switch ─────────────────────────────────────────────────────────────
//
// The app sends { type: "CLEAR_CACHE", cacheNames?: string[] } to clear caches
// without nuking the SW itself. If cacheNames is omitted, ALL caches are cleared.
// Activate by bumping CACHE_BUST_VERSION in src/lib/sw-version.ts.
//
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "CLEAR_CACHE") return;

  event.waitUntil(
    (async () => {
      const targetNames: string[] | undefined = event.data.cacheNames;
      const allKeys = await caches.keys();
      const toDelete = targetNames
        ? allKeys.filter((k) => targetNames.some((t) => k.includes(t)))
        : allKeys;

      await Promise.all(toDelete.map((name) => caches.delete(name)));

      // Tell the triggering client to reload so it picks up fresh responses
      const source = event.source as WindowClient | null;
      source?.navigate(source.url);
    })()
  );
});
// ─────────────────────────────────────────────────────────────────────────────

// ── NetworkOnly — declared FIRST so they match before any caching rule ────────

// Never cache any auth endpoint
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin ||
    /uninav-backend-v2\.onrender\.com|localhost:3200/.test(url.host)
      ? /\/auth\//.test(url.pathname)
      : false,
  new NetworkOnly()
);

// Never cache user profile
registerRoute(
  ({ url }) => /\/user\/profile$/.test(url.pathname),
  new NetworkOnly(),
  "GET"
);

// Never cache bookmark data
registerRoute(
  ({ url }) => /\/user\/bookmarks/.test(url.pathname),
  new NetworkOnly(),
  "GET"
);

// Never cache download link generation
registerRoute(
  ({ url }) => /\/materials\/download\//.test(url.pathname),
  new NetworkOnly(),
  "GET"
);

// ── CacheFirst — long-lived static assets ─────────────────────────────────────

registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new CacheFirst({
    cacheName: "google-fonts-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "gstatic-fonts-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ── StaleWhileRevalidate — API data ───────────────────────────────────────────

registerRoute(
  ({ url }) => /\/faculty\//.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "faculty-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  "GET"
);

registerRoute(
  ({ url }) => /\/department\//.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "department-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  "GET"
);

registerRoute(
  ({ url }) => /\/materials\/recent/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "recent-materials-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  "GET"
);

registerRoute(
  ({ url }) => /\/materials\//.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "materials-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 14 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  "GET"
);

registerRoute(
  ({ url }) => /\/courses\//.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "courses-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 14 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  "GET"
);
