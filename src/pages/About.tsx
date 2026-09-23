import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Target,
  CheckCircle2,
  Gauge,
  ArrowRight,
  Cpu,
  Wrench,
  Users,
  FileCheck,
  Crosshair,
  ZoomIn,
  Settings2,
  Clock,
  Building2
} from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { companyIntro, companyData } from '../data/company';
import { useEnquiry } from '../context/EnquiryContext';
import { useImageViewer } from '../context/ImageViewerContext';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { SectionReveal } from '../components/animation/SectionReveal';
import { Reveal } from '../components/animation/Reveal';
import { ScaleReveal } from '../components/animation/ScaleReveal';
import { PrecisionRuler } from '../components/animation/PrecisionRuler';
import { createBreadcrumbSchema } from '../config/seo';

export const About: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' }
  ];

  const handleInspectFacility = () => {
    openImageViewer({
      src: '/assets/about/about-hero-facility.webp',
      title: 'Akira Advanced Metrology Center & Standards Laboratory',
      category: 'Corporate Metrology & Standards Lab',
      description: 'Sub-micron precision inspection center featuring ISO/IEC 17025 traceable calibration standards, multi-gauging testing benches, and pneumatic air gauge verification cells.',
      badge: 'ISO 9001 / NABL Traceable'
    });
  };

  const handleInspectWorkbench = () => {
    openImageViewer({
      src: '/assets/company/inspection-workbench.webp',
      title: 'High-Precision Metrology Standards & Assembly Workbench',
      category: 'Assembly & Lapping Station',
      description: 'Climate-controlled metrology bench dedicated to sub-micron calibration of air plug gauges, multi-point electronic fixture alignment, and precision granite master verification.',
      badge: 'Sub-Micron Calibration'
    });
  };

  return (
    <>
      <SEOHead
        title="About Us | Precision Metrology & Multi-Gauging Systems"
        description={`${company.name} delivers precision metrology, automated multi-gauging systems, fixtures, and custom inspection solutions with an unwavering commitment to quality and customer success.`}
        keywords={`About ${company.name}, metrology manufacturer, precision gauging India, automated gauging, ${company.legalName}`}
        canonicalPath="/about"
        structuredData={createBreadcrumbSchema(breadcrumbItems)}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION: Technical Blueprint & Engineering Dossier
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-industrial-dark text-white pt-8 sm:pt-12 lg:pt-14 pb-12 sm:pb-16 lg:pb-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full shadow-elevated">
        {/* Engineering Blueprint Background Grid & Technical Accent Lighting */}
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="hidden lg:block absolute -top-32 -right-32 w-96 h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-industrial-highlight/15 blur-3xl pointer-events-none" />

        {/* Top Precision Caliper Ticks */}
        <div className="hidden sm:block absolute top-0 left-0 right-0">
          <PrecisionRuler ticksCount={64} highlightInterval={8} className="opacity-50" />
        </div>

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'About Us' }]} />
          
          {/* 2-Column Hero Layout: Value Proposition + High-Tech Metrology Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mt-4">
            
            {/* Left Column: Heading, Heritage & Value Proposition (7 cols) */}
            <Reveal direction="up" className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  variant="soft"
                  color="accent"
                  size="sm"
                  className="bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono text-xs font-semibold uppercase tracking-wider"
                >
                  <Chip.Label className="inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-industrial-primary" />
                    <span>Corporate Profile & Metrology Heritage</span>
                  </Chip.Label>
                </Chip>

                <span className="text-xs font-mono font-bold text-slate-300 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/80">
                  Est. {companyData.establishedYear} • Chennai, India
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Precision Metrology & <span className="text-sky-300">Engineering Heritage</span>
              </h1>

              <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border-l-4 border-industrial-primary border-y border-r border-slate-800 shadow-subtle">
                <p className="text-sm sm:text-base font-bold text-sky-200 font-heading">
                  "Engineered for Micron-Level Reliability & Zero-Defect Manufacturing."
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Dedicated to keeping customers first through tailored gauging solutions that eliminate shop-floor inspection bottlenecks.
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                <strong className="text-white font-bold">{company.name}</strong> delivers high-reliability precision metrology instruments, automated multi-gauging stations, and custom inspection fixtures engineered for OEMs, Tier-1 automotive suppliers, and precision engineering corridors across India.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry('About Us - Precision Metrology Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all font-sans cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                >
                  <span>Request Engineering Consultation</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                <Link
                  to="/solutions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
                >
                  <span>Explore Turnkey Solutions</span>
                </Link>
              </div>
            </Reveal>

            {/* Right Column: High-Tech Industrial Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={handleInspectFacility}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInspectFacility();
                  }
                }}
                className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group cursor-pointer focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
                role="button"
                tabIndex={0}
                aria-label="View high-resolution photograph of Akira Metrology Center"
              >
                <img
                  src="/assets/about/about-hero-facility.webp"
                  alt="Akira Advanced Metrology Center & Calibration Facility"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('.jpg')) {
                      target.src = '/assets/about/about-hero-facility.jpg';
                    } else if (!target.src.includes('inspection-workbench')) {
                      target.src = '/assets/company/inspection-workbench.webp';
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
                      Metrology Standards Room
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Viewfinder HUD */}
                <div className="absolute inset-0 bg-industrial-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Metrology Center</span>
                  </span>
                </div>

                {/* Bottom Technical Specifications Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      Akira Metrology Center
                    </p>
                    <p className="text-slate-300 text-xs truncate">
                      20°C Stabilized Calibration Lab
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900/90 text-sky-300 border border-sky-800/80 font-bold shrink-0">
                    ≤ 0.1 µm / NABL
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Engineering Capability Metrics Bar with 2:1 Typographic Ratio */}
          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono flex items-baseline gap-1">
                  <span>≤ 0.1</span>
                  <span className="text-xs text-slate-400 font-medium">µm</span>
                </p>
                <p className="text-xs text-slate-400">Sub-Micron Resolution</p>
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

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono">100% Gage R&R</p>
                <p className="text-xs text-slate-400">Pre-Dispatch Runoff</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white font-mono flex items-baseline gap-1">
                  <span>20°C</span>
                  <span className="text-xs text-slate-400 font-medium">± 1°C</span>
                </p>
                <p className="text-xs text-slate-400">Standards Room Environment</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. CORPORATE CHARTER & FACILITY CAPABILITY MATRIX
          ══════════════════════════════════════════════════════════════════════ */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Corporate Philosophy & Core Values (7 cols) */}
            <Reveal direction="up" className="lg:col-span-7 space-y-6">
              <div>
                <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
                  <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                    Corporate Charter & Philosophy
                  </Chip.Label>
                </Chip>
                <h2 className="section-title mt-2">
                  Precision Engineering Sourced from Customer Commitment
                </h2>
                <p className="section-subtitle">
                  {company.name} focuses on delivering high-reliability dimensional checking fixtures and automated multi-gauging systems that directly translate into higher productivity, reduced scrap rates, and proven manufacturing profitability.
                </p>
              </div>

              {/* Authoritative Corporate Motto Pledge Banner */}
              <div className="p-5 sm:p-6 rounded-xl bg-industrial-dark text-white border border-slate-800 shadow-elevated relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-industrial-primary/15 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                    <Award className="w-4 h-4 text-industrial-primary" />
                    <span>Guiding Company Motto</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                    "{companyIntro.motto}"
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {companyIntro.mottoDescription} Every multi-gauging station, air plug gauge, and custom inspection fixture is designed with the machine operator and quality manager at the center of the solution.
                  </p>
                </div>
              </div>

              {/* 3 Core Values as Operational Disciplines */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Three Pillars of Our Engineering Discipline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  {companyIntro.coreValues.map((val, idx) => {
                    const valIcons = [Wrench, ShieldCheck, Users];
                    const ValIcon = valIcons[idx] || ShieldCheck;
                    return (
                      <Card 
                        key={idx} 
                        variant="default" 
                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card transition-all space-y-2 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white text-industrial-primary flex items-center justify-center border border-slate-200/80 shadow-xs group-hover:bg-industrial-primary group-hover:text-white transition-colors">
                          <ValIcon className="w-4 h-4" />
                        </div>
                        <Card.Title className="text-sm font-bold text-slate-900 font-heading group-hover:text-industrial-primary transition-colors">
                          {val.title}
                        </Card.Title>
                        <Card.Description className="text-xs text-slate-700 font-medium leading-relaxed">
                          {val.description}
                        </Card.Description>
                      </Card>
                    );
                  })}
                </div>
              </div>

            </Reveal>

            {/* Right Column: Facility Visual & Location Specifications Matrix (5 cols) */}
            <div className="lg:col-span-5 relative space-y-4">
              <ScaleReveal>
                <div 
                  onClick={handleInspectWorkbench}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleInspectWorkbench();
                    }
                  }}
                  className="rounded-xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 group relative cursor-pointer focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label="View high-resolution photograph of Akira Metrology Inspection Workbench"
                >
                  <img
                    src="/assets/company/inspection-workbench.webp"
                    alt={`${company.name} Metrology Facility and Inspection Workbench`}
                    className="w-full h-auto object-cover max-h-[420px] transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-industrial-dark/85 via-transparent to-transparent opacity-80" />
                  
                  {/* Hover Inspect Indicator */}
                  <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700">
                      <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                      <span>Inspect Workbench</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-industrial-dark/90 backdrop-blur-sm border border-slate-700/80 text-white">
                    <p className="text-xs font-bold font-mono">
                      Metrology Assembly & Lapping Bench
                    </p>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Sub-micron granite surface plates & calibration masters
                    </p>
                  </div>
                </div>
              </ScaleReveal>

              {/* Technical Facility Specifications Sheet */}
              <Card variant="default" className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-industrial-primary" />
                    <span className="text-xs font-bold text-slate-900 font-heading">
                      Technical Facility Specifications
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-industrial-primary px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                    OEM READY
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Standards Lab Temp:</span>
                    <span className="font-mono font-bold text-slate-900">20°C ± 1°C (Controlled)</span>
                  </div>
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Traceability Standard:</span>
                    <span className="font-mono font-bold text-slate-900">ISO/IEC 17025 / NABL</span>
                  </div>
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Electronic Readout:</span>
                    <span className="font-mono font-bold text-slate-900">Multi-Channel DRO (0.1 µm)</span>
                  </div>
                  <div className="flex items-start justify-between py-1">
                    <span className="text-slate-600 font-medium">Manufacturing Hub:</span>
                    <span className="font-mono font-bold text-slate-900">{companyData.address.city}, Tamil Nadu</span>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════════════════════════
          3. STRATEGIC CAPABILITIES: Turnkey Metrology Scope
          ══════════════════════════════════════════════════════════════════════ */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-10 sm:mb-12">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Full-Scope Manufacturing Capabilities
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              Comprehensive Precision Gauging & Metrology Tooling
            </h2>
            <p className="section-subtitle">
              Unlike off-the-shelf catalog vendors, Akira delivers complete turnkey dimensional verification systems tailored directly to your production part geometry.
            </p>
          </Reveal>

          {/* Asymmetric 2-Column Industrial Architecture: Left Disciplines, Right Advantage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: 4 Strategic Pillars with Concrete Technical Depth (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {companyIntro.visionAndStrengths.map((str, idx) => {
                const strIcons = [Crosshair, Settings2, FileCheck, Wrench];
                const StrIcon = strIcons[idx] || Target;
                const details = [
                  "Multi-point simultaneous electronic gauging with cycle times under 10 seconds and automated OK/Reject segregation.",
                  "Custom air plug gauges, multi-channel electronic comparator fixtures, and hydraulic/pneumatic work-holding tooling.",
                  "Master setting plugs and rings calibrated against NABL / ISO/IEC 17025 accredited laboratory standards.",
                  "On-site installation, Gage R&R statistical studies, comprehensive operator training, and annual calibration support."
                ];
                return (
                  <Card
                    key={idx}
                    variant="default"
                    className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center shrink-0 group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-sky-100">
                        <StrIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <Card.Title className="text-sm sm:text-base font-bold text-slate-900 font-heading group-hover:text-industrial-primary transition-colors">
                          {str}
                        </Card.Title>
                        <Card.Description className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                          {details[idx]}
                        </Card.Description>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Right Column: Akira Engineering Advantage vs. Standard Suppliers (5 cols) */}
            <div className="lg:col-span-5">
              <Card variant="default" className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-5">
                <div className="space-y-1.5 border-b border-slate-100 pb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-industrial-primary">
                    The Akira Engineering Invariant
                  </span>
                  <Card.Title className="text-lg font-bold font-heading text-slate-900">
                    Why Tier-1 Manufacturers Choose Akira
                  </Card.Title>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-bold block">100% Drawing-Specific CAD Design:</strong>
                      <span className="text-slate-600">No generic adapters — every datum locator and probe nest conforms strictly to your component GD&T.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Pre-Dispatch Gage R&R Validation:</strong>
                      <span className="text-slate-600">Statistical repeatability and reproducibility demonstrated on sample production parts prior to shipment.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Industry 4.0 & PLC Ready:</strong>
                      <span className="text-slate-600">Standard RS-232, USB, and optional 24V discrete relay outputs for automated robotic pick-and-place lines.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-bold block">Lifetime Technical Handover:</strong>
                      <span className="text-slate-600">Detailed operation manuals, wiring schematics, spare contact tips, and on-site operator training included.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/solutions"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
                  >
                    <span>View Our Metrology Solutions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════════════════════════
          4. 4-STAGE TRACEABILITY & QUALITY ASSURANCE PIPELINE
          ══════════════════════════════════════════════════════════════════════ */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12 sm:mb-14">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Verification Pipeline
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              4-Stage Traceability & Quality Assurance Pipeline
            </h2>
            <p className="section-subtitle">
              Precision metrology requires uncompromising verification protocols. Every fixture, air plug, and multi-gauging assembly follows our four-stage quality gate:
            </p>
          </Reveal>

          {/* Sequential 4-Stage Process Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stage 01 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-industrial-primary px-2.5 py-1 rounded bg-sky-50 border border-sky-200">
                    STAGE 01
                  </span>
                  <Wrench className="w-4 h-4 text-slate-400 group-hover:text-industrial-primary transition-colors" />
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                  High-Wear Tooling Sourcing
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Careful selection of stabilized tool steel (58–62 HRC) and tungsten carbide contact wear pads to prevent geometric degradation over millions of inspection cycles.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/80 mt-4 text-xs font-mono text-slate-500">
                <span>Material Certification</span>
              </div>
            </div>

            {/* Stage 02 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-industrial-primary px-2.5 py-1 rounded bg-sky-50 border border-sky-200">
                    STAGE 02
                  </span>
                  <Cpu className="w-4 h-4 text-slate-400 group-hover:text-industrial-primary transition-colors" />
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                  Sub-Micron CNC Grinding & Lapping
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Precision cylindrical grinding and hand-lapping of air plug nozzles, reference datums, and master diameters down to sub-micron roundness and straightness.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/80 mt-4 text-xs font-mono text-slate-500">
                <span>≤ 0.0005 mm Geometry</span>
              </div>
            </div>

            {/* Stage 03 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-industrial-primary px-2.5 py-1 rounded bg-sky-50 border border-sky-200">
                    STAGE 03
                  </span>
                  <Gauge className="w-4 h-4 text-slate-400 group-hover:text-industrial-primary transition-colors" />
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                  Traceable Master Calibration
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Calibration in our 20°C standards room using reference setting masters traceable to national and international NABL / ISO/IEC 17025 accredited laboratories.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/80 mt-4 text-xs font-mono text-slate-500">
                <span>ISO/IEC 17025 Traceable</span>
              </div>
            </div>

            {/* Stage 04 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-industrial-primary px-2.5 py-1 rounded bg-sky-50 border border-sky-200">
                    STAGE 04
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-industrial-primary transition-colors" />
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                  Pre-Dispatch Gage R&R Runoff
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Rigorous repeatability and reproducibility trials with customer production parts, ensuring total measurement variance falls well within your Cp/Cpk benchmarks.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/80 mt-4 text-xs font-mono text-slate-500">
                <span>100% Pre-Dispatch Runoff</span>
              </div>
            </div>

          </div>
        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════════════════════════
          5. OEM ENGINEERING ENGAGEMENT MODEL: How We Partner With Plants
          ══════════════════════════════════════════════════════════════════════ */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12 sm:mb-14">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                B2B Engineering Collaboration
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              How We Partner With Manufacturing Plants & Quality Teams
            </h2>
            <p className="section-subtitle">
              From the initial component drawing review to turn-key commissioning on your plant floor, our structured engineering engagement ensures complete alignment:
            </p>
          </Reveal>

          {/* 4-Step Collaborative Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
              <span className="text-xs font-mono font-bold text-slate-500 block">STEP 01</span>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Drawing & GD&T Analysis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Send your 2D manufacturing drawings or 3D STEP models. We examine critical datum references, diametrical tolerances, runout specifications, and target cycle times.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
              <span className="text-xs font-mono font-bold text-slate-500 block">STEP 02</span>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Concept Tooling CAD & Quote
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                We develop a tailored 3D fixture proposal, probe nest architecture, electronic readout specifications, and deliver a detailed engineering proposal with realistic delivery timelines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
              <span className="text-xs font-mono font-bold text-slate-500 block">STEP 03</span>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Fabrication & Lab Validation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Fixture fabrication, carbide contact installation, air/electronic circuit integration, and continuous dry-run cycle testing inside our climate-controlled standards facility.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
              <span className="text-xs font-mono font-bold text-slate-500 block">STEP 04</span>
              <h3 className="text-base font-bold font-heading text-slate-900">
                FAT & On-Site Handover
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Factory Acceptance Testing (FAT) with sample components, on-site commissioning, full operator and quality technician training, and delivery of ISO calibration certificates.
              </p>
            </div>

          </div>

          {/* Quick Consultation Callout */}
          <div className="mt-10 p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-bold text-slate-900 font-heading">
                Have a new component drawing or upcoming production line?
              </p>
              <p className="text-xs text-slate-600">
                Our application engineering team provides free preliminary drawing reviews and feasibility recommendations.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onPress={() => openEnquiry('Drawing Feasibility Review')}
              className="px-6 py-2.5 min-h-[44px] rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white text-xs sm:text-sm font-semibold shrink-0 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-industrial-primary focus-visible:outline-none"
            >
              <span>Submit Drawing for Review</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

        </div>
      </SectionReveal>

      {/* ══════════════════════════════════════════════════════════════════════
          6. CONVERSION CTA: Connect With Engineering Desk
          ══════════════════════════════════════════════════════════════════════ */}
      <EnquiryCTA />
    </>
  );
};
