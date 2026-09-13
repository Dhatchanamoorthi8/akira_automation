import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DashboardStats, Enquiry, Followup, ActivityLog } from '../types/database';

export interface DailyEnquiryTrend {
  date: string;
  label: string;
  count: number;
}

export interface EnquiryStatusDistribution {
  status: string;
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
}

export class DashboardService {
  /**
   * Aggregate key business metrics across products, enquiries, and followups.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const defaultStats: DashboardStats = {
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      totalEnquiries: 0,
      newEnquiries: 0,
      openFollowups: 0,
      overdueFollowups: 0,
      completedFollowups: 0,
      convertedEnquiries: 0,
    };

    if (!isSupabaseConfigured()) {
      return defaultStats;
    }

    try {
      const nowIso = new Date().toISOString();

      // Parallel execution for optimal performance
      const [
        productsRes,
        activeProductsRes,
        featuredProductsRes,
        totalEnquiriesRes,
        newEnquiriesRes,
        convertedEnquiriesRes,
        openFollowupsRes,
        overdueFollowupsRes,
        completedFollowupsRes,
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('featured', true),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
        supabase.from('followups').select('*', { count: 'exact', head: true }).in('status', ['upcoming', 'due_today']),
        supabase.from('followups').select('*', { count: 'exact', head: true }).eq('status', 'overdue').or(`status.eq.upcoming,scheduled_at.lt.${nowIso}`),
        supabase.from('followups').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);

      return {
        totalProducts: productsRes.count || 0,
        activeProducts: activeProductsRes.count || 0,
        featuredProducts: featuredProductsRes.count || 0,
        totalEnquiries: totalEnquiriesRes.count || 0,
        newEnquiries: newEnquiriesRes.count || 0,
        openFollowups: openFollowupsRes.count || 0,
        overdueFollowups: overdueFollowupsRes.count || 0,
        completedFollowups: completedFollowupsRes.count || 0,
        convertedEnquiries: convertedEnquiriesRes.count || 0,
      };
    } catch {
      return defaultStats;
    }
  }

  /**
   * Retrieve recent inbound customer enquiries.
   */
  async getRecentEnquiries(limit: number = 5): Promise<Enquiry[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data || []) as Enquiry[];
    } catch {
      return [];
    }
  }

  /**
   * Retrieve upcoming follow-up appointments.
   */
  async getUpcomingFollowups(limit: number = 5): Promise<Followup[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data } = await supabase
        .from('followups')
        .select('*, enquiries(name, company, email)')
        .in('status', ['upcoming', 'due_today'])
        .order('scheduled_at', { ascending: true })
        .limit(limit);

      return (data || []) as Followup[];
    } catch {
      return [];
    }
  }

  /**
   * Retrieve recent system and entity activities.
   */
  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data || []) as ActivityLog[];
    } catch {
      return [];
    }
  }

  /**
   * Calculate daily enquiry counts over a rolling period (default 7 days).
   * Aggregates real created_at records from Supabase.
   */
  async getEnquiryTrend(days: number = 7): Promise<DailyEnquiryTrend[]> {
    // Generate dates template for the requested window
    const now = new Date();
    const result: DailyEnquiryTrend[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const weekdayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      result.push({
        date: isoDate,
        label: weekdayLabel,
        count: 0,
      });
    }

    if (!isSupabaseConfigured()) {
      return result;
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('enquiries')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error || !data) return result;

      // Map records to day buckets in user's local timezone
      const countsByDate: Record<string, number> = {};
      data.forEach((row: { created_at: string }) => {
        const localDate = new Date(row.created_at).toISOString().split('T')[0];
        countsByDate[localDate] = (countsByDate[localDate] || 0) + 1;
      });

      return result.map(bucket => ({
        ...bucket,
        count: countsByDate[bucket.date] || 0,
      }));
    } catch {
      return result;
    }
  }

  /**
   * Calculate real breakdown of enquiries by lifecycle status.
   */
  async getEnquiryStatusSummary(): Promise<EnquiryStatusDistribution[]> {
    const statusMeta = [
      { status: 'new', label: 'New / RFQ', colorClass: 'bg-sky-500' },
      { status: 'contacted', label: 'Contacted', colorClass: 'bg-blue-600' },
      { status: 'quotation_sent', label: 'Quotation Sent', colorClass: 'bg-amber-500' },
      { status: 'follow_up', label: 'Follow-up', colorClass: 'bg-indigo-500' },
      { status: 'converted', label: 'Converted', colorClass: 'bg-emerald-500' },
      { status: 'closed', label: 'Closed', colorClass: 'bg-slate-400' },
    ];

    if (!isSupabaseConfigured()) {
      return statusMeta.map(m => ({ ...m, count: 0, percentage: 0 }));
    }

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('status');

      if (error || !data || data.length === 0) {
        return statusMeta.map(m => ({ ...m, count: 0, percentage: 0 }));
      }

      const total = data.length;
      const counts: Record<string, number> = {};
      data.forEach((row: { status: string }) => {
        counts[row.status] = (counts[row.status] || 0) + 1;
      });

      return statusMeta.map(m => {
        const count = counts[m.status] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          ...m,
          count,
          percentage,
        };
      });
    } catch {
      return statusMeta.map(m => ({ ...m, count: 0, percentage: 0 }));
    }
  }
}

export const dashboardService = new DashboardService();
