import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailMessageService, EmailMessageService } from './emailMessageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
  isSupabaseConfigured: vi.fn(),
}));

describe('EmailMessageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it('1. exports singleton instance and class', () => {
    expect(emailMessageService).toBeInstanceOf(EmailMessageService);
  });

  describe('getEnquiryThread', () => {
    it('returns empty array when unconfigured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);
      const res = await emailMessageService.getEnquiryThread('enq-123');
      expect(res.messages).toEqual([]);
      expect(res.error).toBeNull();
    });

    it('queries email_messages table with chronological ordering', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          { id: 'msg-1', enquiry_id: 'enq-123', direction: 'OUTBOUND', subject: 'Initial Response', status: 'SENT' },
          { id: 'msg-2', enquiry_id: 'enq-123', direction: 'INBOUND', subject: 'Re: Initial Response', status: 'RECEIVED' },
        ],
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });

      const res = await emailMessageService.getEnquiryThread('enq-123');

      expect(supabase.from).toHaveBeenCalledWith('email_messages');
      expect(mockEq).toHaveBeenCalledWith('enquiry_id', 'enq-123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(res.messages).toHaveLength(2);
      expect(res.error).toBeNull();
    });

    it('handles query error gracefully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'relation "email_messages" does not exist' },
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });

      const res = await emailMessageService.getEnquiryThread('enq-123');

      expect(res.messages).toEqual([]);
      expect(res.error).toContain('relation "email_messages" does not exist');
    });
  });

  describe('sendAdminReply', () => {
    it('validates required inputs before invoking Edge Function', async () => {
      const res = await emailMessageService.sendAdminReply({
        enquiryId: '',
        subject: 'Test',
        message: 'Hello',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Enquiry ID and message body are required');
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('invokes send-email-notification with eventType admin_reply', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          status: 'SENT',
          providerMessageId: 'resend-reply-123',
          provider: 'resend',
          emailMessage: { id: 'msg-saved-1' },
        },
        error: null,
      });

      const res = await emailMessageService.sendAdminReply({
        enquiryId: 'enq-uuid-777',
        subject: 'Regarding Bore Gauge Tolerance',
        message: 'We can achieve 0.0005mm repeatability.',
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email-notification', {
        body: {
          eventType: 'admin_reply',
          enquiryId: 'enq-uuid-777',
          subject: 'Regarding Bore Gauge Tolerance',
          message: 'We can achieve 0.0005mm repeatability.',
        },
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('resend-reply-123');
    });

    it('captures provider error when rejected', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: false,
          status: 'FAILED',
          error: 'Domain not verified in Resend',
          code: 'DOMAIN_NOT_VERIFIED',
        },
        error: null,
      });

      const res = await emailMessageService.sendAdminReply({
        enquiryId: 'enq-uuid-777',
        subject: 'Test Subject',
        message: 'Test Message',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Domain not verified in Resend');
      expect(res.code).toBe('DOMAIN_NOT_VERIFIED');
    });
  });

  describe('sendTestEmail', () => {
    it('validates email format', async () => {
      const res = await emailMessageService.sendTestEmail('invalid-email');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Valid recipient email address is required');
    });

    it('invokes send-email-notification with test event', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          status: 'SENT',
          providerMessageId: 'test-msg-id-888',
        },
        error: null,
      });

      const res = await emailMessageService.sendTestEmail('admin@akiraautomation.com');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email-notification', {
        body: {
          eventType: 'test',
          recipient: 'admin@akiraautomation.com',
          subject: 'AKIRA AUTOMATION — Test Email',
        },
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('test-msg-id-888');
    });
  });

  describe('checkDomainStatus', () => {
    it('invokes send-email-notification with check_domain event', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          success: true,
          isVerified: true,
          domainName: 'akiraautomation.com',
          status: 'verified',
          records: [{ record: 'DKIM', type: 'TXT', status: 'verified', value: 'p=...' }],
        },
        error: null,
      });

      const res = await emailMessageService.checkDomainStatus();

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email-notification', {
        body: { eventType: 'check_domain' },
      });
      expect(res.success).toBe(true);
      expect(res.isVerified).toBe(true);
      expect(res.status).toBe('verified');
      expect(res.dnsRecords).toHaveLength(1);
    });
  });
});
