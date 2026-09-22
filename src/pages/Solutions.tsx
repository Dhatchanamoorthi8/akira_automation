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
  ArrowLeft,
  ShieldCheck,
  FileText,
  ZoomIn
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

export const Solutions: React.FC = () => {
  const location = useLocation();
  const { category } = useParams<{ category?: string }>();
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

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
        ogImage={selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp'}
        structuredData={
          selectedSolution?.faqs
            ? [createBreadcrumbSchema(breadcrumbsData), createFAQSchema(selectedSolution.faqs)!]
            : createBreadcrumbSchema(breadcrumbsData)
        }
      />

      {/* 1. Hero Section - Premium Industrial Engineering */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none overflow-hidden" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none overflow-hidden" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb 
            items={
              selectedSolution
                ? [{ label: 'Solutions', href: '/solutions' }, { label: selectedSolution.title }]
                : [{ label: 'Solutions' }]
            } 
          />

          {/* 2-Column Hero Layout: Value Proposition + High-Tech Metrology Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-4">
            
            {/* Left Column: Heading & Value Proposition (7 cols) */}
            <Reveal direction="up" className="lg:col-span-7 space-y-4">
              <Chip
                variant="soft"
                color="accent"
                size="sm"
                className="bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono text-xs font-semibold uppercase tracking-wider mb-2"
              >
                <Chip.Label className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>{selectedSolution ? 'Dedicated Solution Capability' : 'Core Capabilities & Engineering Portfolio'}</span>
                </Chip.Label>
              </Chip>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                {selectedSolution ? (
                  <>
                    {selectedSolution.title}
                  </>
                ) : (
                  <>
                    Turnkey Metrology & <span className="text-[#00c2ff]">Gauging Solutions</span>
                  </>
                )}
              </h1>

              {!selectedSolution && (
                <p className="text-xl sm:text-2xl font-bold text-sky-300 font-heading">
                  "12 Engineered Domains for Shop-Floor & Automated Line Inspection."
                </p>
              )}

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {selectedSolution 
                  ? selectedSolution.fullDescription
                  : `${company.name} provides advanced solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding.`
                }
              </p>

              {/* AEO TL;DR Direct-Answer Capsule in Focused View */}
              {selectedSolution?.tldr && (
                <Card variant="default" className="mt-4 p-4 rounded-xl bg-sky-950/70 border-l-4 border-sky-400 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <strong className="text-sky-300 font-semibold font-mono text-xs uppercase tracking-wider">
                      Key Engineering Summary (TL;DR):
                    </strong>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium pl-5.5">
                    {selectedSolution.tldr}
                  </p>
                </Card>
              )}

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry(selectedSolution?.title || 'Precision Solutions Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans cursor-pointer"
                >
                  <span>Request Engineering Consultation</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                {selectedSolution ? (
                  <Link
                    to="/solutions"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span>View All 12 Capabilities</span>
                  </Link>
                ) : (
                  <Link
                    to="/products"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                  >
                    <span>Browse Product Lineup</span>
                  </Link>
                )}
              </div>
            </Reveal>

            {/* Right Column: High-Tech Industrial Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => {
                  openImageViewer({
                    src: selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp',
                    title: selectedSolution?.title || 'Automated Multi-Gauging & Turnkey Inspection Cell',
                    category: selectedSolution ? 'Turnkey Metrology Solution' : 'Turnkey Metrology Solutions',
                    description: selectedSolution?.shortDescription || 'Automated multi-point dimensional inspection station verifying complex machined automotive shafts and housings with pneumatic air probes and LVDT sensors.',
                    badge: selectedSolution ? 'Engineered Solution' : 'Custom Engineered Fixtures'
                  });
                }}
                className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group cursor-pointer"
                role="button"
                tabIndex={0}
                title="Click to view full-resolution engineering photo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openImageViewer({
                      src: selectedSolution?.image || '/assets/solutions/solutions-hero-multigauge.webp',
                      title: selectedSolution?.title || 'Automated Multi-Gauging & Turnkey Inspection Cell',
                      category: selectedSolution ? 'Turnkey Metrology Solution' : 'Turnkey Metrology Solutions',
                      description: selectedSolution?.shortDescription || 'Automated multi-point dimensional inspection station verifying complex machined automotive shafts and housings with pneumatic air probes and LVDT sensors.',
                      badge: selectedSolution ? 'Engineered Solution' : 'Custom Engineered Fixtures'
                    });
                  }
                }}
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

                {/* Subtle Gradient & Status Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5 z-10">
                  <Chip
                    variant="soft"
                    color="default"
                    size="sm"
                    className="bg-slate-900/90 text-white shadow-subtle border border-slate-700/90 backdrop-blur-sm"
                  >
                    <Chip.Label className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      {selectedSolution ? selectedSolution.title : 'Turnkey Gauging Cell'}
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Pill */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Gauging Fixture</span>
                  </span>
                </div>

                {/* Bottom Information Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      {selectedSolution ? selectedSolution.title : 'Automated Multi-Point Gauging Cell'}
                    </p>
                    <p className="text-slate-300 text-[10px] truncate">
                      {selectedSolution ? selectedSolution.shortDescription : 'Shaft & component multi-parameter audit'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 font-bold shrink-0">
                    {selectedSolution ? '100% In-Line Audit' : 'Cp/Cpk ≥ 1.67'}
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Engineering Capability Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">12 Domains</p>
                <p className="text-xs text-slate-400">Turnkey Capabilities</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 0.1 µm</p>
                <p className="text-xs text-slate-400">Sub-Micron Precision</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">100% Verified</p>
                <p className="text-xs text-slate-400">Pre-Dispatch Gage R&R</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">ISO/IEC 17025</p>
                <p className="text-xs text-slate-400">Traceable Standards</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Solutions Quick Navigation Bar - Sticky */}
      <section className="py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[80px] z-30 shadow-xs overflow-hidden">
        <div className="industrial-container">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Link
              to="/solutions"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] inline-flex items-center ${
                !selectedSolution
                  ? 'bg-industrial-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-industrial-primary border border-slate-200/80'
              }`}
            >
              All Capabilities
            </Link>
            {solutions.map((s) => (
              <Link
                key={s.id}
                to={`/solutions/${s.slug}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] inline-flex items-center ${
                  selectedSolution?.slug === s.slug
                    ? 'bg-industrial-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-industrial-primary border border-slate-200/80'
                }`}
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Main Solutions Content Area */}
      <section className="py-16 sm:py-20 lg:py-24 bg-industrial-bg border-b border-slate-200">
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
                  className="scroll-mt-36"
                >
                  <Card
                    variant="default"
                    className="p-6 sm:p-10 border border-slate-200/90 rounded-2xl bg-white shadow-sm hover:shadow-card transition-all duration-200"
                  >
                    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
                      isReversed ? 'lg:flex-row-reverse' : ''
                    }`}>
                      
                      {/* Text Details (7 cols) */}
                      <div className={`lg:col-span-7 space-y-5 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shadow-xs shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <Chip
                              variant="soft"
                              color="accent"
                              size="sm"
                              className="bg-sky-50 text-industrial-primary border border-sky-200/70 font-mono text-[10px] font-bold uppercase tracking-wider mb-1"
                            >
                              <Chip.Label>
                                Capability {String(solutions.findIndex(s => s.id === sol.id) + 1).padStart(2, '0')}
                              </Chip.Label>
                            </Chip>
                            <Card.Title className="text-2xl font-bold font-heading text-industrial-dark">
                              {sol.title}
                            </Card.Title>
                          </div>
                        </div>

                        <Card.Description className="text-sm text-slate-700 leading-relaxed font-medium">
                          {sol.fullDescription}
                        </Card.Description>

                        {/* AEO TL;DR Direct-Answer Capsule */}
                        {sol.tldr && (
                          <div className="p-3.5 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-xs text-slate-700 leading-relaxed shadow-xs">
                            <strong className="text-sky-900 font-semibold block mb-0.5 font-mono">
                              Direct Engineering Summary (TL;DR):
                            </strong>
                            {sol.tldr}
                          </div>
                        )}

                        {/* 134-167 Word AI-Extractable Definition Block */}
                        {sol.aiOverviewPassage && (
                          <Card variant="default" className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-industrial-primary" />
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-industrial-primary">
                                Technical Definition & Operating Principle
                              </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                              {sol.aiOverviewPassage}
                            </p>
                          </Card>
                        )}

                        {/* Technical Highlights & Scope Checklist */}
                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                            Technical Highlights & Scope
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                            {sol.features.map((feat, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Industrial Applications */}
                        <div className="pt-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                            Common Industrial Applications
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {sol.applications.map((app, i) => (
                              <Chip
                                key={i}
                                variant="soft"
                                size="sm"
                                className="bg-slate-100 text-slate-700 border border-slate-200/70 font-sans text-xs font-medium"
                              >
                                <Chip.Label>{app}</Chip.Label>
                              </Chip>
                            ))}
                          </div>
                        </div>

                        {/* Standards & Traceability Compliance */}
                        {sol.standardsCompliance && sol.standardsCompliance.length > 0 && (
                          <div className="pt-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-industrial-primary" />
                              <span>Applicable Metrology & Quality Standards</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {sol.standardsCompliance.map((std, i) => (
                                <Chip
                                  key={i}
                                  variant="soft"
                                  color="accent"
                                  size="sm"
                                  className="bg-sky-50 text-sky-900 border border-sky-200/80 font-mono text-xs font-medium"
                                >
                                  <Chip.Label className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                    <span>{std}</span>
                                  </Chip.Label>
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* E-E-A-T Technical Specialist Byline */}
                        <Card variant="default" className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-row items-start gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                          <div className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            <strong className="text-slate-800">Technical Metrology Review:</strong> Verified by <strong className="text-slate-900">Kalidoss</strong>, Lead Metrology Applications Engineer. All tolerances and measurement parameters comply with ISO/DIN manufacturing standards.
                          </div>
                        </Card>

                        {/* Actions */}
                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <Button
                            variant="primary"
                            size="md"
                            onPress={() => openEnquiry(sol.title)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-semibold text-xs sm:text-sm tracking-wide shadow-xs transition-all font-sans"
                          >
                            <span>Enquire About {sol.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                          </Button>

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

                    {/* Real-World Metrology Case Studies */}
                    {sol.caseStudies && sol.caseStudies.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-slate-200 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-industrial-primary" />
                          <h3 className="text-base font-bold font-heading text-industrial-dark">
                            Real-World Metrology Case Studies &amp; Shop-Floor Deployments
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                          {sol.caseStudies.map((cs, csIdx) => (
                            <Card key={csIdx} variant="default" className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                <div>
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-industrial-primary font-bold">
                                    Case Study — {cs.industry}
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-slate-900 font-heading mt-0.5">
                                    {cs.title}
                                  </h4>
                                </div>
                                <Chip
                                  variant="soft"
                                  color="success"
                                  size="sm"
                                  className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold"
                                >
                                  <Chip.Label className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Production Verified</span>
                                  </Chip.Label>
                                </Chip>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-900 block">Manufacturing Challenge:</span>
                                  <p className="text-slate-600 leading-relaxed font-medium">{cs.challenge}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-900 block">AKIRA Engineering Solution:</span>
                                  <p className="text-slate-600 leading-relaxed font-medium">{cs.solution}</p>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-slate-200/70">
                                <span className="font-bold text-slate-900 text-xs block">Production Impact &amp; Result:</span>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">{cs.result}</p>
                              </div>

                              {cs.metrics && cs.metrics.length > 0 && (
                                <div className="pt-2">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {cs.metrics.map((m, mIdx) => (
                                      <div key={mIdx} className="bg-white border border-slate-200 p-2.5 rounded-lg text-center shadow-xs">
                                        <span className="text-[11px] font-bold text-industrial-primary font-mono block">
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
                      </div>
                    )}

                    {/* Comparative Metrology Analysis Table */}
                    {sol.comparisonTable && (
                      <div className="mt-10 pt-8 border-t border-slate-200">
                        <h3 className="text-base font-bold font-heading text-industrial-dark mb-3">
                          {sol.comparisonTable.caption || `${sol.title} — Comparative Metrology Analysis`}
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                          <table className="w-full text-left text-xs border-collapse bg-white">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200">
                                {sol.comparisonTable.headers.map((h, i) => (
                                  <th key={i} className="p-3 font-semibold text-slate-900">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sol.comparisonTable.rows.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className={`p-3 ${cIdx === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
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

                    {/* Technical FAQs for AI Search & Engineering Teams */}
                    {sol.faqs && sol.faqs.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-slate-200 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h3 className="text-base font-bold font-heading text-industrial-dark">
                            Frequently Asked Technical Questions
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {sol.faqs.map((faq, fIdx) => (
                            <Card key={fIdx} variant="default" className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1.5">
                              <h4 className="text-xs sm:text-sm font-bold text-industrial-dark flex items-start gap-2">
                                <span className="text-industrial-primary font-mono font-semibold">Q{fIdx + 1}:</span>
                                <span>{faq.question}</span>
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed pl-6 font-medium font-sans">
                                {faq.answer}
                              </p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Products in Focused View */}
                    {selectedSolution && supportedProductList.length > 0 && (
                      <div className="mt-12 pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-bold font-heading text-industrial-dark mb-4">
                          Recommended Metrology Systems for {sol.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {supportedProductList.map((prod) => (
                            <Card key={prod.id} variant="default" className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between hover:shadow-card transition-all duration-200">
                              <div className="space-y-2">
                                <Chip
                                  variant="soft"
                                  color="accent"
                                  size="sm"
                                  className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[10px] font-bold"
                                >
                                  <Chip.Label>{prod.category}</Chip.Label>
                                </Chip>
                                <Card.Title className="text-sm font-bold text-industrial-dark font-heading">
                                  {prod.title}
                                </Card.Title>
                                <Card.Description className="text-xs text-slate-600 line-clamp-2 font-medium">
                                  {prod.description}
                                </Card.Description>
                              </div>
                              <Link
                                to={`/products/${prod.slug}`}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:underline"
                              >
                                <span>View Specifications</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                  </Card>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 4. Conversion CTA */}
      <EnquiryCTA />
    </>
  );
};
