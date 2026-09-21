import React from 'react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { FileCheck, Scale, CheckCircle2, Wrench, AlertCircle } from 'lucide-react';
import { Reveal } from '../components/animation/Reveal';
import { createBreadcrumbSchema } from '../config/seo';

export const Terms: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service & Inquiries | Commercial & Technical Terms"
        description={`Terms of service, quotation guidelines, engineering tolerance standards, and commercial conditions of ${company.name}.`}
        keywords={`Terms of Service, Engineering Terms, Quotation Conditions, Metrology Standards, ${company.name}`}
        canonicalPath="/terms"
        structuredData={createBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' }
        ])}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Terms of Service' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <Scale className="w-3.5 h-3.5" />
              Commercial & Engineering Framework
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Terms of Service & Inquiries
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Standard commercial terms, technical quotation protocols, and metrological warranty standards governing {company.name} client engagements.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-industrial-bg">
        <div className="industrial-container max-w-4xl space-y-12">
          
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <FileCheck className="w-5 h-5" />
              <h2>1. Quotation & Technical Proposal Validity</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              All formal commercial quotations and engineering proposals issued by {company.name} remain valid for 30 calendar days from the date of issuance unless explicitly stated otherwise in the proposal document.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
              <li>Prices quoted for air plug gauges, air ring gauges, and setting masters are based on workpiece drawing dimensions and specified material treatments.</li>
              <li>Turnkey automated multi-gauging stations require formal drawing approval and signed scope-of-work (SOW) before fixture manufacturing commences.</li>
            </ul>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <Wrench className="w-5 h-5" />
              <h2>2. Manufacturing Tolerances & Metrological Standards</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Precision inspection fixtures and gauging systems are manufactured according to Indian Standards (IS) and International Standards (DIN / ISO) for dimensional metrology.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-industrial-dark block mb-1">Setting Masters</span>
                <span>Calibrated using comparative masters traceable to national/international accreditation standards (NABL / ISO/IEC 17025).</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-industrial-dark block mb-1">Repeatability Guarantees</span>
                <span>Sub-micron repeatability claims apply under standard 20°C ambient cleanroom conditions and proper pneumatic filtration.</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <h2>3. Warranty & Field Service Support</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Under our motto <em>"Keeping Customers First"</em>, all electronic digital display units (DROs) and automated stations carry a 12-month standard warranty covering manufacturing defects.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consumable wear components (such as tungsten carbide tips or hard chrome plating worn through normal abrasive workpiece friction) are serviceable under scheduled maintenance agreements.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <AlertCircle className="w-5 h-5" />
              <h2>4. Governing Law & Jurisdiction</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              All commercial contracts, inquiries, and purchase orders shall be governed by the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in Coimbatore, Tamil Nadu, India.
            </p>
          </div>

        </div>
      </section>
    </>
  );
};

export default Terms;
