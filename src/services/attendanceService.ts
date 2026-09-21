import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  StaffAttendance,
  ClockInInput,
  ClockOutInput,
  StaffProfile,
} from '../types/database';
import { activityService } from './activityService';

export interface StaffWithAttendanceStatus extends StaffProfile {
  attendanceStatus: 'present' | 'on_field' | 'clocked_out' | 'not_reported';
  todayAttendance?: StaffAttendance | null;
}

export class AttendanceService {
  /**
   * Clock in for the day (captures GPS coordinates).
   */
  async clockIn(input: ClockInInput): Promise<{
    attendance: StaffAttendance | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { attendance: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.staffId) {
      return { attendance: null, error: 'Staff ID is required.' };
    }

    const todayDate = new Date().toISOString().slice(0, 10);

    try {
      // 1. Check if already clocked in today
      const { data: existing } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('staff_id', input.staffId)
        .eq('work_date', todayDate)
        .maybeSingle();

      if (existing) {
        return {
          attendance: existing as StaffAttendance,
          error: 'Already clocked in for today.',
        };
      }

      // 2. Insert attendance record
      const now = new Date().toISOString();
      const coords = input.coords;
      const { data, error } = await supabase
        .from('staff_attendance')
        .insert({
          staff_id: input.staffId,
          work_date: todayDate,
          clock_in_at: now,
          clock_in_lat: coords?.lat || null,
          clock_in_lng: coords?.lng || null,
          clock_in_address: input.address || (coords ? `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}` : null),
          status: input.status || 'present',
          notes: input.notes?.trim() || null,
        })
        .select(`
          *,
          staff_profile:profiles!staff_attendance_staff_id_fkey(id, email, full_name, role)
        `)
        .single();

      if (error || !data) {
        return { attendance: null, error: error?.message || 'Failed to clock in.' };
      }

      await activityService.recordActivity({
        entityType: 'staff_attendance',
        entityId: data.id,
        action: 'STAFF_CLOCKED_IN',
        newValue: {
          work_date: todayDate,
          clock_in_at: now,
          status: input.status || 'present',
        },
        description: `Staff clocked in (${input.status || 'present'}) at ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        performedBy: input.staffId,
      });

      return { attendance: data as StaffAttendance, error: null };
    } catch (err: unknown) {
      return {
        attendance: null,
        error: err instanceof Error ? err.message : 'Unable to clock in.',
      };
    }
  }

  /**
   * Clock out for the day.
   */
  async clockOut(input: ClockOutInput): Promise<{
    attendance: StaffAttendance | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { attendance: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.attendanceId) {
      return { attendance: null, error: 'Attendance ID is required.' };
    }

    try {
      const now = new Date().toISOString();
      const coords = input.coords;

      const { data, error } = await supabase
        .from('staff_attendance')
        .update({
          clock_out_at: now,
          clock_out_lat: coords?.lat || null,
          clock_out_lng: coords?.lng || null,
          clock_out_address: input.address || (coords ? `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}` : null),
        })
        .eq('id', input.attendanceId)
        .select(`
          *,
          staff_profile:profiles!staff_attendance_staff_id_fkey(id, email, full_name, role)
        `)
        .single();

      if (error || !data) {
        return { attendance: null, error: error?.message || 'Failed to clock out.' };
      }

      await activityService.recordActivity({
        entityType: 'staff_attendance',
        entityId: data.id,
        action: 'STAFF_CLOCKED_OUT',
        newValue: { clock_out_at: now },
        description: `Staff clocked out at ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        performedBy: data.staff_id,
      });

      return { attendance: data as StaffAttendance, error: null };
    } catch (err: unknown) {
      return {
        attendance: null,
        error: err instanceof Error ? err.message : 'Unable to clock out.',
      };
    }
  }

  /**
   * Get staff member's attendance record for today.
   */
  async getTodayAttendance(staffId: string): Promise<StaffAttendance | null> {
    if (!isSupabaseConfigured()) return null;

    const todayDate = new Date().toISOString().slice(0, 10);
    try {
      const { data, error } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('staff_id', staffId)
        .eq('work_date', todayDate)
        .maybeSingle();

      if (error || !data) return null;
      return data as StaffAttendance;
    } catch {
      return null;
    }
  }

  /**
   * Get all active staff with today's attendance status.
   * Useful for admin assignment picker to select available sales reps.
   * @param includeAdmin If true, includes admin profiles for assignment purposes. Defaults to false (only field/sales staff).
   */
  async getActiveStaffWithAttendance(includeAdmin = false): Promise<StaffWithAttendanceStatus[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const todayDate = new Date().toISOString().slice(0, 10);

      let profileQuery = supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('active', true);

      if (!includeAdmin) {
        profileQuery = profileQuery.neq('role', 'admin');
      }

      const [staffRes, attendanceRes] = await Promise.all([
        profileQuery.order('full_name', { ascending: true }),
        supabase
          .from('staff_attendance')
          .select('*')
          .eq('work_date', todayDate),
      ]);

      const staffProfiles = (staffRes.data || []) as StaffProfile[];
      const todayAttendances = (attendanceRes.data || []) as StaffAttendance[];

      const attendanceMap = new Map<string, StaffAttendance>();
      todayAttendances.forEach((att) => {
        attendanceMap.set(att.staff_id, att);
      });

      return staffProfiles.map((staff) => {
        const att = attendanceMap.get(staff.id);
        let status: 'present' | 'on_field' | 'clocked_out' | 'not_reported' = 'not_reported';

        if (staff.role === 'admin') {
          status = 'present';
        } else if (att) {
          if (att.clock_out_at) {
            status = 'clocked_out';
          } else if (att.status === 'on_field') {
            status = 'on_field';
          } else {
            status = 'present';
          }
        }

        return {
          ...staff,
          attendanceStatus: status,
          todayAttendance: att || null,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Get monthly attendance records for a staff member or all staff (admin).
   */
  async getAttendanceHistory(filters: {
    staffId?: string;
    month?: string; // YYYY-MM
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<StaffAttendance[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase
        .from('staff_attendance')
        .select(`
          *,
          staff_profile:profiles!staff_attendance_staff_id_fkey(id, email, full_name, role)
        `);

      if (filters.staffId && filters.staffId !== 'all') {
        query = query.eq('staff_id', filters.staffId);
      }

      if (filters.dateFrom) {
        query = query.gte('work_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('work_date', filters.dateTo);
      }

      query = query.order('work_date', { ascending: false });

      const { data, error } = await query;
      if (error || !data) return [];
      return data as StaffAttendance[];
    } catch {
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();
