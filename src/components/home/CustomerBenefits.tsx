import React from 'react';
import { Clock, TrendingUp, ShieldCheck, Cpu, DollarSign } from 'lucide-react';
import { Card, Chip } from '@heroui/react';
import { company } from '../../config/company';
import { companyIntro } from '../../data/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';
import { SpotlightCard } from '../animation/SpotlightCard';

const benefitIcons = [
  Clock,
  TrendingUp,
  ShieldCheck,
  Cpu,
  DollarSign
];

export const CustomerBenefits: React.FC = () => {
  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-slate-50/70 border-b border-slate-200 overflow-hidden">
      <div className="industrial-container">
        {/* Header */}
        <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-6 sm:mb-12">
          <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3 mx-auto">
            <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
              Measurable Manufacturing Value
            </Chip.Label>
          </Chip>
          <h2 className="section-title mt-2">
            Customer Benefits
          </h2>
          <p className="section-subtitle mx-auto">
            Direct business advantages realized by OEMs and tier-suppliers deploying {company.name} precision gauging and automated multi-gauging systems.
          </p>
        </Reveal>

        {/* 5 Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-6">
          {companyIntro.customerBenefits.map((b, idx) => {
            const Icon = benefitIcons[idx] || ShieldCheck;
            return (
              <StaggerItem key={idx}>
                <SpotlightCard
                  spotlightColor="rgba(0, 85, 165, 0.06)"
                  className="h-full rounded-xl"
                >
                  <Card
                    variant="default"
                    className="card-hover p-5 sm:p-6 flex flex-col justify-between group border border-slate-200/90 h-full rounded-xl bg-white shadow-sm hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                          <Icon className="w-5 h-5" />
                        </div>
                        <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/70 font-mono text-[10px] font-bold">
                          <Chip.Label>{b.metric}</Chip.Label>
                        </Chip>
                      </div>

                      <Card.Header className="p-0">
                        <Card.Title className="text-sm font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                          {b.title}
                        </Card.Title>
                        <Card.Description className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {b.description}
                        </Card.Description>
                      </Card.Header>
                    </div>

                    <Card.Footer className="p-0 pt-3 border-t border-slate-100 text-[10px] font-mono font-semibold text-slate-400 flex items-center gap-1 mt-4">
                      <span className="text-industrial-primary">{company.name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Smart Solutions</span>
                    </Card.Footer>
                  </Card>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

      </div>
    </SectionReveal>
  );
};

