import React from 'react';
import { ArrowRight, Phone, Cpu } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { companyData } from '../../data/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';

export const EnquiryCTA: React.FC = () => {
  const { openEnquiry } = useEnquiry();

  return (
    <SectionReveal className="py-12 sm:py-16 bg-gradient-to-r from-industrial-dark via-industrial-primary to-industrial-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
      
      <div className="industrial-container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* Left Text */}
          <Reveal direction="up" className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-white/10 text-sky-200 border border-white/20">
              <Cpu className="w-3.5 h-3.5 text-sky-300" />
              Custom Metrology & Fixture Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
              Connect With Us for Custom Gauging Solutions
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              "Connect with us to explore custom solutions tailored for your manufacturing needs." Send your component drawing or inspection specification for an expert technical proposal.
            </p>
          </Reveal>

          {/* Right Actions */}
          <Reveal direction="left" delay={0.15} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => openEnquiry()}
              className="w-full sm:w-auto px-7 py-3 min-h-[48px] rounded-lg bg-white text-industrial-dark font-extrabold text-sm tracking-wide transition-all duration-200 shadow-md hover:bg-slate-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white group text-center flex items-center justify-center gap-2"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4 text-industrial-primary transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
              className="w-full sm:w-auto px-5 py-3 min-h-[48px] rounded-lg bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 font-mono text-center"
            >
              <Phone className="w-4 h-4 text-sky-300" />
              <span>{companyData.phones[0]}</span>
            </a>
          </Reveal>

        </div>
      </div>
    </SectionReveal>
  );
};
