import React from "react";
import {
  Form,
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
  Button,
  Spinner,
  Chip,
  Alert,
  Card,
} from "@heroui/react";
import {
  ArrowLeft,
  PersonPlus,
  Pin,
  Receipt,
  Plus,
  Clock,
  TrashBin,
  CircleCheck,
  Magnifier,
} from "@gravity-ui/icons";
import { DateValue, getLocalTimeZone } from "@internationalized/date";
import {
  EnquiryWithDetails,
  FollowupPriority,
  FollowupType,
  Invoice,
  InvoiceType,
  VisitPurpose,
} from "../../../../types/database";
import { Product } from "../../../../types";
import { CustomerSearchResult } from "../../../../services/invoiceService";
import {
  CreateFollowupFormData,
  FormViewType,
  InvoiceFormData,
  LeadFormData,
  VisitFormData,
} from "../../types";
import {
  GST_RATE_OPTIONS,
  INVOICE_TYPE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  VISIT_PURPOSE_OPTIONS,
} from "../../constants";
import { productCategories } from "../../../../data/productSummaries";
import { industries } from "../../../../data/industries";

import { HeroUIDateTimePicker } from "../HeroUIDateTimePicker";
export { HeroUIDateTimePicker };

export interface StaffDynamicFormScreenProps {
  formType: FormViewType;
  onClose: () => void;
  enquiries: EnquiryWithDetails[];

  // Lead Form Props
  leadForm?: LeadFormData;
  setLeadForm?: React.Dispatch<React.SetStateAction<LeadFormData>>;
  leadFollowupDateValue?: DateValue | null;
  setLeadFollowupDateValue?: (val: DateValue | null) => void;
  isSubmittingLead?: boolean;
  leadError?: string | null;
  onSubmitLead?: (e?: React.FormEvent) => void;

  // Visit Form Props
  visitForm?: VisitFormData;
  setVisitForm?: React.Dispatch<React.SetStateAction<VisitFormData>>;
  visitDateValue?: DateValue | null;
  setVisitDateValue?: (val: DateValue | null) => void;
  isSubmittingVisit?: boolean;
  visitError?: string | null;
  onSubmitVisit?: (e: React.FormEvent) => void;

  // Invoice Form Props
  editingInvoice?: Invoice | null;
  invoiceForm?: InvoiceFormData;
  setInvoiceForm?: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
  productCatalog?: Product[];
  customerSearchQuery?: string;
  customerSuggestions?: CustomerSearchResult[];
  isSearchingCustomers?: boolean;
  handleCustomerSearch?: (val: string) => void;
  handleSelectCustomer?: (c: CustomerSearchResult) => void;
  isSubmittingInvoice?: boolean;
  invoiceErrorMsg?: string | null;
  setInvoiceErrorMsg?: (msg: string | null) => void;
  onSubmitInvoice?: (e: React.FormEvent<HTMLFormElement>) => void;

  // Follow-up Form Props
  createFollowupForm?: CreateFollowupFormData;
  setCreateFollowupForm?: React.Dispatch<
    React.SetStateAction<CreateFollowupFormData>
  >;
  followupDateValue?: DateValue | null;
  setFollowupDateValue?: (val: DateValue | null) => void;
  isSubmittingFollowup?: boolean;
  followupError?: string | null;
  onSubmitFollowup?: (e: React.FormEvent) => void;
}

export const StaffDynamicFormScreen: React.FC<StaffDynamicFormScreenProps> = ({
  formType,
  onClose,
  enquiries,

  leadForm,
  setLeadForm,
  leadFollowupDateValue,
  setLeadFollowupDateValue,
  isSubmittingLead = false,
  leadError,
  onSubmitLead,

  visitForm,
  setVisitForm,
  visitDateValue,
  setVisitDateValue,
  isSubmittingVisit = false,
  visitError,
  onSubmitVisit,

  editingInvoice,
  invoiceForm,
  setInvoiceForm,
  productCatalog = [],
  customerSearchQuery = "",
  customerSuggestions = [],
  handleCustomerSearch,
  handleSelectCustomer,
  isSubmittingInvoice = false,
  invoiceErrorMsg,
  setInvoiceErrorMsg,
  onSubmitInvoice,

  createFollowupForm,
  setCreateFollowupForm,
  followupDateValue,
  setFollowupDateValue,
  isSubmittingFollowup = false,
  followupError,
  onSubmitFollowup,
}) => {
  // Date values state management with fallback
  const [localLeadDateValue, setLocalLeadDateValue] =
    React.useState<DateValue | null>(null);
  const activeLeadDate =
    leadFollowupDateValue !== undefined
      ? leadFollowupDateValue
      : localLeadDateValue;
  const handleLeadDateChange = (val: DateValue | null, isoStr?: string) => {
    if (setLeadFollowupDateValue) setLeadFollowupDateValue(val);
    setLocalLeadDateValue(val);
    if (setLeadForm) {
      if (val) {
        try {
          const tz = getLocalTimeZone();
          const iso =
            isoStr ||
            ("toDate" in val && typeof (val as any).toDate === "function"
              ? (val as any).toDate(tz).toISOString().slice(0, 10)
              : new Date(val.toString()).toISOString().slice(0, 10));
          setLeadForm((prev: LeadFormData) => ({ ...prev, followupDate: iso }));
        } catch {
          setLeadForm((prev: LeadFormData) => ({
            ...prev,
            followupDate: isoStr || val.toString(),
          }));
        }
      } else {
        setLeadForm((prev: LeadFormData) => ({ ...prev, followupDate: "" }));
      }
    }
  };

  const [localVisitDateValue, setLocalVisitDateValue] =
    React.useState<DateValue | null>(null);
  const activeVisitDate =
    visitDateValue !== undefined ? visitDateValue : localVisitDateValue;
  const handleVisitDateChange = (val: DateValue | null, isoStr?: string) => {
    if (setVisitDateValue) setVisitDateValue(val);
    setLocalVisitDateValue(val);
    if (setVisitForm) {
      if (val) {
        try {
          const tz = getLocalTimeZone();
          const iso =
            isoStr ||
            ("toDate" in val && typeof (val as any).toDate === "function"
              ? (val as any).toDate(tz).toISOString()
              : new Date(val.toString()).toISOString());
          setVisitForm((prev: VisitFormData) => ({ ...prev, scheduledAt: iso }));
        } catch {
          setVisitForm((prev: VisitFormData) => ({
            ...prev,
            scheduledAt: isoStr || val.toString(),
          }));
        }
      } else {
        setVisitForm((prev: VisitFormData) => ({ ...prev, scheduledAt: "" }));
      }
    }
  };

  const [localFollowupDateValue, setLocalFollowupDateValue] =
    React.useState<DateValue | null>(null);
  const activeFollowupDate =
    followupDateValue !== undefined
      ? followupDateValue
      : localFollowupDateValue;
  const handleFollowupDateChange = (val: DateValue | null, isoStr?: string) => {
    if (setFollowupDateValue) setFollowupDateValue(val);
    setLocalFollowupDateValue(val);
    if (setCreateFollowupForm) {
      if (val) {
        try {
          const tz = getLocalTimeZone();
          const iso =
            isoStr ||
            ("toDate" in val && typeof (val as any).toDate === "function"
              ? (val as any).toDate(tz).toISOString()
              : new Date(val.toString()).toISOString());
          setCreateFollowupForm((prev: CreateFollowupFormData) => ({
            ...prev,
            scheduledAt: iso,
          }));
        } catch {
          setCreateFollowupForm((prev: CreateFollowupFormData) => ({
            ...prev,
            scheduledAt: isoStr || val.toString(),
          }));
        }
      } else {
        setCreateFollowupForm((prev: CreateFollowupFormData) => ({
          ...prev,
          scheduledAt: "" as string,
        }));
      }
    }
  };
  // Config definition per form type
  const formConfigs: Record<
    FormViewType,
    {
      title: string;
      badge: string;
      icon: typeof Plus;
      iconBg: string;
      description: string;
      backText: string;
      formId: string;
      submitLabel: string;
      isSubmitting: boolean;
      error?: string | null;
    }
  > = {
    lead: {
      title: "Add Offline Customer / Inbound Lead",
      badge: "Inbound Pipeline",
      icon: PersonPlus,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      description:
        "Record walk-in clients, direct phone calls, WhatsApp inquiries, and trade expo contacts into your CRM.",
      backText: "Back to Inquiries",
      formId: "add-offline-lead-form",
      submitLabel: "Save Customer Lead",
      isSubmitting: isSubmittingLead,
      error: leadError,
    },
    visit: {
      title: "Schedule Client Site Visit",
      badge: "Field Inspection",
      icon: Pin,
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      description:
        "Book a precision metrology on-site demonstration, drawing verification, or technical calibration audit.",
      backText: "Back to Field Visits",
      formId: "create-visit-form",
      submitLabel: "Schedule Visit",
      isSubmitting: isSubmittingVisit,
      error: visitError,
    },
    invoice: {
      title: editingInvoice
        ? `Edit Quotation (${editingInvoice.invoice_number})`
        : "Create Formal Quotation / Tax Invoice",
      badge: editingInvoice ? "Edit Mode" : "Billing & Quotes",
      icon: Receipt,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      description:
        "Generate formal Akira price quotations or GST-compliant tax invoices with itemized specifications and calculations.",
      backText: "Back to Invoices",
      formId: "create-invoice-form",
      submitLabel: editingInvoice ? "Save Changes" : "Generate Document",
      isSubmitting: isSubmittingInvoice,
      error: invoiceErrorMsg,
    },
    followup: {
      title: "Schedule New Follow-up",
      badge: "Touchpoint Schedule",
      icon: Plus,
      iconBg: "bg-slate-100 text-slate-800 border-slate-200",
      description:
        "Schedule telephone follow-ups, specification updates, quotation discussions, and customer reviews.",
      backText: "Back to Follow-ups",
      formId: "create-followup-form",
      submitLabel: "Schedule Follow-up",
      isSubmitting: isSubmittingFollowup,
      error: followupError,
    },
  };

  const config = formConfigs[formType];
  const FormIcon = config.icon;

  // Invoice calculations helper
  const calculateInvoiceTotals = () => {
    if (!invoiceForm) return { subtotal: 0, tax: 0, total: 0 };
    let subtotal = 0;
    let tax = 0;
    invoiceForm.items.forEach((it) => {
      const line = (it.quantity || 1) * (it.unitPrice || 0);
      subtotal += line;
      tax += (line * (it.taxRate || 0)) / 100;
    });
    return { subtotal, tax, total: subtotal + tax };
  };

  const invoiceTotals = calculateInvoiceTotals();

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onPress={onClose}
            className="h-9 w-9 min-w-9 p-0 rounded-xl border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs shrink-0"
            aria-label={config.backText}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 font-mono tracking-wide uppercase">
                Sales & Field
              </span>
              <span className="text-slate-300">/</span>
              <Chip
                size="sm"
                variant="soft"
                className="text-[10px] font-bold px-2 py-0.5 h-4.5 bg-rose-50 text-rose-700 border border-rose-200/70"
              >
                {config.badge}
              </Chip>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${config.iconBg}`}
              >
                <FormIcon className="w-3 h-3" />
              </div>
              <h1
                role="heading"
                aria-level={1}
                className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans truncate"
              >
                {config.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onPress={onClose}
            className="flex-1 sm:flex-initial text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer h-9 px-4 justify-center"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            form={config.formId}
            type="submit"
            isDisabled={config.isSubmitting}
            className="flex-1 sm:flex-initial text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white cursor-pointer h-9 px-5 shadow-2xs gap-2 justify-center"
          >
            {config.isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{config.submitLabel}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {config.error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Submission Error</Alert.Title>
            <Alert.Description>{config.error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {/* Main Form Body & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Side: Dynamic Form Elements */}
        <div className="lg:col-span-8 space-y-6 w-full min-w-0">
          {/* ======================================================== */}
          {/* FORM TYPE 1: Add Offline Customer / Inbound Lead         */}
          {/* ======================================================== */}
          {formType === "lead" && leadForm && setLeadForm && (
            <Form
              id="add-offline-lead-form"
              validationBehavior="native"
              onSubmit={onSubmitLead}
              className="space-y-5"
            >
              {/* Section 1: Customer Contact & Source */}
              <Surface className="p-5 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <PersonPlus className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Customer Contact & Source
                  </h2>
                </div>

                <Select
                  fullWidth
                  isRequired
                  value={leadForm.source}
                  onChange={(val) =>
                    setLeadForm((prev: LeadFormData) => ({
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
                  <Description>
                    Origin of customer interaction or lead source
                  </Description>
                  <FieldError />
                </Select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextField
                    isRequired
                    fullWidth
                    name="name"
                    value={leadForm.name}
                    onChange={(val) =>
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        name: val,
                      }))
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
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        companyName: val,
                      }))
                    }
                  >
                    <Label>Company / Workshop Name</Label>
                    <Input placeholder="e.g. Precision Engineering Works" />
                    <Description>Registered company or shop</Description>
                    <FieldError />
                  </TextField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextField
                    fullWidth
                    name="phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(val) =>
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        phone: val,
                      }))
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
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        email: val,
                      }))
                    }
                    validate={(val) => {
                      if (!leadForm.phone.trim() && (!val || !val.trim())) {
                        return "Please enter at least a phone number or email address";
                      }
                      return null;
                    }}
                  >
                    <Label>Email Address</Label>
                    <Input placeholder="e.g. contact@precisionworks.com" />
                    <Description>Direct email for quotation</Description>
                    <FieldError />
                  </TextField>
                </div>
              </Surface>

              {/* Section 2: Technical Interest & Gauging Requirements */}
              <Surface className="p-5 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Technical Interest & Gauging Requirements
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Select
                    fullWidth
                    value={leadForm.industry}
                    onChange={(val) =>
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        industry: (val as string) || "",
                      }))
                    }
                    aria-label="Manufacturing Industry Sector"
                  >
                    <Label>Industry Sector</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="min-w-[280px]">
                      <ListBox>
                        {industries.map((ind) => (
                          <ListBox.Item
                            key={ind.slug}
                            id={ind.name}
                            textValue={ind.name}
                          >
                            {ind.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <Description>Customer's industry domain</Description>
                    <FieldError />
                  </Select>

                  <Select
                    fullWidth
                    value={leadForm.productCategory}
                    onChange={(val) =>
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        productCategory: (val as string) || "",
                      }))
                    }
                    aria-label="Primary Metrology Interest"
                  >
                    <Label>Primary Metrology Interest</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="min-w-[280px]">
                      <ListBox>
                        {productCategories
                          .filter((c) => c.slug !== "all")
                          .map((cat) => (
                            <ListBox.Item
                              key={cat.slug}
                              id={cat.name}
                              textValue={cat.name}
                            >
                              {cat.name}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                      </ListBox>
                    </Select.Popover>
                    <Description>Instrument / Gauge class</Description>
                    <FieldError />
                  </Select>
                </div>

                <TextField
                  fullWidth
                  name="specificProduct"
                  value={leadForm.specificProduct}
                  onChange={(val) =>
                    setLeadForm((prev: LeadFormData) => ({
                      ...prev,
                      specificProduct: val,
                    }))
                  }
                >
                  <Label>Specific Product / Component Drawing Ref</Label>
                  <Input placeholder="e.g. Multi-jet Air Ring Gauge for 25.000mm Shaft" />
                  <Description>
                    Model name, dimension parameter, or customer drawing number
                  </Description>
                  <FieldError />
                </TextField>

                <TextField
                  fullWidth
                  name="notes"
                  value={leadForm.notes}
                  onChange={(val) =>
                    setLeadForm((prev: LeadFormData) => ({
                      ...prev,
                      notes: val,
                    }))
                  }
                >
                  <Label>Discussion Notes / Technical Specifications</Label>
                  <TextArea
                    rows={3}
                    placeholder="Enter tolerances, quantity requirements, delivery expectations, or technical questions raised during interaction..."
                  />
                  <Description>
                    Detailed technical background captured during conversation
                  </Description>
                  <FieldError />
                </TextField>
              </Surface>

              {/* Section 3: Schedule immediate follow-up task */}
              <Surface className="p-5 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Schedule immediate follow-up task for this lead
                    </h2>
                  </div>
                  <Checkbox
                    isSelected={leadForm.scheduleFollowup}
                    onChange={(checked) =>
                      setLeadForm((prev: LeadFormData) => ({
                        ...prev,
                        scheduleFollowup: checked,
                      }))
                    }
                  >
                    Enable
                  </Checkbox>
                </div>

                {leadForm.scheduleFollowup && (
                  <div className="space-y-3.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <HeroUIDateTimePicker
                        isRequired
                        granularity="day"
                        label="Follow-up Date"
                        ariaLabel="Follow-up Date"
                        value={activeLeadDate || leadForm.followupDate}
                        onChange={handleLeadDateChange}
                        description="Target date for touchpoint"
                      />

                      <Select
                        fullWidth
                        value={leadForm.followupType}
                        onChange={(val) =>
                          setLeadForm((prev: LeadFormData) => ({
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
                              { id: "meeting", label: "Meeting / Visit" },
                              { id: "demo", label: "Live Demo" },
                              { id: "email", label: "Technical Email" },
                            ].map((t) => (
                              <ListBox.Item
                                key={t.id}
                                id={t.id}
                                textValue={t.label}
                              >
                                {t.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                        <Description>Planned touchpoint</Description>
                        <FieldError />
                      </Select>

                      <Select
                        fullWidth
                        value={leadForm.followupPriority}
                        onChange={(val) =>
                          setLeadForm((prev: LeadFormData) => ({
                            ...prev,
                            followupPriority:
                              (val as FollowupPriority) || "medium",
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
                              { id: "high", label: "High Urgency" },
                              { id: "medium", label: "Medium Normal" },
                              { id: "low", label: "Low Routine" },
                            ].map((p) => (
                              <ListBox.Item
                                key={p.id}
                                id={p.id}
                                textValue={p.label}
                              >
                                {p.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                        <Description>Urgency level</Description>
                        <FieldError />
                      </Select>
                    </div>
                  </div>
                )}
              </Surface>
            </Form>
          )}

          {/* ======================================================== */}
          {/* FORM TYPE 2: Schedule Client Site Visit                  */}
          {/* ======================================================== */}
          {formType === "visit" && visitForm && setVisitForm && (
            <Form
              id="create-visit-form"
              validationBehavior="native"
              onSubmit={onSubmitVisit}
              className="space-y-5"
            >
              <Surface className="p-5 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Pin className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Site Visit Details & Assignment
                  </h2>
                </div>

                <TextField isRequired fullWidth name="enquiryId">
                  <Label>
                    Select Client Inquiry{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={visitForm.enquiryId}
                    onChange={(val) =>
                      setVisitForm((prev: VisitFormData) => ({
                        ...prev,
                        enquiryId: (val as string) || "",
                      }))
                    }
                    className="w-full"
                    aria-label="Select Client Inquiry"
                    placeholder="-- Choose Client --"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox className="outline-none space-y-0.5">
                        {enquiries.map((e) => (
                          <ListBox.Item
                            key={e.id}
                            id={e.id}
                            textValue={`${e.name} ${e.company ? `(${e.company})` : ""} - ${e.specific_product || e.product_category || "Inquiry"}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 text-xs">
                                {e.name} {e.company ? `(${e.company})` : ""}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {e.specific_product ||
                                  e.product_category ||
                                  "General Metrology"}
                              </span>
                            </div>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <Description>
                    Client lead requiring on-site visit
                  </Description>
                  <FieldError />
                </TextField>

                <TextField
                  isRequired
                  fullWidth
                  name="title"
                  value={visitForm.title}
                  onChange={(val) =>
                    setVisitForm((prev: VisitFormData) => ({
                      ...prev,
                      title: val,
                    }))
                  }
                  validate={(v) =>
                    !v || !v.trim() ? "Visit title is required" : null
                  }
                >
                  <Label>Visit Title</Label>
                  <Input placeholder="e.g. On-site Calibration & Dimension Verification" />
                  <Description>Objective or topic of inspection</Description>
                  <FieldError />
                </TextField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Select
                    fullWidth
                    value={visitForm.visitPurpose}
                    onChange={(val) =>
                      setVisitForm((prev: VisitFormData) => ({
                        ...prev,
                        visitPurpose: (val as VisitPurpose) || "consultation",
                      }))
                    }
                    aria-label="Visit Purpose"
                  >
                    <Label>Purpose</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox className="outline-none space-y-0.5">
                        {VISIT_PURPOSE_OPTIONS.map((item) => (
                          <ListBox.Item
                            key={item.id}
                            id={item.id}
                            textValue={item.label}
                          >
                            {item.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <Description>Nature of technical visit</Description>
                    <FieldError />
                  </Select>

                  <TextField
                    fullWidth
                    name="customerContactPerson"
                    value={visitForm.customerContactPerson}
                    onChange={(val) =>
                      setVisitForm((prev: VisitFormData) => ({
                        ...prev,
                        customerContactPerson: val,
                      }))
                    }
                  >
                    <Label>Contact Person</Label>
                    <Input placeholder="e.g. Quality Manager" />
                    <Description>On-site point of contact</Description>
                    <FieldError />
                  </TextField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <HeroUIDateTimePicker
                    isRequired
                    granularity="minute"
                    label={
                      <>
                        Scheduled Date & Time{" "}
                        <span className="text-rose-500">*</span>
                      </>
                    }
                    ariaLabel="Scheduled Date & Time"
                    value={activeVisitDate || visitForm.scheduledAt}
                    onChange={handleVisitDateChange}
                    description="Date and appointment time for arrival"
                  />
                </div>

                <TextField
                  fullWidth
                  name="notes"
                  value={visitForm.notes}
                  onChange={(val) =>
                    setVisitForm((prev: VisitFormData) => ({
                      ...prev,
                      notes: val,
                    }))
                  }
                >
                  <Label>Preparation Notes & Tooling Needed</Label>
                  <TextArea
                    rows={3}
                    placeholder="e.g. Bring master setting plug gauges, surface roughness tester, calibration certificate copies..."
                  />
                  <Description>
                    Special instructions for the field engineer
                  </Description>
                  <FieldError />
                </TextField>
              </Surface>
            </Form>
          )}

          {/* ======================================================== */}
          {/* FORM TYPE 3: Create Formal Quotation / Tax Invoice       */}
          {/* ======================================================== */}
          {formType === "invoice" && invoiceForm && setInvoiceForm && (
            <Form
              id="create-invoice-form"
              validationBehavior="native"
              onSubmit={onSubmitInvoice}
              className="space-y-5"
            >
              {/* Customer & Document Information */}
              <Surface className="p-4 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Document Type & Client Details
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {INVOICE_TYPE_OPTIONS.map((t) => (
                      <Button
                        key={t.id}
                        type="button"
                        size="sm"
                        variant={
                          invoiceForm.type === t.id ? "primary" : "outline"
                        }
                        onPress={() =>
                          setInvoiceForm((prev: InvoiceFormData) => ({
                            ...prev,
                            type: t.id as InvoiceType,
                          }))
                        }
                        className={`text-xs font-semibold rounded-xl h-7 px-2.5 ${
                          invoiceForm.type === t.id
                            ? "bg-slate-900 text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Customer Fast Search Autocomplete */}
                <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Magnifier className="w-3.5 h-3.5 text-slate-400" />
                      <span>Search Past Clients or Inquiries</span>
                    </Label>
                    {invoiceForm.customerName && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[11px] text-slate-500 hover:text-slate-800 h-6 px-2"
                        onPress={() => {
                          setInvoiceForm((prev: InvoiceFormData) => ({
                            ...prev,
                            enquiryId: "",
                            customerName: "",
                            customerCompany: "",
                            customerEmail: "",
                            customerPhone: "",
                            customerAddress: "",
                            customerGst: "",
                          }));
                          if (handleCustomerSearch) handleCustomerSearch("");
                        }}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>

                  <TextField
                    fullWidth
                    name="customerSearch"
                    value={customerSearchQuery}
                    onChange={(val) => {
                      if (handleCustomerSearch) handleCustomerSearch(val);
                    }}
                  >
                    <Input placeholder="Type name, company, or email to search past records..." />
                    <FieldError />
                  </TextField>

                  {/* Customer Search Quick List */}
                  {customerSuggestions.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl border border-slate-200 p-1.5 shadow-md max-h-48 overflow-y-auto space-y-1">
                      {customerSuggestions.map((c, i) => (
                        <div
                          key={c.id || i}
                          onClick={() => {
                            if (handleSelectCustomer) handleSelectCustomer(c);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">
                              {c.name}
                            </span>
                            {c.company && (
                              <span className="text-slate-500 ml-1">
                                ({c.company})
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {c.email} {c.phone ? `• ${c.phone}` : ""}
                            </span>
                          </div>
                          <Chip size="sm" variant="soft" className="text-[10px]">
                            {c.source === "invoice" ? "Past Client" : "Inquiry"}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Customer Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextField
                    isRequired
                    fullWidth
                    name="customerName"
                    value={invoiceForm.customerName}
                    onChange={(val) =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        customerName: val,
                      }))
                    }
                    validate={(v) =>
                      !v || !v.trim()
                        ? "Customer / Contact Name is required"
                        : null
                    }
                  >
                    <Label>Customer / Contact Name</Label>
                    <Input placeholder="e.g. Acme Corporation or Contact Person" />
                    <Description>Recipient entity name</Description>
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    name="customerCompany"
                    value={invoiceForm.customerCompany}
                    onChange={(val) =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        customerCompany: val,
                      }))
                    }
                  >
                    <Label>Company Name</Label>
                    <Input placeholder="e.g. Acme Precision Tools Pvt Ltd" />
                    <Description>Registered company title</Description>
                    <FieldError />
                  </TextField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextField
                    isRequired
                    fullWidth
                    name="customerEmail"
                    type="email"
                    value={invoiceForm.customerEmail}
                    onChange={(val) =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        customerEmail: val,
                      }))
                    }
                  >
                    <Label>Email Address</Label>
                    <Input placeholder="e.g. purchase@acmetools.com" />
                    <Description>Destination for PDF quotation</Description>
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    name="customerPhone"
                    type="tel"
                    value={invoiceForm.customerPhone}
                    onChange={(val) =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        customerPhone: val,
                      }))
                    }
                  >
                    <Label>Phone / WhatsApp</Label>
                    <Input placeholder="e.g. +91 98765 43210" />
                    <Description>Billing contact number</Description>
                    <FieldError />
                  </TextField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextField
                    fullWidth
                    name="customerAddress"
                    value={invoiceForm.customerAddress}
                    onChange={(val) =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        customerAddress: val,
                      }))
                    }
                  >
                    <Label>Billing Address</Label>
                    <Input placeholder="Plot No, Industrial Area, City..." />
                    <Description>Official billing address</Description>
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    name="customerGst"
                    value={invoiceForm.customerGst}
                    onChange={(val) =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        customerGst: val.toUpperCase(),
                      }))
                    }
                  >
                    <Label>GSTIN Number</Label>
                    <Input placeholder="e.g. 33AAAAA0000A1Z5" />
                    <Description>15-digit GST identification</Description>
                    <FieldError />
                  </TextField>
                </div>
              </Surface>

              {/* Line Items & Calculations */}
              <Surface className="p-4 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate sm:whitespace-normal">
                      Itemized Gauging & Tooling Specifications
                    </h2>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      setInvoiceForm((prev: InvoiceFormData) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            description: "",
                            quantity: 1,
                            unitPrice: 0,
                            taxRate: 18,
                          },
                        ],
                      }))
                    }
                    className="h-7 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-3.5">
                  {invoiceForm.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Item #{idx + 1}
                        </span>
                        {invoiceForm.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            isIconOnly
                            onPress={() => {
                              const newItems = invoiceForm.items.filter(
                                (_, i) => i !== idx,
                              );
                              setInvoiceForm((prev: InvoiceFormData) => ({
                                ...prev,
                                items: newItems,
                              }));
                            }}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 w-7 min-w-7 rounded-lg"
                            aria-label="Remove item"
                          >
                            <TrashBin className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>

                      {/* Product Catalogue Dropdown (Optional selection) */}
                      {productCatalog.length > 0 && (
                        <Select
                          fullWidth
                          value={item.productId || ""}
                          onChange={(val) => {
                            const pId = (val as string) || "";
                            if (pId) {
                              const isAlreadySelected = invoiceForm.items.some(
                                (other, oIdx) =>
                                  oIdx !== idx && other.productId === pId,
                              );
                              if (isAlreadySelected) {
                                if (setInvoiceErrorMsg) {
                                  setInvoiceErrorMsg(
                                    "This catalogue product has already been selected on this invoice. Duplicate selection is not permitted; please adjust the quantity instead.",
                                  );
                                }
                                return;
                              }
                            }
                            const p = productCatalog.find(
                              (prod) => prod.id === pId,
                            );
                            const newItems = [...invoiceForm.items];
                            if (p) {
                              newItems[idx] = {
                                ...newItems[idx],
                                productId: p.id,
                                description: `${p.title}${p.tagline ? " - " + p.tagline : ""}`,
                                taxRate: 18,
                              };
                            } else {
                              newItems[idx] = {
                                ...newItems[idx],
                                productId: undefined,
                              };
                            }
                            setInvoiceForm((prev: InvoiceFormData) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          aria-label="Select Product from Catalogue"
                        >
                          <Label>Select Product from Catalogue</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {productCatalog.map((prod) => (
                                <ListBox.Item
                                  key={prod.id}
                                  id={prod.id}
                                  textValue={prod.title}
                                >
                                  {prod.title}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                          <Description>
                            Autofills standard catalog specifications
                          </Description>
                        </Select>
                      )}

                      <TextField
                        isRequired
                        fullWidth
                        name={`item-desc-${idx}`}
                        value={item.description}
                        onChange={(val) => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx] = { ...newItems[idx], description: val };
                          setInvoiceForm((prev: InvoiceFormData) => ({
                            ...prev,
                            items: newItems,
                          }));
                        }}
                      >
                        <Label>Item Description / Specifications</Label>
                        <Input placeholder="e.g. Air Electronic Column Gauge Model AEC-100" />
                        <FieldError />
                      </TextField>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <TextField
                          isRequired
                          fullWidth
                          name={`item-qty-${idx}`}
                          value={String(item.quantity)}
                          onChange={(val) => {
                            const newItems = [...invoiceForm.items];
                            newItems[idx] = {
                              ...newItems[idx],
                              quantity: parseInt(val, 10) || 1,
                            };
                            setInvoiceForm((prev: InvoiceFormData) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                        >
                          <Label>Quantity</Label>
                          <Input type="number" min="1" />
                          <FieldError />
                        </TextField>

                        <TextField
                          isRequired
                          fullWidth
                          name={`item-price-${idx}`}
                          value={String(item.unitPrice)}
                          onChange={(val) => {
                            const newItems = [...invoiceForm.items];
                            newItems[idx] = {
                              ...newItems[idx],
                              unitPrice: parseFloat(val) || 0,
                            };
                            setInvoiceForm((prev: InvoiceFormData) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                        >
                          <Label>Unit Price (₹)</Label>
                          <Input type="number" min="0" step="0.01" />
                          <FieldError />
                        </TextField>

                        <Select
                          fullWidth
                          value={String(item.taxRate)}
                          onChange={(val) => {
                            const newItems = [...invoiceForm.items];
                            newItems[idx] = {
                              ...newItems[idx],
                              taxRate: parseFloat(val as string) || 0,
                            };
                            setInvoiceForm((prev: InvoiceFormData) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          aria-label="GST Rate"
                        >
                          <Label>GST Rate (%)</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {GST_RATE_OPTIONS.map((rate) => (
                                <ListBox.Item
                                  key={rate.id}
                                  id={rate.id}
                                  textValue={rate.label}
                                >
                                  {rate.label}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </Surface>
            </Form>
          )}

          {/* ======================================================== */}
          {/* FORM TYPE 4: Schedule New Follow-up                      */}
          {/* ======================================================== */}
          {formType === "followup" &&
            createFollowupForm &&
            setCreateFollowupForm && (
              <Form
                id="create-followup-form"
                validationBehavior="native"
                onSubmit={onSubmitFollowup}
                className="space-y-5"
              >
                <Surface className="p-5 sm:p-6 rounded-2xl flex flex-col gap-4 bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Follow-up Task Details
                    </h2>
                  </div>

                  <TextField isRequired fullWidth name="enquiryId">
                    <Label>
                      Select Client Inquiry{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={createFollowupForm.enquiryId}
                      onChange={(val) =>
                        setCreateFollowupForm((prev: CreateFollowupFormData) => ({
                          ...prev,
                          enquiryId: (val as string) || "",
                        }))
                      }
                      className="w-full"
                      aria-label="Select Client Inquiry"
                      placeholder="-- Choose Assigned Client --"
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox className="outline-none space-y-0.5">
                          {enquiries.map((e) => (
                            <ListBox.Item
                              key={e.id}
                              id={e.id}
                              textValue={`${e.name} ${e.company ? `(${e.company})` : ""}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 text-xs">
                                  {e.name}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {e.company || e.email}
                                </span>
                              </div>
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <Description>Linked client record</Description>
                    <FieldError />
                  </TextField>

                  <TextField
                    isRequired
                    fullWidth
                    name="title"
                    value={createFollowupForm.title}
                    onChange={(val) =>
                      setCreateFollowupForm((prev: CreateFollowupFormData) => ({
                        ...prev,
                        title: val,
                      }))
                    }
                  >
                    <Label>Task Title</Label>
                    <Input placeholder="e.g. Call client regarding quotation feedback" />
                    <Description>Action headline for reminders</Description>
                    <FieldError />
                  </TextField>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <HeroUIDateTimePicker
                      isRequired
                      granularity="minute"
                      label={
                        <>
                          Scheduled Date & Time{" "}
                          <span className="text-rose-500">*</span>
                        </>
                      }
                      ariaLabel="Scheduled Date & Time"
                      value={
                        activeFollowupDate || createFollowupForm.scheduledAt
                      }
                      onChange={handleFollowupDateChange}
                      description="Date and time for contact"
                    />

                    <Select
                      fullWidth
                      value={createFollowupForm.type}
                      onChange={(val) =>
                        setCreateFollowupForm((prev: CreateFollowupFormData) => ({
                          ...prev,
                          type: (val as FollowupType) || "call",
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
                            { id: "meeting", label: "Meeting / Visit" },
                            { id: "demo", label: "Live Demo" },
                            { id: "email", label: "Technical Email" },
                          ].map((t) => (
                            <ListBox.Item
                              key={t.id}
                              id={t.id}
                              textValue={t.label}
                            >
                              {t.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <Description>Channel</Description>
                      <FieldError />
                    </Select>

                    <Select
                      fullWidth
                      value={createFollowupForm.priority}
                      onChange={(val) =>
                        setCreateFollowupForm((prev: CreateFollowupFormData) => ({
                          ...prev,
                          priority: (val as FollowupPriority) || "medium",
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
                            { id: "high", label: "High Urgency" },
                            { id: "medium", label: "Medium Normal" },
                            { id: "low", label: "Low Routine" },
                          ].map((p) => (
                            <ListBox.Item
                              key={p.id}
                              id={p.id}
                              textValue={p.label}
                            >
                              {p.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <Description>Urgency</Description>
                      <FieldError />
                    </Select>
                  </div>

                  <TextField
                    fullWidth
                    name="notes"
                    value={createFollowupForm.notes}
                    onChange={(val) =>
                      setCreateFollowupForm((prev: CreateFollowupFormData) => ({
                        ...prev,
                        notes: val,
                      }))
                    }
                  >
                    <Label>Internal Notes</Label>
                    <TextArea
                      rows={3}
                      placeholder="Specific points to discuss or client requests..."
                    />
                    <Description>Key questions to ask client</Description>
                    <FieldError />
                  </TextField>
                </Surface>
              </Form>
            )}
        </div>

        {/* Right Side: Context Sidebar Card */}
        <div className="lg:col-span-4 space-y-4 w-full min-w-0">
          {/* Summary / Calculation Card for Invoices */}
          {formType === "invoice" && (
            <Card className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Summary & Financials
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{invoiceTotals.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Calculated GST:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{invoiceTotals.tax.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                  <span className="font-bold text-slate-900 uppercase">
                    Grand Total:
                  </span>
                  <span className="font-bold text-emerald-700">
                    ₹{invoiceTotals.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-[11px] text-emerald-800 space-y-1">
                <p className="font-semibold">Akira Precision Quotation Engine</p>
                <p className="text-slate-600">
                  PDF will be generated with ISO calibration terms, standard
                  payment schedule, and validity period.
                </p>
              </div>
            </Card>
          )}

          {/* Quick Guidance Card */}
          <Card className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <CircleCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Field CRM Guidelines
              </span>
            </div>

            <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
              <li>
                All submitted entries are directly synced with Akira backend
                cloud.
              </li>
              <li>
                Inquiries with scheduled follow-ups appear automatically on the
                daily agenda.
              </li>
              <li>
                Ensure contact details are validated for seamless automated PDF
                dispatch.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
