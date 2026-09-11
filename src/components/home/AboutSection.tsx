import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { company } from '../../config/company';
import { companyIntro } from '../../data/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { ScaleReveal } from '../animation/ScaleReveal';

export const AboutSection: React.FC = () => {
  return (
    <SectionReveal className="py-12 sm:py-16 lg:py-20 bg-industrial-bg relative overflow-hidden">
      <div className="industrial-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Company Introduction */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal direction="up">
              <span className="section-tag">
                About {company.name}
              </span>
              <h2 className="section-title mt-3">
                Precision Instruments & Automated Multi-Gauging Systems
              </h2>
            </Reveal>

            <p className="text-base text-slate-700 leading-relaxed">
              <strong>{company.name}</strong> focuses on high quality products and innovative solutions that help customers increase productivity and profitability.
            </p>

            <p className="text-sm text-industrial-muted leading-relaxed">
              {companyIntro.aboutUsText}
            </p>

            {/* Core Values & Motto */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-industrial-muted uppercase font-semibold tracking-wider">Company Motto</span>
                  <p className="text-base font-extrabold text-industrial-primary font-heading">
                    "{companyIntro.motto}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {companyIntro.coreValues.map((val, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <p className="text-xs font-bold text-industrial-dark font-heading">{val.title}</p>
                    <p className="text-[11px] text-industrial-muted mt-1 leading-snug">{val.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision & Strengths Bullet Checklist */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vision & Key Strengths
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {companyIntro.visionAndStrengths.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link to="/about" className="btn-outline">
                <span>Learn More About Our Company</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Large PPT Metrology Inspection Workbench Image */}
          <div className="lg:col-span-5 relative">
            <ScaleReveal>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white group">
                <img
                  src="/assets/company/inspection-workbench.webp"
                  alt={`${company.name} Precision Metrology Workshop`}
                  className="w-full h-auto object-cover max-h-[480px] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="p-4 bg-white border-t border-slate-100">
                  <p className="text-xs font-bold text-industrial-dark font-heading">
                    High-Precision Metrology Standards & Gauging Workbench
                  </p>
                  <p className="text-[11px] text-industrial-muted mt-0.5">
                    Traceable measurements to international standards and rigorous quality assurance.
                  </p>
                </div>
              </div>
            </ScaleReveal>

            {/* Visual Fact Card */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-industrial-dark text-white p-4 sm:p-5 rounded-2xl shadow-elevated border border-slate-700 w-full sm:max-w-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-industrial-primary flex items-center justify-center text-white shrink-0 font-bold">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold">Brand Promise</p>
                  <p className="text-base sm:text-lg font-black font-heading tracking-tight text-white">{company.name}</p>
                  <p className="text-[10px] sm:text-[11px] text-sky-400 font-medium mt-0.5">{company.slogan}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </SectionReveal>
  );
};
