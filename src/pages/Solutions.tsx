import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
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
  Eye,
  ArrowLeft
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { solutions } from '../data/solutions';
import { products } from '../data/products';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';
import { createBreadcrumbSchema } from '../config/seo';

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
  const { category } = useParams<{ category?: string }>();

  const selectedSolution = useMemo(() => {
    if (!category) return null;
    return solutions.find((s) => s.slug === category || s.id === category) || null;
  }, [category]);

  useEffect(() => {
    if (selectedSolution) {
      window.scrollTo(0, 0);
    } else if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location, selectedSolution]);

  // Resolve supported products for the selected solution
  const supportedProductList = useMemo(() => {
    if (!selectedSolution || !selectedSolution.supportedProducts) return [];
    return products.filter((p) => selectedSolution.supportedProducts?.includes(p.slug));
  }, [selectedSolution]);

  const breadcrumbsData = useMemo(() => {
    if (selectedSolution) {
      return [
        { name: 'Home', url: '/' },
        { name: 'Solutions', url: '/solutions' },
        { name: selectedSolution.title, url: `/solutions/${selectedSolution.slug}` }
      ];
    }
    return [
      { name: 'Home', url: '/' },
      { name: 'Solutions', url: '/solutions' }
    ];
  }, [selectedSolution]);

  return (
    <>
      <SEOHead
        title={selectedSolution ? `${selectedSolution.title} | Precision Metrology` : "Precision Gauging & Fixture Solutions"}
        description={
          selectedSolution 
            ? `${selectedSolution.title} by ${company.name}: ${selectedSolution.shortDescription}`
            : `Explore ${company.name}'s 12 core solution capabilities: Multi-gauging systems, air gauges, electronic gauges, fixtures, air plug & ring gauges, and work-holding.`
        }
        keywords={
          selectedSolution
            ? `${selectedSolution.title}, ${company.name}, Precision Gauging Solutions, Industrial Metrology India`
            : `Multi Gauging Solutions, Air Gauges, Fixtures, Electronic Gauging, Air Plug Gauges, Air Ring Gauges, ${company.name}`
        }
        canonicalPath={selectedSolution ? `/solutions/${selectedSolution.slug}` : '/solutions'}
        ogImage={selectedSolution?.image || '/assets/multigauging/multigauging-showcase.webp'}
        structuredData={createBreadcrumbSchema(breadcrumbsData)}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb 
            items={
              selectedSolution
                ? [{ label: 'Solutions', href: '/solutions' }, { label: selectedSolution.title }]
                : [{ label: 'Solutions' }]
            } 
          />

          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <Layers className="w-3.5 h-3.5" />
              {selectedSolution ? 'Dedicated Solution Capability' : 'Core Capabilities'}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              {selectedSolution ? selectedSolution.title : "Precision Gauging & Fixture Solutions"}
            </h1>

            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              {selectedSolution 
                ? selectedSolution.fullDescription
                : `${company.name} provides solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding.`
              }
            </p>

            {selectedSolution && (
              <div className="pt-4 flex items-center gap-3">
                <Link
                  to="/solutions"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>View All 12 Solutions</span>
                </Link>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Solutions Quick Navigation Bar */}
      <section className="py-4 bg-white border-b border-slate-200 sticky top-[80px] z-30 shadow-sm overflow-hidden">
        <div className="industrial-container">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Link
              to="/solutions"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                !selectedSolution
                  ? 'bg-industrial-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Capabilities
            </Link>
            {solutions.map((s) => (
              <Link
                key={s.id}
                to={`/solutions/${s.slug}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSolution?.slug === s.slug
                    ? 'bg-industrial-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-16">
          {(selectedSolution ? [selectedSolution] : solutions).map((sol, index) => {
            const Icon = iconMap[sol.iconName] || CheckCircle2;
            const isReversed = index % 2 !== 0;

            return (
              <Reveal
                key={sol.id}
                direction="up"
              >
                <div
                  id={sol.slug}
                  className="card-base p-8 sm:p-10 border-slate-200 bg-white scroll-mt-36"
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
                          Capability {String(solutions.findIndex(s => s.id === sol.id) + 1).padStart(2, '0')}
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
                      {!selectedSolution && (
                        <Link
                          to={`/solutions/${sol.slug}`}
                          className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-industrial-primary hover:underline py-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dedicated Solution Page</span>
                        </Link>
                      )}
                    </div>

                  </div>

                  {/* Image (5 cols) */}
                  <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 group">
                      <img
                        src={sol.image}
                        alt={`${sol.title} - ${company.name}`}
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

                {/* Related Products in Focused View */}
                {selectedSolution && supportedProductList.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-slate-200">
                    <h3 className="text-lg font-bold font-heading text-industrial-dark mb-4">
                      Recommended Metrology Systems for {sol.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {supportedProductList.map((prod) => (
                        <div key={prod.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-industrial-primary bg-sky-100 px-2 py-0.5 rounded">
                              {prod.category}
                            </span>
                            <h4 className="text-sm font-bold text-industrial-dark font-heading">
                              {prod.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {prod.description}
                            </p>
                          </div>
                          <Link
                            to={`/products/${prod.slug}`}
                            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:underline"
                          >
                            <span>View Specifications</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
