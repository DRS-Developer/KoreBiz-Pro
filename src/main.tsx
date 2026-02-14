import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
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
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

reportWebVitals(console.log);
