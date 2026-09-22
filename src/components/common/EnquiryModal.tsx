import React from 'react';
import { Modal, Button, Chip } from '@heroui/react';
import { X, ShieldCheck, Phone, Clock, ArrowUpRight } from 'lucide-react';
import { company } from '../../config/company';
import { useEnquiry } from '../../context/EnquiryContext';
import { companyData } from '../../data/company';
import { EnquiryForm } from './EnquiryForm';

export const EnquiryModal: React.FC = () => {
  const { isOpen, selectedProduct, closeEnquiry } = useEnquiry();

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeEnquiry();
        }
      }}
      variant="blur"
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-industrial-dark/65 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <Modal.Container size="full" scroll="inside" className="w-full max-w-2xl max-h-[92vh]">
        <Modal.Dialog
          className="bg-white rounded-2xl shadow-elevated border border-slate-200/90 w-full overflow-hidden relative flex flex-col p-0 focus:outline-none animate-in zoom-in-95 duration-200"
          aria-labelledby="enquiry-modal-title"
          aria-describedby="enquiry-modal-subtitle"
        >
          {/* Modal Header */}
          <Modal.Header className="bg-gradient-to-r from-industrial-dark via-[#0d2740] to-industrial-dark text-white p-5 sm:p-6 border-b border-slate-800/80 relative flex flex-col gap-2 shrink-0">
            {/* Top row: Engineering Badge & HeroUI CloseTrigger */}
            <div className="flex items-center justify-between gap-3">
              <Chip
                size="sm"
                variant="secondary"
                className="bg-sky-500/15 text-sky-300 border border-sky-400/30 font-mono font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Technical Sales & Engineering Enquiry</span>
              </Chip>

              <Modal.CloseTrigger
                aria-label="Close enquiry modal"
                onPress={closeEnquiry}
                className="static sm:absolute sm:end-5 sm:top-5 p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </Modal.CloseTrigger>
            </div>

            {/* Modal Heading & Subtitle */}
            <div className="sm:pr-10">
              <Modal.Heading
                id="enquiry-modal-title"
                className="text-lg sm:text-xl font-bold font-heading text-white tracking-tight leading-snug"
              >
                Request Technical Proposal & Quotation
              </Modal.Heading>
              <p
                id="enquiry-modal-subtitle"
                className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5"
              >
                <span className="font-semibold text-slate-200">{company.name}</span>
                <span className="w-1 h-1 rounded-full bg-sky-400/80" />
                <span>Precision Gauging & Fixture Systems</span>
              </p>
            </div>
          </Modal.Header>

          {/* Modal Body */}
          <Modal.Body className="p-4 sm:px-8 sm:py-6 overflow-y-auto max-h-[calc(92vh-165px)]">
            <EnquiryForm
              variant="modal"
              idPrefix="modal-"
              preselectedProduct={selectedProduct}
              onCancel={closeEnquiry}
            />
          </Modal.Body>

          {/* Modal Footer with HeroUI Button & Chip */}
          <Modal.Footer className="px-4 py-3 sm:px-8 sm:py-3.5 bg-slate-50/95 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Button
                onPress={() => {
                  window.location.href = `tel:${companyData.phones[0].replace(/[^0-9+]/g, '')}`;
                }}
                size="sm"
                variant="outline"
                className="h-8 px-2.5 sm:px-3 text-xs font-mono font-bold inline-flex items-center gap-1.5 rounded-lg border-slate-300 text-industrial-dark hover:border-industrial-primary hover:text-industrial-primary bg-white shadow-xs transition-colors cursor-pointer"
                aria-label={`Call Akira factory desk: ${companyData.phones[0]}`}
              >
                <Phone className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Call: {companyData.phones[0]}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <Chip
                size="sm"
                variant="secondary"
                className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>≤ 24h Engineering SLA</span>
              </Chip>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Est. 2021 • Tamil Nadu, India
              </span>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
