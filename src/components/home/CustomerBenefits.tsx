import React from 'react';
import { Clock, TrendingUp, ShieldCheck, Cpu, DollarSign } from 'lucide-react';
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
    <SectionReveal className="py-20 bg-white border-b border-slate-200">
      <div className="industrial-container">
        {/* Header */}
        <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-14">
          <span className="section-tag">
            Measurable Manufacturing Value
          </span>
          <h2 className="section-title mt-3">
            Customer Benefits
          </h2>
          <p className="section-subtitle mx-auto">
            Direct business advantages realized by OEMs and tier-suppliers deploying {company.name} precision gauging and automated multi-gauging systems.
          </p>
        </Reveal>

        {/* 5 Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {companyIntro.customerBenefits.map((b, idx) => {
            const Icon = benefitIcons[idx] || ShieldCheck;
            return (
              <StaggerItem key={idx}>
                <SpotlightCard
                  spotlightColor="rgba(14, 116, 144, 0.08)"
                  className="card-base card-hover p-6 flex flex-col justify-between group border-slate-200 h-full"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-slate-100 text-industrial-primary group-hover:bg-industrial-accent">
                        {b.metric}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-industrial-muted mt-2 leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-industrial-secondary flex items-center gap-1 mt-4">
                    <span>{company.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">Smart Solutions</span>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

      </div>
    </SectionReveal>
  );
};
