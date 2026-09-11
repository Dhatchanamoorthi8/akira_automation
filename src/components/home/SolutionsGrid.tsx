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
  return (
    <SectionReveal className="py-20 bg-white border-y border-slate-200">
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="max-w-3xl mb-12">
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
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {solutions.map((sol) => {
            const Icon = iconMap[sol.iconName] || CheckCircle2;
            return (
              <StaggerItem key={sol.id}>
                <SpotlightCard className="card-base p-6 flex flex-col justify-between group border-slate-200 h-full">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                        {sol.title}
                      </h3>
                      <p className="text-xs text-industrial-muted mt-2 leading-relaxed">
                        {sol.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-semibold text-industrial-primary group-hover:text-industrial-hover">
                    <Link
                      to={`/solutions#${sol.slug}`}
                      className="inline-flex items-center gap-1.5 focus:outline-none"
                    >
                      <span>Explore Capability</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      PPT Specified
                    </span>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Bottom CTA bar */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-industrial-dark to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold font-heading">
              Have a custom component or unique gauging requirement?
            </h4>
            <p className="text-xs text-slate-300">
              Our engineers build tailor-made special fixtures and multi-gauging stations for your exact production tolerances.
            </p>
          </div>
          <Link to="/contact" className="btn-primary shrink-0 whitespace-nowrap bg-industrial-primary hover:bg-sky-600 text-white">
            Discuss Your Requirement
          </Link>
        </div>

      </div>
    </SectionReveal>
  );
};
