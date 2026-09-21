import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { visitService } from './visitService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('VisitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('schedules a field visit and logs activity', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockVisit = {
      id: 'visit_1',
      enquiry_id: 'enq_123',
      staff_id: 'staff_abc',
      title: 'Gauge Calibration Site Inspection',
      visit_purpose: 'site_inspection',
      status: 'scheduled',
      scheduled_at: '2026-09-25T10:00:00Z',
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockVisit, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'field_visits') {
        return { insert: mockInsert } as any;
      }
      if (table === 'activity_logs') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) } as any;
      }
      return {} as any;
    });

    const result = await visitService.createVisit({
      enquiryId: 'enq_123',
      staffId: 'staff_abc',
      title: 'Gauge Calibration Site Inspection',
      visitPurpose: 'site_inspection',
      scheduledAt: '2026-09-25T10:00:00Z',
    });

    expect(result.visit).toBeDefined();
    expect(result.visit?.title).toBe('Gauge Calibration Site Inspection');
    expect(result.error).toBeNull();
  });

  it('updates check-in GPS coordinates', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'field_visits') {
        return { update: mockUpdate } as any;
      }
      if (table === 'activity_logs') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) } as any;
      }
      return {} as any;
    });

    const res = await visitService.checkInVisit('visit_1', { lat: 12.9716, lng: 77.5946 });
    expect(res.success).toBe(true);
    expect(res.error).toBeNull();
  });
});
