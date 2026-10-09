import {
  FollowupPriority,
  FollowupType,
  InvoiceType,
  VisitPurpose,
} from "../../types/database";

export type WorkspaceTab = "overview" | "followups" | "enquiries" | "visits" | "invoices";

export type FormViewType = "lead" | "visit" | "invoice" | "followup";

export interface StaffStats {
  myNewEnquiries: number;
  dueToday: number;
  overdue: number;
  upcoming: number;
  completed: number;
}

export interface CreateFollowupFormData {
  enquiryId: string;
  title: string;
  scheduledAt: string;
  type: FollowupType;
  priority: FollowupPriority;
  notes: string;
}

export interface LeadFormData {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  source: string;
  industry: string;
  productCategory: string;
  specificProduct: string;
  notes: string;
  scheduleFollowup: boolean;
  followupDate: string;
  followupType: FollowupType;
  followupPriority: FollowupPriority;
}

export interface DealFormData {
  dealTitle: string;
  dealValue: string;
  expectedCloseDate: string;
  notes: string;
}

export interface VisitFormData {
  enquiryId: string;
  title: string;
  visitPurpose: VisitPurpose;
  scheduledAt: string;
  customerContactPerson: string;
  notes: string;
}

export interface InvoiceLineItemForm {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface InvoiceFormData {
  enquiryId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGst: string;
  type: InvoiceType;
  items: InvoiceLineItemForm[];
}

export interface ActionFeedbackState {
  status: "success" | "danger" | "accent";
  title: string;
  message: string;
}

export interface DeleteConfirmInvoiceState {
  id: string;
  invoiceNumber: string;
  customerName?: string;
}

export interface SendConfirmInvoiceState {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
}
