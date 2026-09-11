import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Handshake, 
  Target 
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { companyIntro } from '../data/company';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { SectionReveal } from '../components/animation/SectionReveal';
import { Reveal } from '../components/animation/Reveal';
import { ScaleReveal } from '../components/animation/ScaleReveal';
import { StaggerContainer } from '../components/animation/StaggerContainer';
import { StaggerItem } from '../components/animation/StaggerItem';
import { SpotlightCard } from '../components/animation/SpotlightCard';

export const About: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About Us | Precision Metrology & Multi-Gauging Systems"
        description={`${company.name} delivers precision metrology, automated multi-gauging systems, fixtures, and custom inspection solutions with a commitment to quality and customer success.`}
        keywords={`About ${company.name}, metrology manufacturer, precision gauging India, automated gauging`}
      />

      {/* Page Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'About Us' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-industrial-primary/30 text-sky-300 border border-sky-400/30">
              <Award className="w-3.5 h-3.5" />
              Corporate Profile & Heritage
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              About {company.name}
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              We support OEMs, automation integrators, and engineering industries with customized gauging solutions focused on accuracy, productivity, and reliability.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main About Story */}
      <SectionReveal className="py-20 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <Reveal direction="up" className="lg:col-span-7 space-y-6">
              <span className="section-tag">
                Company Overview
              </span>
              <h2 className="section-title mt-2">
                Delivering Innovative Metrology & Automation Solutions
              </h2>

              <p className="text-base text-slate-700 leading-relaxed">
                <strong>{company.name}</strong> focuses on high quality products and innovative solutions that help customers increase productivity and profitability.
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">
                The company provides comprehensive solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding which is our major strength compared to any supplier.
              </p>

              {/* Motto Box */}
              <div className="p-6 rounded-2xl bg-industrial-accent/40 border border-industrial-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-industrial-primary uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Company Motto</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-industrial-dark">
                  "{companyIntro.motto}"
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We strive to give Quality Solutions and Quality Service to customers in every project we undertake.
                </p>
              </div>

              {/* Core Values */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Core Values Driving {company.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {companyIntro.coreValues.map((val, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-sm font-bold text-industrial-dark font-heading">{val.title}</p>
                      <p className="text-xs text-industrial-muted mt-1 leading-snug">{val.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </Reveal>

            <div className="lg:col-span-5 relative">
              <ScaleReveal>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-900">
                  <img
                    src="/assets/company/inspection-workbench.webp"
                    alt={`${company.name} Metrology Facility`}
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                </div>
              </ScaleReveal>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-industrial-dark">{company.name}</p>
                  <p className="text-slate-500">Mamandur Village, Tiruttani, Tamil Nadu</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-industrial-primary text-white font-mono font-bold text-[10px]">
                  SMART SOLUTIONS
                </span>
              </div>
            </div>

          </div>
        </div>
      </SectionReveal>

      {/* Vision & Strengths */}
      <SectionReveal className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12">
            <span className="section-tag">
              Strategic Direction
            </span>
            <h2 className="section-title mt-2">
              Vision & Strengths
            </h2>
            <p className="section-subtitle">
              Sourced directly from our corporate charter, guiding how we design, manufacture, and support precision metrology equipment.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyIntro.visionAndStrengths.map((str, idx) => (
              <StaggerItem key={idx}>
                <div className="card-base p-6 flex items-start gap-4 border-slate-200/90 bg-white h-full">
                  <div className="w-10 h-10 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-industrial-dark font-heading">
                      {str}
                    </h3>
                    <p className="text-xs text-industrial-muted mt-1 leading-relaxed">
                      Committed to delivering traceable, high-reliability dimensional gauging across the production lifecycle.
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* Three Pillars of Commitment (Slide 7) */}
      <SectionReveal className="py-20 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-14 text-center mx-auto">
            <span className="section-tag">
              Foundational Principles
            </span>
            <h2 className="section-title mt-2">
              Commitment to Excellence
            </h2>
            <p className="mt-2 text-base font-bold text-industrial-primary font-heading">
              Precision and Reliability in Every Solution
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companyIntro.commitments.map((c, idx) => (
              <StaggerItem key={idx}>
                <SpotlightCard
                  spotlightColor="rgba(14, 116, 144, 0.08)"
                  className="card-base card-hover p-8 border-slate-200/90 flex flex-col justify-between h-full bg-white"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-industrial-dark font-heading">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-slate-100 text-[11px] font-mono text-industrial-muted mt-6">
                    Quality Standard
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* Building Strong Partnerships (Slide 13) */}
      <SectionReveal className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12">
            <span className="section-tag">
              Slide 13 Values
            </span>
            <h2 className="section-title mt-2">
              Building Strong Partnerships
            </h2>
            <p className="section-subtitle">
              We believe lasting industrial success is founded on two core pillars:
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyIntro.partnershipPillars.map((p, idx) => (
              <StaggerItem key={idx}>
                <div className="card-base p-8 bg-white border-slate-200/90 space-y-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center">
                    <Handshake className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-industrial-dark">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionReveal>

      <EnquiryCTA />
    </>
  );
};
