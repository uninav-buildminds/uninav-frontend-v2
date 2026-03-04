import { precacheAndRoute } from "workbox-precaching";

/**
 * SW NUKE — deploy this for ONE release cycle to clear all stale caches.
 *
 * What it does:
 *   1. Activates immediately (skipWaiting) — no waiting for tabs to close
 *   2. Claims all open tabs so this SW controls them right away
 *   3. Deletes every cache entry in the browser (all cache names)
 *   4. Unregisters itself so the next deploy's real SW installs clean
 *   5. Reloads all controlled tabs so they pick up the fresh SW next load
 *
 * After deploying this, deploy the real SW (src/sw.ts) in the next release.
 * The nuke does NOT need to be kept after that — delete public/sw-nuke.js.
 */

// Precache hook required for injectManifest; caches are cleared immediately afterwards.
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", (event) => {
  // Activate without waiting for existing tabs to close
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Claim all open clients immediately
      await self.clients.claim();

      // Delete every cache — runtime, precache, old workbox caches, everything
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister this SW so the next deploy starts fresh
      await self.registration.unregister();

      console.log("all caches cleared and SW unregistered");
      // Reload all open tabs so they re-register the real SW on next load
      const allClients = await self.clients.matchAll({ type: "window" });
      allClients.forEach((client) => client.navigate(client.url));
    })()
  );
});
