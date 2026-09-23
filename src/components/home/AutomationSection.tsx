import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Zap } from 'lucide-react';
import { Card, Chip } from '@heroui/react';
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
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-industrial-dark via-[#0d2238] to-industrial-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dark-grid opacity-25 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />

      <div className="industrial-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Automation Cell Visualization from PPT Slide 12 (5 cols) */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <ScaleReveal>
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-industrial-dark group aspect-[4/3] sm:aspect-[16/10] min-h-[260px]">
                <img
                  src="/assets/solutions/automation-cell.webp"
                  alt="Multi-Gauging Automation Station with Robotic Integration"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3.5 sm:p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80">
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1 font-mono">
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
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <Reveal direction="up">
              <Chip variant="soft" color="accent" size="sm" className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70 mb-3">
                <Zap className="w-3.5 h-3.5" />
                <Chip.Label>Next-Gen Factory Automation</Chip.Label>
              </Chip>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white mt-2 leading-tight">
                The Next Level for Your Manufacturing
              </h2>
              <p className="mt-2.5 sm:mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                {company.name} bridges precision metrology with modern production line automation, bringing automated multi-point dimensional checking directly to your manufacturing cells.
              </p>
            </Reveal>

            {/* 3 Pillars from Slide 12 with HeroUI Card */}
            <StaggerContainer className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
              {companyIntro.automationPillars.map((pillar, idx) => (
                <StaggerItem key={idx}>
                  <Card 
                    variant="default"
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-sky-400/40 transition-colors shadow-none"
                  >
                    <Card.Title className="text-sm font-bold text-sky-400 font-heading flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      {pillar.title}
                    </Card.Title>
                    <Card.Description className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {pillar.description}
                    </Card.Description>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <Reveal direction="up" className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
              <Link
                to="/solutions/multigauging"
                className="w-full sm:w-auto text-center justify-center font-sans font-semibold text-xs sm:text-sm inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
              >
                <span>Explore Multigauging Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto text-center justify-center font-sans font-semibold text-xs sm:text-sm inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-transparent text-white border border-slate-600 hover:bg-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
              >
                <span>Consult Automation Team</span>
              </Link>
            </Reveal>

          </div>

        </div>
      </div>
    </SectionReveal>
  );
};

