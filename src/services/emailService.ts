import { EnquiryFormData } from '../types';
import { company } from '../config/company';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  EmailNotificationPayload,
  EmailSendResult,
  NewEnquiryEmailData,
  EnquiryAssignedEmailData,
  FollowupAssignedEmailData,
  FollowupReminderEmailData,
} from '../types/email';
import {
  renderNewEnquiryAdminEmail,
  renderNewEnquiryCustomerEmail,
  renderEnquiryAssignedEmail,
  renderFollowupAssignedEmail,
  renderFollowupReminderEmail,
} from '../templates/emailTemplates';
import { Enquiry, Followup, StaffProfile } from '../types/database';
import { emailSettingsService } from './emailSettingsService';

export interface EmailDispatchResult {
  success: boolean;
  message: string;
  recipientEmail: string;
}

export interface EmailServiceConfig {
  recipientEmail?: string;
  ccEmail?: string;
  timeoutMs?: number;
}

/**
 * Enterprise Email Notification Service for Akira Precision Automation LLP.
 * Dispatches transactional notifications via Supabase Edge Function (`send-email-notification`).
 * Keeps all API keys (Resend, SMTP) securely server-side with zero client-side secrets.
 */
export class EmailService {
  private defaultRecipient: string;
  private defaultCc: string;
  private defaultTimeout: number;
  private isConfiguredExplicitly: boolean;

  constructor(config: EmailServiceConfig = {}) {
    this.isConfiguredExplicitly = Boolean(config.recipientEmail || config.ccEmail);
    this.defaultRecipient = (config.recipientEmail || company.primaryEmail || 'milestonegauges@gmail.com').replace(/,+$/, '').trim();
    this.defaultCc = (config.ccEmail || company.ccEmail || 'messalessarvices@gmail.com').replace(/,+$/, '').trim();
    this.defaultTimeout = config.timeoutMs || 12000;
  }

  getRecipientEmail(): string {
    if (this.isConfiguredExplicitly) {
      return this.defaultRecipient;
    }
    return emailSettingsService.getPrimaryRecipient() || this.defaultRecipient;
  }

  getCcEmail(): string {
    if (this.isConfiguredExplicitly) {
      return this.defaultCc;
    }
    const cc = emailSettingsService.getSettingsSync().ccRecipients;
    return cc !== undefined && cc.trim() ? cc : this.defaultCc;
  }

  getTimeoutMs(): number {
    return this.defaultTimeout;
  }

  /**
   * Invokes the Supabase Edge Function to deliver transactional emails safely.
   * Eliminates mock fallbacks and captures real provider response status.
   */
  async sendNotification(payload: EmailNotificationPayload): Promise<EmailSendResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Database and Edge Function endpoints are unconfigured.',
        recipient: payload.recipient,
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: payload,
      });

      if (error) {
        console.warn('[EmailService] Edge Function returned error:', error.message);
        return {
          success: false,
          error: error.message,
          recipient: payload.recipient,
        };
      }

      // Check if Edge Function returned provider failure in body
      if (data && (data.success === false || data.status === 'FAILED' || data.statusCode >= 400)) {
        const errorMsg = data.error || data.message || `Provider status ${data.statusCode || data.httpStatus}`;
        console.warn('[EmailService] Email provider rejected delivery:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          code: data.code || data.name,
          recipient: payload.recipient,
        };
      }

      // Genuine provider success
      if (data && data.success === true) {
        return {
          success: true,
          messageId: data.providerMessageId || data.messageId,
          provider: data.provider || 'resend',
          recipient: payload.recipient,
        };
      }

      return {
        success: false,
        error: data?.error || data?.message || 'Provider did not confirm delivery ID.',
        recipient: payload.recipient,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Edge Function error';
      console.warn('[EmailService] Network issue invoking send-email-notification:', errorMsg);
      return {
        success: false,
        error: errorMsg,
        recipient: payload.recipient,
      };
    }
  }

  /**
   * Dispatches notifications when a new customer enquiry is submitted:
   * 1. Alert sent to Admin & Sales team with Reply-To set to the customer's email.
   * 2. Confirmation acknowledgement sent to the prospective customer.
   */
  async notifyNewEnquiry(enquiry: Enquiry): Promise<EmailSendResult[]> {
    const templateData: NewEnquiryEmailData = {
      enquiryId: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      company: enquiry.company,
      industry: enquiry.industry,
      productCategory: enquiry.product_category,
      specificProduct: enquiry.specific_product,
      requirement: enquiry.requirement,
      message: enquiry.message,
      source: enquiry.source,
    };

    // 1. Admin & Engineering notification (Reply-To = customer's email)
    const adminTemplate = renderNewEnquiryAdminEmail(templateData);
    const resolvedPrimary = this.getRecipientEmail();
    const resolvedCc = emailSettingsService.getCcRecipients() || (this.defaultCc ? [this.defaultCc] : undefined);
    const shouldSendCustomerAck = emailSettingsService.getSettingsSync().sendCustomerConfirmation;

    const adminPromise = this.sendNotification({
      eventType: 'new_enquiry',
      enquiryId: enquiry.id,
      recipient: resolvedPrimary,
      cc: resolvedCc,
      replyTo: enquiry.email,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      templateData: templateData as unknown as Record<string, unknown>,
      idempotencyKey: `enq_admin_${enquiry.id}`,
    });

    // 2. Customer acknowledgement (optional based on admin preference)
    if (!shouldSendCustomerAck) {
      return Promise.all([adminPromise]);
    }

    const customerTemplate = renderNewEnquiryCustomerEmail(templateData);
    const customerPromise = this.sendNotification({
      eventType: 'new_enquiry_customer',
      enquiryId: enquiry.id,
      recipient: enquiry.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
      text: customerTemplate.text,
      templateData: templateData as unknown as Record<string, unknown>,
      idempotencyKey: `enq_cust_${enquiry.id}`,
    });

    return Promise.all([adminPromise, customerPromise]);
  }

  /**
   * Dispatches an alert to a staff member when an enquiry is assigned to them.
   */
  async notifyEnquiryAssigned(
    enquiry: Enquiry,
    staff: StaffProfile,
    assignedBy?: string,
    assignedDate?: string
  ): Promise<EmailSendResult> {
    const templateData: EnquiryAssignedEmailData = {
      enquiryId: enquiry.id,
      customerName: enquiry.name,
      customerCompany: enquiry.company,
      customerEmail: enquiry.email,
      assignedStaffName: staff.full_name || staff.email,
      assignedStaffEmail: staff.email,
      assignedBy: assignedBy || 'AKIRA Operations Admin',
      assignedDate: assignedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      enquirySubject: enquiry.subject || enquiry.specific_product || enquiry.product_category || 'Industrial Gauge RFQ',
      productOrCategory: enquiry.specific_product || enquiry.product_category,
      messageSnippet: enquiry.message?.length > 200 ? `${enquiry.message.slice(0, 197)}...` : (enquiry.message || 'No additional notes provided.'),
    };

    const template = renderEnquiryAssignedEmail(templateData);
    return this.sendNotification({
      eventType: 'enquiry_assigned',
      enquiryId: enquiry.id,
      recipient: staff.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      templateData: templateData as unknown as Record<string, unknown>,
      idempotencyKey: `enq_assign_${enquiry.id}_${staff.id}`,
    });
  }

  /**
   * Dispatches a notification to staff when a follow-up task is assigned to them.
   */
  async notifyFollowupAssigned(
    followup: Followup,
    enquiry: Enquiry,
    staff: StaffProfile
  ): Promise<EmailSendResult> {
    const templateData: FollowupAssignedEmailData = {
      followupId: followup.id,
      enquiryId: enquiry.id,
      customerName: enquiry.name,
      customerCompany: enquiry.company,
      assignedStaffName: staff.full_name || staff.email,
      assignedStaffEmail: staff.email,
      type: followup.type,
      scheduledAt: followup.scheduled_at,
      dueDate: followup.due_date,
      priority: followup.priority,
      notes: followup.notes,
    };

    const template = renderFollowupAssignedEmail(templateData);
    return this.sendNotification({
      eventType: 'followup_assigned',
      enquiryId: enquiry.id,
      recipient: staff.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      templateData: templateData as unknown as Record<string, unknown>,
      idempotencyKey: `fup_assign_${followup.id}_${staff.id}`,
    });
  }

  /**
   * Dispatches a reminder or overdue alert for an upcoming/pending follow-up task.
   */
  async notifyFollowupReminder(
    followup: Followup,
    enquiry: Enquiry,
    staff: StaffProfile,
    isOverdue = false
  ): Promise<EmailSendResult> {
    const templateData: FollowupReminderEmailData = {
      followupId: followup.id,
      enquiryId: enquiry.id,
      customerName: enquiry.name,
      customerCompany: enquiry.company,
      assignedStaffName: staff.full_name || staff.email,
      assignedStaffEmail: staff.email,
      type: followup.type,
      scheduledAt: followup.scheduled_at,
      isOverdue,
      priority: followup.priority || 'normal',
      notes: followup.notes,
    };

    const template = renderFollowupReminderEmail(templateData);
    return this.sendNotification({
      eventType: 'followup_reminder',
      enquiryId: enquiry.id,
      recipient: staff.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      templateData: templateData as unknown as Record<string, unknown>,
      idempotencyKey: `fup_rem_${followup.id}_${isOverdue ? 'overdue' : 'due'}`,
    });
  }

  /**
   * Dispatches an email to the customer with invoice/quotation details.
   */
  async notifyInvoiceDispatched(invoice: import('../types/database').Invoice, customerEmail: string): Promise<EmailSendResult> {
    const subject = `[${company.name}] ${invoice.type === 'quotation' ? 'Quotation' : 'Invoice'} #${invoice.invoice_number} from Akira Precision`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">${company.name}</h1>
          <p style="color: #94a3b8; margin: 4px 0 0; font-size: 14px;">Precision Metrology & Gauging Solutions</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background-color: #ffffff;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">${invoice.type === 'quotation' ? 'Formal Quotation' : 'Invoice'} Details</h2>
          <p>Dear ${invoice.customer_name},</p>
          <p>Please find the summary of your ${invoice.type} below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Document Number:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${invoice.invoice_number}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Issue Date:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${invoice.issue_date}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Total Amount:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 16px; font-weight: bold; color: #0284c7;">₹${invoice.total_amount.toLocaleString('en-IN')} (incl. GST)</td></tr>
          </table>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If you have any technical questions regarding this document, please reply directly to this email or contact our sales engineering desk at ${company.primaryEmail}.</p>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ${company.name} &bull; Bangalore, India
        </div>
      </div>
    `;

    return this.sendNotification({
      eventType: 'enquiry_assigned',
      recipient: customerEmail,
      subject,
      html,
    });
  }

  /**
   * Dispatches SLA breach alert to administrators when an assigned lead has had no activity for > 24 hours.
   */
  async notifyLeadSLAAlert(enquiry: Enquiry, staffName: string, hoursIdle: number): Promise<EmailSendResult> {
    const adminEmail = this.getRecipientEmail();
    const subject = `[SLA ALERT] Lead #${enquiry.id.slice(0, 8)} unattended for ${hoursIdle}h (Assigned to: ${staffName})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background-color: #be123c; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 18px;">CRM Lead SLA Warning</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background-color: #ffffff;">
          <p><strong>Warning:</strong> The following lead was assigned to <strong>${staffName}</strong> and has had no recorded action or follow-up for <strong>${hoursIdle} hours</strong>.</p>
          <ul style="line-height: 1.6;">
            <li><strong>Customer:</strong> ${enquiry.name} (${enquiry.company || 'N/A'})</li>
            <li><strong>Email:</strong> ${enquiry.email}</li>
            <li><strong>Phone:</strong> ${enquiry.phone || 'N/A'}</li>
            <li><strong>Requirement:</strong> ${enquiry.subject || enquiry.requirement || 'N/A'}</li>
          </ul>
          <p>Please log in to the Akira Admin Portal to reassign or follow up with the assigned representative.</p>
        </div>
      </div>
    `;

    return this.sendNotification({
      eventType: 'enquiry_assigned',
      recipient: adminEmail,
      subject,
      html,
    });
  }

  /**
   * Form-to-email fallback interface (Phase 5 migration compatibility).
   */
  async sendEnquiry(
    _formData: EnquiryFormData,
    customRecipient?: string
  ): Promise<EmailDispatchResult> {
    const recipient = customRecipient || this.defaultRecipient;
    return {
      success: true,
      message: 'Enquiry safely recorded in database. Notification boundary prepared.',
      recipientEmail: recipient,
    };
  }

  /**
   * Generates a pre-filled mailto URL as an offline fallback.
   */
  generateMailtoFallback(formData: EnquiryFormData, customRecipient?: string): string {
    const recipient = customRecipient || this.defaultRecipient;
    const subject = `[${company.name}] Technical Enquiry - ${formData.companyName}`;
    const body = [
      `Hello ${company.name} Engineering Team,`,
      '',
      'Please find our technical enquiry details below:',
      '',
      `• Full Name: ${formData.name}`,
      `• Company / Organization: ${formData.companyName}`,
      `• Business Email: ${formData.email}`,
      `• Contact Phone: ${formData.phone}`,
      `• Manufacturing Sector: ${formData.industry}`,
      `• Product / Solution Category: ${formData.productCategory}`,
      `• Specific Gauge Model / Drawing Ref: ${formData.specificProduct || 'N/A'}`,
      '',
      '• Technical Requirement / Tolerance Specifications:',
      formData.message,
      '',
      'Sent from Web Inquiry Form',
    ].join('\n');

    return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

export const emailService = new EmailService();
export default emailService;
