import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attendanceService } from './attendanceService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('AttendanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clocks in staff member with GPS coordinates', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockAttendance = {
      id: 'att_1',
      staff_id: 'staff_123',
      work_date: new Date().toISOString().slice(0, 10),
      clock_in_at: new Date().toISOString(),
      clock_in_lat: 12.9716,
      clock_in_lng: 77.5946,
      status: 'present',
    };

    // First check if existing: return null
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqDate = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEqStaff = vi.fn().mockReturnValue({ eq: mockEqDate });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEqStaff });

    // Then insert
    const mockSingle = vi.fn().mockResolvedValue({ data: mockAttendance, error: null });
    const mockSelectInsert = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelectInsert });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'staff_attendance') {
        return {
          select: mockSelectCheck,
          insert: mockInsert,
        } as any;
      }
      if (table === 'activity_logs') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) } as any;
      }
      return {} as any;
    });

    const result = await attendanceService.clockIn({
      staffId: 'staff_123',
      coords: { lat: 12.9716, lng: 77.5946 },
      status: 'present',
    });

    expect(result.attendance).toBeDefined();
    expect(result.attendance?.status).toBe('present');
    expect(result.error).toBeNull();
  });

  it('prevents duplicate clock-in for the same date', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const existingAttendance = {
      id: 'att_1',
      staff_id: 'staff_123',
      work_date: new Date().toISOString().slice(0, 10),
      status: 'present',
    };

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: existingAttendance, error: null });
    const mockEqDate = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEqStaff = vi.fn().mockReturnValue({ eq: mockEqDate });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'staff_attendance') {
        return {
          select: vi.fn().mockReturnValue({ eq: mockEqStaff }),
        } as any;
      }
      return {} as any;
    });

    const result = await attendanceService.clockIn({
      staffId: 'staff_123',
      status: 'present',
    });

    expect(result.error).toBe('Already clocked in for today.');
    expect(result.attendance).toEqual(existingAttendance);
  });
});
