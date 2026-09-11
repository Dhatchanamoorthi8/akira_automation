import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
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
  Anchor,
  Eye
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { solutions } from '../data/solutions';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';

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

export const Solutions: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <SEOHead
        title="Precision Gauging & Fixture Solutions"
        description={`Explore ${company.name}'s 12 core solution capabilities: Multi-gauging systems, air gauges, electronic gauges, fixtures, air plug & ring gauges, and work-holding.`}
        keywords={`Multi Gauging Solutions, Air Gauges, Fixtures, Electronic Gauging, Air Plug Gauges, Air Ring Gauges, ${company.name}`}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Solutions' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-industrial-primary/30 text-sky-300 border border-sky-400/30">
              <Layers className="w-3.5 h-3.5" />
              Core Capabilities
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Precision Gauging & Fixture Solutions
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              {company.name} provides solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Solutions Detailed List */}
      <section className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-16">
          {solutions.map((sol, index) => {
            const Icon = iconMap[sol.iconName] || CheckCircle2;
            const isReversed = index % 2 !== 0;

            return (
              <Reveal
                key={sol.id}
                direction="up"
              >
                <div
                  id={sol.slug}
                  className="card-base p-8 sm:p-10 border-slate-200 bg-white scroll-mt-28"
                >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}>
                  
                  {/* Text Details (7 cols) */}
                  <div className={`lg:col-span-7 space-y-5 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shadow-sm shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Solution {String(index + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-2xl font-bold font-heading text-industrial-dark">
                          {sol.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {sol.fullDescription}
                    </p>

                    {/* Features Checklist */}
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Technical Highlights & Scope
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {sol.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Applications */}
                    <div className="pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Common Industrial Applications
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sol.applications.map((app, i) => (
                          <span key={i} className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <Link
                        to={`/contact?solution=${sol.slug}`}
                        className="btn-primary text-xs py-2.5 w-full sm:w-auto text-center"
                      >
                        <span>Enquire About {sol.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>
                      <Link
                        to="/products"
                        className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-industrial-primary hover:underline py-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Related Products</span>
                      </Link>
                    </div>

                  </div>

                  {/* Image (5 cols) */}
                  <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 group">
                      <img
                        src={sol.image}
                        alt={sol.title}
                        className="w-full h-auto object-cover max-h-[400px] transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-industrial-dark flex items-center justify-between">
                        <span>{sol.title}</span>
                        <span className="text-[10px] text-industrial-primary font-mono">Precision Standard</span>
                      </div>
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
