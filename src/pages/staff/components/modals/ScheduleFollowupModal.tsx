import React from "react";
import {
  Modal,
  Label,
  Input,
  TextArea,
  Select,
  ListBox,
  Button,
  Spinner,
} from "@heroui/react";
import { X, AlertCircle, Plus } from "lucide-react";
import { EnquiryWithDetails, FollowupPriority, FollowupType } from "../../../../types/database";
import { CreateFollowupFormData } from "../../types";
import { HeroUIDateTimePicker } from "../HeroUIDateTimePicker";

interface ScheduleFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  enquiries: EnquiryWithDetails[];
  createForm: CreateFollowupFormData;
  setCreateForm: React.Dispatch<React.SetStateAction<CreateFollowupFormData>>;
  isSubmitting: boolean;
  error: string | null;
}

export const ScheduleFollowupModal: React.FC<ScheduleFollowupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  enquiries,
  createForm,
  setCreateForm,
  isSubmitting,
  error,
}) => {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      isDismissable={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Container placement="center" size="lg">
        <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
          <Modal.CloseTrigger
            onPress={onClose}
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </Modal.CloseTrigger>
          <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
            <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
              Schedule New Follow-up
            </Modal.Heading>
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
                  Select Client Inquiry{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={createForm.enquiryId}
                  onChange={(val) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      enquiryId: (val as string) || "",
                    }))
                  }
                  className="w-full"
                  aria-label="Select Client Inquiry"
                  placeholder="-- Choose Assigned Client --"
                >
                  <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                    <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                    <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                  </Select.Trigger>
                  <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 max-h-60 overflow-y-auto">
                    <ListBox className="outline-none space-y-0.5">
                      {enquiries.map((e) => (
                        <ListBox.Item
                          key={e.id}
                          id={e.id}
                          textValue={`${e.name} ${e.company ? `(${e.company})` : ""}`}
                          className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                        >
                          <div>
                            <p className="font-semibold">{e.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {e.company || e.email}
                            </p>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Task Title
                </Label>
                <Input
                  type="text"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Call client regarding quotation feedback"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs"
                />
              </div>

              <HeroUIDateTimePicker
                isRequired
                granularity="minute"
                label={
                  <span className="font-semibold text-slate-700">
                    Scheduled Date & Time <span className="text-rose-500">*</span>
                  </span>
                }
                ariaLabel="Scheduled Date & Time"
                value={createForm.scheduledAt}
                onChange={(_dateVal, iso) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    scheduledAt: iso,
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Action Type
                  </Label>
                  <Select
                    value={createForm.type}
                    onChange={(val) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        type: (val as FollowupType) || "call",
                      }))
                    }
                    className="w-full"
                    aria-label="Action Type"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 capitalize" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50">
                      <ListBox className="outline-none space-y-0.5">
                        {[
                          { id: "call", label: "Phone Call" },
                          { id: "quotation", label: "Send Quotation" },
                          { id: "meeting", label: "Meeting / Visit" },
                          { id: "demo", label: "Live Demo" },
                          { id: "email", label: "Technical Email" },
                        ].map((t) => (
                          <ListBox.Item
                            key={t.id}
                            id={t.id}
                            textValue={t.label}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {t.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Priority
                  </Label>
                  <Select
                    value={createForm.priority}
                    onChange={(val) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        priority: (val as FollowupPriority) || "medium",
                      }))
                    }
                    className="w-full"
                    aria-label="Priority"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 capitalize" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50">
                      <ListBox className="outline-none space-y-0.5">
                        {[
                          { id: "urgent", label: "Urgent" },
                          { id: "high", label: "High" },
                          { id: "medium", label: "Medium" },
                          { id: "low", label: "Low" },
                        ].map((p) => (
                          <ListBox.Item
                            key={p.id}
                            id={p.id}
                            textValue={p.label}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {p.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="block font-semibold text-slate-700 mb-1">
                  Internal Notes
                </Label>
                <TextArea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Specific points to discuss or client requests..."
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
                  className="gap-1.5 font-semibold bg-industrial-blue hover:bg-sky-700 text-white"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Schedule Follow-up
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
