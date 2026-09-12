import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, GraduationCap, Compass, Zap, Headphones, Phone } from 'lucide-react';
import { servicesData } from '../../data/services';
import { useEnquiry } from '../../context/EnquiryContext';
import { companyData } from '../../data/company';
import { SectionReveal } from '../animation/SectionReveal';
import { Reveal } from '../animation/Reveal';
import { StaggerContainer } from '../animation/StaggerContainer';
import { StaggerItem } from '../animation/StaggerItem';
import { SpotlightCard } from '../animation/SpotlightCard';

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  GraduationCap,
  Compass,
  Zap
};

export const ServiceSupportSection: React.FC = () => {
  const { openEnquiry } = useEnquiry();

  return (
    <SectionReveal className="py-10 sm:py-16 lg:py-20 bg-industrial-bg border-b border-slate-200 overflow-hidden">
      <div className="industrial-container">
        {/* Section Header */}
        <Reveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-12 gap-6">
          <div>
            <span className="section-tag">
              Lifecycle Engineering Support
            </span>
            <h2 className="section-title mt-3">
              Service & Support
            </h2>
            <p className="mt-2 text-base sm:text-lg font-bold text-industrial-primary font-heading">
              "We support beyond sales."
            </p>
            <p className="section-subtitle">
              Our commitment begins before commissioning and continues through operator training, routine calibration, and fast emergency service response.
            </p>
          </div>
          <button
            onClick={() => openEnquiry("Service & Technical Support")}
            className="btn-primary w-full sm:w-auto text-center justify-center shrink-0 self-start md:self-end"
          >
            <Headphones className="w-4 h-4" />
            <span>Talk to Our Technical Team</span>
          </button>
        </Reveal>

        {/* 4 Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {servicesData.map((srv) => {
            const Icon = iconMap[srv.iconName] || Wrench;
            return (
              <StaggerItem key={srv.id}>
                <SpotlightCard
                  spotlightColor="rgba(14, 116, 144, 0.08)"
                  className="card-base card-hover p-4 sm:p-6 flex flex-col justify-between group border-slate-200 bg-white h-full"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-industrial-accent text-industrial-primary flex items-center justify-center group-hover:bg-industrial-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-industrial-dark font-heading group-hover:text-industrial-primary transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-industrial-muted mt-2 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      {srv.details.slice(0, 2).map((d, idx) => (
                        <p key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="text-industrial-primary font-bold">•</span>
                          <span className="line-clamp-2">{d}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-industrial-primary group-hover:text-industrial-hover transition-colors"
                    >
                      <span>Full Service Details</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Hotline Banner */}
        <Reveal direction="up" delay={0.2} className="mt-6 sm:mt-12 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5 text-xs text-slate-700">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-industrial-dark font-heading">Direct Technical Support Hotline</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-xs text-industrial-primary font-semibold">
                <a href={`tel:${companyData.phones[0].replace(/\s+/g, '')}`} className="hover:underline">
                  {companyData.phones[0]}
                </a>
                <span className="text-slate-400">/</span>
                <a href={`tel:${companyData.phones[1].replace(/\s+/g, '')}`} className="hover:underline">
                  {companyData.phones[1]}
                </a>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 sm:text-right max-w-xs leading-relaxed border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            Service available across all automotive and industrial manufacturing corridors in India.
          </p>
        </Reveal>

      </div>
    </SectionReveal>
  );
};
