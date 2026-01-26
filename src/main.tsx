import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Optional: Dispatch a custom event so your component knows it happened
    // if it mounted *before* this event fired.
    window.dispatchEvent(new Event('pwa-ready'));
});

export { deferredPrompt };

createRoot(document.getElementById("root")!).render(<App />);
