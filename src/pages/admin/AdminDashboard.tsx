import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Chip, Card, Label, DatePicker, DateField, Calendar } from '@heroui/react';
import { DateValue, parseDate } from '@internationalized/date';
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
  const [startDateValue, setStartDateValue] = useState<DateValue | null>(null);
  const [endDateValue, setEndDateValue] = useState<DateValue | null>(null);
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
      if (customStart && !startDateValue) {
        try {
          setStartDateValue(parseDate(customStart));
        } catch {
          // ignore parse error
        }
      }
      if (customEnd && !endDateValue) {
        try {
          setEndDateValue(parseDate(customEnd));
        } catch {
          // ignore parse error
        }
      }
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setSelectedPreset(preset);
    }
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    const startStr = startDateValue ? startDateValue.toString() : customStart;
    const endStr = endDateValue ? endDateValue.toString() : customEnd;
    if (startStr && endStr) {
      setCustomStart(startStr);
      setCustomEnd(endStr);
      setSelectedPreset('custom');
      setShowCustomPicker(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Dashboard | Akira Precision Automation"
        description="Executive management and real-time CRM intelligence console for Akira Precision Automation precision metrology systems."
      />

      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* Top Control Bar with Premium Industrial Styling */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                Operations & CRM Analytics
              </h1>
              <Chip
                variant="soft"
                color="accent"
                size="sm"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 font-mono shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <Chip.Label>Executive Intelligence</Chip.Label>
              </Chip>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
              Precision metrology operations, RFQ pipeline, follow-up velocity, and staff performance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Date Range Selector Pills */}
            <div className="flex items-center max-w-full overflow-x-auto no-scrollbar rounded-xl border border-slate-200/90 p-1 bg-white shadow-xs text-xs font-semibold">
              {(['today', '7d', '30d', '90d', 'year'] as DateRangePreset[]).map((p) => {
                const isActive = selectedPreset === p && !showCustomPicker;
                return (
                  <Button
                    key={p}
                    variant={isActive ? 'primary' : 'ghost'}
                    size="sm"
                    onPress={() => handlePresetSelect(p)}
                    onClick={() => handlePresetSelect(p)}
                    className={`whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg transition-all font-sans cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {presetLabels[p]}
                  </Button>
                );
              })}
              <Button
                variant={selectedPreset === 'custom' || showCustomPicker ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => setShowCustomPicker(!showCustomPicker)}
                onClick={() => setShowCustomPicker(!showCustomPicker)}
                className={`whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg transition-all font-sans cursor-pointer ${
                  selectedPreset === 'custom' || showCustomPicker
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Custom
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="md"
              onPress={() => fetchDashboardData(true)}
              isDisabled={isRefreshing || isLoading}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Refresh analytics data"
            >
              <RotateCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Custom Date Range Form */}
        {showCustomPicker && (
          <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm animate-in fade-in">
            <form
              onSubmit={handleApplyCustomRange}
              className="flex flex-wrap items-end gap-3 text-xs"
            >
              <div className="min-w-[150px]">
                <DatePicker
                  isRequired
                  value={startDateValue}
                  onChange={(val) => {
                    setStartDateValue(val);
                    if (val) setCustomStart(val.toString());
                  }}
                  className="flex flex-col gap-1"
                  aria-label="Filter Start Date"
                >
                  {() => (
                    <>
                      <Label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                        Start Date
                      </Label>
                      <DateField.Group
                        fullWidth
                        className="w-full h-9 px-2.5 py-1 text-xs border border-slate-200/90 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white font-mono flex items-center justify-between"
                      >
                        <DateField.Input className="flex items-center gap-0.5 text-xs">
                          {(segment) => (
                            <DateField.Segment
                              segment={segment}
                              className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                            />
                          )}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors">
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 flex flex-col gap-3">
                        <Calendar aria-label="Start Date" className="w-full">
                          <Calendar.Header className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                            <Calendar.YearPickerTrigger className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <div className="flex items-center gap-1">
                              <Calendar.NavButton
                                slot="previous"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              />
                              <Calendar.NavButton
                                slot="next"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              />
                            </div>
                          </Calendar.Header>
                          <Calendar.Grid className="w-full border-collapse">
                            <Calendar.GridHeader>
                              {(day) => (
                                <Calendar.HeaderCell className="text-[11px] font-semibold text-slate-400 pb-1.5 text-center">
                                  {day}
                                </Calendar.HeaderCell>
                              )}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => (
                                <Calendar.Cell
                                  date={date}
                                  className="text-xs p-1 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[disabled=true]:text-slate-300 data-[unavailable=true]:text-slate-300"
                                />
                              )}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid className="w-full">
                            <Calendar.YearPickerGridBody>
                              {({ year }) => (
                                <Calendar.YearPickerCell
                                  year={year}
                                  className="text-xs p-1.5 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
                                />
                              )}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                    </>
                  )}
                </DatePicker>
              </div>

              <div className="min-w-[150px]">
                <DatePicker
                  isRequired
                  value={endDateValue}
                  onChange={(val) => {
                    setEndDateValue(val);
                    if (val) setCustomEnd(val.toString());
                  }}
                  className="flex flex-col gap-1"
                  aria-label="Filter End Date"
                >
                  {() => (
                    <>
                      <Label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                        End Date
                      </Label>
                      <DateField.Group
                        fullWidth
                        className="w-full h-9 px-2.5 py-1 text-xs border border-slate-200/90 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white font-mono flex items-center justify-between"
                      >
                        <DateField.Input className="flex items-center gap-0.5 text-xs">
                          {(segment) => (
                            <DateField.Segment
                              segment={segment}
                              className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                            />
                          )}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors">
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 flex flex-col gap-3">
                        <Calendar aria-label="End Date" className="w-full">
                          <Calendar.Header className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                            <Calendar.YearPickerTrigger className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <div className="flex items-center gap-1">
                              <Calendar.NavButton
                                slot="previous"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              />
                              <Calendar.NavButton
                                slot="next"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              />
                            </div>
                          </Calendar.Header>
                          <Calendar.Grid className="w-full border-collapse">
                            <Calendar.GridHeader>
                              {(day) => (
                                <Calendar.HeaderCell className="text-[11px] font-semibold text-slate-400 pb-1.5 text-center">
                                  {day}
                                </Calendar.HeaderCell>
                              )}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => (
                                <Calendar.Cell
                                  date={date}
                                  className="text-xs p-1 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[disabled=true]:text-slate-300 data-[unavailable=true]:text-slate-300"
                                />
                              )}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid className="w-full">
                            <Calendar.YearPickerGridBody>
                              {({ year }) => (
                                <Calendar.YearPickerCell
                                  year={year}
                                  className="text-xs p-1.5 text-center rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
                                />
                              )}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                    </>
                  )}
                </DatePicker>
              </div>

              <div className="flex items-center gap-2 pb-0.5">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="h-9 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs font-sans cursor-pointer"
                >
                  Apply Filter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowCustomPicker(false)}
                  className="h-9 px-3 text-slate-500 hover:text-slate-800 transition-colors font-sans cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Global Error Banner */}
        {error && (
          <AdminErrorState
            title="Database Connection Issue"
            message={error}
            onRetry={() => fetchDashboardData()}
          />
        )}

        {/* 8 PRECISION KPI CARDS ACROSS DESKTOP & TABLET */}
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0 items-stretch">
          <div className="xl:col-span-2 min-w-0 max-w-full flex flex-col h-full">
            <EnquiryTrend
              data={trendData}
              isLoading={isLoading}
              title={`Enquiry Influx & Conversions (${presetLabels[selectedPreset]})`}
              subtitle={`Daily inbound RFQ volume & conversion velocity (${presetLabels[selectedPreset]})`}
              badgeLabel={presetLabels[selectedPreset]}
            />
          </div>
          <div className="xl:col-span-1 min-w-0 max-w-full flex flex-col h-full">
            <EnquiryStatusSummary
              data={statusSummary}
              isLoading={isLoading}
              title="Pipeline Value"
            />
          </div>
        </div>

        {/* RECENT DEALS & ENQUIRIES TABLE */}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 items-stretch">
          <div className="min-w-0 max-w-full flex flex-col h-full">
            {isLoading ? (
              <ActivitySkeleton items={4} />
            ) : (
              <UpcomingFollowups followups={upcomingFollowups} />
            )}
          </div>
          <div className="min-w-0 max-w-full flex flex-col h-full">
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
