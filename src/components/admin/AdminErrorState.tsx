import React from 'react';
import { Card, Button } from '@heroui/react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title = 'Database Connection Issue',
  message = 'A secure connection could not be established with the database service.',
  onRetry,
}) => {
  return (
    <Card className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm my-4 max-w-2xl mx-auto">
      <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200/80 shadow-2xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 font-heading">{title}</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="md"
            onPress={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer font-sans"
          >
            <RotateCw className="w-3.5 h-3.5 shrink-0" />
            <span>Retry Query</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
