import React from "react";
import { Modal, Label, TextArea, Checkbox, Button, Spinner } from "@heroui/react";
import { X, AlertCircle, Check } from "lucide-react";
import { FollowupWithEnquiry } from "../../../../types/database";
import { HeroUIDateTimePicker } from "../HeroUIDateTimePicker";

interface CompleteFollowupModalProps {
  task: FollowupWithEnquiry | null;
  outcomeNotes: string;
  setOutcomeNotes: (val: string) => void;
  scheduleNext: boolean;
  setScheduleNext: (val: boolean) => void;
  nextDate: string;
  setNextDate: (val: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CompleteFollowupModal: React.FC<CompleteFollowupModalProps> = ({
  task,
  outcomeNotes,
  setOutcomeNotes,
  scheduleNext,
  setScheduleNext,
  nextDate,
  setNextDate,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}) => {
  if (!task) return null;

  return (
    <Modal.Backdrop
      isOpen={!!task}
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
                Complete CRM Follow-up
              </Modal.Heading>
              <p className="text-[11px] text-slate-500">
                Customer: {task.enquiry?.name} ({task.enquiry?.company})
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
                <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                  Customer Outcome & Technical Notes{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <TextArea
                  required
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="e.g. Discussed air plug gauge tolerances. Customer requested formal quotation by Friday."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <Checkbox
                  isSelected={scheduleNext}
                  onChange={(isSelected) => setScheduleNext(isSelected)}
                  className="font-semibold text-slate-700 text-xs"
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <span>Schedule successive touchpoint</span>
                  </Checkbox.Content>
                </Checkbox>

                {scheduleNext && (
                  <HeroUIDateTimePicker
                    isRequired={scheduleNext}
                    granularity="minute"
                    label={
                      <span className="text-[11px] font-semibold text-slate-600">
                        Next Touchpoint Date & Time
                      </span>
                    }
                    ariaLabel="Next Touchpoint Date & Time"
                    value={nextDate}
                    onChange={(_dateVal, iso) => setNextDate(iso)}
                  />
                )}
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
                  Confirm Complete
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
