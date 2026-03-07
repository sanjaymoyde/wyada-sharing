import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initAppViewport } from './utils/viewport';


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

const revealApp = () => {
  const htmlClassList = document.documentElement.classList;
  htmlClassList.remove('app-booting');
  htmlClassList.add('app-ready');
};

const bootReveal = async () => {
  try {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  } catch {
    // Fall back to reveal on next frame.
  }
  requestAnimationFrame(revealApp);
};

void bootReveal();

// initialize viewport height variable on startup and keep it in sync as the
// mobile browser chrome shows/hides.  this is intentionally light-weight and
// runs outside React so we can update the CSS variable globally.
initAppViewport();

