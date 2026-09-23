import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Cpu, 
  Wrench, 
  HeartHandshake, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Gauge, 
  Zap, 
  Check, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ZoomIn, 
  Activity, 
  TrendingUp,
  Layers,
  Phone,
  BadgeIndianRupeeIcon
} from 'lucide-react';
import { Button, Card, Chip, Accordion } from '@heroui/react';
import { company } from '../config/company';
import { companyData, companyIntro } from '../data/company';
import { createBreadcrumbSchema, createFAQSchema } from '../config/seo';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';
import { StaggerContainer } from '../components/animation/StaggerContainer';
import { StaggerItem } from '../components/animation/StaggerItem';
import { SpotlightCard } from '../components/animation/SpotlightCard';
import { useEnquiry } from '../context/EnquiryContext';
import { useImageViewer } from '../context/ImageViewerContext';

// 5 Core Strategic Differentiators with rich technical metadata
const differentiators = [
  {
    id: "automated-multi-gauging",
    icon: Cpu,
    badge: "Pillar 01 // Multi-Point Metrology",
    title: "Automated Multi-Gauging Expertise",
    tagline: "Simultaneous multi-parameter bore, journal & concentricity inspection",
    description: `${company.name} has developed deep engineering mastery in designing automated multi-gauging stations. From multi-jet suspended air plugs checking liner bores at multiple levels across X & Y axes, to multi-journal camshaft diameter fixtures, our systems eliminate inspection bottlenecks.`,
    metric: "< 12s Cycle Time",
    metricLabel: "100% In-Line Part Audit",
    capabilities: [
      "Simultaneous measurement of up to 16+ parameters in a single pneumatic stroke",
      "Tri-colour LED tolerance classification (Green Accept, Amber Rework, Red Reject)",
      "Continuous internal bore ovality, taper, and perpendicularity evaluation",
      "Direct RS-232 / USB serial ASCII telemetry to factory SCADA & SPC systems"
    ],
    ctaLabel: "Consult on Multi-Gauging"
  },
  {
    id: "oem-automation-ready",
    icon: Bot,
    badge: "Pillar 02 // Industry 4.0 Interface",
    title: "OEM & Automation-Ready Architecture",
    tagline: "Seamless integration with robotic cells, transfer lines & PLC indexing gates",
    description: "Every electronic DRO and digital display column is engineered from the ground up for modern production environments. With standard RS-232 serial data streams, optional 24V automation relay outputs, and remote foot-switch triggers, our hardware drops seamlessly into robotic cells and automated conveyors.",
    metric: "24V PLC I/O Ready",
    metricLabel: "Robotic Cell Handshake",
    capabilities: [
      "Discrete 24V DC relay I/O gates for automatic OK / NG component binning",
      "Interlock compatibility with Siemens, Mitsubishi, and Rockwell automation PLCs",
      "Air Saver auto-shutoff solenoid valve conserving plant compressed air",
      "High-speed digital sampling rate for dynamic in-process verification"
    ],
    ctaLabel: "Explore PLC Interfacing"
  },
  {
    id: "custom-built-tooling",
    icon: Wrench,
    badge: "Pillar 03 // Precision Tooling",
    title: "Custom-Built Tooling & Fixtures",
    tagline: "Component-specific mandrels, carbide wear contacts & zero-deflection fixtures",
    description: "We recognize that every workpiece has unique datum structures and tight dimensional tolerances. We specialize in custom-tailored fixtures, air snap gauges with carbide wear pads, and dedicated workholding tooling that adapt precisely to your drawings without part deflection.",
    metric: "≤ 0.0005 mm",
    metricLabel: "Gauge Repeatability",
    capabilities: [
      "Tungsten carbide wear-protected contact points for abrasive cast iron & steel",
      "Hard-chrome plated pneumatic plug bodies ground to sub-micron accuracy",
      "Anti-deflection mechanical clamping designed from component 3D CAD models",
      "Setting master rings and setting master plugs verified to ISO/IEC 17025"
    ],
    ctaLabel: "Submit Component Drawing"
  },
  {
    id: "service-technical-support",
    icon: HeartHandshake,
    badge: "Pillar 04 // Lifetime Commitment",
    title: "Strong Service & Technical Support",
    tagline: "\"We support beyond sales\" with turnkey installation & rapid field response",
    description: "Under our motto 'Keeping Customers First', we support beyond sales. Our engineers provide complete on-site installation, pneumatic line regulation (3 bars regulated, 4.5 bars line), electrical integration, operator calibration training, and fast responsive field service.",
    metric: "≤ 24h Field Dispatch",
    metricLabel: "Emergency Breakdown Triage",
    capabilities: [
      "On-site mounting and mechanical alignment of multi-gauging stations",
      "Hands-on single-master and double-master calibration training for machine operators",
      "24–48 hour rapid emergency field dispatch across major Indian automotive corridors",
      "Traceable setting master recalibration and transducer sensitivity health checks"
    ],
    ctaLabel: "Request Service Support"
  },
  {
    id: "value-driven-pricing",
    icon: BadgeIndianRupeeIcon,
    badge: "Pillar 05 // Economic Advantage",
    title: "Competitive & Value-Driven Pricing",
    tagline: "High-precision metrology without exorbitant multinational markups",
    description: "We provide high-precision metrology technology and rugged shop-floor hardware at competitive, value-driven pricing. This delivers our clients a fast return on investment, lower scrap rates, and superior cost-effectiveness compared to multinational suppliers.",
    metric: "Fast Payback",
    metricLabel: "Low Total Cost of Ownership",
    capabilities: [
      "Substantially lower capital expenditure compared to European and Japanese imports",
      "Readily available domestic replacement air tooling, carbide tips, and wear rings",
      "Rapid capital amortization achieved through scrap prevention and early tool wear detection",
      "Transparent spares pricing with zero hidden vendor licensing fees"
    ],
    ctaLabel: "Request Commercial Proposal"
  }
];

// Strategic Comparison Matrix: AKIRA vs Conventional Gauging
const comparisonData = [
  {
    parameter: "Inspection Cycle Time",
    conventional: "2 to 5 minutes per component across multiple separate manual gauges",
    akira: "< 12 seconds simultaneous multi-point automated inspection",
    advantage: "Up to 80% cycle time reduction",
    icon: Clock
  },
  {
    parameter: "Measurement Objectivity",
    conventional: "High operator feel variation, manual dial reading fatigue & parallax bias",
    akira: "100% objective pneumatic back-pressure & digital DRO readouts",
    advantage: "Removes human subjectivity & audit disputes",
    icon: Gauge
  },
  {
    parameter: "Surface Finish Protection",
    conventional: "Direct metal-to-metal rubbing risks scoring micro-honed surfaces",
    akira: "Non-contact pneumatic air cushion prevents part scratching & scuffing",
    advantage: "Zero surface damage on critical bores",
    icon: ShieldCheck
  },
  {
    parameter: "Quality Data Traceability",
    conventional: "Manual paper logsheets vulnerable to clerical transcription errors",
    akira: "Direct RS-232 / USB telemetry export to Excel, Minitab & MES",
    advantage: "Instant IATF 16949 digital audit trail",
    icon: Activity
  },
  {
    parameter: "Production Line Integration",
    conventional: "Offline inspection bench causing work-in-progress (WIP) bottlenecks",
    akira: "Line-side or robotic cell integration with 24V PLC sorting gates",
    advantage: "Continuous line-flow without WIP buffers",
    icon: Bot
  }
];

// 5 Measurable Operational Benefits
const operationalBenefits = [
  {
    title: "Reduced Inspection Time",
    description: "Fast cycle times with multi-point simultaneous measurement and instant tolerance indication.",
    metric: "High Speed",
    icon: Zap
  },
  {
    title: "Higher Line Productivity",
    description: "Eliminates inspection bottlenecks on high-volume production and precision CNC machining lines.",
    metric: "Streamlined",
    icon: TrendingUp
  },
  {
    title: "Consistent Quality (Cp/Cpk)",
    description: "Removes operator subjectivity with repeatable precision pneumatic and electronic measurement.",
    metric: "Cp/Cpk ≥ 1.67",
    icon: Award
  },
  {
    title: "Automation-Ready Inspection",
    description: "Standard RS-232, optional 24V relay outputs, and foot switch interfaces for seamless line integration.",
    metric: "Industry 4.0",
    icon: Layers
  },
  {
    title: "Strong Return on Investment",
    description: "Lower scrap rates, extended tool wear monitoring, and durable wear-resistant carbide contacts.",
    metric: "High Value",
    icon: BadgeIndianRupeeIcon
  }
];

// Technical & Procurement FAQs
const whyChooseFAQs = [
  {
    question: "How does Akira compare in cost and lead times to multinational gauging brands?",
    answer: "Akira Precision Automation LLP designs and manufactures precision gauging fixtures, air electronic display units, and pneumatic tooling domestically in Chennai, India. We deliver equivalent sub-micron accuracy (≤ 0.0005 mm) and ISO/IEC 17025 traceability at 40% to 50% lower capital cost than imported European or Japanese brands, with significantly shorter lead times for custom tooling and rapid local replacement support."
  },
  {
    question: "Can Akira multi-gauging stations interface directly with our existing factory PLCs?",
    answer: "Yes. All our digital DROs and multi-channel air display units feature standard RS-232 serial telemetry and optional discrete 24V DC relay I/O gates (Accept, Rework, Reject signals). They interface seamlessly with Siemens, Mitsubishi, Omron, and Allen-Bradley PLCs on robotic cells, automated transfer lines, and pick-and-place indexing conveyors."
  },
  {
    question: "Why is non-contact air gauging superior for micro-honed engine cylinder bores?",
    answer: "Traditional mechanical contact probes can scratch or burnish finely honed engine cylinder block bores and sleeve surfaces. Air gauging operates on a non-contact pneumatic back-pressure principle where high-velocity air jets create a protective air cushion between the gauge plug and the bore wall. This completely prevents part scoring while continuously clearing cutting fluids and micro-chips from the measurement zone."
  },
  {
    question: "What is the typical turnaround time for custom fixture engineering?",
    answer: "Upon receipt of customer 2D/3D component drawings and tolerance parameters, our engineering team provides a conceptual 3D fixture model and feasibility proposal within 5 to 7 business days. Complete turnkey fixture fabrication, pneumatic line assembly, master setting, and factory trial testing are typically completed in 3 to 5 weeks depending on geometry complexity."
  },
  {
    question: "How do you guarantee measurement repeatability and Gauge R&R?",
    answer: "Every Akira gauging system undergoes rigorous pre-dispatch testing in our standards room. We perform 10-part, 3-operator repeatability & reproducibility (Gauge R&R) trials using customer test components and certified setting masters to guarantee an R&R value well below 10% of the total component tolerance band before customer sign-off."
  },
  {
    question: "What warranty, field support, and spare tooling commitments does Akira provide?",
    answer: "All Akira systems come with a comprehensive 12-month manufacturer warranty. Guided by our motto 'Keeping Customers First', our field engineering desk provides on-site installation, operator calibration training, annual setting master reverification, and rapid emergency field breakdown dispatch within 24 to 48 hours across India."
  }
];

export const WhyChooseUs: React.FC = () => {
  const { openEnquiry } = useEnquiry();
  const { openImageViewer } = useImageViewer();

  const breadcrumbsData = [
    { name: 'Home', url: '/' },
    { name: 'Why Choose Us', url: '/why-choose-us' }
  ];

  return (
    <>
      <SEOHead
        title={`Why Choose ${company.name} | Precision Metrology Advantages`}
        description={`Discover why leading automotive OEMs, Tier-1 suppliers, and precision manufacturers choose ${company.name} for automated multi-gauging, sub-micron air tooling, and custom fixtures.`}
        keywords={`${company.name}, Why Choose ${company.name}, Automated Multi-Gauging Expertise, Sub-Micron Precision India, Automotive Inspection Fixtures, Air Gauging Solutions`}
        canonicalPath="/why-choose-us"
        ogImage="/assets/solutions/air-gauging-inspection.webp"
        structuredData={[
          createBreadcrumbSchema(breadcrumbsData),
          createFAQSchema(whyChooseFAQs)!
        ]}
      />

      {/* 1. Engineering Hero Section */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'Why Choose Us' }]} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-4">
            
            {/* Left Column: Heading & Strategic Narrative (7 cols) */}
            <Reveal direction="up" className="lg:col-span-7 space-y-4">
              <Chip
                variant="soft"
                color="accent"
                size="sm"
                className="bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono text-xs font-semibold uppercase tracking-wider mb-2"
              >
                <Chip.Label className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Strategic Manufacturing Advantages</span>
                </Chip.Label>
              </Chip>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Why Partner with <span className="text-[#00c2ff]">{company.name}</span>
              </h1>

              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-bold text-sky-300 font-heading">
                  "{company.slogan}"
                </p>
                <p className="text-xs sm:text-sm font-mono text-slate-400">
                  Motto: <span className="text-white font-semibold">"{companyData.motto}"</span> • {company.tagline}
                </p>
              </div>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Precision dimensional measurement is the cornerstone of modern industrial manufacturing. At {company.name}, we engineer custom automated multi-gauging stations, sub-micron pneumatic tooling, and digital display instrumentation that eliminate inspection bottlenecks, guarantee Cp/Cpk compliance, and deliver rapid capital return for OEMs and precision machine shops across India.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => openEnquiry('Why Choose Us Consultation')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans cursor-pointer"
                >
                  <span>Request Engineering Consultation</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>

                <Link
                  to="/solutions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center"
                >
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Explore 12 Turnkey Solutions</span>
                </Link>
              </div>
            </Reveal>

            {/* Right Column: In-Line Metrology Visual Showcase (5 cols) */}
            <Reveal direction="left" delay={0.15} className="lg:col-span-5">
              <div 
                onClick={() => {
                  openImageViewer({
                    src: '/assets/solutions/air-gauging-inspection.webp',
                    title: 'Production In-Line Precision Air Gauging Cell',
                    category: 'Automated Metrology Deployment',
                    description: 'Direct shop-floor air gauging tool verifying engine cylinder head and bore dimensions on an active production line, ensuring 100% part inspection with zero surface scoring.',
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
                      src: '/assets/solutions/air-gauging-inspection.webp',
                      title: 'Production In-Line Precision Air Gauging Cell',
                      category: 'Automated Metrology Deployment',
                      description: 'Direct shop-floor air gauging tool verifying engine cylinder head and bore dimensions on an active production line, ensuring 100% part inspection with zero surface scoring.',
                      badge: 'In-Line Quality Audit'
                    });
                  }
                }}
              >
                <img
                  src="/assets/solutions/air-gauging-inspection.webp"
                  alt="Automated Shop-Floor Air Gauging Inspection Station"
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
                      Shop-Floor In-Line Rig
                    </Chip.Label>
                  </Chip>
                </div>

                {/* Hover Click to Inspect Pill */}
                <div className="absolute inset-0 bg-industrial-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/95 text-white text-xs font-semibold shadow-md backdrop-blur-md border border-slate-700 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Inspect In-Line Setup</span>
                  </span>
                </div>

                {/* Bottom Information Overlay */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      Engine Cylinder Head In-Line Gauging
                    </p>
                    <p className="text-slate-300 text-[10px] truncate">
                      Automotive Production Quality Assurance
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
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 0.0005 mm</p>
                <p className="text-xs text-slate-400">Gauge Repeatability</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">&lt; 12s Cycle</p>
                <p className="text-xs text-slate-400">100% In-Line Audit</p>
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">0% Scoring</p>
                <p className="text-xs text-slate-400">Non-Contact Cushion</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Five Core Strategic Differentiators (Detailed Technical Dossiers) */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Core Strengths & Technical Differentiators</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Engineered for Accuracy, Productivity & Reliability
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {company.name} delivers specialized capabilities in multi-gauging, custom fixtures, pneumatic air tooling, electronic columns, attribute gauges, and workholding designed around your exact production datums.
            </p>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((d) => {
              const Icon = d.icon;
              return (
                <StaggerItem key={d.id} className="h-full">
                  <SpotlightCard
                    spotlightColor="rgba(14, 116, 144, 0.08)"
                    className="h-full rounded-2xl"
                  >
                    <Card
                      variant="default"
                      className="h-full border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-card hover:border-industrial-primary/30 transition-all duration-300 p-6 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        
                        {/* Header & Pillar Badge */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Chip
                              variant="soft"
                              color="default"
                              size="sm"
                              className="bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider"
                            >
                              <Chip.Label>{d.badge}</Chip.Label>
                            </Chip>

                            <span className="text-[11px] font-mono font-semibold text-industrial-primary flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-industrial-primary" />
                              <span>{d.metric}</span>
                            </span>
                          </div>

                          <div className="flex items-start gap-3.5 pt-1">
                            <div className="w-11 h-11 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <Card.Title className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
                                {d.title}
                              </Card.Title>
                              <p className="text-xs text-industrial-primary font-medium mt-0.5">
                                {d.tagline}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <Card.Description className="text-xs text-slate-600 leading-relaxed font-normal">
                          {d.description}
                        </Card.Description>

                        {/* Engineering Capabilities Checklist */}
                        <Card.Content className="space-y-2 pt-2 border-t border-slate-100 p-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Technical Highlights:
                          </p>
                          <div className="space-y-1.5">
                            {d.capabilities.map((cap, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-industrial-primary shrink-0 mt-0.5" />
                                <span className="leading-snug text-slate-600">{cap}</span>
                              </div>
                            ))}
                          </div>
                        </Card.Content>

                      </div>

                      {/* Card Footer */}
                      <Card.Footer className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between p-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => openEnquiry(`Why Choose Us: ${d.title}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-industrial-primary hover:bg-sky-600 text-white font-bold text-xs shadow-xs font-sans cursor-pointer"
                        >
                          <span>{d.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-[10px] font-mono text-slate-400">
                          {d.metricLabel}
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

      {/* 3. Strategic Comparison Matrix: AKIRA vs Conventional Gauging */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Metrology Paradigm Comparison</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              AKIRA Automated Metrology vs Conventional Gauging
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Compare how our turnkey multi-gauging stations and pneumatic columns transform shop-floor productivity compared to traditional manual tools.
            </p>
          </Reveal>

          <div className="space-y-4">
            {comparisonData.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <Reveal key={idx} direction="up" delay={idx * 0.08}>
                  <Card
                    variant="default"
                    className="border border-slate-200 bg-white rounded-xl p-5 shadow-xs hover:shadow-card hover:border-industrial-primary/40 transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Parameter Title */}
                      <div className="md:col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center shrink-0 border border-sky-100">
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Metric</span>
                          <Card.Title className="text-sm sm:text-base font-bold font-heading text-slate-900">
                            {item.parameter}
                          </Card.Title>
                        </div>
                      </div>

                      {/* Conventional Gauging */}
                      <div className="md:col-span-4 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Conventional / Legacy
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.conventional}
                        </p>
                      </div>

                      {/* AKIRA Automated Solution */}
                      <div className="md:col-span-5 p-3 rounded-lg bg-sky-50/70 border border-sky-200/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-industrial-primary">
                            AKIRA Automated System
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {item.advantage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {item.akira}
                        </p>
                      </div>

                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Customer Operational & Economic Benefits */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Measurable Manufacturing Impact</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Five Operational Benefits for Production Teams
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Direct economic and quality improvements realized by OEM quality directors, machine shop owners, and automation integrators.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {operationalBenefits.map((benefit, idx) => {
              const BenefitIcon = benefit.icon;
              return (
                <Reveal key={idx} direction="up" delay={idx * 0.08}>
                  <div className="h-full p-5 rounded-xl border border-slate-200 bg-white hover:border-industrial-primary/40 hover:shadow-card transition-all duration-300 flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center border border-sky-100 shadow-xs group-hover:bg-industrial-primary group-hover:text-white transition-colors">
                        <BenefitIcon className="w-5 h-5" />
                      </div>

                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-industrial-primary px-2 py-0.5 rounded bg-sky-50 border border-sky-100 inline-block">
                        {benefit.metric}
                      </span>

                      <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                        {benefit.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {benefit.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Proven Benefit</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Company Motto & Core Values Spotlight */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <Reveal direction="up">
            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-industrial-dark text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-dark-grid opacity-15 pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-8">
                
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="space-y-2">
                    <Chip
                      variant="soft"
                      color="accent"
                      size="sm"
                      className="bg-sky-950 text-sky-300 border border-sky-800 font-mono text-[10px] font-bold uppercase tracking-wider"
                    >
                      <Chip.Label>Corporate Philosophy & Culture</Chip.Label>
                    </Chip>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                      Motto: "{companyData.motto}"
                    </h3>
                    <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                      {companyIntro.mottoDescription}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      onPress={() => openEnquiry("Partner Inquiry")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all font-sans cursor-pointer"
                    >
                      <span>Partner With Us</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <a
                      href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-xs border border-slate-700 transition-all font-sans text-center"
                    >
                      <Phone className="w-4 h-4 text-sky-400" />
                      <span>{companyData.phones[0]}</span>
                    </a>
                  </div>
                </div>

                {/* 3 Core Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {companyData.coreValues.map((val, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-sky-950 text-sky-400 flex items-center justify-center border border-sky-800/60 font-mono font-bold text-sm">
                        0{idx + 1}
                      </div>
                      <h4 className="text-base font-bold font-heading text-white">
                        {val}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {companyIntro.coreValues[idx]?.description || `Dedicated focus on delivering world-class ${val.toLowerCase()} to precision manufacturers.`}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Technical & Procurement FAQ with HeroUI Accordion */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container max-w-4xl space-y-10">
          
          <Reveal direction="up" className="text-center space-y-3">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Customer Due Diligence</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Technical answers regarding tooling cost, PLC interfacing, R&R guarantees, and field service commitments.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <Accordion className="w-full space-y-3" variant="surface">
              {whyChooseFAQs.map((faq, index) => (
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

// Backward-compatibility export
export const WhyMilestone = WhyChooseUs;
