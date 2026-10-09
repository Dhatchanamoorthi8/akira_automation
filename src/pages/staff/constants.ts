import { FollowupPriority, VisitPurpose, InvoiceType } from "../../types/database";

export const PRIORITY_STYLES: Record<
  FollowupPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: {
    label: "URGENT",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  high: {
    label: "HIGH",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  medium: {
    label: "MEDIUM",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  low: {
    label: "LOW",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

export const LOST_REASONS = [
  "Price / Budget Constraint",
  "Competitor Selected",
  "Requirements Mismatch / Out of Scope",
  "Customer Postponed / Cancelled Project",
  "Customer Unresponsive",
  "Other",
];

export const VISIT_PURPOSE_OPTIONS: Array<{ id: VisitPurpose; label: string }> = [
  { id: "consultation", label: "Consultation" },
  { id: "demo", label: "Demo" },
  { id: "site_inspection", label: "Site Inspection" },
  { id: "installation", label: "Installation" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "other", label: "Other" },
];

export const LEAD_SOURCE_OPTIONS = [
  { id: "offline_walkin", label: "Facility Walk-in / Direct Customer Visit" },
  { id: "phone_call", label: "Inbound Phone Call / WhatsApp Inquiry" },
  { id: "trade_expo", label: "Trade Show / Industrial Expo Exhibition" },
  { id: "referral", label: "Customer / Vendor Referral" },
  { id: "existing_client", label: "Existing Client Offline Re-order" },
  { id: "other_offline", label: "Other Offline Channel" },
];

export const INVOICE_TYPE_OPTIONS: Array<{ id: InvoiceType; label: string }> = [
  { id: "quotation", label: "Formal Quotation" },
  { id: "proforma", label: "Proforma Invoice" },
  { id: "tax_invoice", label: "Tax Invoice" },
];

export const GST_RATE_OPTIONS = [
  { id: "18", label: "18%" },
  { id: "12", label: "12%" },
  { id: "5", label: "5%" },
  { id: "0", label: "0% (Exempt)" },
];
