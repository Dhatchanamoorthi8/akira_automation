import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Car, 
  Boxes, 
  Cog, 
  Bot, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Gauge,
  PackageCheck,
  Factory,
  ChevronRight,
  ZoomIn,
  Sparkles,
  Layers,
  Sliders,
  Check
} from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { createBreadcrumbSchema } from '../config/seo';
import { industries } from '../data/industries';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';
import { SpotlightCard } from '../components/animation/SpotlightCard';
import { useEnquiry } from '../context/EnquiryContext';
import { useImageViewer } from '../context/ImageViewerContext';

const iconMap: Record<string, React.ElementType> = {
  Car,
  Boxes,
  Cog,
  Bot,
  Cpu
};

// Engineering metadata and sector standards matrix for each industry
const industryMeta: Record<string, {
  badge: string;
  tagline: string;
  toleranceRange: string;
  throughput: string;
  primaryTech: string[];
  spcDataOutput: string;
  solutionSlug: string;
}> = {
  'automotive-oems': {
    badge: 'High-Volume Production & Assembly',
    tagline: 'Automated 100% in-line inspection for powertrain and drivetrain components',
    toleranceRange: '± 0.0005 mm to ± 0.002 mm (Sub-Micron)',
    throughput: '< 12 sec cycle time (100% Part Audit)',
    primaryTech: ['Multi-Gauging Stations', 'Bore Air Plugs', 'Camshaft Fixtures', '24V PLC I/O'],
    spcDataOutput: 'RS-232 / USB direct to SCADA / MES',
    solutionSlug: 'multigauging-systems',
  },
  'tier-1-suppliers': {
    badge: 'Critical Component Manufacturing',
    tagline: 'Statistical process control and multi-jet inspection for OEM vendor assurance',
    toleranceRange: '± 0.001 mm to ± 0.003 mm',
    throughput: '< 15 sec cycle time (Cp/Cpk ≥ 1.67)',
    primaryTech: ['Tri-Colour Digital DROs', 'Air Ring Gauges', 'Memory Module (10,000 readings)', 'Snap Gauges'],
    spcDataOutput: 'Real-time Excel & Minitab SPC Logging',
    solutionSlug: 'air-gauging-solutions',
  },
  'tier-2-suppliers': {
    badge: 'Precision Machining & Grinding',
    tagline: 'Rugged shop-floor inspection with carbide wear protection for harsh environments',
    toleranceRange: '± 0.002 mm to ± 0.005 mm',
    throughput: 'Continuous Line-Side CNC Inspection',
    primaryTech: ['Carbide Air Snap Gauges', 'Master Setting Rings', 'Air Display Columns', 'Attribute Gauging'],
    spcDataOutput: 'Digital DRO with Red/Green/Yellow Status',
    solutionSlug: 'special-gauges-fixtures',
  },
  'automation-builders': {
    badge: 'Robotic Cells & SPM Integration',
    tagline: 'Automation-ready digital gauges and pneumatic servers for custom machines',
    toleranceRange: '± 0.0005 mm Repeatability',
    throughput: 'High-Speed Automated Indexing Stations',
    primaryTech: ['Multi-Channel DROs', 'Air Server Valves', '24V Relay I/O Gates', 'LVDT Probes'],
    spcDataOutput: 'Discrete 24V Relay Signals + Serial ASCII',
    solutionSlug: 'auto-selection-with-air-server',
  },
  'general-precision-engineering': {
    badge: 'Aerospace, Defense & Hydraulics',
    tagline: 'Custom metrology fixtures and standards calibration for complex geometries',
    toleranceRange: '± 0.001 mm Micron-Level Geometry',
    throughput: 'Batch Verification & Standards Room Auditing',
    primaryTech: ['Multi-Pin Inspection Fixtures', 'Setting Master Rings', 'Tri-Colour Display Stand', 'Pin Gauges'],
    spcDataOutput: 'ISO/IEC 17025 Calibration Traceability',
    solutionSlug: 'standards-room-calibration',
  },
};

export const Industries: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();
  const location = useLocation();
  const [activeSector, setActiveSector] = useState<string>('all');
  const dirNavRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Precision scroll helper to ensure zero overlap with sticky Header + Sector Directory
  const scrollToSector = useCallback((slug: string, smooth = true) => {
    setActiveSector(slug);
    if (slug === 'all') {
      window.scrollTo({ top: 400, behavior: smooth ? 'smooth' : 'auto' });
      return;
    }
    const el = document.getElementById(slug);
    if (el) {
      const isMobile = window.innerWidth < 640;
      const headerH = isMobile ? 82 : 106;
      const dirEl = document.getElementById('sector-directory-nav');
      const dirH = dirEl ? dirEl.getBoundingClientRect().height : 60;
      const targetOffset = headerH + dirH + 32;

      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - targetOffset),
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Handle deep-link scrolling to specific industry anchor on initial mount/hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          scrollToSector(id, false);
        }, 150);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash, scrollToSector]);

  // Scroll spy to highlight active sector while user scrolls down the page
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentSlug = entry.target.id;
          setActiveSector(currentSlug);
          // Keep active button visible in the horizontal directory bar
          const activeBtn = buttonRefs.current[currentSlug];
          if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-175px 0px -55% 0px',
      threshold: 0,
    });

    industries.forEach((ind) => {
      const el = document.getElementById(ind.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [industries]);

  const handleSectorJump = (slug: string) => {
    scrollToSector(slug, true);
  };

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

      {/* 1. Hero Section - Premium Industrial Engineering */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none overflow-hidden" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none overflow-hidden" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'Industries' }]} />

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
                  <Factory className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sector-Specific Metrology & Inspection Tooling</span>
                </Chip.Label>
              </Chip>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Precision Metrology for <span className="text-[#00c2ff]">Critical Manufacturing Sectors</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Based on the core sectors identified in our charter, {company.name} delivers custom multi-gauging stations, pneumatic air tooling, tri-colour display systems, and automated inspection fixtures engineered to meet stringent tolerance benchmarks across India's premier manufacturing supply chains.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry('Industries Metrology Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans"
                >
                  <span>Consult with Sector Engineer</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                <Link
                  to="/solutions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                >
                  <span>Explore 12 Turnkey Solutions</span>
                </Link>
              </div>
            </Reveal>

            {/* Right Column: High-Tech Industrial Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => {
                  openImageViewer({
                    src: '/assets/industries/industries-hero-metrology.webp',
                    title: 'Automated Multi-Gauging & Engine Bore Metrology Station',
                    category: 'Industrial Quality Verification Cell',
                    description: 'Automated multi-point inspection cell verifying engine cylinder block bore dimensions (0.0005 mm tolerance) with pneumatic probes and direct digital DRO readouts.',
                    badge: 'In-Line Quality Audit'
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
                      src: '/assets/industries/industries-hero-metrology.webp',
                      title: 'Automated Multi-Gauging & Engine Bore Metrology Station',
                      category: 'Industrial Quality Verification Cell',
                      description: 'Automated multi-point inspection cell verifying engine cylinder block bore dimensions (0.0005 mm tolerance) with pneumatic probes and direct digital DRO readouts.',
                      badge: 'In-Line Quality Audit'
                    });
                  }
                }}
              >
                <img
                  src="/assets/industries/industries-hero-metrology.webp"
                  alt="Industrial Metrology & Multi-Gauging Quality Inspection Cell"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('.jpg')) {
                      target.src = '/assets/industries/industries-hero-metrology.jpg';
                    } else if (!target.src.includes('hero-lab-gauging.webp')) {
                      target.src = '/assets/hero/hero-lab-gauging.webp';
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
                      Shop Floor In-Line Inspection
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Pill */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Metrology Cell</span>
                  </span>
                </div>

                {/* Bottom Information Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      Multi-Point In-Line Metrology
                    </p>
                    <p className="text-slate-300 text-[10px] truncate">
                      Engine Block & Drivetrain Verification
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 font-bold shrink-0">
                    ≤ 0.0005 mm
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Engineering Capability Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">5 Sectors</p>
                <p className="text-xs text-slate-400">Targeted Engineering</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 0.5 µm</p>
                <p className="text-xs text-slate-400">Gauge Repeatability</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">ISO/IEC 17025</p>
                <p className="text-xs text-slate-400">Traceable Masters</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">100% Audit</p>
                <p className="text-xs text-slate-400">In-Line & EOL Inspection</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Interactive Quick Jump Navigation Bar - Sticky below Header without overlap */}
      <section
        id="sector-directory-nav"
        ref={dirNavRef}
        className="py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[82px] sm:top-[106px] z-30 shadow-xs w-full max-w-full overflow-hidden"
      >
        <div className="industrial-container w-full max-w-full min-w-0">
          <div className="flex items-center justify-between gap-3 py-0.5 w-full max-w-full min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 hidden lg:inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-industrial-primary" />
              <span>Sector Directory:</span>
            </span>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full max-w-full min-w-0 pb-1 lg:pb-0">
              {industries.map((ind, idx) => {
                const Icon = iconMap[ind.iconName] || Cpu;
                const isActive = activeSector === ind.slug;
                return (
                  <button
                    key={ind.slug}
                    ref={(el) => { buttonRefs.current[ind.slug] = el; }}
                    onClick={() => handleSectorJump(ind.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all min-h-[38px] inline-flex items-center gap-2 border shrink-0 ${
                      isActive
                        ? 'bg-industrial-primary text-white border-industrial-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-industrial-primary border-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{ind.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 text-slate-600 font-medium'
                    }`}>
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Detailed Industry Sector Showcase Cards */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-16">
          {industries.map((ind, index) => {
            const Icon = iconMap[ind.iconName] || Cpu;
            const isReversed = index % 2 !== 0;
            const meta = industryMeta[ind.slug] || {
              badge: 'Precision Manufacturing',
              tagline: ind.description,
              toleranceRange: '≤ 1 µm Precision',
              throughput: 'High-Volume Production',
              primaryTech: ['Air Gauges', 'Multi-Gauging', 'DROs'],
              spcDataOutput: 'RS-232 / USB',
              solutionSlug: 'multigauging-systems',
            };

            return (
              <div
                key={ind.id}
                id={ind.slug}
                className="scroll-mt-[190px] sm:scroll-mt-[220px]"
              >
                <Reveal direction="up">
                  <SpotlightCard className="h-full">
                    <Card
                      variant="default"
                      className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-card hover:border-industrial-primary/30 transition-all duration-300 p-6 sm:p-8 lg:p-10"
                    >
                      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                        isReversed ? 'lg:flex-row-reverse' : ''
                      }`}>
                        
                        {/* Technical Dossier Content (7 cols) */}
                        <div className={`lg:col-span-7 space-y-6 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                          
                          {/* Sector Identification Header */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Chip
                                variant="soft"
                                color="default"
                                size="sm"
                                className="bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider"
                              >
                                <Chip.Label>
                                  Sector {String(index + 1).padStart(2, '0')} // Metrology Profile
                                </Chip.Label>
                              </Chip>

                              <Chip
                                variant="soft"
                                color="accent"
                                size="sm"
                                className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[10px] font-bold uppercase tracking-wider"
                              >
                                <Chip.Label className="inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-sky-500" />
                                  <span>{meta.badge}</span>
                                </Chip.Label>
                              </Chip>
                            </div>

                            <div className="flex items-center gap-3.5 pt-1">
                              <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                                  {ind.name}
                                </h2>
                                <p className="text-xs text-industrial-primary font-medium mt-0.5">
                                  {meta.tagline}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Sector Description */}
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                            {ind.description}
                          </p>

                          {/* Engineering Context & Tolerance Benchmark Panel */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200/70 pb-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-industrial-primary flex items-center gap-1.5">
                                <Gauge className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
                                <span>Manufacturing Context & Tolerance Benchmark</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-semibold shrink-0">
                                Tol: {meta.toleranceRange}
                              </span>
                            </div>
                            
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {ind.gaugingRelevance}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 text-[11px] text-slate-600 font-medium">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">Throughput Target:</span>
                                <span>{meta.throughput}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">SPC Output:</span>
                                <span>{meta.spcDataOutput}</span>
                              </div>
                            </div>
                          </div>

                          {/* Key Applications & Component Scope */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                              <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>Key Applications & Component Scope:</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                              {ind.keyApplications.map((app, i) => (
                                <div 
                                  key={i} 
                                  className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-100 shadow-xs hover:border-slate-200 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{app}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommended Metrology Tooling Tags */}
                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                              Recommended AKIRA Metrology Hardware:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {meta.primaryTech.map((tech, i) => (
                                <Chip
                                  key={i}
                                  variant="soft"
                                  color="default"
                                  size="sm"
                                  className="bg-slate-100 text-slate-800 border border-slate-200/80 text-[10px] font-semibold"
                                >
                                  <Chip.Label>{tech}</Chip.Label>
                                </Chip>
                              ))}
                            </div>
                          </div>

                          {/* Interactive Action Bar */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Button
                              variant="primary"
                              size="md"
                              onPress={() => openEnquiry(`${ind.name} Metrology Inquiry`)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-bold text-xs tracking-wide shadow-sm transition-all font-sans text-center"
                            >
                              <span>Request {ind.name === 'General & Precision Engineering' ? 'Precision Engineering' : ind.name} Proposal</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </Button>

                            <Link
                              to={`/solutions#${meta.solutionSlug}`}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-industrial-primary font-semibold text-xs border border-slate-200/80 transition-all font-sans text-center"
                            >
                              <span>Explore Related Solutions</span>
                              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                            </Link>
                          </div>

                        </div>

                        {/* Visual Engineering Showcase (5 cols) */}
                        <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                          <div
                            onClick={() => {
                              openImageViewer({
                                src: ind.image || '/assets/hero/hero-lab-gauging.webp',
                                title: ind.name,
                                category: 'Industrial Sector Application',
                                description: ind.description,
                                badge: meta.badge
                              });
                            }}
                            className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-slate-950 group cursor-pointer"
                            role="button"
                            tabIndex={0}
                            title="Click to view full-resolution engineering photo"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openImageViewer({
                                  src: ind.image || '/assets/hero/hero-lab-gauging.webp',
                                  title: ind.name,
                                  category: 'Industrial Sector Application',
                                  description: ind.description,
                                  badge: meta.badge
                                });
                              }
                            }}
                          >
                            <img
                              src={ind.image || '/assets/hero/hero-lab-gauging.webp'}
                              alt={`${ind.name} - Precision Metrology Application`}
                              decoding="async"
                              className="w-full h-auto object-cover min-h-[300px] sm:min-h-[360px] max-h-[420px] transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.includes('akira-automation-logo')) {
                                  target.src = '/assets/company/akira-automation-logo.jpeg';
                                }
                              }}
                            />

                            {/* Gradient Overlay & Badge */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute top-3.5 left-3.5 z-10">
                              <Chip
                                variant="soft"
                                color="default"
                                size="sm"
                                className="bg-slate-900/90 text-white shadow-subtle border border-slate-700 backdrop-blur-sm"
                              >
                                <Chip.Label className="text-[10px] font-bold uppercase tracking-wider font-mono">
                                  {meta.badge}
                                </Chip.Label>
                              </Chip>
                            </div>

                            {/* Hover "Click to Inspect" Pill */}
                            <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                <ZoomIn className="w-4 h-4 text-sky-400" />
                                <span>Click to Inspect High-Res</span>
                              </span>
                            </div>

                            {/* Bottom Caption Pill */}
                            <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                              <p className="text-white text-xs font-bold font-mono truncate drop-shadow-sm">
                                {ind.name} // Production Cell
                              </p>
                              <p className="text-slate-300 text-[10px] font-normal truncate">
                                Tolerance Capability: {meta.toleranceRange}
                              </p>
                            </div>

                          </div>
                        </div>

                      </div>
                    </Card>
                  </SpotlightCard>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Sector Standards & Technical Compliance Matrix */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="industrial-container">
          
          <Reveal direction="up" className="max-w-3xl mb-12">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200 font-mono text-xs font-bold uppercase tracking-wider mb-2.5"
            >
              <Chip.Label className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Quality & Compliance Specifications</span>
              </Chip.Label>
            </Chip>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Sector Metrology & Standards Compliance Matrix
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Compare {company.name}'s inspection capabilities across all five core industrial manufacturing sectors, highlighting tolerance classes, throughput capabilities, and Industry 4.0 data interfacing.
            </p>
          </Reveal>

          {/* Standards Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, i) => {
              const Icon = iconMap[ind.iconName] || Cpu;
              const meta = industryMeta[ind.slug];

              return (
                <Card
                  key={ind.id}
                  variant="default"
                  className="p-6 border border-slate-200 bg-slate-50/50 rounded-xl hover:bg-white hover:border-industrial-primary/40 hover:shadow-card transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-sky-100/80 text-industrial-primary flex items-center justify-center shrink-0 border border-sky-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Sector 0{i + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        {ind.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {meta.tagline}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Tolerance Class:</span>
                        <span className="font-bold text-slate-900 font-mono text-[11px]">{meta.toleranceRange}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Inspection Speed:</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{meta.throughput}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">SPC Protocol:</span>
                        <span className="font-semibold text-slate-800 text-[11px]">{meta.spcDataOutput}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/80">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => openEnquiry(`${ind.name} Technical Specifications`)}
                      className="w-full text-industrial-primary font-bold hover:bg-sky-50 rounded-lg min-h-[36px] text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Inquire for {ind.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}

            {/* Custom Fixtures & Special SPM Integration Highlight Card */}
            <Card
              variant="default"
              className="p-6 border border-sky-300 bg-gradient-to-br from-sky-950 via-slate-900 to-industrial-dark text-white rounded-xl shadow-card flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-sky-900/80 text-sky-400 flex items-center justify-center shrink-0 border border-sky-700">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <Chip
                    variant="soft"
                    color="accent"
                    size="sm"
                    className="bg-sky-900 text-sky-200 border border-sky-700 font-mono text-[9px] font-bold uppercase tracking-wider"
                  >
                    <Chip.Label>Turnkey SPM</Chip.Label>
                  </Chip>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Custom Special Gauging Fixtures
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Need custom inspection for unconventional geometry, multiple concentric bores, or robotic automation lines? Our in-house toolroom engineers custom solutions from component 2D/3D CAD.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    <span>Multi-point concentricity & runout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    <span>LVDT inductive probe integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    <span>Direct PLC 24V relay interlocking</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => openEnquiry('Custom Gauging SPM Project')}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg min-h-[36px] text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Submit Custom Drawing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>

          </div>

        </div>
      </section>

      {/* 5. Conversion CTA */}
      <EnquiryCTA />
    </>
  );
};
