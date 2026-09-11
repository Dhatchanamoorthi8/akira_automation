import React from 'react';

interface PrecisionRulerProps {
  className?: string;
  ticksCount?: number;
  highlightInterval?: number;
}

export const PrecisionRuler: React.FC<PrecisionRulerProps> = ({
  className = '',
  ticksCount = 48,
  highlightInterval = 6,
}) => {
  return (
    <div
      className={`relative w-full h-2 overflow-hidden flex items-end justify-between px-2 pointer-events-none select-none opacity-40 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: ticksCount }).map((_, i) => {
        const isMajor = i % highlightInterval === 0;
        const isMedium = i % (highlightInterval / 2) === 0 && !isMajor;

        return (
          <div
            key={i}
            className={`w-[1px] transition-colors ${
              isMajor
                ? 'h-3 bg-sky-400 opacity-90'
                : isMedium
                ? 'h-2 bg-slate-400 opacity-60'
                : 'h-1.5 bg-slate-600 opacity-40'
            }`}
          />
        );
      })}
    </div>
  );
};
