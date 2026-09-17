import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  EmailMessage,
  EmailSendResult,
  DomainStatusResult,
} from '../types/email';

export interface SendAdminReplyParams {
  enquiryId: string;
  subject: string;
  message: string;
}

/**
 * Service to manage email conversation threads, delivery tracking,
 * and admin outbound email dispatches via Supabase Edge Functions.
 */
export class EmailMessageService {
  /**
   * Retrieves all email messages (both OUTBOUND and INBOUND) for a specific enquiry,
   * ordered chronologically for conversation threading.
   */
  async getEnquiryThread(enquiryId: string): Promise<{
    messages: EmailMessage[];
    error: string | null;
  }> {
    if (!isSupabaseConfigured() || !enquiryId) {
      return { messages: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('email_messages')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('created_at', { ascending: true });

      if (error) {
        // Table might not exist yet if migration has not been applied
        console.warn('[EmailMessageService] Unable to fetch email thread:', error.message);
        return { messages: [], error: error.message };
      }

      return { messages: (data || []) as EmailMessage[], error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown database error';
      return { messages: [], error: msg };
    }
  }

  /**
   * Dispatches an authenticated admin reply to an enquiry's customer.
   * Enforces server-side recipient resolution (browser cannot override recipient email).
   */
  async sendAdminReply(params: SendAdminReplyParams): Promise<EmailSendResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Database and Edge Function endpoints are unconfigured.',
      };
    }

    if (!params.enquiryId || !params.message?.trim()) {
      return {
        success: false,
        error: 'Enquiry ID and message body are required.',
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          eventType: 'admin_reply',
          enquiryId: params.enquiryId,
          subject: params.subject?.trim() || 'Technical Response — Akira Precision Automation LLP',
          message: params.message.trim(),
        },
      });

      if (error) {
        console.warn('[EmailMessageService] Edge Function error:', error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      if (data && (data.success === false || data.status === 'FAILED')) {
        return {
          success: false,
          error: data.error || data.message || 'Provider failed to accept outbound reply.',
          code: data.code,
        };
      }

      return {
        success: true,
        messageId: data?.providerMessageId || data?.messageId,
        provider: data?.provider || 'resend',
        status: data?.status || 'SENT',
        emailMessage: data?.emailMessage,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during dispatch';
      return {
        success: false,
        error: msg,
      };
    }
  }

  /**
   * Dispatches a diagnostic test email to confirm provider connectivity.
   */
  async sendTestEmail(recipientEmail: string): Promise<EmailSendResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase endpoints are not configured.',
      };
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return {
        success: false,
        error: 'Valid recipient email address is required.',
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          eventType: 'test',
          recipient: recipientEmail.trim(),
          subject: 'Akira Precision Automation LLP — Test Email',
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data && (data.success === false || data.status === 'FAILED')) {
        return {
          success: false,
          error: data.error || 'Provider rejected test dispatch.',
          code: data.code,
        };
      }

      return {
        success: true,
        messageId: data?.providerMessageId || data?.messageId,
        provider: data?.provider || 'resend',
        status: data?.status || 'SENT',
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error invoking test email',
      };
    }
  }

  /**
   * Queries Resend API via Edge Function to retrieve live domain verification state.
   */
  async checkDomainStatus(): Promise<DomainStatusResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        isVerified: false,
        domainName: 'akiraautomation.com',
        status: 'unconfigured',
        error: 'Supabase credentials missing',
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          eventType: 'check_domain',
        },
      });

      if (error) {
        return {
          success: false,
          isVerified: false,
          domainName: 'akiraautomation.com',
          status: 'error',
          error: error.message,
        };
      }

      return {
        success: data?.success ?? false,
        isVerified: data?.isVerified ?? false,
        domainName: data?.domainName || 'akiraautomation.com',
        status: data?.status || 'unknown',
        dnsRecords: data?.records || [],
      };
    } catch (err: unknown) {
      return {
        success: false,
        isVerified: false,
        domainName: 'akiraautomation.com',
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed checking domain',
      };
    }
  }
}

export const emailMessageService = new EmailMessageService();
export default emailMessageService;
