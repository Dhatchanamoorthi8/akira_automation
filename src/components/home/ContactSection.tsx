import React from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Award,
  Building
} from 'lucide-react';
import { Card, Chip } from '@heroui/react';
import { companyData } from '../../data/company';
import { EnquiryForm } from '../common/EnquiryForm';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { useCompanyEmails } from '../../hooks/useCompanyEmails';

interface ContactSectionProps {
  isStandalone?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ isStandalone = false }) => {
  const emails = useCompanyEmails();
  return (
    <SectionReveal id="contact-section" className={`py-10 sm:py-16 lg:py-20 ${isStandalone ? 'bg-white' : 'bg-industrial-bg'} border-b border-slate-200 overflow-hidden`}>
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="max-w-3xl mb-6 sm:mb-12">
          <Chip variant="soft" color="accent" size="sm" className="bg-sky-50 text-industrial-primary border border-sky-200/80 mb-3">
            <Chip.Label className="text-xs font-semibold uppercase tracking-wider font-mono">
              Official Registered Details & Inquiries
            </Chip.Label>
          </Chip>
          <h2 className="section-title mt-2">
            Connect With Us
          </h2>
          <p className="mt-2.5 sm:mt-3 text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
            "Connect with us to explore custom solutions tailored for your manufacturing needs."
          </p>
        </Reveal>

        {/* 2-Column Grid: Contact Information & B2B Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Official Contact Details from Slide 26 (5 cols) */}
          <Reveal direction="right" className="lg:col-span-5 space-y-4 sm:space-y-6">
            <Card variant="default" className="bg-white p-4 sm:p-8 rounded-xl border border-slate-200/90 shadow-subtle space-y-5 sm:space-y-6">
              
              <Card.Header className="p-0 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-industrial-primary">
                  <Building className="w-3.5 h-3.5" />
                  <span>Registered Details</span>
                </div>
                <Card.Title className="text-xl font-bold font-heading text-slate-900 mt-1">
                  {companyData.companyName}
                </Card.Title>
                <Card.Description className="text-xs text-slate-700 font-medium mt-0.5">
                  Established 2021 • Precision • Innovation • Quality
                </Card.Description>
              </Card.Header>

              {/* Address Card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900">Registered Office Address:</p>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {companyData.address.street},<br />
                    {companyData.address.village ? `${companyData.address.village}, ` : ''}{companyData.address.city},<br />
                    {companyData.address.district && <>{companyData.address.district},<br /></>}
                    {companyData.address.state}, PIN {companyData.address.pin}, India.
                  </p>
                </div>
              </div>

              {/* Emails Card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-industrial-dark">Official Inquiries & Sales:</p>
                  <div className="space-y-0.5">
                    {emails.map((email) => (
                      <a 
                        key={email}
                        href={`mailto:${email}`} 
                        className="text-industrial-primary font-medium hover:underline block"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phones Card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-industrial-dark">Direct Factory Contact Lines:</p>
                  <div className="space-y-0.5 font-mono">
                    <a 
                      href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} 
                      className="text-industrial-primary font-medium hover:underline block"
                    >
                      {companyData.phones[0]}
                    </a>
                    <a 
                      href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} 
                      className="text-industrial-primary font-medium hover:underline block"
                    >
                      {companyData.phones[1]}
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours Card */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-industrial-accent text-industrial-primary flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900">Operational Hours:</p>
                  <p className="text-slate-700 font-medium">{companyData.businessHours}</p>
                  <p className="text-xs text-industrial-secondary font-semibold">
                    Support for continuous manufacturing lines
                  </p>
                </div>
              </div>

              {/* Quality Commitment Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Award className="w-4 h-4 text-industrial-primary" />
                <span>Motto: "Keeping Customers First"</span>
              </div>

            </Card>
          </Reveal>

          {/* Right Column: B2B Enquiry Form (7 cols) */}
          <Reveal direction="left" delay={0.15} className="lg:col-span-7">
            <Card variant="default" className="bg-white p-4 sm:p-10 rounded-xl border border-slate-200/90 shadow-subtle">
              <Card.Header className="p-0 mb-6">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-industrial-primary">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Direct Engineering Quotation</span>
                </div>
                <Card.Title className="text-xl font-bold font-heading text-slate-900 mt-1">
                  Submit Gauging / Fixture Enquiry
                </Card.Title>
                <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                  Fill out the parameters below and our metrology technical team will prepare a structured proposal.
                </Card.Description>
              </Card.Header>

              <EnquiryForm variant="inline" idPrefix="contact-" />
            </Card>
          </Reveal>

        </div>

      </div>
    </SectionReveal>
  );
};

