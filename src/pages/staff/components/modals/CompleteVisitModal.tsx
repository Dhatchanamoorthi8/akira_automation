import React from "react";
import { Modal, Label, Input, TextArea, Button, Spinner } from "@heroui/react";
import { X, AlertCircle, Check, MapPin } from "lucide-react";
import { FieldVisit } from "../../../../types/database";

interface CompleteVisitModalProps {
  visit: FieldVisit | null;
  outcomeNotes: string;
  setOutcomeNotes: (val: string) => void;
  photoUrl: string;
  setPhotoUrl: (val: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CompleteVisitModal: React.FC<CompleteVisitModalProps> = ({
  visit,
  outcomeNotes,
  setOutcomeNotes,
  photoUrl,
  setPhotoUrl,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}) => {
  if (!visit) return null;

  return (
    <Modal.Backdrop
      isOpen={!!visit}
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
                Check Out & Complete Field Visit
              </Modal.Heading>
              <p className="text-[11px] text-slate-500">{visit.title}</p>
            </div>
          </Modal.Header>

          <Modal.Body className="p-0 overflow-visible">
            {error && (
              <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">
                  Exact GPS Verification Active:
                </span>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  High-accuracy satellite GPS coordinates and physical site
                  address will be captured upon submission to authenticate
                  site departure.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Visit Outcome & Findings{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <TextArea
                  required
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Documented component dimensions. Customer agreed to standard 2-jet air ring gauge."
                  className="w-full text-xs font-sans"
                />
              </div>

              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Inspection Photo / Proof URL
                </Label>
                <Input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... (photo of setup or job card)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-mono"
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
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Confirm Check-out
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
