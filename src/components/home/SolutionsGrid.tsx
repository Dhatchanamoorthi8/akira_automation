import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Wind, Layers, Gauge, CircleDot, Disc, CheckCircle2, Crosshair, Maximize2, Circle, Wrench, Anchor } from 'lucide-react';
import { company } from '../../config/company';
import { solutions } from '../../data/solutions';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';
import { SpotlightCard } from '../animation/SpotlightCard';

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Wind,
  Layers,
  Gauge,
  CircleDot,
  Disc,
  CheckCircle2,
  Crosshair,
  Maximize2,
  Circle,
  Wrench,
  Anchor
};

export const SolutionsGrid: React.FC = () => {
  const [showAllMobile, setShowAllMobile] = React.useState(false);

  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-white border-y border-slate-200 overflow-hidden">
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="max-w-3xl mb-6 sm:mb-12">
          <span className="section-tag">
            Core Solution Capabilities
          </span>
          <h2 className="section-title mt-3">
            Comprehensive Precision Gauging & Metrology Engineering
          </h2>
          <p className="section-subtitle">
            From automated multi-gauging stations and compressed-air inspection to custom fixtures and work-holding solutions — {company.name} provides end-to-end dimensional checking solutions compared to any supplier.
          </p>
        </Reveal>

        {/* Solutions Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {solutions.map((sol, idx) => {
            const Icon = iconMap[sol.iconName] || CheckCircle2;
            return (
              <StaggerItem key={sol.id} className={idx >= 4 && !showAllMobile ? "hidden sm:block" : "block"}>
                <SpotlightCard className="card-base card-hover p-4 sm:p-6 flex flex-col justify-between group border-slate-200/90 h-full rounded-xl bg-white">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-all duration-200 border border-slate-200/60">
                      <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                        {sol.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {sol.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-semibold text-industrial-primary group-hover:text-industrial-hover">
                    <Link
                      to={`/solutions#${sol.slug}`}
                      className="inline-flex items-center gap-1.5 focus:outline-none min-h-[44px] py-1"
                    >
                      <span>Explore Capability</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      Precision Standard
                    </span>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Mobile View More Solutions Button */}
        {!showAllMobile && (
          <div className="mt-5 text-center sm:hidden">
            <button
              type="button"
              onClick={() => setShowAllMobile(true)}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-industrial-primary font-bold text-xs border border-slate-200/80 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>View All 12 Capabilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom CTA bar */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-xl bg-industrial-dark text-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 border border-slate-800 shadow-subtle">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold font-heading">
              Have a custom component or unique gauging requirement?
            </h4>
            <p className="text-xs text-slate-300">
              Our engineers build tailor-made special fixtures and multi-gauging stations for your exact production tolerances.
            </p>
          </div>
          <Link to="/contact" className="btn-primary w-full sm:w-auto text-center justify-center shrink-0 whitespace-nowrap bg-industrial-primary hover:bg-sky-600 text-white">
            Discuss Your Requirement
          </Link>
        </div>

      </div>
    </SectionReveal>
  );
};
