export type EmailEventType =
  | 'new_enquiry'
  | 'new_enquiry_customer'
  | 'enquiry_assigned'
  | 'followup_assigned'
  | 'followup_reminder'
  | 'admin_reply'
  | 'test'
  | 'check_domain';

export type EmailDirection = 'OUTBOUND' | 'INBOUND';

export type EmailStatus =
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'BOUNCED'
  | 'FAILED'
  | 'RECEIVED';

export interface EmailMessage {
  id: string;
  enquiry_id: string | null;
  direction: EmailDirection;
  from_email: string;
  to_email: string;
  cc_email?: string | null;
  reply_to?: string | null;
  subject: string;
  body: string;
  body_html?: string | null;
  provider: string;
  provider_message_id?: string | null;
  message_id?: string | null;
  in_reply_to?: string | null;
  references_header?: string | null;
  status: EmailStatus;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  sent_at?: string | null;
  delivered_at?: string | null;
}

export interface AdminReplyEmailData extends BaseEmailTemplateData {
  enquiryId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  subject: string;
  message: string;
  senderName: string;
  senderRole?: string;
  previousSubject?: string | null;
}

export interface TestEmailData extends BaseEmailTemplateData {
  recipientEmail: string;
  triggeredBy: string;
  environment: string;
  timestamp: string;
}

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
  enquiryId?: string;
  recipient?: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject?: string;
  message?: string;
  html?: string;
  text?: string;
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  _hp?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: string;
  provider?: string;
  mock?: boolean;
  recipient?: string | string[];
  status?: string;
  emailMessage?: EmailMessage;
}

export interface DomainStatusResult {
  success: boolean;
  isVerified: boolean;
  domainName: string;
  status: string;
  dnsRecords?: Array<{
    record: string;
    type: string;
    value: string;
    status: string;
  }>;
  error?: string;
}

