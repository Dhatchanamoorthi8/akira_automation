import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Wind, Layers, Gauge, CircleDot, Disc, CheckCircle2, Crosshair, Maximize2, Circle, Wrench, Anchor } from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';
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
    <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-y border-slate-200 overflow-hidden">
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="max-w-3xl mb-6 sm:mb-12">
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest font-sans mb-2">
            Core Solution Capabilities
          </div>
          <h2 className="section-title mt-2">
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
                <SpotlightCard className="h-full rounded-xl">
                  <Card variant="default" className="card-hover p-5 sm:p-6 flex flex-col justify-between group border border-slate-200/90 h-full rounded-xl bg-white shadow-sm hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-all duration-200 border border-slate-200/60">
                        <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                      </div>

                      <Card.Header className="p-0">
                        <Card.Title className="text-base font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                          {sol.title}
                        </Card.Title>
                        <Card.Description className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {sol.shortDescription}
                        </Card.Description>
                      </Card.Header>
                    </div>

                    <Card.Footer className="p-0 pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-semibold text-industrial-primary group-hover:text-industrial-hover">
                      <Link
                        to={`/solutions#${sol.slug}`}
                        className="inline-flex items-center gap-1.5 min-h-[44px] py-1 font-sans focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none rounded-lg"
                      >
                        <span>Explore Capability</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                      <span className="text-xs font-mono text-slate-500 font-medium">
                        Precision Standard
                      </span>
                    </Card.Footer>
                  </Card>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Mobile View More Solutions Button - HeroUI Button */}
        {!showAllMobile && (
          <div className="mt-5 text-center sm:hidden">
            <Button
              variant="secondary"
              fullWidth
              onPress={() => setShowAllMobile(true)}
              className="py-2.5 px-4 min-h-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 text-industrial-primary font-bold text-xs border border-slate-200/80 transition-colors inline-flex items-center justify-center gap-1.5 font-sans focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
            >
              <span>View All 12 Capabilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
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
          <Link
            to="/contact"
            className="button button--primary button--md w-full sm:w-auto text-center justify-center shrink-0 whitespace-nowrap bg-industrial-primary hover:bg-sky-600 text-white font-sans px-6 inline-flex items-center"
          >
            <span>Discuss Your Requirement</span>
          </Link>
        </div>

      </div>
    </SectionReveal>
  );
};

