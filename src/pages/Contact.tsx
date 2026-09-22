import React from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Award, 
  Building, 
  ArrowRight, 
  FileText, 
  Lock, 
  Compass, 
  ChevronDown, 
  ExternalLink, 
  Headphones, 
  Check,
  Zap,
  Gauge
} from 'lucide-react';
import { Button, Card, Chip, Accordion } from '@heroui/react';
import { company } from '../config/company';
import { companyData } from '../data/company';
import { createBreadcrumbSchema, createOrganizationSchema, createFAQSchema } from '../config/seo';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { Reveal } from '../components/animation/Reveal';
import { SpotlightCard } from '../components/animation/SpotlightCard';
import { EnquiryForm } from '../components/common/EnquiryForm';
import { useCompanyEmails } from '../hooks/useCompanyEmails';

// Technical & Procurement FAQs for Contact page
const contactFAQs = [
  {
    question: "What technical parameters are required to quote a custom gauging fixture?",
    answer: "To provide an accurate technical proposal and quotation, our engineering team requires: (1) 2D/3D part drawings with dimensional tolerances and GD&T datum references (STEP, IGES, DXF, or PDF), (2) Target inspection cycle time (e.g. 10s–15s for in-line cells), (3) Component material and hardness (cast iron, forged steel, aluminum), and (4) Desired gauge output format (dial indicator, electronic digital column DRO, or automated PLC relay gates)."
  },
  {
    question: "How fast can Akira dispatch an application engineer for an emergency breakdown?",
    answer: "For production-critical lines experiencing gauging or display malfunctions across the Chennai industrial corridor (Sriperumbudur, Oragadam, Maraimalai Nagar, Ambattur), we triage within 2 hours and dispatch on-site field engineers within 12 to 24 hours. For pan-India clients (Pune, NCR, Bengaluru, Coimbatore), dispatch is executed within 24 to 48 hours."
  },
  {
    question: "Can our quality and production team visit your Chennai works for trial inspection?",
    answer: "Yes, absolutely. We welcome OEM quality directors, manufacturing engineers, and procurement teams to our works in Gerugambakkam, Chennai. During pre-dispatch factory trials, we run 10-part, 3-operator repeatability trials (Gauge R&R) on your actual test components and provide hands-on calibration training before shipping."
  },
  {
    question: "Are your setting master rings and plugs supplied with traceable calibration certificates?",
    answer: "Yes. Every Akira setting master ring, setting master plug, and air gauging probe is manufactured to DIN 2250 / ISO standards and supplied with calibration reports traceable to National and International Metrology Standards (NABL accredited / ISO/IEC 17025 standards room traceability)."
  },
  {
    question: "How do you protect proprietary CAD drawings and confidential component designs?",
    answer: "We treat all customer intellectual property with strict confidentiality. Before receiving your proprietary component 3D CAD files or manufacturing drawings, we execute a mutual Non-Disclosure Agreement (NDA). All files are stored on secure internal servers and accessed strictly on a need-to-know basis by assigned fixture design engineers."
  }
];

// Drawing submission guidelines
const submissionGuidelines = [
  {
    icon: FileText,
    title: "CAD & Drawing Formats",
    description: "Submit 3D models in STEP (.stp), IGES (.igs), or Parasolid (.x_t) format, along with 2D drawings in DXF, DWG, or PDF containing full GD&T datum structures.",
    badge: "3D STEP / 2D PDF"
  },
  {
    icon: Gauge,
    title: "Critical Tolerances",
    description: "Specify critical checking dimensions: bore diameters, ovality, taper, journal concentricity, runout, and surface finish (Ra) requirements.",
    badge: "Sub-Micron Scope"
  },
  {
    icon: Clock,
    title: "Target Cycle Time",
    description: "Indicate your production rate and target inspection time per part (e.g. < 12 seconds in-line audit vs line-side sampling).",
    badge: "< 12s Target"
  },
  {
    icon: Lock,
    title: "Confidentiality & NDA",
    description: "All client drawings, tolerance limits, and component geometries are protected under strict mutual Non-Disclosure Agreements (NDAs).",
    badge: "100% Protected"
  }
];

// Regional Industrial Corridors
const regionalCorridors = [
  {
    region: "Chennai Automotive Hub",
    locations: "Sriperumbudur • Oragadam • Maraimalai Nagar • Ambattur • Guindy",
    response: "≤ 12–24h On-Site Dispatch",
    tag: "Factory Direct Corridor"
  },
  {
    region: "Southern Precision Engineering",
    locations: "Coimbatore • Hosur • Bengaluru • Tiruchirappalli • Salem",
    response: "≤ 24h Field Support",
    tag: "Active Industrial Hub"
  },
  {
    region: "Pan-India Manufacturing Hubs",
    locations: "Pune-Chakan • Gurugram-Manesar • Ahmedabad-Sanand • Jamshedpur",
    response: "≤ 24–48h Dispatch",
    tag: "Nationwide OEM Support"
  }
];

export const Contact: React.FC = () => {
  const emails = useCompanyEmails();

  const breadcrumbsData = [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' }
  ];

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${companyData.address.street}, ${companyData.address.village}, ${companyData.address.city}, ${companyData.address.pin}`
  )}`;

  return (
    <>
      <SEOHead
        title={`Contact ${company.name} | Factory & Technical Inquiries`}
        description={`Connect with ${company.name} in Chennai, India for custom multi-gauging fixtures, pneumatic air tooling, sub-micron calibration, and turnkey metrology support.`}
        keywords={`Contact ${company.name}, precision metrology Chennai, air gauging manufacturer India, custom fixture engineering, setting master calibration, Gerugambakkam Chennai`}
        canonicalPath="/contact"
        structuredData={[
          createBreadcrumbSchema(breadcrumbsData),
          createOrganizationSchema(),
          createFAQSchema(contactFAQs)!
        ]}
      />

      {/* 1. Engineering Hero Section */}
      <section className="bg-industrial-dark text-white py-12 sm:py-16 lg:py-20 border-b border-slate-800 relative overflow-hidden w-full max-w-full">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-industrial-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="industrial-container relative z-10 w-full max-w-full">
          <Breadcrumb items={[{ label: 'Contact Us' }]} />

          <Reveal direction="up" className="max-w-4xl mt-4 space-y-4">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-950/80 text-sky-300 border border-sky-800/80 font-mono text-xs font-semibold uppercase tracking-wider mb-2"
            >
              <Chip.Label className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Technical Sales & Factory Desk</span>
              </Chip.Label>
            </Chip>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
              Contact & Technical Inquiries | <span className="text-[#00c2ff]">{company.name}</span>
            </h1>

            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-bold text-sky-300 font-heading">
                "{company.slogan}"
              </p>
              <p className="text-xs sm:text-sm font-mono text-slate-400">
                Motto: <span className="text-white font-semibold">"{companyData.motto}"</span> • {company.tagline}
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal pt-1 max-w-3xl">
              "Connect with us to explore custom solutions tailored for your manufacturing needs." Partner directly with our Chennai application engineering team for automated multi-gauging stations, sub-micron air tooling, and turnkey shop-floor dimensional inspection fixtures.
            </p>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <Button
                variant="primary"
                size="lg"
                onPress={() => {
                  const formEl = document.getElementById('inquiry-form-card');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/40 transition-all font-sans cursor-pointer"
              >
                <span>Submit Technical Inquiry</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Button>

              <a
                href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-slate-900/90 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all font-sans text-center font-mono"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Call Factory: {companyData.phones[0]}</span>
              </a>
            </div>
          </Reveal>

          {/* Key Response Benchmarks Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">&lt; 2h Response</p>
                <p className="text-xs text-slate-400">Technical Inquiries Triage</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">≤ 24h Dispatch</p>
                <p className="text-xs text-slate-400">Emergency Breakdown Support</p>
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
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white font-mono">100% NDA</p>
                <p className="text-xs text-slate-400">Drawing Security</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main Two-Column Contact Section: Factory Information & B2B Inquiry Desk */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Official Registered Details & Specialized Channels (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Registered Facility Card */}
              <Reveal direction="up">
                <SpotlightCard className="h-full">
                  <Card variant="default" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-card space-y-5">
                    
                    <Card.Header className="p-0 border-b border-slate-100 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-industrial-primary">
                          <Building className="w-3.5 h-3.5" />
                          <span>Registered Facility & Office</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-industrial-primary border border-sky-100 font-bold">
                          Est. {companyData.establishedYear}
                        </span>
                      </div>
                      <Card.Title className="text-xl font-bold font-heading text-slate-900 mt-2">
                        {companyData.companyName}
                      </Card.Title>
                      <Card.Description className="text-xs text-slate-600 font-normal mt-0.5">
                        High-Precision Industrial Metrology & Automated Gauging Systems
                      </Card.Description>
                    </Card.Header>

                    {/* Address Block */}
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-industrial-primary flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1.5 flex-1">
                        <p className="font-bold text-slate-900 font-heading text-sm">Works & Head Office:</p>
                        <p className="text-slate-600 leading-relaxed font-normal">
                          {companyData.address.street},<br />
                          {companyData.address.village ? `${companyData.address.village}, ` : ''}{companyData.address.city},<br />
                          {companyData.address.district && <>{companyData.address.district},<br /></>}
                          {companyData.address.state}, PIN {companyData.address.pin}, India.
                        </p>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-industrial-primary hover:text-sky-700 transition-colors pt-1 group"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="flex items-start gap-3.5 pt-2 border-t border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-industrial-primary flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1 flex-1">
                        <p className="font-bold text-slate-900 font-heading text-sm">Working Hours:</p>
                        <p className="text-slate-600 font-normal">{companyData.businessHours}</p>
                        <p className="text-[11px] text-industrial-primary font-medium">
                          Emergency breakdown dispatch active 24/7 for contracted lines
                        </p>
                      </div>
                    </div>

                    {/* Corporate Motto Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Award className="w-4 h-4 text-industrial-primary" />
                        <span>Motto: <strong className="text-slate-900">"{companyData.motto}"</strong></span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">Chennai, TN</span>
                    </div>

                  </Card>
                </SpotlightCard>
              </Reveal>

              {/* Specialized Department Channels Card */}
              <Reveal direction="up" delay={0.1}>
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Headphones className="w-4 h-4 text-industrial-primary" />
                    <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
                      Specialized Department Desks
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Channel 1: Technical Sales */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">Technical Sales & Proposals</p>
                        <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          New Projects
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Multi-gauging fixtures, pneumatic air plug/ring sizing, and custom quotation.
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
                        <a href={`mailto:${emails[0]}`} className="text-industrial-primary hover:underline font-medium">
                          {emails[0]}
                        </a>
                        <span className="text-slate-300">•</span>
                        <a href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} className="text-slate-700 hover:text-industrial-primary font-medium">
                          {companyData.phones[0]}
                        </a>
                      </div>
                    </div>

                    {/* Channel 2: Calibration & Standards */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">Calibration & Setting Masters</p>
                        <span className="text-[10px] font-mono text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                          Standards
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Traceable master ring/plug reverification, LVDT transducer sensitivity check.
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
                        {emails[1] ? (
                          <a href={`mailto:${emails[1]}`} className="text-industrial-primary hover:underline font-medium">
                            {emails[1]}
                          </a>
                        ) : (
                          <a href={`mailto:${company.ccEmail}`} className="text-industrial-primary hover:underline font-medium">
                            {company.ccEmail}
                          </a>
                        )}
                        <span className="text-slate-300">•</span>
                        <a href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} className="text-slate-700 hover:text-industrial-primary font-medium">
                          {companyData.phones[1]}
                        </a>
                      </div>
                    </div>

                    {/* Channel 3: Emergency Breakdown Field Support */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">Field Service & Breakdown Triage</p>
                        <span className="text-[10px] font-mono text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          Rapid 24h
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Immediate line-stop troubleshooting, pneumatic air regulator audits, operator training.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-xs font-mono">
                        <Phone className="w-3.5 h-3.5 text-industrial-primary" />
                        <a href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} className="text-industrial-primary hover:underline font-bold">
                          Hotline: {companyData.phones[0]}
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              </Reveal>

            </div>

            {/* Right Column: B2B Engineering Quotation & Parameter Submission (7 cols) */}
            <div id="inquiry-form-card" className="lg:col-span-7">
              <Reveal direction="left" delay={0.15}>
                <Card variant="default" className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl border border-slate-200/90 shadow-card">
                  <Card.Header className="p-0 mb-6 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-industrial-primary mb-1">
                      <ShieldCheck className="w-4 h-4 text-sky-500" />
                      <span>Direct Engineering Quotation</span>
                    </div>
                    <Card.Title className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                      Submit Gauging / Fixture Enquiry
                    </Card.Title>
                    <Card.Description className="text-xs sm:text-sm text-slate-600 font-normal mt-1 leading-relaxed">
                      Fill out the parameters below and our metrology technical team will prepare a structured proposal with cycle-time estimates and fixture drawings.
                    </Card.Description>
                  </Card.Header>

                  <EnquiryForm variant="inline" idPrefix="contact-" />
                </Card>
              </Reveal>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Engineering Drawing & Specifications Submission Guidelines */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="industrial-container">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Drawing Submission Protocol</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              How to Submit Your Component Drawings
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Follow our engineering protocol to ensure your custom fixture quotation is delivered rapidly and accurately with complete feasibility analysis.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {submissionGuidelines.map((guide, idx) => {
              const GuideIcon = guide.icon;
              return (
                <Reveal key={idx} direction="up" delay={idx * 0.08}>
                  <div className="h-full p-6 rounded-xl border border-slate-200 bg-white hover:border-industrial-primary/40 hover:shadow-card transition-all duration-300 flex flex-col justify-between group">
                    <div className="space-y-3.5">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center border border-sky-100 shadow-xs group-hover:bg-industrial-primary group-hover:text-white transition-colors">
                        <GuideIcon className="w-5 h-5" />
                      </div>

                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-industrial-primary px-2 py-0.5 rounded bg-sky-50 border border-sky-100 inline-block">
                        {guide.badge}
                      </span>

                      <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-industrial-primary transition-colors">
                        {guide.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {guide.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified Standard</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Regional Automotive & Precision Manufacturing Corridor Reach */}
      <section className="py-16 sm:py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container">
          
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Manufacturing Geography</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Automotive & Precision Corridors We Support
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Based in Chennai, {company.name} serves OEMs, Tier-1 automotive machinists, and precision component manufacturers with rapid field response across India.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalCorridors.map((corridor, idx) => (
              <Reveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="h-full p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-industrial-primary bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {corridor.tag}
                      </span>
                      <Compass className="w-4 h-4 text-slate-400" />
                    </div>

                    <h3 className="text-lg font-bold font-heading text-slate-900">
                      {corridor.region}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {corridor.locations}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Service SLA:</span>
                    <span className="font-bold text-industrial-primary">{corridor.response}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Technical Sales & Procurement FAQs (HeroUI Accordion) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="industrial-container max-w-4xl mx-auto">
          
          <Reveal direction="up" className="text-center space-y-3 mb-10 sm:mb-12">
            <Chip
              variant="soft"
              color="accent"
              size="sm"
              className="bg-sky-50 text-industrial-primary border border-sky-200/80 font-mono text-[11px] font-bold uppercase tracking-wider"
            >
              <Chip.Label>Customer & Procurement Due Diligence</Chip.Label>
            </Chip>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-industrial-dark">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Answers regarding custom tooling quotation, emergency dispatch protocols, NDA commitments, and works visits.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <Accordion variant="surface" className="space-y-3">
              {contactFAQs.map((faq, index) => (
                <Accordion.Item
                  key={index}
                  id={`contact-faq-${index}`}
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

      {/* 6. Emergency Direct Assistance Hotline Banner */}
      <section className="py-12 sm:py-16 bg-industrial-dark text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="industrial-container relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-industrial-dark border border-slate-800">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Urgent Manufacturing Line Requirement?</span>
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading text-white tracking-tight">
                Require Immediate Technical Support or Urgent Quotation?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect directly with our lead applications engineering team in Chennai for fast technical guidance and immediate fixture feasibility checks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
              <a
                href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-lg bg-[#0084ff] hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all font-sans cursor-pointer font-mono"
              >
                <Phone className="w-4 h-4" />
                <span>Call: {companyData.phones[0]}</span>
              </a>

              <a
                href={`mailto:${emails[0]}?subject=Urgent%20Gauging%20Inquiry%20-%20AKIRA`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-xs sm:text-sm border border-slate-700 transition-all font-sans text-center font-mono"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Email Engineering</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
