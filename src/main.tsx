import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

let deferredPrompt: unknown;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  (window as { __DEFERRED_PROMPT__?: unknown }).__DEFERRED_PROMPT__ = e;
  window.dispatchEvent(new Event('pwa-ready'));
});

export { deferredPrompt };

createRoot(document.getElementById('root')!).render(<App />);
