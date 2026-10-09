import React from "react";
import { Modal, Label, TextArea, Select, ListBox, Button, Spinner } from "@heroui/react";
import { X, AlertCircle, XCircle } from "lucide-react";
import { EnquiryWithDetails } from "../../../../types/database";
import { LOST_REASONS } from "../../constants";

interface CloseLeadModalProps {
  enquiry: EnquiryWithDetails | null;
  lostReason: string;
  setLostReason: (val: string) => void;
  lostNotes: string;
  setLostNotes: (val: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CloseLeadModal: React.FC<CloseLeadModalProps> = ({
  enquiry,
  lostReason,
  setLostReason,
  lostNotes,
  setLostNotes,
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
                Close Lead (Lost Opportunity)
              </Modal.Heading>
              <p className="text-[11px] text-slate-500">
                Client: {enquiry.name} ({enquiry.company || "N/A"})
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
                  Primary Reason for Closing{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={lostReason}
                  onChange={(val) => setLostReason((val as string) || "")}
                  className="w-full"
                  aria-label="Primary Reason for Closing"
                >
                  <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                    <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                    <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                  </Select.Trigger>
                  <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[240px]">
                    <ListBox className="outline-none space-y-0.5">
                      {LOST_REASONS.map((r) => (
                        <ListBox.Item
                          key={r}
                          id={r}
                          textValue={r}
                          className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                        >
                          {r}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Detailed Explanation
                </Label>
                <TextArea
                  rows={3}
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="Provide context on why the client opted not to proceed..."
                  className="w-full text-xs font-sans"
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
                  size="sm"
                  isDisabled={isSubmitting}
                  className="gap-1.5 bg-slate-800 text-white font-semibold hover:bg-slate-900"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Closure
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
