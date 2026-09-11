import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProductFeaturesProps {
  features: string[];
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({ features }) => {
  if (features.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-industrial-dark font-heading uppercase tracking-wider text-slate-500">
        Key Technical Features
      </h3>
      <div className="space-y-2">
        {features.map((feat, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
            <span>{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
