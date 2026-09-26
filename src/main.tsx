import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Clean up pre-render critical FOUC guard styles upon client hydration
if (typeof document !== 'undefined') {
  const guardStyle = document.getElementById('akira-critical-fouc-guard');
  if (guardStyle) {
    guardStyle.remove();
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
