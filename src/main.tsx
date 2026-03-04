import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CACHE_BUST_VERSION } from "./lib/sw-version";

// ── SW Kill Switch ────────────────────────────────────────────────────────────
// If CACHE_BUST_VERSION has been bumped since the last page load, send a
// CLEAR_CACHE message to the active SW so it wipes all runtime caches.
// Runs once per version bump (stored in localStorage) — not on every load.
if ("serviceWorker" in navigator) {
  const SW_VERSION_KEY = "uninav_sw_cache_version";
  const lastVersion = parseInt(localStorage.getItem(SW_VERSION_KEY) ?? "0", 10);

  if (lastVersion < CACHE_BUST_VERSION) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: "CLEAR_CACHE" });
      localStorage.setItem(SW_VERSION_KEY, String(CACHE_BUST_VERSION));
    });
  }
}
// ─────────────────────────────────────────────────────────────────────────────

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Optional: Dispatch a custom event so your component knows it happened
  // if it mounted *before* this event fired.
  window.dispatchEvent(new Event("pwa-ready"));
});

export { deferredPrompt };

createRoot(document.getElementById("root")!).render(<App />);
