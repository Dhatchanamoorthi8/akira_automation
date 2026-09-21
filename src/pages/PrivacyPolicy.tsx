import React from 'react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { companyData } from '../data/company';
import { ShieldCheck, Lock, Eye, FileText, Mail, Phone } from 'lucide-react';
import { Reveal } from '../components/animation/Reveal';
import { createBreadcrumbSchema } from '../config/seo';

export const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Data Protection & Commercial Confidentiality"
        description={`Privacy policy and data protection standards of ${company.name}. Learn how we safeguard your engineering drawings, RFQ data, and business inquiries.`}
        keywords={`Privacy Policy, Data Protection, Commercial Confidentiality, ${company.name}`}
        canonicalPath="/privacy-policy"
        structuredData={createBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy-policy' }
        ])}
      />

      {/* Header */}
      <section className="bg-industrial-dark text-white py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-grid opacity-20 pointer-events-none" />
        <div className="industrial-container relative z-10">
          <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
          <Reveal direction="up" className="max-w-3xl mt-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-sky-950/70 text-sky-300 border border-sky-800/70">
              <ShieldCheck className="w-3.5 h-3.5" />
              Institutional Trust & Governance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mt-3">
              Privacy & Confidentiality Policy
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              At {company.name}, we hold our clients' engineering designs, component drawings, and commercial inquiries with the strictest standards of professional confidentiality.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-industrial-bg">
        <div className="industrial-container max-w-4xl space-y-12">
          
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <Lock className="w-5 h-5" />
              <h2>1. Confidentiality of Engineering Drawings & Technical Data</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              When you submit 2D drawings, 3D CAD files (STEP, IGES, DXF), tolerance specifications, or component samples for technical review or quotation, they remain the exclusive intellectual property of your organization.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
              <li>All technical files are accessible solely to authorized design and application engineers directly involved in your gauging project.</li>
              <li>We execute Non-Disclosure Agreements (NDAs) upon request before reviewing proprietary parts or OEM manufacturing blueprints.</li>
              <li>Technical data is never sold, shared, or distributed to any third party under any circumstances.</li>
            </ul>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <Eye className="w-5 h-5" />
              <h2>2. Information We Collect and Purpose</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              We collect information provided directly by you when submitting inquiries, requesting quotations, or contacting our technical sales desk:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-industrial-dark block mb-1">Contact Details</span>
                <span>Full name, organization name, corporate email address, and telephone number for commercial correspondence.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-industrial-dark block mb-1">Engineering Requirements</span>
                <span>Component dimensions, tolerances, production cycle requirements, and tooling parameters.</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <FileText className="w-5 h-5" />
              <h2>3. Data Storage & Security Standards</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Our web infrastructure utilizes encrypted HTTPS transport (TLS 1.3) everywhere. Access to databases and internal systems is restricted by role-based access control and multi-factor authentication. We do not process direct consumer payment card transactions on this platform.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-industrial-primary font-heading font-bold text-lg">
              <Mail className="w-5 h-5" />
              <h2>4. Contact Our Data & Privacy Desk</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              If you have any questions regarding this Privacy Policy, wish to execute an NDA, or request the deletion of your inquiry records, please contact our compliance desk:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <p><strong className="text-industrial-dark">Entity:</strong> {company.name}</p>
              <p><strong className="text-industrial-dark">Email:</strong> {companyData.emails[0]} (cc: {company.ccEmail})</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-industrial-primary inline" /> <strong className="text-industrial-dark">Phone:</strong> {companyData.phones[0]} / {companyData.phones[1]}</p>
              <p><strong className="text-industrial-dark">Address:</strong> {companyData.address.fullAddress}</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
