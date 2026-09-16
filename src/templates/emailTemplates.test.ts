import { describe, it, expect } from 'vitest';
import {
  renderNewEnquiryAdminEmail,
  renderNewEnquiryCustomerEmail,
  renderEnquiryAssignedEmail,
  renderFollowupAssignedEmail,
  renderFollowupReminderEmail,
  renderAdminReplyEmail,
  renderTestEmail,
} from './emailTemplates';
import {
  NewEnquiryEmailData,
  EnquiryAssignedEmailData,
  FollowupAssignedEmailData,
  FollowupReminderEmailData,
  AdminReplyEmailData,
  TestEmailData,
} from '../types/email';

const mockEnquiryData: NewEnquiryEmailData = {
  enquiryId: '12345678-abcd-ef00-1234-567890abcdef',
  name: 'Rajesh Sharma',
  company: 'Tata Motors Limited',
  email: 'rajesh.sharma@tatamotors.com',
  phone: '+91 9876543210',
  industry: 'Automotive',
  productCategory: 'Air Gauging Systems',
  specificProduct: 'Multi-Jet Air Plug Gauge',
  message: 'Require precision bore gauging solution for diesel engine blocks with 0.001mm tolerance.',
  source: 'website',
};

const mockEnquiryAssignedData: EnquiryAssignedEmailData = {
  enquiryId: '12345678-abcd-ef00-1234-567890abcdef',
  customerName: 'Rajesh Sharma',
  customerCompany: 'Tata Motors Limited',
  customerEmail: 'rajesh.sharma@tatamotors.com',
  assignedStaffName: 'Arun Kumar',
  assignedStaffEmail: 'arun@akiraautomation.com',
  productOrCategory: 'Multi-Jet Air Plug Gauge',
  messageSnippet: 'Require precision bore gauging solution for diesel engine blocks.',
};

const mockFollowupAssignedData: FollowupAssignedEmailData = {
  followupId: 'fup-999',
  enquiryId: '12345678-abcd-ef00-1234-567890abcdef',
  customerName: 'Rajesh Sharma',
  customerCompany: 'Tata Motors Limited',
  assignedStaffName: 'Arun Kumar',
  assignedStaffEmail: 'arun@akiraautomation.com',
  type: 'call',
  scheduledAt: '2026-09-18T10:00:00Z',
  dueDate: '2026-09-18',
  priority: 'high',
  notes: 'Discuss calibration certificate requirements and delivery timelines.',
};

const mockFollowupReminderData: FollowupReminderEmailData = {
  followupId: 'fup-999',
  enquiryId: '12345678-abcd-ef00-1234-567890abcdef',
  customerName: 'Rajesh Sharma',
  customerCompany: 'Tata Motors Limited',
  assignedStaffName: 'Arun Kumar',
  assignedStaffEmail: 'arun@akiraautomation.com',
  type: 'demo',
  scheduledAt: '2026-09-18T10:00:00Z',
  isOverdue: true,
  priority: 'high',
  notes: 'Online demonstration of electronic gauging column.',
};

describe('Email Templates', () => {
  it('1. renders new enquiry admin notification email with all customer metadata', () => {
    const email = renderNewEnquiryAdminEmail(mockEnquiryData);

    expect(email.subject).toContain('[New RFQ]');
    expect(email.subject).toContain('Tata Motors Limited');
    expect(email.html).toContain('AKIRA AUTOMATION');
    expect(email.html).toContain('Rajesh Sharma');
    expect(email.html).toContain('Tata Motors Limited');
    expect(email.html).toContain('rajesh.sharma@tatamotors.com');
    expect(email.html).toContain('Multi-Jet Air Plug Gauge');
    expect(email.html).toContain('/admin/enquiries/12345678-abcd-ef00-1234-567890abcdef');
    expect(email.text).toContain('Rajesh Sharma');
  });

  it('2. renders new enquiry customer acknowledgement email with reference ID', () => {
    const email = renderNewEnquiryCustomerEmail(mockEnquiryData);

    expect(email.subject).toContain('Acknowledgement: AKIRA AUTOMATION');
    expect(email.html).toContain('Dear Rajesh Sharma');
    expect(email.html).toContain('12345678');
    expect(email.html).toContain('Multi-Jet Air Plug Gauge');
    expect(email.text).toContain('12345678');
  });

  it('3. renders enquiry assigned email with staff name and customer details', () => {
    const email = renderEnquiryAssignedEmail(mockEnquiryAssignedData);

    expect(email.subject).toContain('New Enquiry Task Assigned - AKIRA AUTOMATION');
    expect(email.html).toContain('Hello Arun Kumar');
    expect(email.html).toContain('Rajesh Sharma');
    expect(email.html).toContain('Tata Motors Limited');
    expect(email.html).toContain('/admin/login?redirect=/admin/enquiries/12345678-abcd-ef00-1234-567890abcdef');
    expect(email.text).toContain('Arun Kumar');
    expect(email.text).toContain('New Enquiry Task Assigned - AKIRA AUTOMATION');
  });

  it('4. renders followup assigned email with schedule and task type', () => {
    const email = renderFollowupAssignedEmail(mockFollowupAssignedData);

    expect(email.subject).toContain('[Task Assigned] CALL');
    expect(email.html).toContain('Hello Arun Kumar');
    expect(email.html).toContain('CALL');
    expect(email.html).toContain('Discuss calibration certificate requirements');
    expect(email.text).toContain('CALL');
  });

  it('5. renders followup overdue alert with alert badge styling', () => {
    const email = renderFollowupReminderEmail(mockFollowupReminderData);

    expect(email.subject).toContain('[OVERDUE] DEMO');
    expect(email.html).toContain('badge-rose');
    expect(email.html).toContain('OVERDUE TASK ALERT');
    expect(email.html).toContain('Online demonstration');
    expect(email.text).toContain('OVERDUE TASK ALERT');
  });

  it('6. renders followup due today reminder with standard reminder badge', () => {
    const dueTodayData: FollowupReminderEmailData = {
      ...mockFollowupReminderData,
      isOverdue: false,
    };
    const email = renderFollowupReminderEmail(dueTodayData);

    expect(email.subject).toContain('[REMINDER] DEMO');
    expect(email.html).toContain('TASK DUE TODAY');
    expect(email.html).toContain('badge-amber');
  });

  it('7. renders admin reply email to customer with enquiry reference and message', () => {
    const mockAdminReply: AdminReplyEmailData = {
      enquiryId: '12345678-abcd-ef00-1234-567890abcdef',
      customerName: 'Rajesh Sharma',
      customerEmail: 'rajesh.sharma@tatamotors.com',
      subject: 'Air Plug Gauge Quotation and Tolerance Analysis',
      message: 'We have analyzed your 0.001mm tolerance requirement. Please find our technical specification attached.',
      senderName: 'Suresh Raina',
      senderRole: 'Senior Metrology Applications Engineer',
    };

    const email = renderAdminReplyEmail(mockAdminReply);

    expect(email.subject).toContain('Re: Air Plug Gauge Quotation');
    expect(email.html).toContain('Dear Rajesh Sharma');
    expect(email.html).toContain('#12345678');
    expect(email.html).toContain('Suresh Raina');
    expect(email.html).toContain('Senior Metrology Applications Engineer');
    expect(email.html).toContain('support@akiraautomation.com');
    expect(email.text).toContain('Rajesh Sharma');
    expect(email.text).toContain('AKIRA AUTOMATION PRIVATE LIMITED');
  });

  it('8. renders system diagnostic test email with environment and provider metadata', () => {
    const mockTestData: TestEmailData = {
      recipientEmail: 'admin@akiraautomation.com',
      triggeredBy: 'Administrator Console',
      environment: 'Production',
      timestamp: '2026-09-16T15:30:00Z',
    };

    const email = renderTestEmail(mockTestData);

    expect(email.subject).toBe('AKIRA AUTOMATION — Test Email');
    expect(email.html).toContain('Operational Diagnostic Test');
    expect(email.html).toContain('admin@akiraautomation.com');
    expect(email.html).toContain('send-email-notification');
    expect(email.html).toContain('Resend (api.resend.com)');
    expect(email.text).toContain('AKIRA AUTOMATION — Test Email');
    expect(email.text).toContain('admin@akiraautomation.com');
  });
});
