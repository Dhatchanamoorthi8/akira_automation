import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
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
  ShieldCheck,
  ZoomIn,
  Settings2,
  Table,
  HelpCircle
} from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { solutions } from '../data/solutions';
import { products } from '../data/products';
import { useEnquiry } from '../context/EnquiryContext';
import { useImageViewer } from '../context/ImageViewerContext';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';
import { PrecisionRuler } from '../components/animation/PrecisionRuler';
import { createBreadcrumbSchema, createFAQSchema } from '../config/seo';

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

// Engineering category clusters for clean industrial grouping
const categoryClusters = [
  { id: 'all', label: 'All 12 Capabilities' },
  { id: 'automated', label: 'Automated Multi-Gauging' },
  { id: 'pneumatic', label: 'Pneumatic Air Metrology' },
  { id: 'electronic', label: 'Electronic DRO & Probes' },
  { id: 'tooling', label: 'Fixed Limit & Special Fixtures' }
];

export const Solutions: React.FC = () => {
  const location = useLocation();
  const { category } = useParams<{ category?: string }>();
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

  // Active filter cluster in catalog mode
  const [activeCluster, setActiveCluster] = useState('all');
  
  // Spotlight active solution for inline deep-dive dossier in catalog mode
  const [spotlightSlug, setSpotlightSlug] = useState('multigauging');

  // Dedicated single-solution view if route is /solutions/:category
  const selectedSolution = useMemo(() => {
    if (!category) return null;
    return solutions.find((s) => s.slug === category || s.id === category) || null;
  }, [category]);

  // Solution displayed in the spotlight dossier
  const activeSpotlight = useMemo(() => {
    if (selectedSolution) return selectedSolution;
    return solutions.find((s) => s.slug === spotlightSlug) || solutions[0];
  }, [selectedSolution, spotlightSlug]);

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

  // Filtered solution list based on selected cluster
  const filteredSolutions = useMemo(() => {
    if (activeCluster === 'all') return solutions;
    if (activeCluster === 'automated') {
      return solutions.filter(s => ['multigauging', 'assembly', 'workholding'].includes(s.slug));
    }
    if (activeCluster === 'pneumatic') {
      return solutions.filter(s => ['air-gauging', 'air-plug-ring'].includes(s.slug));
    }
    if (activeCluster === 'electronic') {
      return solutions.filter(s => ['electronic-gauges'].includes(s.slug));
    }
    if (activeCluster === 'tooling') {
      return solutions.filter(s => ['fixtures', 'attribute-gauges', 'plug-gauges', 'snap-gauges', 'ring-gauges', 'special-gauges'].includes(s.slug));
    }
    return solutions;
  }, [activeCluster]);

  // Resolve supported products for the selected/spotlight solution
  const supportedProductList = useMemo(() => {
    const target = selectedSolution || activeSpotlight;
    if (!target || !target.supportedProducts) return [];
    return products.filter((p) => target.supportedProducts?.includes(p.slug));
  }, [selectedSolution, activeSpotlight]);

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

  const handleInspectImage = (imgSrc: string, title: string, categoryName: string, desc: string) => {
    openImageViewer({
      src: imgSrc,
      title: title,
      category: categoryName,
      description: desc,
      badge: 'Certified Metrology System'
    });
  };

  return (
    <>
      <SEOHead
        title={selectedSolution ? `${selectedSolution.title} | Precision Metrology` : "Precision Gauging & Turnkey Fixture Solutions"}
        description={
          selectedSolution 
            ? `${selectedSolution.title} by ${company.name}: ${selectedSolution.shortDescription}`
            : `Explore ${company.name}'s 12 core metrology capabilities: Automated multi-gauging systems, pneumatic air gauges, digital DROs, inspection fixtures, setting masters, and work-holding tooling.`
        }
        keywords={
          selectedSolution
            ? `${selectedSolution.title}, ${company.name}, Precision Gauging Solutions, Industrial Metrology India`
            : `Multi Gauging Solutions, Air Gauges, Fixtures, Electronic Gauging, Air Plug Gauges, Air Ring Gauges, ${company.name}`
        }
        canonicalPath={selectedSolution ? `/solutions/${selectedSolution.slug}` : '/solutions'}
        ogImage={selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp'}
        structuredData={
          selectedSolution?.faqs
            ? [createBreadcrumbSchema(breadcrumbsData), createFAQSchema(selectedSolution.faqs)!]
            : createBreadcrumbSchema(breadcrumbsData)
        }
      />

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION: Technical Blueprint & Engineering Dossier
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-industrial-dark text-white pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full shadow-elevated">
        {/* Engineering Blueprint Background Grid & Technical Accents */}
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="hidden lg:block absolute -top-32 -right-32 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-industrial-highlight/15 blur-3xl pointer-events-none" />

        {/* Top Precision Caliper Ticks */}
        <div className="hidden sm:block absolute top-0 left-0 right-0">
          <PrecisionRuler ticksCount={64} highlightInterval={8} className="opacity-50" />
        </div>

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb 
            items={
              selectedSolution
                ? [{ label: 'Solutions', href: '/solutions' }, { label: selectedSolution.title }]
                : [{ label: 'Solutions' }]
            } 
          />

          {/* 2-Column Hero Layout: Value Proposition + High-Tech Metrology Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mt-4">
            
            {/* Left Column: Heading & Value Proposition (7 cols) */}
            <Reveal direction="up" className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  variant="soft"
                  color="accent"
                  size="sm"
                  className="bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono text-xs font-semibold uppercase tracking-wider"
                >
                  <Chip.Label className="inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-industrial-primary" />
                    <span>{selectedSolution ? 'Dedicated Solution Capability' : 'Industrial Metrology Engineering • 12 Core Domains'}</span>
                  </Chip.Label>
                </Chip>

                <span className="text-xs font-mono font-bold text-slate-300 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/80">
                  OEM Turnkey Ready
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                {selectedSolution ? (
                  <>
                    {selectedSolution.title}
                  </>
                ) : (
                  <>
                    Turnkey Metrology & <span className="text-sky-300">Gauging Solutions</span>
                  </>
                )}
              </h1>

              {!selectedSolution && (
                <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border-l-4 border-industrial-primary border-y border-r border-slate-800 shadow-subtle">
                  <p className="text-sm sm:text-base font-bold text-sky-200 font-heading">
                    "12 Engineered Domains for Shop-Floor & Automated Line-Side Inspection."
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    From pneumatic air gauges to fully automated multi-point robotic gauging stations — tailored to your component drawing tolerances.
                  </p>
                </div>
              )}

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {selectedSolution 
                  ? selectedSolution.fullDescription
                  : `${company.name} delivers integrated gauging systems, dedicated metrology fixtures, pneumatic air gauging, multi-channel electronic DRO readouts, and custom work-holding solutions engineered for zero-defect OEM production lines.`
                }
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry(selectedSolution?.title || 'Precision Solutions Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all font-sans cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                >
                  <span>Request Engineering Consultation</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                {selectedSolution ? (
                  <Link
                    to="/solutions"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span>View All 12 Capabilities</span>
                  </Link>
                ) : (
                  <Link
                    to="/products"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                  >
                    <span>Browse Product Lineup</span>
                  </Link>
                )}
              </div>
            </Reveal>

            {/* Right Column: High-Tech Industrial Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => handleInspectImage(
                  selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp',
                  selectedSolution?.title || 'Automated Multi-Gauging & Turnkey Inspection Cell',
                  'Turnkey Metrology Solution',
                  selectedSolution?.shortDescription || 'Automated multi-point dimensional inspection station verifying complex machined automotive shafts and housings with pneumatic air probes and LVDT sensors.'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInspectImage(
                      selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp',
                      selectedSolution?.title || 'Automated Multi-Gauging & Turnkey Inspection Cell',
                      'Turnkey Metrology Solution',
                      selectedSolution?.shortDescription || 'Automated multi-point dimensional inspection station verifying complex machined automotive shafts and housings with pneumatic air probes and LVDT sensors.'
                    );
                  }
                }}
                className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group cursor-pointer focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
                role="button"
                tabIndex={0}
                aria-label="View high-resolution photograph of metrology solution"
              >
                <img
                  src={selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp'}
                  alt={selectedSolution?.title || 'Automated Multi-Gauging & Turnkey Inspection Cell'}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('.jpg')) {
                      target.src = '/assets/solutions/solutions-hero-multigauge.jpg';
                    } else if (!target.src.includes('air-gauging-bench')) {
                      target.src = '/assets/solutions/air-gauging-bench.webp';
                    }
                  }}
                  className="w-full h-auto object-cover min-h-[260px] sm:min-h-[320px] max-h-[380px] transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle Gradient & Technical Status Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5 z-10">
                  <Chip
                    variant="soft"
                    color="default"
                    size="sm"
                    className="bg-slate-900/90 text-white shadow-subtle border border-slate-700/90 backdrop-blur-sm"
                  >
                    <Chip.Label className="text-xs font-bold uppercase tracking-wider font-mono">
                      {selectedSolution ? selectedSolution.title : 'Turnkey Gauging Cell'}
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Viewfinder HUD */}
                <div className="absolute inset-0 bg-industrial-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Gauging Fixture</span>
                  </span>
                </div>

                {/* Bottom Technical Specifications Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      {selectedSolution ? selectedSolution.title : 'Automated Multi-Point Gauging Cell'}
                    </p>
                    <p className="text-slate-300 text-xs truncate">
                      {selectedSolution ? selectedSolution.shortDescription : 'Shaft & component multi-parameter audit'}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900/90 text-sky-300 border border-sky-800/80 font-bold shrink-0">
                    {selectedSolution ? '100% In-Line Audit' : 'Cp/Cpk ≥ 1.67'}
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Engineering Capability Metrics Bar with 2:1 Typographic Ratio */}
          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono">12 Domains</p>
                <p className="text-xs text-slate-400">Turnkey Capabilities</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono flex items-baseline gap-1">
                  <span>≤ 0.1</span>
                  <span className="text-xs text-slate-400 font-medium">µm</span>
                </p>
                <p className="text-xs text-slate-400">Sub-Micron Precision</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono">100% Verified</p>
                <p className="text-xs text-slate-400">Pre-Dispatch Gage R&R</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono">ISO/IEC 17025</p>
                <p className="text-xs text-slate-400">Traceable Standards</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. STICKY CATEGORY CLUSTERS NAVIGATION (Catalog Mode Only)
          ══════════════════════════════════════════════════════════════════════ */}
      {!selectedSolution && (
        <section className="py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[72px] sm:top-[80px] z-30 shadow-subtle overflow-hidden">
          <div className="industrial-container">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categoryClusters.map((cluster) => {
                const isActive = activeCluster === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    onClick={() => setActiveCluster(cluster.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all min-h-[44px] inline-flex items-center justify-center cursor-pointer font-sans focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none ${
                      isActive
                        ? 'bg-industrial-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-industrial-dark border border-slate-200/80'
                    }`}
                  >
                    <span>{cluster.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          3. SCANNABLE 12-DOMAIN CAPABILITY GRID (Catalog Mode)
          ══════════════════════════════════════════════════════════════════════ */}
      {!selectedSolution && (
        <section className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200">
          <div className="industrial-container space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-2">
                  <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                    Capability Directory
                  </Chip.Label>
                </Chip>
                <h2 className="section-title mt-1">
                  12 Engineering Solution Domains
                </h2>
                <p className="section-subtitle">
                  Click any domain to inspect its technical operating principles, real-world case study, and comparative metrology table.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-subtle self-start sm:self-auto">
                Showing {filteredSolutions.length} of 12 Domains
              </div>
            </div>

            {/* 12-Card High-Contrast Scannable Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredSolutions.map((sol) => {
                const Icon = iconMap[sol.iconName] || CheckCircle2;
                const isSpotlighted = spotlightSlug === sol.slug;
                const globalIndex = solutions.findIndex(s => s.id === sol.id) + 1;

                return (
                  <Card
                    key={sol.id}
                    variant="default"
                    className={`p-5 sm:p-6 rounded-2xl flex flex-col justify-between transition-all duration-200 group bg-white border cursor-pointer ${
                      isSpotlighted 
                        ? 'border-industrial-primary ring-2 ring-industrial-primary/20 shadow-card' 
                        : 'border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card'
                    }`}
                    onClick={() => {
                      setSpotlightSlug(sol.slug);
                      const el = document.getElementById('spotlight-dossier');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="space-y-4">
                      {/* Top Header Row: Icon & Capability Index */}
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-sky-50 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-sky-100 shadow-xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          CAP-{String(globalIndex).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Title & Short Description */}
                      <div className="space-y-1.5">
                        <Card.Title className="text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                          {sol.title}
                        </Card.Title>
                        <Card.Description className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                          {sol.shortDescription}
                        </Card.Description>
                      </div>

                      {/* Key Application Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sol.applications.slice(0, 2).map((app, i) => (
                          <span 
                            key={i} 
                            className="inline-flex text-xs font-sans font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpotlightSlug(sol.slug);
                          const el = document.getElementById('spotlight-dossier');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-industrial-primary group-hover:text-industrial-hover inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none rounded"
                      >
                        <span>{isSpotlighted ? 'Viewing Dossier' : 'Inspect Dossier'}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>

                      <Link
                        to={`/solutions/${sol.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-mono font-semibold text-slate-500 hover:text-industrial-primary inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none rounded px-2 py-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dedicated Page</span>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4. FEATURED SOLUTION SPOTLIGHT & TECHNICAL DOSSIER
          ══════════════════════════════════════════════════════════════════════ */}
      <section 
        id="spotlight-dossier" 
        className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200 scroll-mt-24"
      >
        <div className="industrial-container space-y-12">
          {/* Spotlight Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-2">
                <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                  {selectedSolution ? 'Dedicated Technical Dossier' : 'Selected Domain Technical Dossier'}
                </Chip.Label>
              </Chip>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                {activeSpotlight.title}
              </h2>
              <p className="section-subtitle mt-2">
                Detailed operating principles, GD&T inspection capabilities, compliance standards, and verified shop-floor performance metrics.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onPress={() => openEnquiry(activeSpotlight.title)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-semibold text-xs sm:text-sm tracking-wide shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
              >
                <span>Enquire About This System</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 2-Column Deep-Dive Breakdown: Details (7 cols) + Visual/Specs (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Scope, Features, Applications & E-E-A-T (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Technical Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-700">
                  Engineering Scope & Purpose
                </h3>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                  {activeSpotlight.fullDescription}
                </p>
              </div>

              {/* AEO Direct-Answer Summary Box (TL;DR) */}
              {activeSpotlight.tldr && (
                <div className="p-4 rounded-xl bg-sky-50 border-l-4 border-industrial-primary text-xs sm:text-sm text-slate-800 leading-relaxed shadow-subtle space-y-1">
                  <strong className="text-industrial-primary font-bold block font-mono text-xs uppercase tracking-wider">
                    Direct Engineering Summary (TL;DR):
                  </strong>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {activeSpotlight.tldr}
                  </p>
                </div>
              )}

              {/* Operating Principle Block */}
              {activeSpotlight.aiOverviewPassage && (
                <Card variant="default" className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-industrial-primary" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-industrial-primary">
                      Technical Definition & Operating Principle
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {activeSpotlight.aiOverviewPassage}
                  </p>
                </Card>
              )}

              {/* Key Features & GD&T Inspection Capabilities */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Technical Capabilities & Tolerances Checked
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800 font-medium">
                  {activeSpotlight.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                      <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standards Compliance Badges */}
              {activeSpotlight.standardsCompliance && activeSpotlight.standardsCompliance.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-industrial-primary" />
                    <span>Metrology & Traceability Standards</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSpotlight.standardsCompliance.map((std, i) => (
                      <Chip
                        key={i}
                        variant="soft"
                        color="accent"
                        size="sm"
                        className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-xs font-semibold"
                      >
                        <Chip.Label className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-industrial-primary" />
                          <span>{std}</span>
                        </Chip.Label>
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* E-E-A-T Technical Specialist Review Plate */}
              <Card variant="default" className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-row items-start gap-3 shadow-subtle">
                <ShieldCheck className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed font-sans">
                  <strong className="text-slate-900 font-bold">Technical Metrology Review:</strong> Verified by <strong className="text-industrial-primary font-bold">Kalidoss</strong>, Lead Metrology Applications Engineer. All tolerances, gauge repeatability limits, and sensor configurations adhere to ISO/DIN precision engineering standards.
                </div>
              </Card>

            </div>

            {/* Right Column: Visual Showcase & Applications (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Solution Photograph with Viewfinder Inspection Overlay */}
              <div 
                onClick={() => handleInspectImage(
                  activeSpotlight.image,
                  activeSpotlight.title,
                  'Turnkey Metrology Station',
                  activeSpotlight.shortDescription
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInspectImage(
                      activeSpotlight.image,
                      activeSpotlight.title,
                      'Turnkey Metrology Station',
                      activeSpotlight.shortDescription
                    );
                  }
                }}
                className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-950 group cursor-pointer focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`View high-resolution photograph of ${activeSpotlight.title}`}
              >
                <img
                  src={activeSpotlight.image}
                  alt={`${activeSpotlight.title} - ${company.name}`}
                  className="w-full h-auto object-cover min-h-[260px] max-h-[380px] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark/85 via-transparent to-transparent" />
                
                {/* Hover Inspect Indicator */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700">
                    <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                    <span>Inspect System</span>
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-white/95 backdrop-blur-sm text-xs font-bold text-industrial-dark flex items-center justify-between border border-slate-200/80 shadow-subtle">
                  <span>{activeSpotlight.title}</span>
                  <span className="text-xs text-industrial-primary font-mono font-bold">Precision Standard</span>
                </div>
              </div>

              {/* Target Component Applications Card */}
              <Card variant="default" className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Typical Component Applications
                  </span>
                  <span className="text-xs font-mono text-industrial-primary font-bold">
                    OEM VERIFIED
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {activeSpotlight.applications.map((app, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-industrial-primary mt-1.5 shrink-0" />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

          </div>

          {/* Real-World Case Study Callout Plate */}
          {activeSpotlight.caseStudies && activeSpotlight.caseStudies.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-industrial-primary" />
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  Shop-Floor Case Study &amp; Production Verification
                </h3>
              </div>

              {activeSpotlight.caseStudies.map((cs, csIdx) => (
                <Card 
                  key={csIdx} 
                  variant="default" 
                  className="p-6 sm:p-7 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-subtle space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-industrial-primary font-bold">
                        Case Study • {cs.industry}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 font-heading mt-0.5">
                        {cs.title}
                      </h4>
                    </div>
                    <Chip
                      variant="soft"
                      color="accent"
                      size="sm"
                      className="bg-sky-50 text-industrial-primary border border-sky-200 font-mono text-xs font-bold self-start sm:self-auto"
                    >
                      <Chip.Label className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Production Verified</span>
                      </Chip.Label>
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm font-sans">
                    <div className="space-y-1.5">
                      <strong className="font-bold text-slate-900 block text-xs font-mono uppercase tracking-wider text-slate-600">
                        Manufacturing Challenge:
                      </strong>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {cs.challenge}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <strong className="font-bold text-slate-900 block text-xs font-mono uppercase tracking-wider text-slate-600">
                        AKIRA Engineering Solution:
                      </strong>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {cs.solution}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200/80">
                    <strong className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider text-slate-600 block">
                      Production Impact &amp; Result:
                    </strong>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {cs.result}
                    </p>
                  </div>

                  {cs.metrics && cs.metrics.length > 0 && (
                    <div className="pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {cs.metrics.map((m, mIdx) => (
                          <div 
                            key={mIdx} 
                            className="bg-white border border-slate-200/90 p-3 rounded-xl text-center shadow-subtle"
                          >
                            <span className="text-xs sm:text-sm font-bold text-industrial-primary font-mono block">
                              {m}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Comparative Metrology Analysis Table */}
          {activeSpotlight.comparisonTable && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-industrial-primary" />
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                  {activeSpotlight.comparisonTable.caption || `${activeSpotlight.title} — Comparative Metrology Analysis`}
                </h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-subtle bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-900">
                      {activeSpotlight.comparisonTable.headers.map((h, i) => (
                        <th key={i} className="p-3.5 font-bold font-heading text-slate-900">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeSpotlight.comparisonTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        {row.map((cell, cIdx) => (
                          <td 
                            key={cIdx} 
                            className={`p-3.5 ${cIdx === 0 ? 'font-bold text-slate-900 font-mono' : 'text-slate-700 font-medium'}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Technical FAQs Section */}
          {activeSpotlight.faqs && activeSpotlight.faqs.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-industrial-primary" />
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                  Frequently Asked Technical Questions
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSpotlight.faqs.map((faq, fIdx) => (
                  <Card 
                    key={fIdx} 
                    variant="default" 
                    className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2 shadow-subtle"
                  >
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading flex items-start gap-2">
                      <span className="text-industrial-primary font-mono font-bold shrink-0">Q{fIdx + 1}:</span>
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium pl-5">
                      {faq.answer}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Hardware & Supported Products */}
          {supportedProductList.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-industrial-primary" />
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900">
                  Associated Precision Hardware &amp; Tooling
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {supportedProductList.map((prod) => (
                  <Card 
                    key={prod.id} 
                    variant="default" 
                    className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200 shadow-subtle"
                  >
                    <div className="space-y-2">
                      <Chip
                        variant="soft"
                        color="accent"
                        size="sm"
                        className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-xs font-semibold"
                      >
                        <Chip.Label>{prod.category}</Chip.Label>
                      </Chip>
                      <Card.Title className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                        {prod.title}
                      </Card.Title>
                      <Card.Description className="text-xs text-slate-600 line-clamp-2 font-medium">
                        {prod.description}
                      </Card.Description>
                    </div>
                    <Link
                      to={`/products/${prod.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:text-industrial-hover focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none rounded"
                    >
                      <span>View Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. CONVERSION CTA: Connect With Engineering Desk
          ══════════════════════════════════════════════════════════════════════ */}
      <EnquiryCTA />
    </>
  );
};
