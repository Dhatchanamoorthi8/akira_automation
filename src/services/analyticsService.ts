import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AnalyticsOverviewStats,
  DateRangePreset,
  EnquiryTrendPoint,
  EnquiryStatusDistribution,
  StaffWorkloadStat,
  EnquiryStatus,
} from '../types/database';

export class AnalyticsService {
  /**
   * Helper to calculate ISO timestamps for standard date range presets
   */
  getDateRange(preset: DateRangePreset, customStart?: string, customEnd?: string): { startDate: string; endDate: string } {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (preset === 'custom' && customStart && customEnd) {
      const s = new Date(customStart);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return {
        startDate: s.toISOString(),
        endDate: e.toISOString(),
      };
    }

    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    switch (preset) {
      case 'today':
        // start is today 00:00:00
        break;
      case '7d':
        start.setDate(start.getDate() - 6);
        break;
      case '30d':
        start.setDate(start.getDate() - 29);
        break;
      case '90d':
        start.setDate(start.getDate() - 89);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        break;
      default:
        // Default 30d
        start.setDate(start.getDate() - 29);
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: endOfDay.toISOString(),
    };
  }

  /**
   * Fetch high-level analytics KPIs.
   * Tries PostgreSQL RPC function first, then cleanly falls back to direct queries.
   */
  async getOverviewStats(startDate: string, endDate: string): Promise<{
    stats: AnalyticsOverviewStats | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { stats: null, error: 'Database configuration is unavailable.' };
    }

    // Attempt 1: Call PostgreSQL RPC get_admin_analytics_overview
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_analytics_overview', {
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (!rpcError && rpcData) {
        const stats: AnalyticsOverviewStats = {
          totalEnquiries: Number(rpcData.total_enquiries || 0),
          newEnquiries: Number(rpcData.new_enquiries || 0),
          activeEnquiries: Number(rpcData.active_enquiries || 0),
          convertedEnquiries: Number(rpcData.converted_enquiries || 0),
          closedEnquiries: Number(rpcData.closed_enquiries || 0),
          totalFollowups: Number(rpcData.total_followups || 0),
          completedFollowups: Number(rpcData.completed_followups || 0),
          cancelledFollowups: Number(rpcData.cancelled_followups || 0),
          overdueFollowups: Number(rpcData.overdue_followups || 0),
          dueTodayFollowups: Number(rpcData.due_today_followups || 0),
          upcomingFollowups: Number(rpcData.upcoming_followups || 0),
          enquiryConversionRate: Number(rpcData.enquiry_conversion_rate || 0),
          followupCompletionRate: Number(rpcData.followup_completion_rate || 0),
          allTimeEnquiries: Number(rpcData.all_time_enquiries || 0),
          allTimeFollowups: Number(rpcData.all_time_followups || 0),
          activeProducts: Number(rpcData.active_products || 0),
        };
        return { stats, error: null };
      }
    } catch {
      // Fallback to client-side queries
    }

    // Attempt 2: Fallback query execution
    try {
      // Enquiries in date range
      const { data: enquiries, error: enqErr } = await supabase
        .from('enquiries')
        .select('id, status, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (enqErr) throw enqErr;

      // Followups in date range
      const { data: followups, error: folErr } = await supabase
        .from('followups')
        .select('id, status, scheduled_at, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (folErr) throw folErr;

      // All time totals
      const [
        { count: allEnquiriesCount },
        { count: allFollowupsCount },
        { count: activeProductsCount },
      ] = await Promise.all([
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('followups').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
      ]);

      const enqList = enquiries || [];
      const totalEnquiries = enqList.length;
      const newEnquiries = enqList.filter((e) => e.status === 'new').length;
      const activeEnquiries = enqList.filter((e) =>
        ['contacted', 'quotation_sent', 'follow_up'].includes(e.status)
      ).length;
      const convertedEnquiries = enqList.filter((e) => e.status === 'converted').length;
      const closedEnquiries = enqList.filter((e) => e.status === 'closed').length;

      const folList = followups || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      let completedFollowups = 0;
      let cancelledFollowups = 0;
      let overdueFollowups = 0;
      let dueTodayFollowups = 0;
      let upcomingFollowups = 0;

      folList.forEach((f) => {
        const schedDate = f.scheduled_at ? f.scheduled_at.split('T')[0] : '';
        if (f.status === 'completed') {
          completedFollowups++;
        } else if (f.status === 'cancelled') {
          cancelledFollowups++;
        } else if (
          f.status === 'overdue' ||
          (f.status === 'upcoming' && f.scheduled_at && f.scheduled_at < nowIso)
        ) {
          overdueFollowups++;
        } else if (
          f.status === 'due_today' ||
          (f.status === 'upcoming' && schedDate === todayStr)
        ) {
          dueTodayFollowups++;
        } else {
          upcomingFollowups++;
        }
      });

      const totalFollowups = folList.length;
      const actionableFollowups = completedFollowups + overdueFollowups + dueTodayFollowups + upcomingFollowups;

      const enquiryConversionRate = totalEnquiries > 0
        ? Math.round((convertedEnquiries / totalEnquiries) * 1000) / 10
        : 0;

      const followupCompletionRate = actionableFollowups > 0
        ? Math.round((completedFollowups / actionableFollowups) * 1000) / 10
        : 0;

      const stats: AnalyticsOverviewStats = {
        totalEnquiries,
        newEnquiries,
        activeEnquiries,
        convertedEnquiries,
        closedEnquiries,
        totalFollowups,
        completedFollowups,
        cancelledFollowups,
        overdueFollowups,
        dueTodayFollowups,
        upcomingFollowups,
        enquiryConversionRate,
        followupCompletionRate,
        allTimeEnquiries: allEnquiriesCount || 0,
        allTimeFollowups: allFollowupsCount || 0,
        activeProducts: activeProductsCount || 0,
      };

      return { stats, error: null };
    } catch (err: unknown) {
      return {
        stats: null,
        error: err instanceof Error ? err.message : 'Unable to compute analytics statistics.',
      };
    }
  }

  /**
   * Generate continuous daily trend points of enquiry volume and conversions.
   */
  async getEnquiryTrend(startDate: string, endDate: string): Promise<{
    trend: EnquiryTrendPoint[];
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { trend: [], error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('id, created_at, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by YYYY-MM-DD
      const dateMap = new Map<string, { count: number; converted: number }>();

      // Generate all dates in range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);

      while (current <= end) {
        const dateKey = current.toISOString().split('T')[0];
        dateMap.set(dateKey, { count: 0, converted: 0 });
        current.setDate(current.getDate() + 1);
      }

      (data || []).forEach((row) => {
        const dateKey = row.created_at.split('T')[0];
        const entry = dateMap.get(dateKey) || { count: 0, converted: 0 };
        entry.count++;
        if (row.status === 'converted') {
          entry.converted++;
        }
        dateMap.set(dateKey, entry);
      });

      const trend: EnquiryTrendPoint[] = Array.from(dateMap.entries()).map(([date, entry]) => {
        const d = new Date(date + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date,
          label,
          count: entry.count,
          converted: entry.converted,
        };
      });

      return { trend, error: null };
    } catch (err: unknown) {
      return {
        trend: [],
        error: err instanceof Error ? err.message : 'Unable to compute enquiry trend.',
      };
    }
  }

  /**
   * Generate status distribution breakdown with percentages and color codes.
   */
  async getEnquiryStatusSummary(startDate: string, endDate: string): Promise<{
    distribution: EnquiryStatusDistribution[];
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { distribution: [], error: 'Database configuration is unavailable.' };
    }

    const statusConfig: Record<EnquiryStatus, { label: string; color: string; colorClass: string }> = {
      new: { label: 'New', color: '#3B82F6', colorClass: 'bg-blue-500' },
      contacted: { label: 'Contacted', color: '#6366F1', colorClass: 'bg-indigo-500' },
      quotation_sent: { label: 'Quotation Sent', color: '#8B5CF6', colorClass: 'bg-purple-500' },
      follow_up: { label: 'Follow Up', color: '#EC4899', colorClass: 'bg-pink-500' },
      converted: { label: 'Converted', color: '#10B981', colorClass: 'bg-emerald-500' },
      closed: { label: 'Closed', color: '#6B7280', colorClass: 'bg-slate-400' },
    };

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const counts: Record<EnquiryStatus, number> = {
        new: 0,
        contacted: 0,
        quotation_sent: 0,
        follow_up: 0,
        converted: 0,
        closed: 0,
      };

      const rows = data || [];
      const total = rows.length;

      rows.forEach((r) => {
        const s = r.status as EnquiryStatus;
        if (counts[s] !== undefined) {
          counts[s]++;
        }
      });

      const distribution: EnquiryStatusDistribution[] = (Object.keys(statusConfig) as EnquiryStatus[]).map((status) => {
        const count = counts[status];
        const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
        return {
          status,
          label: statusConfig[status].label,
          count,
          percentage,
          color: statusConfig[status].color,
          colorClass: statusConfig[status].colorClass,
        };
      });

      return { distribution, error: null };
    } catch (err: unknown) {
      return {
        distribution: [],
        error: err instanceof Error ? err.message : 'Unable to compute status distribution.',
      };
    }
  }

  /**
   * Retrieve workload and completion metrics across team members.
   */
  async getStaffWorkload(startDate: string, endDate: string): Promise<{
    workload: StaffWorkloadStat[];
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { workload: [], error: 'Database configuration is unavailable.' };
    }

    // Try RPC first
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_staff_workload_analytics', {
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (!rpcError && Array.isArray(rpcData)) {
        const workload: StaffWorkloadStat[] = rpcData.map((row: any) => ({
          staffId: row.staff_id,
          fullName: row.full_name || 'Unnamed',
          email: row.email,
          role: row.role,
          assignedEnquiries: Number(row.assigned_enquiries || 0),
          assignedFollowups: Number(row.assigned_followups || 0),
          completedFollowups: Number(row.completed_followups || 0),
          overdueFollowups: Number(row.overdue_followups || 0),
          completionRate: Number(row.completion_rate || 0),
        }));
        return { workload, error: null };
      }
    } catch {
      // Fallback
    }

    // Fallback query
    try {
      const { data: staffList, error: sErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('active', true)
        .order('full_name', { ascending: true });

      if (sErr) throw sErr;

      const { data: enquiries, error: eErr } = await supabase
        .from('enquiries')
        .select('id, assigned_to')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .not('assigned_to', 'is', null);

      if (eErr) throw eErr;

      // Safely query followups with assigned_to if column exists
      let followups: Array<{ id: string; assigned_to?: string | null; status: string; scheduled_at?: string }> = [];
      try {
        const { data: fData, error: fErr } = await supabase
          .from('followups')
          .select('id, assigned_to, status, scheduled_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .not('assigned_to', 'is', null);

        if (!fErr && fData) {
          followups = fData;
        }
      } catch {
        // Continue with empty followups
      }

      const nowIso = new Date().toISOString();

      const workload: StaffWorkloadStat[] = (staffList || []).map((staff) => {
        const staffEnquiries = (enquiries || []).filter((e) => e.assigned_to === staff.id);
        const staffFollowups = followups.filter((f) => f.assigned_to === staff.id);

        let completed = 0;
        let overdue = 0;

        staffFollowups.forEach((f) => {
          if (f.status === 'completed') {
            completed++;
          } else if (
            f.status === 'overdue' ||
            (f.status === 'upcoming' && f.scheduled_at && f.scheduled_at < nowIso)
          ) {
            overdue++;
          }
        });

        const totalAssignedFollowups = staffFollowups.length;
        const completionRate = totalAssignedFollowups > 0
          ? Math.round((completed / totalAssignedFollowups) * 1000) / 10
          : 0;

        return {
          staffId: staff.id,
          fullName: staff.full_name || 'Staff Member',
          email: staff.email,
          role: staff.role,
          assignedEnquiries: staffEnquiries.length,
          assignedFollowups: totalAssignedFollowups,
          completedFollowups: completed,
          overdueFollowups: overdue,
          completionRate,
        };
      });

      return { workload, error: null };
    } catch (err: unknown) {
      return {
        workload: [],
        error: err instanceof Error ? err.message : 'Unable to compute staff workload analytics.',
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
