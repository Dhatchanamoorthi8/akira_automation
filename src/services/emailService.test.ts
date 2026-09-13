import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService, emailService } from './emailService';
import { EnquiryFormData } from '../types';
import { supabase } from '../lib/supabase';
import { Enquiry, Followup, StaffProfile } from '../types/database';

const mockFormData: EnquiryFormData = {
  name: 'Suresh Raina',
  companyName: 'Chennai Precision Ltd',
  email: 'suresh@chennaiprecision.com',
  phone: '+91 9876543210',
  industry: 'Automotive OEMs',
  productCategory: 'Air Gauging',
  specificProduct: 'Air Plug Gauge Ø45mm',
  requirement: '',
  message: 'Require 2-jet air plug gauge for cylinder bore inspection with master rings.',
};

const mockEnquiry: Enquiry = {
  id: 'enq-100',
  name: 'Kavitha Ram',
  company: 'Apex Metrology',
  email: 'kavitha@apexmetro.com',
  phone: '+91 9123456780',
  subject: 'Multi-jet Air Ring',
  message: 'Need urgent quotation for 3-jet air ring gauge.',
  industry: 'Aerospace',
  product_category: 'Air Gauging',
  specific_product: 'Air Ring Gauge',
  requirement: null,
  status: 'new',
  source: 'website',
  assigned_to: null,
  created_at: '2026-09-13T10:00:00Z',
  updated_at: '2026-09-13T10:00:00Z',
};

const mockStaff: StaffProfile = {
  id: 'staff-42',
  email: 'staff@akiraautomation.com',
  full_name: 'Arun Kumar',
  role: 'staff',
};

const mockFollowup: Followup = {
  id: 'fup-500',
  enquiry_id: 'enq-100',
  scheduled_at: '2026-09-15T14:30:00Z',
  type: 'call',
  status: 'upcoming',
  notes: 'Review tolerance requirements with production lead',
  created_by: 'admin-1',
  assigned_to: 'staff-42',
  title: 'Call Kavitha regarding air ring',
  priority: 'high',
  due_date: '2026-09-15',
  due_time: '14:30',
  completed_at: null,
  outcome: null,
  next_followup_at: null,
  created_at: '2026-09-13T10:00:00Z',
  updated_at: '2026-09-13T10:00:00Z',
};

describe('EmailService', () => {
  const mockInvoke = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockInvoke.mockReset();
    Object.defineProperty(supabase, 'functions', {
      value: { invoke: mockInvoke },
      configurable: true,
      writable: true,
    });
  });

  it('initializes with default recipient and CC from company config', () => {
    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
      ccEmail: 'sales@akiraautomation.com',
    });

    expect(service.getRecipientEmail()).toBe('milestonegauges@gmail.com');
    expect(service.getCcEmail()).toBe('sales@akiraautomation.com');
  });

  it('safely handles sendEnquiry via database boundary without client-side FormSubmit AJAX', async () => {
    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
    });

    const result = await service.sendEnquiry(mockFormData);

    expect(result.success).toBe(true);
    expect(result.recipientEmail).toBe('milestonegauges@gmail.com');
    expect(result.message).toContain('Enquiry safely recorded in database');
  });

  it('allows overriding recipient email on sendEnquiry', async () => {
    const service = new EmailService();
    const result = await service.sendEnquiry(mockFormData, 'custom@akiraautomation.com');

    expect(result.success).toBe(true);
    expect(result.recipientEmail).toBe('custom@akiraautomation.com');
  });

  it('generates a valid mailto fallback link with all inquiry details', () => {
    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
    });

    const mailto = service.generateMailtoFallback(mockFormData);

    expect(mailto).toContain('mailto:milestonegauges%40gmail.com');
    expect(mailto).toContain('subject=');
    expect(mailto).toContain('body=');
    expect(decodeURIComponent(mailto)).toContain('Suresh Raina');
    expect(decodeURIComponent(mailto)).toContain('Chennai Precision Ltd');
    expect(decodeURIComponent(mailto)).toContain('Air Plug Gauge Ø45mm');
  });

  it('exports singleton emailService instance with company defaults', () => {
    expect(emailService).toBeInstanceOf(EmailService);
    expect(emailService.getRecipientEmail()).toBeDefined();
  });

  it('invokes Supabase Edge Function send-email-notification on sendNotification', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { success: true, messageId: 'msg-123' },
      error: null,
    });

    const result = await emailService.sendNotification({
      eventType: 'new_enquiry',
      recipient: 'admin@akiraautomation.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    });

    expect(mockInvoke).toHaveBeenCalledWith('send-email-notification', {
      body: expect.objectContaining({
        eventType: 'new_enquiry',
        recipient: 'admin@akiraautomation.com',
        subject: 'Test Subject',
      }),
    });
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
  });

  it('handles Edge Function error gracefully without throwing', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Provider rate limit' },
    });

    const result = await emailService.sendNotification({
      eventType: 'new_enquiry',
      recipient: 'admin@akiraautomation.com',
      subject: 'Test Subject',
      text: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Provider rate limit');
  });

  it('dispatches admin and customer emails on notifyNewEnquiry', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, messageId: 'msg-456' },
      error: null,
    });

    const results = await emailService.notifyNewEnquiry(mockEnquiry);

    expect(results).toHaveLength(2);
    expect(mockInvoke).toHaveBeenCalledTimes(2);

    // Call 1: Admin
    expect(mockInvoke).toHaveBeenNthCalledWith(
      1,
      'send-email-notification',
      expect.objectContaining({
        body: expect.objectContaining({
          eventType: 'new_enquiry',
          subject: expect.stringContaining('New RFQ'),
          idempotencyKey: 'enq_admin_enq-100',
        }),
      })
    );

    // Call 2: Customer
    expect(mockInvoke).toHaveBeenNthCalledWith(
      2,
      'send-email-notification',
      expect.objectContaining({
        body: expect.objectContaining({
          eventType: 'new_enquiry_customer',
          recipient: 'kavitha@apexmetro.com',
          idempotencyKey: 'enq_cust_enq-100',
        }),
      })
    );
  });

  it('dispatches staff notification on notifyEnquiryAssigned', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const result = await emailService.notifyEnquiryAssigned(mockEnquiry, mockStaff);

    expect(result.success).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith(
      'send-email-notification',
      expect.objectContaining({
        body: expect.objectContaining({
          eventType: 'enquiry_assigned',
          recipient: 'staff@akiraautomation.com',
          idempotencyKey: 'enq_assign_enq-100_staff-42',
        }),
      })
    );
  });

  it('dispatches staff notification on notifyFollowupAssigned', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const result = await emailService.notifyFollowupAssigned(mockFollowup, mockEnquiry, mockStaff);

    expect(result.success).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith(
      'send-email-notification',
      expect.objectContaining({
        body: expect.objectContaining({
          eventType: 'followup_assigned',
          recipient: 'staff@akiraautomation.com',
          idempotencyKey: 'fup_assign_fup-500_staff-42',
        }),
      })
    );
  });

  it('dispatches reminder or overdue notification on notifyFollowupReminder', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const result = await emailService.notifyFollowupReminder(mockFollowup, mockEnquiry, mockStaff, true);

    expect(result.success).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith(
      'send-email-notification',
      expect.objectContaining({
        body: expect.objectContaining({
          eventType: 'followup_reminder',
          subject: expect.stringContaining('OVERDUE'),
          idempotencyKey: 'fup_rem_fup-500_overdue',
        }),
      })
    );
  });
});
