import React from 'react';
import { 
  Award, 
  Cpu, 
  Wrench, 
  DollarSign, 
  HeartHandshake,
  Bot
} from 'lucide-react';
import { company } from '../config/company';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { Reveal } from '../components/animation/Reveal';
import { ScaleReveal } from '../components/animation/ScaleReveal';
import { StaggerContainer } from '../components/animation/StaggerContainer';
import { StaggerItem } from '../components/animation/StaggerItem';
import { SpotlightCard } from '../components/animation/SpotlightCard';

const differentiators = [
  {
    icon: Cpu,
    title: "Automated Multi-Gauging Expertise",
    description: `${company.name} has developed deep, specialized engineering mastery in designing automated multi-gauging stations. From multi-jet suspended air plugs checking liner bores at multiple levels across X & Y axes, to multi-journal camshaft diameter stations, our systems eliminate inspection bottlenecks.`
  },
  {
    icon: Bot,
    title: "OEM & Automation-Ready Solutions",
    description: "Every electronic DRO and digital display unit is engineered from the ground up for modern production lines. With standard RS-232 serial data streams, optional 24V automation relay outputs, and remote foot-switch triggers, our hardware drops seamlessly into robotic cells and automated conveyors."
  },
  {
    icon: Wrench,
    title: "Custom-Built Systems",
    description: "We understand that every workpiece has unique datum structures and tight tolerances. We specialize in custom-tailored fixtures, air snap gauges with carbide tips, and dedicated workholding tooling that adapt precisely to your drawings without part deflection."
  },
  {
    icon: HeartHandshake,
    title: "Strong Service & Technical Support",
    description: "Under our motto 'Keeping Customers First', we support beyond sales. Our engineers provide complete on-site installation, pneumatic regulation, electrical integration, operator calibration training, and fast responsive field service."
  },
  {
    icon: DollarSign,
    title: "Competitive & Value-Driven Pricing",
    description: "We provide high-precision metrology technology and rugged shop-floor hardware at competitive, value-driven pricing. This delivers our clients a fast return on investment, lower scrap rates, and superior cost-effectiveness compared to multinational suppliers."
  }
];

export const WhyChooseUs: React.FC = () => {
  return (
    <>
      <SEOHead
        title={`Why Choose ${company.name} | Core Strengths`}
        description={`Discover why leading OEMs and automotive suppliers choose ${company.name} for precision gauging, automated multi-gauging, and custom fixtures.`}
        keywords={`${company.name}, why choose ${company.name}, automated multi gauging expertise, OEM gauging solutions, custom metrology fixtures`}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Why Choose Us' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <Award className="w-3.5 h-3.5" />
              Strategic Advantages
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Why Choose {company.name}?
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              With a relentless dedication to precision, smart automation solutions, and a steadfast motto of "Keeping Customers First", we provide solutions that help manufacturers increase productivity and profitability.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Core Strengths Detailed Section */}
      <section className="py-20 bg-industrial-bg border-b border-slate-200">
        <div className="industrial-container space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <Reveal direction="up" className="lg:col-span-6 space-y-6">
              <span className="section-tag">
                Proven Engineering Capability
              </span>
              <h2 className="section-title mt-2">
                Engineered for Accuracy, Productivity & Reliability
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {company.name} provides advanced solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding which is our major strength.
              </p>
              
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-primary text-white flex items-center justify-center font-bold text-lg font-heading shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Our Slogan</p>
                  <p className="text-base font-bold text-industrial-dark">{company.slogan}</p>
                  <p className="text-xs text-industrial-primary font-medium">{company.tagline}</p>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-6">
              <ScaleReveal>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-card bg-slate-900">
                  <img
                    src="/assets/solutions/air-gauging-tooling.webp"
                    alt={`${company.name} Precision Tooling`}
                    className="w-full h-auto object-cover max-h-[380px]"
                  />
                </div>
              </ScaleReveal>
            </div>
          </div>

          {/* Differentiator Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {differentiators.map((d, idx) => {
              const Icon = d.icon;
              return (
                <StaggerItem key={idx}>
                  <SpotlightCard
                    spotlightColor="rgba(14, 116, 144, 0.08)"
                    className="card-base p-8 border-slate-200 bg-white flex flex-col justify-between space-y-4 group hover:border-industrial-primary/30 h-full"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold font-heading text-industrial-dark group-hover:text-industrial-primary transition-colors">
                        {d.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {d.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 text-[10px] font-mono text-slate-400 uppercase">
                      Core Strength
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

        </div>
      </section>

      <EnquiryCTA />
    </>
  );
};

export const WhyMilestone = WhyChooseUs;
