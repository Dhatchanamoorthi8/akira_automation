import React from "react";
import {
  Modal,
  Form,
  Alert,
  Surface,
  Select,
  ListBox,
  Label,
  Description,
  FieldError,
  TextField,
  Input,
  TextArea,
  Checkbox,
  DatePicker,
  DateField,
  Calendar,
  Button,
  Spinner,
} from "@heroui/react";
import { X, UserPlus, FileText } from "lucide-react";
import { DateValue, getLocalTimeZone } from "@internationalized/date";
import { FollowupPriority, FollowupType } from "../../../../types/database";
import { productCategories } from "../../../../data/productSummaries";
import { industries } from "../../../../data/industries";
import { LeadFormData } from "../../types";
import { LEAD_SOURCE_OPTIONS } from "../../constants";

interface AddLeadModalProps {
  isOpen: boolean;
  leadForm: LeadFormData;
  setLeadForm: React.Dispatch<React.SetStateAction<LeadFormData>>;
  leadFollowupDateValue: DateValue | null;
  setLeadFollowupDateValue: (val: DateValue | null) => void;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  leadForm,
  setLeadForm,
  leadFollowupDateValue,
  setLeadFollowupDateValue,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      isDismissable={false}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
      className="z-50"
    >
      <Modal.Container placement="center" size="lg" className="p-3 sm:p-6 flex items-center justify-center">
        <Modal.Dialog className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[88vh] flex flex-col relative overflow-hidden my-auto">
          <Modal.CloseTrigger
            onPress={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none z-10"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </Modal.CloseTrigger>

          <Form
            id="add-offline-lead-form"
            validationBehavior="native"
            onSubmit={onSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <Modal.Header className="px-6 py-4.5 border-b border-slate-100 flex-shrink-0 bg-white pr-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <Modal.Heading className="text-base font-bold text-industrial-dark font-heading">
                    Add Offline Customer / Inbound Lead
                  </Modal.Heading>
                  <p className="text-xs text-slate-500">
                    Record walk-in clients, direct phone calls, WhatsApp inquiries, and trade expo contacts into your CRM.
                  </p>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
              {error && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Submission Error</Alert.Title>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}

              {/* Surface 1: Customer Contact & Source */}
              <Surface className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 bg-slate-50/70 border border-slate-200/80">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer Contact & Source</span>
                </h4>

                <Select
                  fullWidth
                  isRequired
                  value={leadForm.source}
                  onChange={(val) =>
                    setLeadForm((prev) => ({
                      ...prev,
                      source: (val as string) || "offline_walkin",
                    }))
                  }
                  aria-label="Customer / Lead Source"
                >
                  <Label>Customer / Lead Source</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="min-w-[280px]">
                    <ListBox>
                      {LEAD_SOURCE_OPTIONS.map((s) => (
                        <ListBox.Item key={s.id} id={s.id} textValue={s.label}>
                          {s.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  <Description>Origin of customer interaction or lead source</Description>
                  <FieldError />
                </Select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    isRequired
                    fullWidth
                    name="name"
                    value={leadForm.name}
                    onChange={(val) =>
                      setLeadForm((prev) => ({ ...prev, name: val }))
                    }
                    validate={(value) => {
                      if (!value || !value.trim()) {
                        return "Contact person / customer name is required";
                      }
                      return null;
                    }}
                  >
                    <Label>Contact Person / Customer Name</Label>
                    <Input placeholder="e.g. Rajesh Kumar" />
                    <Description>Primary contact person name</Description>
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    name="companyName"
                    value={leadForm.companyName}
                    onChange={(val) =>
                      setLeadForm((prev) => ({ ...prev, companyName: val }))
                    }
                  >
                    <Label>Company / Workshop Name</Label>
                    <Input placeholder="e.g. Precision Engineering Works" />
                    <Description>Registered company or shop</Description>
                    <FieldError />
                  </TextField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    fullWidth
                    name="phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(val) =>
                      setLeadForm((prev) => ({ ...prev, phone: val }))
                    }
                    validate={(val) => {
                      if (!leadForm.email.trim() && (!val || !val.trim())) {
                        return "Please enter at least a phone number or email address";
                      }
                      return null;
                    }}
                  >
                    <Label>Phone / WhatsApp Number</Label>
                    <Input placeholder="e.g. +91 98765 43210" />
                    <Description>WhatsApp or calling number</Description>
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={leadForm.email}
                    onChange={(val) =>
                      setLeadForm((prev) => ({ ...prev, email: val }))
                    }
                    validate={(val) => {
                      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                        return "Please enter a valid email address";
                      }
                      return null;
                    }}
                  >
                    <Label>
                      Email Address{" "}
                      <span className="text-slate-400 font-normal text-[11px]">
                        (Optional for offline)
                      </span>
                    </Label>
                    <Input placeholder="e.g. purchase@precisionworks.com" />
                    <Description>Official RFQ or purchase email</Description>
                    <FieldError />
                  </TextField>
                </div>
              </Surface>

              {/* Surface 2: Technical Interest & Requirements */}
              <Surface className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 bg-slate-50/70 border border-slate-200/80">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Technical Interest & Gauging Requirements</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    fullWidth
                    value={leadForm.industry}
                    onChange={(val) =>
                      setLeadForm((prev) => ({
                        ...prev,
                        industry: (val as string) || "",
                      }))
                    }
                    aria-label="Industry Vertical"
                    placeholder="-- Select Industry --"
                  >
                    <Label>Industry Vertical</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="max-h-60 overflow-y-auto">
                      <ListBox>
                        {industries.map((ind) => (
                          <ListBox.Item key={ind.id} id={ind.name} textValue={ind.name}>
                            {ind.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <Description>Customer industry domain</Description>
                  </Select>

                  <Select
                    fullWidth
                    value={leadForm.productCategory}
                    onChange={(val) =>
                      setLeadForm((prev) => ({
                        ...prev,
                        productCategory: (val as string) || "",
                      }))
                    }
                    aria-label="Product Category"
                    placeholder="-- Select Category --"
                  >
                    <Label>Product Category</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="max-h-60 overflow-y-auto">
                      <ListBox>
                        {productCategories
                          .filter((c) => c.slug !== "all")
                          .map((cat) => (
                            <ListBox.Item key={cat.slug} id={cat.name} textValue={cat.name}>
                              {cat.name}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                      </ListBox>
                    </Select.Popover>
                    <Description>Gauging product group</Description>
                  </Select>
                </div>

                <TextField
                  fullWidth
                  name="specificProduct"
                  value={leadForm.specificProduct}
                  onChange={(val) =>
                    setLeadForm((prev) => ({ ...prev, specificProduct: val }))
                  }
                >
                  <Label>Specific Gauge / Tooling Model Interest</Label>
                  <Input placeholder="e.g. Air Plug Gauge Ø25H7, Electronic Snap Gauge, Column Unit" />
                  <Description>Exact bore diameter, tolerance class, or unit</Description>
                  <FieldError />
                </TextField>

                <TextField
                  fullWidth
                  name="notes"
                  value={leadForm.notes}
                  onChange={(val) =>
                    setLeadForm((prev) => ({ ...prev, notes: val }))
                  }
                >
                  <Label>Customer Requirement / Discussion Notes</Label>
                  <TextArea
                    rows={3}
                    placeholder="Mention tolerances, bore depths, production quantities, or specific customer requests discussed..."
                  />
                  <Description>Technical specifications discussed during interaction</Description>
                  <FieldError />
                </TextField>
              </Surface>

              {/* Surface 3: Immediate Follow-up Task Scheduling */}
              <Surface className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 bg-emerald-50/50 border border-emerald-200/80">
                <Checkbox
                  isSelected={leadForm.scheduleFollowup}
                  onChange={(isSelected) =>
                    setLeadForm((prev) => ({
                      ...prev,
                      scheduleFollowup: isSelected,
                    }))
                  }
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-950">
                      Schedule immediate follow-up task for this lead
                    </span>
                  </Checkbox.Content>
                  <Description className="ml-7 text-[11px] text-slate-500">
                    Automatically creates an actionable task assigned to you in your CRM pipeline
                  </Description>
                </Checkbox>

                {leadForm.scheduleFollowup && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <DatePicker
                      granularity="day"
                      isRequired
                      value={leadFollowupDateValue}
                      onChange={(val) => {
                        setLeadFollowupDateValue(val);
                        if (val) {
                          try {
                            const tz = getLocalTimeZone();
                            const iso =
                              "toDate" in val && typeof (val as any).toDate === "function"
                                ? (val as any).toDate(tz).toISOString().slice(0, 10)
                                : new Date(val.toString()).toISOString().slice(0, 10);
                            setLeadForm((prev) => ({ ...prev, followupDate: iso }));
                          } catch {
                            setLeadForm((prev) => ({ ...prev, followupDate: val.toString() }));
                          }
                        } else {
                          setLeadForm((prev) => ({ ...prev, followupDate: "" }));
                        }
                      }}
                      className="w-full"
                      aria-label="Follow-up Date"
                    >
                      <Label>Follow-up Date</Label>
                      <DateField.Group fullWidth>
                        <DateField.Input>
                          {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger>
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover className="flex flex-col gap-3">
                        <Calendar aria-label="Follow-up Date">
                          <Calendar.Header>
                            <Calendar.YearPickerTrigger>
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                          </Calendar.Header>
                          <Calendar.Grid>
                            <Calendar.GridHeader>
                              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => <Calendar.Cell date={date} />}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid>
                            <Calendar.YearPickerGridBody>
                              {({ year }) => <Calendar.YearPickerCell year={year} />}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                      <FieldError />
                    </DatePicker>

                    <Select
                      fullWidth
                      value={leadForm.followupType}
                      onChange={(val) =>
                        setLeadForm((prev) => ({
                          ...prev,
                          followupType: (val as FollowupType) || "call",
                        }))
                      }
                      aria-label="Action Type"
                    >
                      <Label>Action Type</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {[
                            { id: "call", label: "Phone Call" },
                            { id: "quotation", label: "Send Quotation" },
                            { id: "meeting", label: "Customer Visit" },
                            { id: "demo", label: "Product Demo" },
                            { id: "email", label: "Email Catalog" },
                          ].map((t) => (
                            <ListBox.Item key={t.id} id={t.id} textValue={t.label}>
                              {t.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    <Select
                      fullWidth
                      value={leadForm.followupPriority}
                      onChange={(val) =>
                        setLeadForm((prev) => ({
                          ...prev,
                          followupPriority: (val as FollowupPriority) || "medium",
                        }))
                      }
                      aria-label="Priority"
                    >
                      <Label>Priority</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {[
                            { id: "urgent", label: "Urgent" },
                            { id: "high", label: "High" },
                            { id: "medium", label: "Medium" },
                            { id: "low", label: "Low" },
                          ].map((p) => (
                            <ListBox.Item key={p.id} id={p.id} textValue={p.label}>
                              {p.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                )}
              </Surface>
            </Modal.Body>

            <Modal.Footer className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onPress={onClose}
                isDisabled={isSubmitting}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isPending={isSubmitting}
                isDisabled={isSubmitting}
                onPress={() => onSubmit()}
                className="gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs px-5"
              >
                {({ isPending }) => (
                  <>
                    {isPending ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>Save Customer Lead</span>
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
