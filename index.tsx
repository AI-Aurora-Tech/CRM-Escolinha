import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handler for chunk loading failures (common after deployments)
window.addEventListener('error', (event) => {
  if (event.message && (
      event.message.includes('ChunkLoadError') || 
      event.message.includes('Loading chunk') ||
      event.message.includes('missing')
  )) {
    console.warn('Chunk load error detected, reloading page to fetch new version...');
    // Prevent infinite reload loops if the server is actually down
    const lastReload = sessionStorage.getItem('last_chunk_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem('last_chunk_reload', now.toString());
      window.location.reload();
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
