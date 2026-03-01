import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import reportWebVitals from './reportWebVitals'

const isAbortError = (reason: unknown) => {
  const err = reason as { name?: string; message?: string };
  return err?.name === 'AbortError' || err?.message?.includes('AbortError');
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (isAbortError(event.reason)) {
      event.preventDefault();
    }
  });

  // PWA Handling
  if (import.meta.env.DEV) {
    // In development, force unregister any existing service workers to avoid caching issues
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          console.log('Unregistering SW in DEV mode:', registration);
          registration.unregister();
        }
      }).catch(err => {
        console.warn('Failed to unregister SW in DEV mode (safe to ignore):', err);
      });
    }
  } else {
    // Production: Register PWA Service Worker
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('New content available, new SW activated.');
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

reportWebVitals(console.log);
