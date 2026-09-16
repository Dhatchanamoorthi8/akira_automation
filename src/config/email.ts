/**
 * AKIRA AUTOMATION — Centralized Production Email Configuration
 * 
 * Sourced directly from corporate identity and verified DNS boundaries.
 * Zero secrets in client-side code; strictly server-controlled recipients & senders.
 */

export const emailConfig = {
  // Production Sender Addresses
  fromAddress: 'notifications@akiraautomation.com',
  fromName: 'AKIRA AUTOMATION',
  formattedFrom: 'AKIRA AUTOMATION <notifications@akiraautomation.com>',
  
  // Dedicated Inbound / Customer Support Mailbox
  supportAddress: 'support@akiraautomation.com',
  salesAddress: 'sales@akiraautomation.com',
  
  // Brand Identity Constants
  brandName: 'AKIRA AUTOMATION',
  brandTagline: 'PRECISION • INNOVATION • SMART SOLUTIONS',
  brandSlogan: 'Automating Today... Building Tomorrow...',
  corporateEntity: 'AKIRA AUTOMATION PRIVATE LIMITED',
  
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
