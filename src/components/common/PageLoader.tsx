import React from 'react';
import { company } from '../../config/company';

export const PageLoader: React.FC = () => {
  return (
    <div 
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="relative w-12 h-12">
        {/* Outer subtle ring */}
        <div className="w-12 h-12 rounded-full border-2 border-slate-200" />
        {/* Spinning industrial ring */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-industrial-primary border-t-transparent animate-spin" />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-industrial-primary" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-industrial-dark font-mono">
          Loading Metrology Data
        </p>
        <p className="text-[11px] text-industrial-muted">
          {company.name}
        </p>
      </div>
    </div>
  );
};
