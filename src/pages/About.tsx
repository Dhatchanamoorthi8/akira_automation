import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Handshake, 
  Target,
  CheckCircle2,
  Gauge,
  ArrowRight,
  MapPin,
  Cpu,
  Wrench,
  Users,
  TrendingUp,
  FileCheck,
  Crosshair,
  ZoomIn
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
import { StaggerContainer } from '../components/animation/StaggerContainer';
import { StaggerItem } from '../components/animation/StaggerItem';
import { SpotlightCard } from '../components/animation/SpotlightCard';
import { createBreadcrumbSchema } from '../config/seo';

export const About: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' }
  ];

  return (
    <>
      <SEOHead
        title="About Us | Precision Metrology & Multi-Gauging Systems"
        description={`${company.name} delivers precision metrology, automated multi-gauging systems, fixtures, and custom inspection solutions with a commitment to quality and customer success.`}
        keywords={`About ${company.name}, metrology manufacturer, precision gauging India, automated gauging, ${company.legalName}`}
        canonicalPath="/about"
        structuredData={createBreadcrumbSchema(breadcrumbItems)}
      />

      {/* 1. Hero Section - Premium Industrial Engineering */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none overflow-hidden" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none overflow-hidden" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'About Us' }]} />
          
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
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  <span>Corporate Profile & Metrology Heritage</span>
                </Chip.Label>
              </Chip>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Precision Metrology & <span className="text-[#00c2ff]">Engineering Heritage</span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-sky-300 font-heading">
                "Engineered for Micron-Level Reliability & Zero-Defect Manufacturing."
              </p>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {company.name} delivers high-reliability precision instruments, automated multi-gauging stations, and custom inspection fixtures engineered for OEMs, tier-1 automotive suppliers, and precision manufacturing corridors across India.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry('About Us - Precision Metrology Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans cursor-pointer"
                >
                  <span>Request Engineering Consultation</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                <Link
                  to="/solutions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                >
                  <span>Explore Turnkey Solutions</span>
                </Link>
              </div>
            </Reveal>

            {/* Right Column: High-Tech Industrial Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => {
                  openImageViewer({
                    src: '/assets/about/about-hero-facility.webp',
                    title: 'Akira Advanced Metrology Center & Calibration Facility',
                    category: 'Corporate Metrology & Standards Lab',
                    description: 'Sub-micron precision inspection center featuring ISO/IEC 17025 traceable calibration standards, multi-gauging testing benches, and pneumatic air gauge verification cells.',
                    badge: 'ISO 9001 / NABL Traceable'
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
                      src: '/assets/about/about-hero-facility.webp',
                      title: 'Akira Advanced Metrology Center & Calibration Facility',
                      category: 'Corporate Metrology & Standards Lab',
                      description: 'Sub-micron precision inspection center featuring ISO/IEC 17025 traceable calibration standards, multi-gauging testing benches, and pneumatic air gauge verification cells.',
                      badge: 'ISO 9001 / NABL Traceable'
                    });
                  }
                }}
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
                      Metrology Laboratory & R&D Center
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Pill */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Metrology Center</span>
                  </span>
                </div>

                {/* Bottom Information Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      Akira Precision Metrology Facility
                    </p>
                    <p className="text-slate-300 text-[10px] truncate">
                      Sub-Micron Calibration & Standards Room
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 font-bold shrink-0">
                    ≤ 0.1 µm / NABL
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Engineering Capability Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 0.1 µm</p>
                <p className="text-xs text-slate-400">Sub-Micron Resolution</p>
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
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">Custom Fixtures</p>
                <p className="text-xs text-slate-400">Turnkey Tooling</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main About Story & Metrology Facility */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <Reveal direction="up" className="lg:col-span-7 space-y-6">
              <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80">
                <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Company Overview
                </Chip.Label>
              </Chip>

              <h2 className="section-title mt-2">
                Delivering Innovative Metrology & Automation Solutions
              </h2>

              <p className="text-base sm:text-lg text-slate-800 font-semibold leading-relaxed">
                <strong className="text-industrial-primary font-bold">{company.name}</strong> focuses on high quality products and innovative solutions that help customers increase productivity and profitability.
              </p>

              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                The company provides comprehensive solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding which is our major strength compared to any supplier.
              </p>

              {/* Motto Card - HeroUI Card */}
              <Card variant="default" className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-industrial-primary uppercase tracking-wider font-mono">
                  <Award className="w-4 h-4 text-industrial-primary" />
                  <span>Company Motto</span>
                </div>
                <Card.Title className="text-xl font-extrabold font-heading text-industrial-dark">
                  "{companyIntro.motto}"
                </Card.Title>
                <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  We strive to give Quality Solutions and Quality Service to customers in every project we undertake.
                </Card.Description>
              </Card>

              {/* Core Values - 3 HeroUI Cards */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Core Values Driving {company.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {companyIntro.coreValues.map((val, idx) => {
                    const valIcons = [Wrench, ShieldCheck, Users];
                    const ValIcon = valIcons[idx] || ShieldCheck;
                    return (
                      <Card key={idx} variant="default" className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-sm space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-white text-industrial-primary flex items-center justify-center border border-slate-200/80 shadow-xs">
                          <ValIcon className="w-4 h-4" />
                        </div>
                        <Card.Title className="text-sm font-bold text-slate-900 font-heading">
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

            {/* Right Column: Facility Visual & Location Card */}
            <div className="lg:col-span-5 relative space-y-4">
              <ScaleReveal>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-card bg-slate-900 group">
                  <img
                    src="/assets/company/inspection-workbench.webp"
                    alt={`${company.name} Metrology Facility and Inspection Workbench`}
                    className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </ScaleReveal>

              {/* Facility Verification Card */}
              <Card variant="default" className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 flex flex-row items-center justify-between shadow-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-industrial-dark font-sans">{company.name}</p>
                    <p className="text-slate-600 text-[11px] font-medium">
                      {companyData.address.village ? `${companyData.address.village}, ` : ''}{companyData.address.city}, {companyData.address.state}
                    </p>
                  </div>
                </div>
                <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono font-bold text-[10px] shrink-0">
                  <Chip.Label>SMART SOLUTIONS</Chip.Label>
                </Chip>
              </Card>
            </div>

          </div>
        </div>
      </SectionReveal>

      {/* 3. Vision & Strengths */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Strategic Direction
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              Vision & Strengths
            </h2>
            <p className="section-subtitle">
              Sourced directly from our corporate charter, guiding how we design, manufacture, and support precision metrology equipment.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyIntro.visionAndStrengths.map((str, idx) => {
              const strIcons = [Crosshair, TrendingUp, FileCheck, Wrench];
              const StrIcon = strIcons[idx] || Target;
              return (
                <StaggerItem key={idx}>
                  <SpotlightCard className="h-full rounded-xl">
                    <Card
                      variant="default"
                      className="card-hover p-5 sm:p-6 flex flex-col justify-between group border border-slate-200/90 h-full rounded-xl bg-white shadow-sm hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center shrink-0 group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                          <StrIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <Card.Title className="text-sm font-bold text-slate-900 font-heading group-hover:text-industrial-primary transition-colors">
                            {str}
                          </Card.Title>
                          <Card.Description className="text-xs text-slate-600 font-medium leading-relaxed">
                            Committed to delivering traceable, high-reliability dimensional gauging across the production lifecycle.
                          </Card.Description>
                        </div>
                      </div>
                    </Card>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* 4. Three Pillars of Commitment */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-14 text-center mx-auto">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3 mx-auto">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Foundational Principles
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              Commitment to Excellence
            </h2>
            <p className="mt-2 text-base font-bold text-industrial-primary font-heading">
              Precision and Reliability in Every Solution
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {companyIntro.commitments.map((c, idx) => {
              const commitIcons = [Crosshair, Handshake, ShieldCheck];
              const CommitIcon = commitIcons[idx] || ShieldCheck;
              return (
                <StaggerItem key={idx}>
                  <SpotlightCard
                    spotlightColor="rgba(0, 85, 165, 0.07)"
                    className="h-full rounded-xl"
                  >
                    <Card
                      variant="default"
                      className="card-hover p-6 sm:p-7 flex flex-col justify-between group border border-slate-200/90 h-full rounded-xl bg-white shadow-sm hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200"
                    >
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                          <CommitIcon className="w-6 h-6" />
                        </div>
                        <Card.Header className="p-0">
                          <Card.Title className="text-base sm:text-lg font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                            {c.title}
                          </Card.Title>
                          <Card.Description className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                            {c.description}
                          </Card.Description>
                        </Card.Header>
                      </div>

                      <Card.Footer className="p-0 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 mt-6 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-400">Quality Invariant</span>
                        <span className="text-industrial-primary font-bold text-[11px]">ISO Traceable</span>
                      </Card.Footer>
                    </Card>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* 5. Metrology Standards, Calibration & Traceability (E-E-A-T) */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-slate-50/70 border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Metrology Standards & Quality Assurance
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              Traceable Accuracy & Quality Protocols
            </h2>
            <p className="section-subtitle">
              Precision metrology demands rigorous calibration standards and verifiable traceability. Every gauging fixture and electronic readout manufactured by {company.name} adheres to stringent quality invariants:
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card
              variant="default"
              className="card-hover p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                <Gauge className="w-5 h-5" />
              </div>
              <Card.Title className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                Sub-Micron Resolution & Repeatability
              </Card.Title>
              <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                Our electronic DRO systems and LVDT comparator probes provide resolution down to 0.1 µm with repeatability ≤ 0.5 µm under 20°C standard metrology room conditions.
              </Card.Description>
            </Card>

            <Card
              variant="default"
              className="card-hover p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <Card.Title className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                Traceable Master Calibration
              </Card.Title>
              <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                All setting masters, air ring gauges, and setting plugs are manufactured from hardened tool steel or tungsten carbide, calibrated against masters traceable to national/international NABL / ISO/IEC 17025 accredited laboratories.
              </Card.Description>
            </Card>

            <Card
              variant="default"
              className="card-hover p-6 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3.5 hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <Card.Title className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                100% Pre-Dispatch Verification
              </Card.Title>
              <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                Every multi-gauging station undergoes comprehensive repeatability and reproducibility (Gage R&R) validation and continuous dry-run cycles before on-site customer commissioning.
              </Card.Description>
            </Card>
          </div>
        </div>
      </SectionReveal>

      {/* 6. Building Strong Partnerships */}
      <SectionReveal className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up" className="max-w-3xl mb-12">
            <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
              <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
                Engineering Partnership Principles
              </Chip.Label>
            </Chip>
            <h2 className="section-title mt-2">
              Building Strong Partnerships
            </h2>
            <p className="section-subtitle">
              We believe lasting industrial success is founded on two core pillars:
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {companyIntro.partnershipPillars.map((p, idx) => (
              <StaggerItem key={idx}>
                <SpotlightCard
                  spotlightColor="rgba(0, 85, 165, 0.07)"
                  className="h-full rounded-xl"
                >
                  <Card
                    variant="default"
                    className="card-hover p-7 sm:p-8 flex flex-col justify-between group border border-slate-200/90 h-full rounded-xl bg-white shadow-sm hover:shadow-card hover:border-industrial-primary/40 transition-all duration-200"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-slate-200/60">
                        {idx === 0 ? <Handshake className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                      </div>
                      <Card.Header className="p-0">
                        <Card.Title className="text-lg sm:text-xl font-bold font-heading text-industrial-dark group-hover:text-industrial-primary transition-colors">
                          {p.title}
                        </Card.Title>
                        <Card.Description className="text-sm text-slate-700 font-medium mt-2 leading-relaxed">
                          {p.description}
                        </Card.Description>
                      </Card.Header>
                    </div>

                    <Card.Footer className="p-0 pt-4 border-t border-slate-100 text-xs font-semibold text-industrial-primary mt-6 flex items-center gap-1.5">
                      <span>Customer-Centric Engineering</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Card.Footer>
                  </Card>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionReveal>

      {/* 7. Conversion CTA */}
      <EnquiryCTA />
    </>
  );
};
