import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initClarity } from './lib/clarity';

// Initialize Microsoft Clarity behavioral analytics & heatmaps
initClarity();

// Safely remove pre-render critical FOUC guard styles ONLY after React has mounted and painted
const HydrationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // requestAnimationFrame ensures browser has completed first paint of React DOM
    requestAnimationFrame(() => {
      const guardStyle = document.getElementById('akira-critical-fouc-guard');
      if (guardStyle) {
        guardStyle.remove();
      }
    });
  }, []);

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HydrationGuard>
      <App />
    </HydrationGuard>
  </React.StrictMode>
);
