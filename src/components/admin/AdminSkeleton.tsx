import React from 'react';

export const AdminStatSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
        <div className="w-8 h-8 rounded-xl bg-slate-100" />
      </div>
      <div className="h-8 w-20 bg-slate-200 rounded-md" />
      <div className="h-3 w-32 bg-slate-100 rounded-md pt-1" />
    </div>
  );
};

export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="h-4 w-36 bg-slate-200 rounded-md" />
        <div className="h-3 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-slate-200 rounded-md" />
              <div className="h-3 w-32 bg-slate-100 rounded-md" />
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-3.5 w-16 bg-slate-100 rounded-md ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ActivitySkeleton: React.FC<{ items?: number }> = ({ items = 4 }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
      <div className="h-4 w-32 bg-slate-200 rounded-md" />
      <div className="space-y-3.5">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-40 bg-slate-200 rounded-md" />
              <div className="h-2.5 w-20 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
