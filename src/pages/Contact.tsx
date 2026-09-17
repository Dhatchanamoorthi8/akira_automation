import React from 'react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { createBreadcrumbSchema } from '../config/seo';
import { ContactSection } from '../components/home/ContactSection';
import { Mail } from 'lucide-react';
import { Reveal } from '../components/animation/Reveal';

export const Contact: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Contact Us & Engineering Inquiries | Connect With Us"
        description={`Connect with ${company.name} for technical inquiries, air gauges, multi-gauging, and precision inspection fixtures.`}
        keywords={`Contact ${company.name}, precision metrology, ${company.name} phone email address`}
        canonicalPath="/contact"
        structuredData={createBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Contact Us', url: '/contact' }
        ])}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Contact Us' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <Mail className="w-3.5 h-3.5" />
              Technical Sales & Factory Desk
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Connect With Us
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              "Connect with us to explore custom solutions tailored for your manufacturing needs."
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Contact Section with Form & Official Details */}
      <ContactSection isStandalone={true} />
    </>
  );
};
