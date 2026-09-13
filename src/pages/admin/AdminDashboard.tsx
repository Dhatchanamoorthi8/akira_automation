import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { dashboardService } from '../../services/dashboardService';
import {
  AnalyticsOverviewStats,
  DateRangePreset,
  EnquiryTrendPoint,
  EnquiryStatusDistribution,
  StaffWorkloadStat,
  Enquiry,
  Followup,
  ActivityLog,
} from '../../types/database';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { EnquiryTrend } from '../../components/admin/EnquiryTrend';
import { EnquiryStatusSummary } from '../../components/admin/EnquiryStatusSummary';
import { StaffWorkloadTable } from '../../components/admin/StaffWorkloadTable';
import { RecentEnquiries } from '../../components/admin/RecentEnquiries';
import { UpcomingFollowups } from '../../components/admin/UpcomingFollowups';
import { RecentActivity } from '../../components/admin/RecentActivity';
import { AdminStatSkeleton, AdminTableSkeleton, ActivitySkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';
import {
  Mail,
  CalendarClock,
  CheckCircle2,
  RotateCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Clock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Date Range State (default 30 days)
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Analytics Data
  const [overviewStats, setOverviewStats] = useState<AnalyticsOverviewStats | null>(null);
  const [trendData, setTrendData] = useState<EnquiryTrendPoint[]>([]);
  const [statusSummary, setStatusSummary] = useState<EnquiryStatusDistribution[]>([]);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkloadStat[]>([]);

  // Operational Feeds
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [upcomingFollowups, setUpcomingFollowups] = useState<Followup[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const dateRange = useMemo(() => {
    return analyticsService.getDateRange(selectedPreset, customStart, customEnd);
  }, [selectedPreset, customStart, customEnd]);

  const presetLabels: Record<DateRangePreset, string> = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    year: 'This Year',
    custom: 'Custom',
  };

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { startDate, endDate } = dateRange;

      const [
        statsRes,
        trendRes,
        statusRes,
        workloadRes,
        enquiriesRes,
        followupsRes,
        activityRes,
      ] = await Promise.all([
        analyticsService.getOverviewStats(startDate, endDate),
        analyticsService.getEnquiryTrend(startDate, endDate),
        analyticsService.getEnquiryStatusSummary(startDate, endDate),
        analyticsService.getStaffWorkload(startDate, endDate),
        dashboardService.getRecentEnquiries(6),
        dashboardService.getUpcomingFollowups(4),
        dashboardService.getRecentActivity(5),
      ]);

      if (statsRes?.error && !statsRes?.stats) {
        setError(statsRes.error);
      } else {
        setOverviewStats(statsRes?.stats || null);
      }

      setTrendData(trendRes?.trend || []);
      setStatusSummary(statusRes?.distribution || []);
      setStaffWorkload(workloadRes?.workload || []);
      setRecentEnquiries(enquiriesRes || []);
      setUpcomingFollowups(followupsRes || []);
      setRecentActivity(activityRes || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard analytics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setSelectedPreset(preset);
    }
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setSelectedPreset('custom');
      setShowCustomPicker(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Dashboard | AKIRA AUTOMATION"
        description="Executive management and real-time CRM intelligence console for AKIRA AUTOMATION precision metrology systems."
      />

      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* Top Control Bar matching clean reference styling */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
                Operations & CRM Analytics
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3" />
                <span>Executive Intelligence</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Precision metrology operations, RFQ pipeline, follow-up velocity, and staff performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Date Range Selector Pills */}
            <div className="inline-flex rounded-xl border border-slate-200/80 p-1 bg-white shadow-xs text-xs font-medium">
              {(['today', '7d', '30d', '90d', 'year'] as DateRangePreset[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedPreset === p && !showCustomPicker
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {presetLabels[p]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomPicker(!showCustomPicker)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPreset === 'custom' || showCustomPicker
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing || isLoading}
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
              aria-label="Refresh analytics data"
              title="Refresh analytics data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Date Range Popover */}
        {showCustomPicker && (
          <form
            onSubmit={handleApplyCustomRange}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-wrap items-center gap-3 text-xs animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Start Date:</span>
              <input
                type="date"
                required
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">End Date:</span>
              <input
                type="date"
                required
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={() => setShowCustomPicker(false)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Global Error Banner */}
        {error && (
          <AdminErrorState
            title="Database Connection Issue"
            message={error}
            onRetry={() => fetchDashboardData()}
          />
        )}

        {/* 4 PRIMARY KPI CARDS ACROSS DESKTOP (MATCHING REFERENCE IMAGE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-w-0">
          {isLoading ? (
            <>
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
            </>
          ) : (
            <>
              {/* 1. Total Enquiries */}
              <AdminStatCard
                title="Total Enquiries"
                value={overviewStats?.totalEnquiries ?? 0}
                icon={Mail}
                subtext={`Inbound RFQs (${overviewStats?.allTimeEnquiries ?? 0} all-time)`}
                trend={{
                  label: `+${overviewStats?.newEnquiries ?? 0} new`,
                  isPositive: true,
                }}
                iconColorClass="text-blue-600"
                iconBgClass="bg-blue-50"
              />

              {/* 2. New Leads */}
              <AdminStatCard
                title="New Leads"
                value={overviewStats?.newEnquiries ?? 0}
                icon={Clock}
                subtext="Pending initial qualification"
                trend={{
                  label: overviewStats && overviewStats.newEnquiries > 0 ? 'Requires Action' : 'Cleared',
                  isPositive: overviewStats ? overviewStats.newEnquiries === 0 : true,
                }}
                iconColorClass="text-amber-600"
                iconBgClass="bg-amber-50"
              />

              {/* 3. Active Pipeline */}
              <AdminStatCard
                title="Active Pipeline"
                value={overviewStats?.activeEnquiries ?? 0}
                icon={TrendingUp}
                subtext="Under active qualification & quote"
                trend={{
                  label: `${overviewStats?.convertedEnquiries ?? 0} closed`,
                  isPositive: true,
                }}
                iconColorClass="text-indigo-600"
                iconBgClass="bg-indigo-50"
              />

              {/* 4. Converted Deals */}
              <AdminStatCard
                title="Converted Deals"
                value={overviewStats?.convertedEnquiries ?? 0}
                icon={CheckCircle2}
                subtext={`Conversion rate: ${overviewStats?.enquiryConversionRate ?? 0}%`}
                trend={{
                  label: `${overviewStats?.enquiryConversionRate ?? 0}% rate`,
                  isPositive: overviewStats ? overviewStats.enquiryConversionRate >= 15 : true,
                }}
                iconColorClass="text-emerald-600"
                iconBgClass="bg-emerald-50"
              />

              {/* 5. Conversion Rate */}
              <AdminStatCard
                title="Conversion Rate"
                value={`${overviewStats?.enquiryConversionRate ?? 0}%`}
                icon={FileCheck2}
                subtext="Percentage of inquiries converted"
                trend={{
                  label: overviewStats && overviewStats.enquiryConversionRate >= 20 ? 'Target Exceeded' : 'Active Track',
                  isPositive: overviewStats ? overviewStats.enquiryConversionRate >= 20 : true,
                }}
                iconColorClass="text-purple-600"
                iconBgClass="bg-purple-50"
              />

              {/* 6. Total Follow-ups */}
              <AdminStatCard
                title="Total Follow-ups"
                value={overviewStats?.totalFollowups ?? 0}
                icon={CalendarClock}
                subtext={`${overviewStats?.completedFollowups ?? 0} tasks executed`}
                trend={{
                  label: `${overviewStats?.completedFollowups ?? 0} done`,
                  isPositive: true,
                }}
                iconColorClass="text-sky-600"
                iconBgClass="bg-sky-50"
              />

              {/* 7. Completion Rate */}
              <AdminStatCard
                title="Completion Rate"
                value={`${overviewStats?.followupCompletionRate ?? 0}%`}
                icon={CheckCircle2}
                subtext="Timely execution of scheduled tasks"
                trend={{
                  label: overviewStats && overviewStats.followupCompletionRate >= 80 ? 'High Velocity' : 'Normal',
                  isPositive: overviewStats ? overviewStats.followupCompletionRate >= 80 : true,
                }}
                iconColorClass="text-teal-600"
                iconBgClass="bg-teal-50"
              />

              {/* 8. Attention Required */}
              <AdminStatCard
                title="Attention Required"
                value={
                  (overviewStats?.overdueFollowups ?? 0) + (overviewStats?.dueTodayFollowups ?? 0)
                }
                icon={AlertTriangle}
                subtext={`${overviewStats?.overdueFollowups ?? 0} overdue, ${overviewStats?.dueTodayFollowups ?? 0} due today`}
                trend={
                  overviewStats && overviewStats.overdueFollowups > 0
                    ? { label: 'Overdue Pending', isPositive: false }
                    : { label: 'On Schedule', isPositive: true }
                }
                iconColorClass="text-rose-600"
                iconBgClass="bg-rose-50"
              />
            </>
          )}
        </div>

        {/* ANALYTICS SECTION: PERFORMANCE OVERVIEW (2 cols) & PIPELINE VALUE (1 col) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
          <div className="xl:col-span-2 min-w-0 max-w-full">
            <EnquiryTrend
              data={trendData}
              isLoading={isLoading}
              title={`Enquiry Influx & Conversions (${presetLabels[selectedPreset]})`}
              subtitle={`Daily inbound RFQ volume & conversion velocity (${presetLabels[selectedPreset]})`}
              badgeLabel={presetLabels[selectedPreset]}
            />
          </div>
          <div className="xl:col-span-1 min-w-0 max-w-full">
            <EnquiryStatusSummary
              data={statusSummary}
              isLoading={isLoading}
              title="Pipeline Value"
            />
          </div>
        </div>

        {/* RECENT DEALS & ENQUIRIES TABLE (MATCHING REFERENCE IMAGE TABLE) */}
        <div className="min-w-0 max-w-full">
          {isLoading ? (
            <AdminTableSkeleton rows={4} />
          ) : (
            <RecentEnquiries enquiries={recentEnquiries} />
          )}
        </div>

        {/* TEAM WORKLOAD & EXECUTION PERFORMANCE */}
        <div className="min-w-0 max-w-full">
          <StaffWorkloadTable workload={staffWorkload} isLoading={isLoading} />
        </div>

        {/* BOTTOM SPLIT: UPCOMING FOLLOW-UPS & RECENT AUDIT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0 max-w-full">
            {isLoading ? (
              <ActivitySkeleton items={3} />
            ) : (
              <UpcomingFollowups followups={upcomingFollowups} />
            )}
          </div>
          <div className="min-w-0 max-w-full">
            {isLoading ? (
              <ActivitySkeleton items={4} />
            ) : (
              <RecentActivity logs={recentActivity} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
