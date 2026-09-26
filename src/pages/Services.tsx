import React from 'react';
import { 
  Wrench, 
  GraduationCap, 
  Compass, 
  Zap, 
  Headphones, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Gauge,
  Clock,
  Award,
  ChevronDown,
  ZoomIn,
  Settings,
  Activity,
  Sliders,
  Mail
} from 'lucide-react';
import { Button, Card, Chip, Accordion } from '@heroui/react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { createBreadcrumbSchema, createFAQSchema } from '../config/seo';
import { servicesData } from '../data/services';
import { companyData } from '../data/company';
import { useEnquiry } from '../context/EnquiryContext';
import { useImageViewer } from '../context/ImageViewerContext';
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

// Engineering metrics & operating parameters for each service pillar
const pillarMetadata: Record<string, {
  badge: string;
  tagline: string;
  sla: string;
  specs: { label: string; value: string }[];
  ctaLabel: string;
}> = {
  'installation-commissioning': {
    badge: 'On-Site Integration',
    tagline: 'Pneumatic line regulation, mechanical alignment & shop-floor SPC hookup',
    sla: 'Turnkey On-Site Deployment',
    specs: [
      { label: 'Line Pressure', value: '4.5 bar (67 psi) Min' },
      { label: 'Regulated Pressure', value: '3.0 bar (45 psi) ± 0.05' },
      { label: 'Telemetry', value: 'RS-232 / 24V PLC I/O' },
      { label: 'Air Quality', value: 'Auto-Drain 5µm Filtration' }
    ],
    ctaLabel: 'Request Installation & Setup'
  },
  'operator-training': {
    badge: 'Skill Handover & Certification',
    tagline: 'Operator handling, zero-setting routines & carbide tooling wear preservation',
    sla: 'Certified Line Handoff',
    specs: [
      { label: 'Setting Method', value: 'Single & Double Master' },
      { label: 'Tolerance Logic', value: 'Tri-Colour LED Bands' },
      { label: 'Tool Protection', value: 'Non-Contact Air Insertion' },
      { label: 'Data Export', value: 'AKIRA Memory Module / Excel' }
    ],
    ctaLabel: 'Schedule Operator Training'
  },
  'calibration-technical-support': {
    badge: 'Metrology Standards',
    tagline: 'ISO/IEC 17025 traceable master verification & transducer recalibration',
    sla: 'Annual & Periodic Reverification',
    specs: [
      { label: 'Master Repeatability', value: 'Sub-Micron (≤ 0.0005 mm)' },
      { label: 'Transducer Check', value: 'Zero & Span Linearization' },
      { label: 'Pneumatics', value: 'Back-Pressure Leak Audit' },
      { label: 'Traceability', value: 'National Standards Reference' }
    ],
    ctaLabel: 'Book Master Calibration'
  },
  'fast-service-response': {
    badge: 'Uptime & Breakdown Support',
    tagline: 'Rapid engineering dispatch and expedited replacement tooling for line continuity',
    sla: '24–48 Hour Field Dispatch',
    specs: [
      { label: 'Triage Response', value: 'Immediate Telephone Diagnosis' },
      { label: 'On-Site Dispatch', value: 'Within 24–48 Hours' },
      { label: 'Spares Inventory', value: 'Air Plugs, Rings & Carbide Tips' },
      { label: 'Coverage', value: 'All Major Industrial Clusters' }
    ],
    ctaLabel: 'Contact Emergency Service Desk'
  }
};

// 5-Stage Commissioning Protocol
const commissioningProtocol = [
  {
    step: '01',
    title: 'Site Readiness & Pneumatics Audit',
    description: 'Pre-installation verification of compressed air supply (min 4.5 bar line pressure), auto-drain moisture filtration, 5-micron drying, and 230V AC regulated power.',
    icon: Gauge,
    tag: 'Pre-Deployment'
  },
  {
    step: '02',
    title: 'Precision Mechanical Mounting',
    description: 'Rigid mounting of multi-gauging fixtures and electronic display columns on anti-vibration granite bases with sub-millimeter axial alignment.',
    icon: Wrench,
    tag: 'Mechanical Setup'
  },
  {
    step: '03',
    title: 'Two-Master Calibration & Zeroing',
    description: 'High and low master calibration setting, transducer linearization, and programming of tri-colour LED tolerance bands (Accept / Rework / Reject).',
    icon: Sliders,
    tag: 'Metrology Cal'
  },
  {
    step: '04',
    title: 'Operator Certification & Trial R&R',
    description: 'Practical training on non-contact probe insertion, zero-drift verification, and live repeatability & reproducibility (Gauge R&R) sign-off on actual workpieces.',
    icon: GraduationCap,
    tag: 'Hands-On Training'
  },
  {
    step: '05',
    title: 'Scheduled Recalibration & SLA Support',
    description: 'Ongoing setting master reverification, scheduled preventive maintenance audits, and guaranteed 24-48h emergency field breakdown support.',
    icon: ShieldCheck,
    tag: 'Lifecycle SLA'
  }
];

// Service Level Commitments & Standards Matrix
const serviceMatrix = [
  {
    service: 'Emergency Breakdown Callout',
    targetSLA: 'Immediate phone triage / 24–48h on-site dispatch',
    standards: 'Factory calibration restoration & repeatability validation',
    deliverable: 'Field breakdown report & line clearance sign-off',
    icon: Zap
  },
  {
    service: 'Setting Master Ring & Plug Reverification',
    targetSLA: '3–5 business days laboratory turnaround',
    standards: 'Traceable to National Metrology Standards (ISO/IEC 17025)',
    deliverable: 'Traceable Calibration Certificate with recorded deviations',
    icon: Award
  },
  {
    service: 'Display Unit & Transducer Calibration',
    targetSLA: 'Scheduled quarterly or annual maintenance cycles',
    standards: 'Multi-point electronic linearization & pneumatic back-pressure testing',
    deliverable: 'Transducer sensitivity audit & parameter verification log',
    icon: Activity
  },
  {
    service: 'Custom Fixture Engineering Consultation',
    targetSLA: '5–7 business days for concept & 3D fixture proposal',
    standards: 'Gauge R&R capability designed for < 10% tolerance band',
    deliverable: 'Detailed 3D GA drawing, pneumatic circuit diagram & cycle audit',
    icon: Compass
  }
];

// Technical & Operational FAQs
const serviceFAQs = [
  {
    question: 'What pneumatic supply conditions are required for air gauging installation?',
    answer: 'Akira air gauging systems require a regulated working pressure of 3.0 bars (45 psi) with an incoming line pressure of at least 4.5 bars (67 psi). Compressed air must be clean, dry, and oil-free. Our installation engineers integrate auto-drain moisture filters and 5-micron air dryer units directly upstream of the air displays to prevent transducer contamination and ensure measurement stability.'
  },
  {
    question: 'How frequently should setting master rings and plugs be recalibrated?',
    answer: 'Under normal production operating conditions, we recommend recalibrating setting master rings and setting master plugs every 6 to 12 months in accordance with ISO 9001 and IATF 16949 quality standards. For high-volume automotive lines operating continuous three-shift cycles, semi-annual reverification prevents wear-induced measurement drift.'
  },
  {
    question: 'What is covered during on-site operator and quality inspector training?',
    answer: 'Our comprehensive training curriculum covers: (1) Correct insertion techniques to protect hard-chrome and carbide wear contacts, (2) Step-by-step single-master and double-master zero setting routines, (3) Interpretation of tri-colour LED tolerance bands (Accept, Rework, Reject), (4) Air Saver auto-shutoff valve operation for energy efficiency, and (5) AKIRA Memory Module configuration for direct Excel and SPC data export.'
  },
  {
    question: 'How rapidly can Akira respond to an emergency breakdown on a production line?',
    answer: 'For critical production stoppages, our technical hotline provides immediate engineer triage via phone or video to diagnose pneumatic regulation, transducer drift, or electrical continuity. Where on-site service is required, service personnel are dispatched within 24 to 48 hours across major automotive manufacturing corridors in India.'
  },
  {
    question: 'Can Akira service, calibrate, or retrofit third-party air gauges and fixtures?',
    answer: 'Yes. Akira Precision Automation manufactures compatible replacement air plug gauges, air ring gauges, carbide wear mandrels, and digital display units that interface directly with third-party pneumatic back-pressure systems, standard inductive LVDT probes, and legacy multi-gauging fixtures.'
  },
  {
    question: 'What documentation and certification is provided upon service completion?',
    answer: 'Every installation, preventive maintenance, or breakdown visit concludes with an official Field Service Report signed by both parties. For master calibration assignments, we issue traceable Calibration Certificates detailing measured actual dimensions, permissible limits, ambient test temperature (20°C standard), and national metrology standards traceability.'
  }
];

export const Services: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

  const breadcrumbsData = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' }
  ];

  return (
    <>
      <SEOHead
        title="Service & Technical Support | Beyond Sales Commitment"
        description={`Comprehensive technical support, on-site installation, operator calibration training, ISO/IEC 17025 traceable master verification, and rapid service response from ${company.name}.`}
        keywords={`Metrology Calibration Service, Multi-Gauging Installation, Operator Training, Air Gauging Support India, Setting Master Calibration, Pneumatic Metrology Maintenance, ${company.name}`}
        canonicalPath="/services"
        ogImage="/assets/company/inspection-workbench.webp"
        structuredData={[
          createBreadcrumbSchema(breadcrumbsData),
          createFAQSchema(serviceFAQs)!
        ]}
      />

      {/* 1. Engineering Hero Section */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'Services' }]} />

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
                  <Headphones className="w-3.5 h-3.5 text-sky-400" />
                  <span>Comprehensive Lifecycle Engineering Support</span>
                </Chip.Label>
              </Chip>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Service & <span className="text-[#00c2ff]">Technical Support</span>
              </h1>

              <p className="text-xl sm:text-2xl font-bold text-sky-300 font-heading">
                "We support beyond sales."
              </p>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                At {company.name}, we recognize that precision gauging systems are mission-critical to your production lines. We partner with your quality engineering teams through every phase of operation—from initial mechanical mounting and pneumatic line regulation to operator certification, master recalibration, and rapid breakdown response.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry('Services Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans cursor-pointer"
                >
                  <span>Request Engineering Support</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                <a
                  href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                >
                  <Phone className="w-4 h-4 text-sky-400" />
                  <span>Call {companyData.phones[0]}</span>
                </a>
              </div>
            </Reveal>

            {/* Right Column: High-Tech Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => {
                  openImageViewer({
                    src: '/assets/company/inspection-workbench.webp',
                    title: 'Precision Metrology & Calibration Standards Workbench',
                    category: 'Metrology Lab & Field Support',
                    description: 'Factory inspection granite plate and precision dial test indicators used for setting master verification, sub-micron air tooling calibration, and shop-floor quality auditing.',
                    badge: 'ISO/IEC 17025 Traceable'
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
                      src: '/assets/company/inspection-workbench.webp',
                      title: 'Precision Metrology & Calibration Standards Workbench',
                      category: 'Metrology Lab & Field Support',
                      description: 'Factory inspection granite plate and precision dial test indicators used for setting master verification, sub-micron air tooling calibration, and shop-floor quality auditing.',
                      badge: 'ISO/IEC 17025 Traceable'
                    });
                  }
                }}
              >
                <img
                  src="/assets/company/inspection-workbench.webp"
                  alt="Precision Metrology & Calibration Standards Workbench"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('air-gauging-bench')) {
                      target.src = '/assets/solutions/air-gauging-bench.webp';
                    }
                  }}
                  className="w-full h-auto object-cover min-h-[260px] sm:min-h-[320px] max-h-[380px] transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient & Overlay Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5 z-10">
                  <Chip
                    variant="soft"
                    color="default"
                    size="sm"
                    className="bg-slate-900/90 text-white shadow-subtle border border-slate-700/90 backdrop-blur-sm"
                  >
                    <Chip.Label className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      Metrology & Calibration Bench
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Pill */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect Metrology Desk</span>
                  </span>
                </div>

                {/* Bottom Information Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      Sub-Micron Calibration Bench
                    </p>
                    <p className="text-slate-300 text-[10px] truncate">
                      Setting Master & Pneumatic Verification
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 font-bold shrink-0">
                    ≤ 0.0005 mm
                  </span>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Key Capability Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 24h</p>
                <p className="text-xs text-slate-400">Emergency Dispatch</p>
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
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">3.0 Bar ± 0.05</p>
                <p className="text-xs text-slate-400">Calibrated Pneumatics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">100% Audit</p>
                <p className="text-xs text-slate-400">Operator Sign-Off</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Service Pillars Detailed Technical Dossiers */}
      <section id="service-pillars" className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Engineering Service Portfolio</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Four Pillars of Technical Support
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Structured engineering engagements designed to eliminate dimensional inspection bottlenecks, safeguard tooling life, and guarantee measurement precision across your operations.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {servicesData.map((srv, index) => {
              const Icon = iconMap[srv.iconName] || Wrench;
              const meta = pillarMetadata[srv.id] || {
                badge: 'Engineering Service',
                tagline: srv.description,
                sla: 'Guaranteed SLA',
                specs: [],
                ctaLabel: `Request ${srv.title}`
              };

              return (
                <StaggerItem key={srv.id} className="h-full">
                  <SpotlightCard
                    spotlightColor="rgba(14, 116, 144, 0.08)"
                    className="h-full rounded-2xl"
                  >
                    <Card
                      variant="default"
                      className="h-full border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-card hover:border-industrial-primary/30 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between"
                    >
                      <div className="space-y-6">
                        
                        {/* Header & Pillar Badge */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Chip
                              variant="soft"
                              color="default"
                              size="sm"
                              className="bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider"
                            >
                              <Chip.Label>
                                Pillar 0{index + 1} // {meta.badge}
                              </Chip.Label>
                            </Chip>

                            <span className="text-[11px] font-mono font-semibold text-industrial-primary flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-industrial-primary" />
                              <span>{meta.sla}</span>
                            </span>
                          </div>

                          <div className="flex items-start gap-4 pt-1">
                            <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <Card.Title className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                                {srv.title}
                              </Card.Title>
                              <p className="text-xs text-industrial-primary font-medium mt-0.5">
                                {meta.tagline}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <Card.Description className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                          {srv.description}
                        </Card.Description>

                        {/* Operating Specifications Grid */}
                        {meta.specs.length > 0 && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-industrial-primary flex items-center gap-1.5">
                                <Settings className="w-3 h-3 text-industrial-primary shrink-0" />
                                <span>Technical Parameters & Protocol</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {meta.specs.map((sp, idx) => (
                                <div key={idx} className="space-y-0.5">
                                  <span className="text-[10px] text-slate-500 font-mono block uppercase">{sp.label}</span>
                                  <span className="text-slate-800 font-semibold font-mono text-[11px] block">{sp.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Service Deliverables Checklist */}
                        <Card.Content className="space-y-2 pt-2 p-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Engineering Deliverables:
                          </p>
                          <div className="space-y-2">
                            {srv.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-industrial-primary shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </Card.Content>

                      </div>

                      {/* Card Footer CTA */}
                      <Card.Footer className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => openEnquiry(`Service: ${srv.title}`)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-industrial-primary hover:bg-sky-600 text-white font-bold text-xs shadow-xs font-sans cursor-pointer"
                        >
                          <span>{meta.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-[10px] font-mono text-slate-400 text-center sm:text-right">
                          Factory Direct Engineering
                        </span>
                      </Card.Footer>

                    </Card>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

        </div>
      </section>

      {/* 3. 5-Stage Commissioning Protocol Section */}
      <section id="commissioning-protocol" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Standard Operating Procedure</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              5-Stage Commissioning & Support Protocol
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Our structured quality deployment sequence guarantees measurement repeatability, zero calibration drift, and operator self-sufficiency before production release.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
            {commissioningProtocol.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <Reveal key={step.step} direction="up" delay={idx * 0.1}>
                  <div className="h-full p-5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-industrial-primary/40 hover:shadow-card transition-all duration-300 flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-industrial-primary transition-colors">
                          {step.step}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-industrial-primary flex items-center justify-center shadow-xs">
                          <StepIcon className="w-4 h-4" />
                        </div>
                      </div>

                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-industrial-primary block">
                        {step.tag}
                      </span>

                      <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                        {step.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified Sign-Off</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Calibration Standards & Service SLA Matrix */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Quality Assurance Benchmarks</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Service Commitments & Standards Matrix
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Clear commitments, turnaround times, and national standards traceability for every tier of our engineering service engagements.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceMatrix.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <Reveal key={idx} direction="up" delay={idx * 0.08}>
                  <Card
                    variant="default"
                    className="h-full border border-slate-200 bg-white rounded-xl p-5 shadow-xs hover:shadow-card hover:border-industrial-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center border border-sky-100 shadow-xs">
                        <ItemIcon className="w-5 h-5" />
                      </div>

                      <Card.Title className="text-base font-bold font-heading text-slate-900 leading-snug">
                        {item.service}
                      </Card.Title>

                      <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                            Target SLA Turnaround:
                          </span>
                          <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                            {item.targetSLA}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                            Standards Compliance:
                          </span>
                          <span className="text-slate-700 mt-0.5 block leading-relaxed">
                            {item.standards}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                            Service Deliverable:
                          </span>
                          <span className="text-slate-700 mt-0.5 block leading-relaxed font-medium">
                            {item.deliverable}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => openEnquiry(`Enquiry: ${item.service}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary hover:text-industrial-hover cursor-pointer"
                      >
                        <span>Book Engagement</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Direct Technical Support Desk & Breakdown Hotline */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up">
            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-industrial-dark text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-dark-grid opacity-15 pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left side: Information */}
                <div className="lg:col-span-8 space-y-4">
                  <Chip
                    variant="soft"
                    color="accent"
                    size="sm"
                    className="bg-sky-950 text-sky-300 border border-sky-800 font-mono text-[10px] font-bold uppercase tracking-wider"
                  >
                    <Chip.Label>Immediate Technical Triage</Chip.Label>
                  </Chip>

                  <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                    Require Urgent Technical Support or Calibration?
                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                    Contact our factory engineering desk directly. We support OEMs, Tier-1 suppliers, and machine shops with minimal turnaround time, on-site diagnostics, and genuine replacement air tooling.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-6 text-xs sm:text-sm font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{companyData.businessHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                      <a href={`mailto:${companyData.emails[0]}`} className="hover:text-white underline">
                        {companyData.emails[0]}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right side: Direct Actions */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch gap-3.5 shrink-0">
                  <a
                    href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all font-sans text-center"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Hotline: {companyData.phones[0]}</span>
                  </a>

                  {companyData.phones[1] && (
                    <a
                      href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-xs sm:text-sm border border-slate-700 transition-all font-sans text-center"
                    >
                      <Phone className="w-4 h-4 text-sky-400" />
                      <span>Alt: {companyData.phones[1]}</span>
                    </a>
                  )}

                  <Button
                    variant="secondary"
                    size="md"
                    onPress={() => openEnquiry("Technical Support Desk")}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all font-sans cursor-pointer"
                  >
                    <span>Submit Service Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Technical & Operational FAQ Section with HeroUI Accordion */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container max-w-4xl space-y-10">
          
          <Reveal direction="up" className="text-center space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Knowledge Base & Technical Specs</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Technical answers regarding pneumatic parameters, calibration frequency, operator certification, and emergency support.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <Accordion className="w-full space-y-3" variant="surface">
              {serviceFAQs.map((faq, index) => (
                <Accordion.Item
                  key={index}
                  id={`faq-${index}`}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs data-[expanded=true]:border-industrial-primary/50 transition-colors"
                >
                  <Accordion.Heading>
                    <Accordion.Trigger className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-900 font-heading hover:text-industrial-primary transition-colors cursor-pointer group">
                      <span className="text-sm sm:text-base pr-4">
                        {faq.question}
                      </span>
                      <Accordion.Indicator className="transition-transform duration-200 shrink-0 text-slate-400 group-hover:text-industrial-primary">
                        <ChevronDown className="w-4 h-4" />
                      </Accordion.Indicator>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 mt-1 pt-3">
                      {faq.answer}
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Reveal>

        </div>
      </section>

      {/* 7. Bottom Enquiry CTA Banner */}
      <EnquiryCTA />
    </>
  );
};
