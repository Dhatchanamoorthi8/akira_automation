import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, Chip } from '@heroui/react';
import { company } from '../../config/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';
import { ScaleReveal } from '../animation/ScaleReveal';

const coreStrengthDetails = [
  {
    title: "Automated Multi-Gauging Expertise",
    description: "Specialized engineering mastery in multi-jet air plugs, multi-probe fixtures, and simultaneous multi-parameter inspection."
  },
  {
    title: "OEM & Automation-Ready Solutions",
    description: "Built strictly to automotive OEM standards with standard RS-232 serial streams, 24V relay interlocks, and foot-switch interfaces."
  },
  {
    title: "Custom-Built Systems",
    description: "Tailor-engineered around your unique component drawings, ensuring exact datum location and zero workpiece distortion."
  },
  {
    title: "Strong Service & Technical Support",
    description: "Installation, commissioning, operator training, and calibration support that extends far beyond the sale."
  },
  {
    title: "Competitive & Value-Driven Pricing",
    description: "High-precision metrology without exorbitant multinational markups, maximizing your return on investment."
  }
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-slate-50/70 border-b border-slate-200 overflow-hidden">
      <div className="industrial-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Typography & Vertical Feature List (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <Reveal direction="up">
              <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
                <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Our Differentiators
                </Chip.Label>
              </Chip>
              <h2 className="section-title mt-2">
                Why Choose {company.name}?
              </h2>
              <p className="section-subtitle">
                {company.name} is a trusted partner for OEMs and tier suppliers across India, combining relentless precision and automated solutions with a customer-first philosophy.
              </p>
            </Reveal>

            {/* Vertical Feature List with HeroUI Card */}
            <StaggerContainer className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
              {coreStrengthDetails.map((item, idx) => (
                <StaggerItem key={idx}>
                  <Card 
                    variant="default"
                    className={`items-start gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle hover:border-industrial-primary/30 hover:shadow-card transition-all group ${
                      idx >= 3 ? "hidden sm:flex" : "flex"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0 group-hover:bg-industrial-primary group-hover:text-white transition-colors mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <Card.Header className="p-0 space-y-1">
                      <Card.Title className="text-sm font-bold text-slate-900 font-heading group-hover:text-industrial-primary transition-colors">
                        {item.title}
                      </Card.Title>
                      <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {item.description}
                      </Card.Description>
                    </Card.Header>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <Reveal direction="up" className="pt-2">
              <Link
                to="/why-choose-us"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-800 hover:text-industrial-primary hover:border-industrial-primary font-sans font-semibold text-xs sm:text-sm px-5 py-2.5 min-h-[44px] rounded-lg shadow-subtle hover:bg-slate-50 transition-all focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
              >
                <span>Read More About Our Core Strengths</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>

          {/* Right Column: Technical Metrology Image from PPT (5 cols) */}
          <div className="lg:col-span-5 relative">
            <ScaleReveal>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 group">
                <img
                  src="/assets/solutions/air-gauging-inspection.webp"
                  alt={`${company.name} Precision Inspection`}
                  className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-industrial-dark/85 backdrop-blur-md border border-slate-700 text-xs text-slate-200">
                  <p className="font-bold text-white font-heading">
                    "Keeping Customers First"
                  </p>
                  <p className="text-xs text-slate-200 font-medium mt-1">
                    We strive to give quality solutions and quality service to our customers.
                  </p>
                </div>
              </div>
            </ScaleReveal>

            {/* Floating Metric Card */}
            <Reveal direction="right" delay={0.2} className="absolute -top-4 -left-4 hidden sm:block">
              <Card variant="default" className="bg-white text-industrial-dark rounded-xl p-3.5 shadow-card border border-slate-200 flex flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-600 font-mono">Core Values</p>
                  <p className="text-xs font-extrabold font-heading text-slate-900">Technical Support • Quality Service</p>
                </div>
              </Card>
            </Reveal>

          </div>

        </div>
      </div>
    </SectionReveal>
  );
};

export const WhyMilestoneSection = WhyChooseUsSection;

