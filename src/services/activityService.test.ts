import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { activityService } from './activityService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('ActivityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves activity history with filters and ordering', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockLogs = [
      {
        id: 'log-1',
        entity_type: 'enquiry',
        entity_id: 'e-1',
        action: 'STATUS_UPDATED',
        old_value: { status: 'new' },
        new_value: { status: 'contacted' },
        description: 'Status changed from new to contacted',
        performed_by: 'u-1',
        created_at: '2026-09-12T12:00:00Z',
        actor_profile: { id: 'u-1', full_name: 'Lead Engineer', email: 'admin@akiraautomation.com', role: 'admin' },
      },
    ];

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: mockLogs, error: null, count: 1 }),
    };

    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    } as any);

    const result = await activityService.getActivityHistory({ entityType: 'enquiry', limit: 20 });
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0].action).toBe('STATUS_UPDATED');
    expect(result.total).toBe(1);
    expect(result.error).toBeNull();
  });

  it('records audit activity correctly with auth user ID', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: { id: 'admin-user-id' } as any },
      error: null,
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.spyOn(supabase, 'from').mockReturnValue({ insert: mockInsert } as any);

    await activityService.recordActivity({
      entityType: 'enquiry',
      entityId: 'e-100',
      action: 'ASSIGNED',
      newValue: { assigned_to: 'staff-1' },
      description: 'Assigned enquiry to sales specialist',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'enquiry',
        entity_id: 'e-100',
        action: 'ASSIGNED',
        performed_by: 'admin-user-id',
      })
    );
  });

  it('correctly calculates object diffs while ignoring timestamps', () => {
    const oldObj = {
      name: 'Air Gauge',
      status: 'new',
      updated_at: '2026-09-01T00:00:00Z',
    };
    const newObj = {
      name: 'Air Gauge Precision',
      status: 'contacted',
      updated_at: '2026-09-13T00:00:00Z',
    };

    const diffs = activityService.computeDiff(oldObj, newObj);
    expect(diffs).toHaveLength(2);
    expect(diffs).toEqual(
      expect.arrayContaining([
        { field: 'name', from: 'Air Gauge', to: 'Air Gauge Precision' },
        { field: 'status', from: 'new', to: 'contacted' },
      ])
    );
  });

  it('returns empty diff if objects are identical', () => {
    const obj = { fieldA: 'value1', fieldB: 123 };
    const diffs = activityService.computeDiff(obj, { ...obj });
    expect(diffs).toHaveLength(0);
  });
});
