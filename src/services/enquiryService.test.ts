import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enquiryService } from './enquiryService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('EnquiryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inserts enquiry record successfully when Supabase is configured', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    vi.spyOn(supabase, 'from').mockReturnValue({ insert: mockInsert } as any);

    const result = await enquiryService.createEnquiry({
      name: 'Ramesh Kumar',
      companyName: 'Tata Motors',
      email: 'ramesh@tatamotors.com',
      phone: '+91 9876543210',
      specificProduct: 'Air Plug Gauge',
      message: 'Need quotation for 50mm bore air plug gauge with masters.',
    });

    expect(result.enquiry).toBeDefined();
    expect(result.enquiry?.name).toBe('Ramesh Kumar');
    expect(result.error).toBeNull();
  });

  it('returns sanitized error message when database insertion fails without leaking SQL errors', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockInsert = vi.fn().mockResolvedValue({
      error: { message: 'relation "public.enquiries" violates check constraint', code: '23514' },
    });

    vi.spyOn(supabase, 'from').mockReturnValue({ insert: mockInsert } as any);

    const result = await enquiryService.createEnquiry({
      name: 'Test Client',
      companyName: 'Test Co',
      email: 'test@example.com',
      phone: '12345678',
      message: 'Checking price',
    });

    expect(result.enquiry).toBeNull();
    // Must NOT contain raw PostgreSQL error code or table reference
    expect(result.error).toBe('Unable to submit your enquiry. Please try again.');
  });
});
