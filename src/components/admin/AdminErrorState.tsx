import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'A secure connection could not be established with the database service.',
  onRetry,
}) => {
  return (
    <div className="bg-white border border-rose-200 rounded-xl p-6 text-center space-y-3 shadow-subtle my-4">
      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-industrial-dark">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <div className="pt-1">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <RotateCw className="w-3 h-3" />
            <span>Retry Query</span>
          </button>
        </div>
      )}
    </div>
  );
};
