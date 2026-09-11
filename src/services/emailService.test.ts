import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from './emailService';
import { EnquiryFormData } from '../types';

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

describe('EmailService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('initializes with default recipient and CC from company config', () => {
    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
      ccEmail: 'sales@akiraautomation.com',
    });

    expect(service.getRecipientEmail()).toBe('milestonegauges@gmail.com');
    expect(service.getCcEmail()).toBe('sales@akiraautomation.com');
  });

  it('posts formatted JSON payload to FormSubmit endpoint on sendEnquiry', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: 'true', message: 'The form was submitted successfully.' }),
    });
    global.fetch = mockFetch;

    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
      ccEmail: 'sales@akiraautomation.com',
    });

    const result = await service.sendEnquiry(mockFormData);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [endpoint, options] = mockFetch.mock.calls[0];

    expect(endpoint).toBe('https://formsubmit.co/ajax/milestonegauges%40gmail.com');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = JSON.parse(options.body);
    expect(body['Client Name']).toBe('Suresh Raina');
    expect(body['Company / Organization']).toBe('Chennai Precision Ltd');
    expect(body['Business Email']).toBe('suresh@chennaiprecision.com');
    expect(body['Contact Number']).toBe('+91 9876543210');
    expect(body['Manufacturing Sector']).toBe('Automotive OEMs');
    expect(body['Product Category']).toBe('Air Gauging');
    expect(body['Specific Gauge / Drawing Ref']).toBe('Air Plug Gauge Ø45mm');
    expect(body['Technical Requirement & Tolerance Specifications']).toContain('Require 2-jet air plug gauge');
    expect(body._cc).toBe('sales@akiraautomation.com');
    expect(body._template).toBe('table');
    expect(body._captcha).toBe('false');

    expect(result.success).toBe(true);
    expect(result.recipientEmail).toBe('milestonegauges@gmail.com');
  });

  it('throws descriptive error when fetch response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
    });

    await expect(service.sendEnquiry(mockFormData)).rejects.toThrow('Server returned status 500');
  });

  it('throws descriptive error when response returns success="false"', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: 'false', message: 'Spam detected or invalid recipient' }),
    });

    const service = new EmailService({
      recipientEmail: 'milestonegauges@gmail.com',
    });

    await expect(service.sendEnquiry(mockFormData)).rejects.toThrow('Spam detected or invalid recipient');
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
});
