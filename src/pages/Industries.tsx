import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Boxes, 
  Cog, 
  Bot, 
  Cpu, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { createBreadcrumbSchema } from '../config/seo';
import { industries } from '../data/industries';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';

const iconMap: Record<string, React.ElementType> = {
  Car,
  Boxes,
  Cog,
  Bot,
  Cpu
};

export const Industries: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Industries We Serve | Automotive OEMs, Tier Suppliers & Automation"
        description={`${company.name} provides precision gauging and multi-gauging systems for Automotive OEMs, Tier-1 & Tier-2 suppliers, Automation machine builders, and Precision Engineering.`}
        keywords={`Automotive OEM Gauges, Tier-1 Supplier Gauging, Automation Machine Builders, Precision Engineering Gauges India, ${company.name}`}
        canonicalPath="/industries"
        structuredData={createBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Industries', url: '/industries' }
        ])}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Industries' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <Car className="w-3.5 h-3.5" />
              Manufacturing Sectors
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Industries We Serve
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Based on the core sectors identified in our charter, {company.name} provides custom-built gauging systems and metrology equipment engineered for demanding production tolerances.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Detailed Industry Cards */}
      <section className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-16">
          {industries.map((ind, index) => {
            const Icon = iconMap[ind.iconName] || Cpu;
            const isReversed = index % 2 !== 0;

            return (
              <Reveal
                key={ind.id}
                direction="up"
              >
                <div
                  id={ind.slug}
                  className="card-base p-8 sm:p-10 border-slate-200 bg-white scroll-mt-28"
                >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}>
                  
                  {/* Left/Right Text Content (7 cols) */}
                  <div className={`lg:col-span-7 space-y-5 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Sector {String(index + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-2xl font-bold font-heading text-industrial-dark">
                          {ind.name}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {ind.description}
                    </p>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-industrial-dark uppercase tracking-wider text-[10px]">
                        Manufacturing Context & Gauging Relevance:
                      </p>
                      <p className="leading-relaxed">
                        {ind.gaugingRelevance}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Key Applications & Component Scope:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {ind.keyApplications.map((app, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                            <span>{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3">
                      <Link
                        to={`/contact?industry=${ind.slug}`}
                        className="btn-primary text-xs py-2.5"
                      >
                        <span>Discuss Solutions for {ind.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>

                  {/* Image (5 cols) */}
                  <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 group">
                      <img
                        src={ind.image}
                        alt={ind.name}
                        className="w-full h-auto object-cover max-h-[400px] transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </Reveal>
          );
          })}
        </div>
      </section>

      <EnquiryCTA />
    </>
  );
};
