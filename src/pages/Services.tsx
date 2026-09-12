import React from 'react';
import { 
  Wrench, 
  GraduationCap, 
  Compass, 
  Zap, 
  Headphones, 
  Phone, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { servicesData } from '../data/services';
import { companyData } from '../data/company';
import { useEnquiry } from '../context/EnquiryContext';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';
import { StaggerContainer } from '../components/animation/StaggerContainer';
import { StaggerItem } from '../components/animation/StaggerItem';
import { SpotlightCard } from '../components/animation/SpotlightCard';

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  GraduationCap,
  Compass,
  Zap
};

export const Services: React.FC = () => {
  const { openEnquiry } = useEnquiry();

  return (
    <>
      <SEOHead
        title="Service & Technical Support | Beyond Sales Commitment"
        description={`Comprehensive technical support, on-site installation, operator calibration training, and rapid service response from ${company.name}.`}
        keywords={`Metrology Calibration Service, Multi-Gauging Installation, Operator Training, Air Gauging Support India, ${company.name}`}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Services' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <Headphones className="w-3.5 h-3.5" />
              Comprehensive Technical Backing
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Service & Support
            </h1>
            <p className="mt-3 text-xl font-bold text-sky-300 font-heading">
              "We support beyond sales."
            </p>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              At {company.name}, we understand that precision gauging equipment is mission-critical to your production lines. We partner with your quality engineering teams through every phase of operation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Service Pillars Detailed Grid */}
      <section className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-12">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {servicesData.map((srv) => {
              const Icon = iconMap[srv.iconName] || Wrench;
              return (
                <StaggerItem key={srv.id}>
                  <SpotlightCard
                    spotlightColor="rgba(14, 116, 144, 0.08)"
                    className="card-base p-8 border-slate-200 bg-white flex flex-col justify-between space-y-6 h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold font-heading text-industrial-dark">
                            {srv.title}
                          </h2>
                          <span className="text-[11px] font-mono text-slate-400">Service Pillar</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Service Deliverables:
                        </p>
                        {srv.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => openEnquiry(`Service: ${srv.title}`)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-industrial-primary hover:text-industrial-hover group"
                      >
                        <span>Request {srv.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">Direct Engineering</span>
                    </div>

                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Direct Support Card */}
          <Reveal direction="up" delay={0.2}>
            <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-bold font-heading text-industrial-dark">
                  Require Immediate Technical Support or Calibration?
                </h3>
                <p className="text-xs text-industrial-muted max-w-xl">
                  Contact our factory engineering desk directly. We support OEMs, tier-1 suppliers, and machine shops with minimal turnaround time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <a
                  href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
                  className="btn-primary"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {companyData.phones[0]}</span>
                </a>
                <button
                  onClick={() => openEnquiry("Technical Support Desk")}
                  className="btn-secondary"
                >
                  <span>Submit Service Request</span>
                </button>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      <EnquiryCTA />
    </>
  );
};
