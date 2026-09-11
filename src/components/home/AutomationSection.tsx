import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Zap } from 'lucide-react';
import { company } from '../../config/company';
import { companyIntro } from '../../data/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { ScaleReveal } from '../animation/ScaleReveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';
import { ShinyText } from '../animation/ShinyText';

export const AutomationSection: React.FC = () => {
  return (
    <SectionReveal className="py-20 bg-gradient-to-br from-industrial-dark via-[#0d2238] to-industrial-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dark-grid opacity-25 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />

      <div className="industrial-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Automation Cell Visualization from PPT Slide 12 (5 cols) */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <ScaleReveal>
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-industrial-dark group">
                <img
                  src="/assets/solutions/automation-cell.webp"
                  alt="Multi-Gauging Automation Station with Robotic Integration"
                  className="w-full h-auto object-cover max-h-[440px] transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80">
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
                    <Bot className="w-4 h-4" />
                    <span><ShinyText>Robotic & Conveyor Ready</ShinyText></span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Fast, error-proof cycle times with automated component loading, air gauging, and OK / Reject sorting.
                  </p>
                </div>
              </div>
            </ScaleReveal>
          </div>

          {/* Right Column: Copy & 3 Pillars from PPT Slide 12 (7 cols) */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <Reveal direction="up">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                <Zap className="w-3.5 h-3.5" />
                Next-Gen Factory Automation
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white mt-3 leading-tight">
                The Next Level for Your Manufacturing
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                {company.name} bridges precision metrology with modern production line automation, bringing automated multi-point dimensional checking directly to your manufacturing cells.
              </p>
            </Reveal>

            {/* 3 Pillars from Slide 12 */}
            <StaggerContainer className="space-y-4 pt-2">
              {companyIntro.automationPillars.map((pillar, idx) => (
                <StaggerItem key={idx}>
                  <div 
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-sky-400/40 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-sky-400 font-heading flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <Reveal direction="up" className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/solutions/multigauging"
                className="btn-primary bg-sky-500 hover:bg-sky-400 text-white"
              >
                <span>Explore Multigauging Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary bg-transparent text-white border-slate-600 hover:bg-slate-800"
              >
                Consult Automation Team
              </Link>
            </Reveal>

          </div>

        </div>
      </div>
    </SectionReveal>
  );
};
