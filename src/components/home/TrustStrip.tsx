import React from 'react';
import { 
  Crosshair, 
  Settings2, 
  Headphones, 
  ShieldCheck, 
  HeartHandshake, 
  Bot
} from 'lucide-react';
import { Card } from '@heroui/react';
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
                <Card 
                  variant="default"
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:border-industrial-primary/40 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group text-left h-full flex flex-col justify-start"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-industrial-primary flex items-center justify-center mb-2.5 group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-200 border border-sky-100/60">
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                  </div>
                  <Card.Header className="p-0 space-y-1">
                    <Card.Title className="text-xs sm:text-sm font-bold text-slate-900 font-heading group-hover:text-industrial-primary transition-colors leading-snug">
                      {item.title}
                    </Card.Title>
                    <Card.Description className="text-xs text-slate-600 font-medium leading-relaxed">
                      {item.description}
                    </Card.Description>
                  </Card.Header>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};


