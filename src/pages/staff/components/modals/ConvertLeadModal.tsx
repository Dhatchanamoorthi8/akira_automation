import React from "react";
import { Modal, Label, Input, TextArea, Button, Spinner } from "@heroui/react";
import { X, AlertCircle, TrendingUp } from "lucide-react";
import { EnquiryWithDetails } from "../../../../types/database";
import { DealFormData } from "../../types";
import { HeroUIDateTimePicker } from "../HeroUIDateTimePicker";

interface ConvertLeadModalProps {
  enquiry: EnquiryWithDetails | null;
  dealForm: DealFormData;
  setDealForm: React.Dispatch<React.SetStateAction<DealFormData>>;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  enquiry,
  dealForm,
  setDealForm,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}) => {
  if (!enquiry) return null;

  return (
    <Modal.Backdrop
      isOpen={!!enquiry}
      isDismissable={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Container placement="center" className="w-full max-w-md">
        <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
          <Modal.CloseTrigger
            onPress={onClose}
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </Modal.CloseTrigger>
          <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
            <div>
              <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                Convert Lead to Active Deal
              </Modal.Heading>
              <p className="text-[11px] text-slate-500">
                Client: {enquiry.name} ({enquiry.company || "Direct Client"})
              </p>
            </div>
          </Modal.Header>

          <Modal.Body className="p-0 overflow-visible">
            {error && (
              <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Deal Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="text"
                  value={dealForm.dealTitle}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, dealTitle: e.target.value })
                  }
                  placeholder="e.g. 5x Electronic Column Gauges - Batch 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Estimated Deal Value (₹)
                  </Label>
                  <Input
                    type="number"
                    value={dealForm.dealValue}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, dealValue: e.target.value })
                    }
                    placeholder="e.g. 250000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <HeroUIDateTimePicker
                  granularity="day"
                  label={
                    <span className="font-semibold text-slate-700">
                      Expected Close Date
                    </span>
                  }
                  ariaLabel="Expected Close Date"
                  value={dealForm.expectedCloseDate}
                  onChange={(_dateVal, iso) =>
                    setDealForm((prev) => ({
                      ...prev,
                      expectedCloseDate: iso,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Conversion Notes
                </Label>
                <TextArea
                  rows={2}
                  value={dealForm.notes}
                  onChange={(e) =>
                    setDealForm({ ...dealForm, notes: e.target.value })
                  }
                  placeholder="Client agreed on technical parameters and formal proposal..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={onClose}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isDisabled={isSubmitting}
                  className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5" />
                  )}
                  Confirm Deal Conversion
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
