/**
 * AKIRA PRECISION AUTOMATION — Centralized Production Email Configuration
 * 
 * Sourced directly from corporate identity and verified DNS boundaries.
 * Zero secrets in client-side code; strictly server-controlled recipients & senders.
 */

export const emailConfig = {
  // Production Sender Addresses
  fromAddress: 'notifications@akiraautomation.com',
  fromName: 'Akira Precision Automation',
  formattedFrom: 'Akira Precision Automation <notifications@akiraautomation.com>',
  
  // Dedicated Inbound / Customer Support Mailbox
  supportAddress: 'support@akiraautomation.com',
  salesAddress: 'sales@akiraautomation.com',
  
  // Brand Identity Constants
  brandName: 'Akira Precision Automation',
  brandTagline: 'PRECISION • INNOVATION • SMART SOLUTIONS',
  brandSlogan: 'Automating Today... Building Tomorrow...',
  corporateEntity: 'Akira Precision Automation',
  
  // Production Portal Base URL
  portalUrl: 'https://akiraautomation.com',
  
  // Supabase Edge Function Names
  functions: {
    sendNotification: 'send-email-notification',
    inboundWebhook: 'resend-inbound-email',
    statusWebhook: 'resend-webhook',
  },
} as const;

export type EmailConfig = typeof emailConfig;
