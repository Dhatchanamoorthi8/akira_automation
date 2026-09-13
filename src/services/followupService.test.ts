import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { followupService } from './followupService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('FollowupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates scheduled follow-up for an enquiry', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockFollowup = {
      id: 'f-1',
      enquiry_id: 'e-1',
      scheduled_at: '2026-09-15T10:00:00Z',
      type: 'call',
      status: 'upcoming',
      notes: 'Call quality manager regarding tolerance specs',
      created_at: '2026-09-12T10:00:00Z',
    };

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockFollowup, error: null }),
      }),
    });

    vi.spyOn(supabase, 'from').mockReturnValue({ insert: mockInsert } as any);

    const result = await followupService.createFollowup({
      enquiryId: 'e-1',
      scheduledAt: '2026-09-15T10:00:00Z',
      type: 'call',
      notes: 'Call quality manager regarding tolerance specs',
    });

    expect(result.followup).toBeDefined();
    expect(result.followup?.id).toBe('f-1');
    expect(result.error).toBeNull();
  });

  it('completes follow-up and updates outcome', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'f-1', enquiry_id: 'e-1', status: 'completed' },
            error: null,
          }),
        }),
      }),
    });

    vi.spyOn(supabase, 'from').mockReturnValue({
      update: mockUpdate,
      insert: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    const result = await followupService.completeFollowup('f-1', 'Quotation approved by client', 'e-1');
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
  });
});
