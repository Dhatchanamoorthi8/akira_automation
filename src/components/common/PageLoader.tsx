import React from 'react';
import { Spinner } from '@heroui/react';
import { company } from '../../config/company';

export const PageLoader: React.FC = () => {
  return (
    <div 
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="flex items-center justify-center">
        <Spinner size="lg" color="accent" className="text-industrial-primary" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-industrial-dark font-mono">
          Loading Metrology Data
        </p>
        <p className="text-xs text-slate-600 font-medium">
          {company.name}
        </p>
      </div>
    </div>
  );
};
