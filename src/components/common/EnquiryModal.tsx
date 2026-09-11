import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Phone } from 'lucide-react';
import { company } from '../../config/company';
import { useEnquiry } from '../../context/EnquiryContext';
import { companyData } from '../../data/company';
import { EnquiryForm } from './EnquiryForm';

export const EnquiryModal: React.FC = () => {
  const { isOpen, selectedProduct, closeEnquiry } = useEnquiry();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Set initial focus to close button or first focusable element
      const focusTimer = requestAnimationFrame(() => {
        if (modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            focusables[0].focus();
          }
        }
      });

      // Escape key closing and keyboard focus trap
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeEnquiry();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusables = Array.from(
            modalRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        cancelAnimationFrame(focusTimer);
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isOpen, closeEnquiry]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-dark/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeEnquiry();
        }
      }}
      aria-hidden={!isOpen}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
        aria-describedby="enquiry-modal-subtitle"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="bg-industrial-dark text-white p-4 sm:p-6 sticky top-0 z-10 flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-industrial-highlight uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Technical Sales & Engineering Enquiry
            </div>
            <h2 id="enquiry-modal-title" className="text-lg sm:text-xl font-bold font-heading">
              Request Technical Proposal & Quotation
            </h2>
            <p id="enquiry-modal-subtitle" className="text-xs text-slate-300 mt-0.5 sm:mt-1">
              {company.name} • Precision Gauging & Fixture Systems
            </p>
          </div>
          <button
            type="button"
            onClick={closeEnquiry}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-primary shrink-0 ml-2"
            aria-label="Close enquiry modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:px-8 sm:py-6">
          <EnquiryForm
            variant="modal"
            idPrefix="modal-"
            preselectedProduct={selectedProduct}
            onCancel={closeEnquiry}
          />

          {/* Quick Contact Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-industrial-primary" />
              <span>Direct factory call: <strong className="font-mono text-industrial-dark">{companyData.phones[0]}</strong></span>
            </div>
            <span>Est. 2021 • Tamil Nadu, India</span>
          </div>
        </div>
      </div>
    </div>
  );
};
