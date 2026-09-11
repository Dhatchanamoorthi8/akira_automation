import React from 'react';
import { 
  Crosshair, 
  Settings2, 
  Headphones, 
  ShieldCheck, 
  HeartHandshake, 
  Bot 
} from 'lucide-react';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';

const strengths = [
  {
    icon: Crosshair,
    title: "Precision Engineering",
    description: "Sub-micron accuracy and rigorous standards for OEM manufacturing."
  },
  {
    icon: Settings2,
    title: "Customized Solutions",
    description: "Tailored fixtures and gauging systems built for your unique parts."
  },
  {
    icon: Headphones,
    title: "Technical Support",
    description: "Expert engineering assistance from design to production floor."
  },
  {
    icon: ShieldCheck,
    title: "Quality Service",
    description: "Fast service response, operator training, and calibration support."
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    description: "Our guiding motto: 'Keeping Customers First' in everything we build."
  },
  {
    icon: Bot,
    title: "Automation Ready",
    description: "Standard RS-232 and optional 24V relay outputs for robotic cells."
  }
];

export const TrustStrip: React.FC = () => {
  return (
    <section className="bg-white border-b border-slate-200 py-8 relative z-20 overflow-hidden" aria-labelledby="trust-strip-heading">
      <h2 id="trust-strip-heading" className="sr-only">Our Core Engineering Strengths</h2>
      <div className="industrial-container">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {strengths.map((item, idx) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={idx}>
                <div 
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-industrial-primary/40 hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-200 group text-center sm:text-left h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center mb-3 group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 mx-auto sm:mx-0">
                      <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xs font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-industrial-muted mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};
