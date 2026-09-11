import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    <SectionReveal className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200 overflow-hidden">
      <div className="industrial-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography & Vertical Feature List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal direction="up">
              <span className="section-tag">
                Our Differentiators
              </span>
              <h2 className="section-title mt-3">
                Why Choose {company.name}?
              </h2>
              <p className="section-subtitle">
                {company.name} is a trusted partner for OEMs and tier suppliers across India, combining relentless precision and automated solutions with a customer-first philosophy.
              </p>
            </Reveal>

            {/* Vertical Feature List */}
            <StaggerContainer className="space-y-4 pt-2">
              {coreStrengthDetails.map((item, idx) => (
                <StaggerItem key={idx}>
                  <div 
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-industrial-primary/30 hover:bg-slate-50/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0 group-hover:bg-industrial-primary group-hover:text-white transition-colors mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-industrial-muted mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <Reveal direction="up" className="pt-2">
              <Link to="/why-choose-us" className="btn-outline">
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
                  <p className="text-[11px] text-slate-300 mt-1">
                    We strive to give quality solutions and quality service to our customers.
                  </p>
                </div>
              </div>
            </ScaleReveal>

            {/* Floating Metric Card */}
            <Reveal direction="right" delay={0.2} className="absolute -top-4 -left-4 bg-white text-industrial-dark rounded-xl p-3.5 shadow-card border border-slate-200 hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Core Values</p>
                <p className="text-xs font-extrabold font-heading text-industrial-dark">Technical Support • Quality Service</p>
              </div>
            </Reveal>

          </div>

        </div>
      </div>
    </SectionReveal>
  );
};

export const WhyMilestoneSection = WhyChooseUsSection;
