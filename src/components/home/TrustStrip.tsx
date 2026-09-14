import React from 'react';
import { 
  Crosshair, 
  Settings2, 
  Headphones, 
  ShieldCheck, 
  HeartHandshake, 
  Bot,
  ArrowRight
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
    <section className="bg-slate-50/60 border-b border-slate-200/80 py-5 sm:py-8 relative z-20 overflow-hidden" aria-labelledby="trust-strip-heading">
      <h2 id="trust-strip-heading" className="sr-only">Our Core Engineering Strengths</h2>
      <div className="industrial-container">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {strengths.map((item, idx) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={idx} className={idx >= 4 ? 'hidden md:block' : ''}>
                <div 
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-sky-300 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group text-left h-full flex flex-col justify-between relative"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading group-hover:text-sky-600 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10.5px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-sky-500 transition-transform duration-200 group-hover:translate-x-1" />
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

