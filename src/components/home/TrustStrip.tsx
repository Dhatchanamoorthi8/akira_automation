import React from 'react';
import { SectionReveal } from '../animation/SectionReveal';

export const TrustStrip: React.FC = () => {
  return (
    <SectionReveal className="bg-white pt-14 pb-8 sm:pt-20 sm:pb-12 relative z-20">
      <div className="industrial-container max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px bg-slate-200 flex-grow max-w-[40px]" />
          <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
            The Akira Standard
          </h2>
          <div className="h-px bg-slate-200 flex-grow max-w-[40px]" />
        </div>
        
        <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-industrial-dark leading-[1.2]">
          PRECISION ENGINEERING,
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>BUILT FOR PRODUCTION.
        </p>
        <p className="mt-5 text-[15px] sm:text-[17px] text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto font-sans">
          We engineer zero-defect manufacturing solutions. From sub-micron inline metrology to automated multi-gauging stations, our systems deliver the absolute accuracy required by tier-one automotive and OEM production lines.
        </p>
        
        <div className="w-12 h-[2px] bg-industrial-primary mx-auto mt-8 sm:mt-10" />
      </div>
    </SectionReveal>
  );
};
