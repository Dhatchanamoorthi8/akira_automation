import { EnquiryFormData } from '../types';
import { company } from '../config/company';

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
 * Service to handle form-to-email submissions across the website.
 * Uses FormSubmit AJAX API with zero-backend dependency, delivering structured
 * HTML emails directly to the configured recipient email address.
 */
export class EmailService {
  private defaultRecipient: string;
  private defaultCc: string;
  private defaultTimeout: number;

  constructor(config: EmailServiceConfig = {}) {
    this.defaultRecipient = config.recipientEmail || company.primaryEmail;
    this.defaultCc = config.ccEmail || company.ccEmail;
    this.defaultTimeout = config.timeoutMs || 12000;
  }

  /**
   * Get the active recipient email configured via environment or fallback
   */
  getRecipientEmail(): string {
    return this.defaultRecipient;
  }

  /**
   * Get the active CC email if configured
   */
  getCcEmail(): string {
    return this.defaultCc;
  }

  /**
   * Send an enquiry form submission to the configured email recipient.
   */
  async sendEnquiry(
    formData: EnquiryFormData,
    customRecipient?: string
  ): Promise<EmailDispatchResult> {
    const recipient = customRecipient || this.defaultRecipient;
    const cc = this.defaultCc;

    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;

    const subject = `[${company.name}] Technical Enquiry: ${formData.specificProduct || formData.productCategory} - ${formData.companyName}`;

    const payload: Record<string, string> = {
      'Client Name': formData.name,
      'Company / Organization': formData.companyName,
      'Business Email': formData.email,
      'Contact Number': formData.phone,
      'Manufacturing Sector': formData.industry,
      'Product Category': formData.productCategory,
      'Specific Gauge / Drawing Ref': formData.specificProduct || 'Not specified',
      'Technical Requirement & Tolerance Specifications': formData.message,
      'Submission Timestamp': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      'Portal Source': `${company.name} Web Metrology Portal`,
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
    };

    if (cc && cc !== recipient) {
      payload._cc = cc;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success === 'false') {
        throw new Error(data.message || 'Submission was not accepted by the email service.');
      }

      return {
        success: true,
        message: 'Your technical inquiry has been submitted and delivered to our engineering desk.',
        recipientEmail: recipient,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Email request timed out. Please check your network or try direct email.');
      }
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('An unexpected error occurred while transmitting your inquiry.');
    }
  }

  /**
   * Generates a pre-filled mailto URL as a reliable offline/direct client fallback.
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
