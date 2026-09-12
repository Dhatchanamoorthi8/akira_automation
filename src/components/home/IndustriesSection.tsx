import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Boxes, Cog, Bot, Cpu, CheckCircle2 } from 'lucide-react';
import { industries } from '../../data/industries';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';
import { SpotlightCard } from '../animation/SpotlightCard';

const iconMap: Record<string, React.ElementType> = {
  Car,
  Boxes,
  Cog,
  Bot,
  Cpu
};

export const IndustriesSection: React.FC = () => {
  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-industrial-bg border-b border-slate-200 overflow-hidden">
      <div className="industrial-container">
        {/* Header */}
        <Reveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-6">
          <div>
            <span className="section-tag">
              Industrial Sectors
            </span>
            <h2 className="section-title mt-3">
              Industries We Serve
            </h2>
            <p className="section-subtitle">
              Delivering high-reliability metrology tooling and custom multi-gauging fixtures across the manufacturing ecosystem.
            </p>
          </div>
          <Link to="/industries" className="inline-flex items-center gap-2 text-sm font-bold text-industrial-primary hover:text-industrial-hover self-start md:self-end group">
            <span>Explore All Industries</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Large Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {industries.map((ind, idx) => {
            const Icon = iconMap[ind.iconName] || Cpu;
            return (
              <StaggerItem key={ind.id} className={idx >= 3 ? "hidden sm:block" : "block"}>
                <SpotlightCard
                  spotlightColor="rgba(14, 116, 144, 0.08)"
                  className="card-base card-hover overflow-hidden flex flex-col justify-between group border-slate-200 bg-white h-full"
                >
                  <div>
                    {/* Card Image */}
                    {ind.image && (
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={ind.image}
                          alt={ind.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark/90 via-industrial-dark/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-industrial-primary flex items-center justify-center text-white shadow-sm">
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold font-heading text-white">
                              {ind.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                      <p className="text-xs text-industrial-muted leading-relaxed">
                        {ind.description}
                      </p>

                      <div className="pt-2 space-y-1.5 border-t border-slate-100">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Typical Gauging Scope:
                        </p>
                        {ind.keyApplications.slice(0, 2).map((app, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 mt-2">
                    <Link
                      to={`/industries#${ind.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary group-hover:text-industrial-hover transition-colors"
                    >
                      <span>Industry Solutions</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Mobile View All Industries Link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/industries"
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-industrial-primary font-bold text-xs border border-slate-200 transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Explore All 5 Industry Sectors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </SectionReveal>
  );
};
