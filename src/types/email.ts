export type EmailEventType =
  | 'new_enquiry'
  | 'new_enquiry_customer'
  | 'enquiry_assigned'
  | 'followup_assigned'
  | 'followup_reminder';

export interface BaseEmailTemplateData {
  portalUrl?: string;
  timestamp?: string;
}

export interface NewEnquiryEmailData extends BaseEmailTemplateData {
  enquiryId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  industry?: string | null;
  productCategory?: string | null;
  specificProduct?: string | null;
  requirement?: string | null;
  message: string;
  source?: string;
}

export interface EnquiryAssignedEmailData extends BaseEmailTemplateData {
  enquiryId: string;
  customerName: string;
  customerCompany?: string | null;
  customerEmail: string;
  assignedStaffName: string;
  assignedStaffEmail: string;
  assignedBy?: string | null;
  assignedDate?: string | null;
  enquirySubject?: string | null;
  loginUrl?: string;
  productOrCategory?: string | null;
  messageSnippet: string;
}

export interface FollowupAssignedEmailData extends BaseEmailTemplateData {
  followupId: string;
  enquiryId: string;
  customerName: string;
  customerCompany?: string | null;
  assignedStaffName: string;
  assignedStaffEmail: string;
  type: string;
  scheduledAt: string;
  dueDate?: string | null;
  priority?: string;
  notes?: string | null;
}

export interface FollowupReminderEmailData extends BaseEmailTemplateData {
  followupId: string;
  enquiryId: string;
  customerName: string;
  customerCompany?: string | null;
  assignedStaffName: string;
  assignedStaffEmail: string;
  type: string;
  scheduledAt: string;
  isOverdue: boolean;
  priority: string;
  notes?: string | null;
}

export interface EmailNotificationPayload {
  eventType: EmailEventType;
  recipient: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: string;
  provider?: string;
  mock?: boolean;
  recipient?: string | string[];
}
