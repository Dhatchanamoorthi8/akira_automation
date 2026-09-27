import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { Card } from '@heroui/react';
import { company } from '../../config/company';
import { companyIntro } from '../../data/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { ScaleReveal } from '../animation/ScaleReveal';

export const AboutSection: React.FC = () => {
  return (
    <SectionReveal className="pt-8 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 bg-industrial-bg relative border-t border-slate-200 overflow-hidden">
      <div className="industrial-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Company Introduction */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <Reveal direction="up">
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest font-sans mb-2">
                About {company.name}
              </div>
              <h2 className="section-title mt-2">
                Precision Instruments & Automated Multi-Gauging Systems
              </h2>
            </Reveal>

            <p className="text-base text-slate-800 font-medium leading-relaxed">
              <strong className="text-slate-900 font-bold">{company.name}</strong> focuses on high quality products and innovative solutions that help customers increase productivity and profitability.
            </p>

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              {companyIntro.aboutUsText}
            </p>

            {/* Core Values & Motto with HeroUI Card */}
            <Card variant="default" className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
              <Card.Header className="p-0 border-b border-slate-100 pb-3 flex flex-row items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Company Motto</span>
                  <Card.Title className="text-base sm:text-lg font-extrabold text-industrial-primary font-heading">
                    "{companyIntro.motto}"
                  </Card.Title>
                </div>
              </Card.Header>

              <Card.Content className="p-0 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {companyIntro.coreValues.map((val, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 font-heading">{val.title}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{val.description}</p>
                  </div>
                ))}
              </Card.Content>
            </Card>

            {/* Vision & Strengths Bullet Checklist */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Vision & Key Strengths
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-800">
                {companyIntro.visionAndStrengths.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-800 hover:text-industrial-primary hover:border-industrial-primary font-sans font-semibold text-xs sm:text-sm px-5 py-2.5 min-h-[44px] rounded-lg shadow-subtle hover:bg-slate-50 transition-all focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
              >
                <span>Learn More About Our Company</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Large PPT Metrology Inspection Workbench Image */}
          <div className="lg:col-span-5 relative">
            <ScaleReveal>
              <div className="relative rounded-xl overflow-hidden border border-slate-200/90 shadow-subtle bg-white group">
                <img
                  src="/assets/company/inspection-workbench.webp"
                  alt={`${company.name} Precision Metrology Workshop`}
                  className="w-full h-auto object-cover max-h-[480px] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="p-4 bg-white border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900 font-heading">
                    High-Precision Metrology Standards & Gauging Workbench
                  </p>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Traceable measurements to international standards and rigorous quality assurance.
                  </p>
                </div>
              </div>
            </ScaleReveal>

            {/* Visual Fact Card */}
            <Card variant="tertiary" className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-industrial-dark text-white p-4 sm:p-5 rounded-xl shadow-elevated border border-slate-700 w-full sm:max-w-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-industrial-primary flex items-center justify-center text-white shrink-0 font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-300 uppercase tracking-widest font-semibold font-mono">Brand Promise</p>
                  <p className="text-base sm:text-lg font-black font-heading tracking-tight text-white">{company.name}</p>
                  <p className="text-xs text-sky-400 font-semibold mt-0.5">{company.slogan}</p>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </SectionReveal>
  );
};

