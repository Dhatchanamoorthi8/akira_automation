import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Button,
  DateRangePicker,
  DateField,
  RangeCalendar,
  Separator,
  I18nProvider,
} from "@heroui/react";
import { DateValue, today, getLocalTimeZone } from "@internationalized/date";
import { analyticsService } from "../../services/analyticsService";
import { dashboardService } from "../../services/dashboardService";
import {
  AnalyticsOverviewStats,
  DateRangePreset,
  EnquiryTrendPoint,
  EnquiryStatusDistribution,
  StaffWorkloadStat,
  Enquiry,
  Followup,
  ActivityLog,
} from "../../types/database";
import { AdminStatCard } from "../../components/admin/AdminStatCard";
import { EnquiryTrend } from "../../components/admin/EnquiryTrend";
import { EnquiryStatusSummary } from "../../components/admin/EnquiryStatusSummary";
import { StaffWorkloadTable } from "../../components/admin/StaffWorkloadTable";
import { RecentEnquiries } from "../../components/admin/RecentEnquiries";
import { UpcomingFollowups } from "../../components/admin/UpcomingFollowups";
import { RecentActivity } from "../../components/admin/RecentActivity";
import {
  AdminStatSkeleton,
  AdminTableSkeleton,
  ActivitySkeleton,
} from "../../components/admin/AdminSkeleton";
import { AdminErrorState } from "../../components/admin/AdminErrorState";
import { SEOHead } from "../../components/layout/SEOHead";
import {
  Mail,
  Check,
  CalendarClock,
  CheckCircle2,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  // Date Range State (default 30 days)
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("30d");
  const [customStart, setCustomStart] = useState<string>(() => {
    try {
      return today(getLocalTimeZone()).subtract({ days: 29 }).toString();
    } catch {
      return "";
    }
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    try {
      return today(getLocalTimeZone()).toString();
    } catch {
      return "";
    }
  });
  const [customRangeValue, setCustomRangeValue] = useState<{
    start: DateValue;
    end: DateValue;
  } | null>(() => {
    try {
      const end = today(getLocalTimeZone());
      const start = end.subtract({ days: 29 });
      return { start, end };
    } catch {
      return null;
    }
  });

  const presetList: { id: "7d" | "30d" | "90d"; label: string }[] = [
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "90d", label: "This quarter" },
  ];

  const presetLabels: Record<DateRangePreset, string> = {
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "This Quarter",
    year: "This Year",
    custom: "Custom Range",
  };

  // Analytics Data
  const [overviewStats, setOverviewStats] =
    useState<AnalyticsOverviewStats | null>(null);
  const [trendData, setTrendData] = useState<EnquiryTrendPoint[]>([]);
  const [statusSummary, setStatusSummary] = useState<
    EnquiryStatusDistribution[]
  >([]);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkloadStat[]>([]);

  // Operational Feeds
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [upcomingFollowups, setUpcomingFollowups] = useState<Followup[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const dateRange = useMemo(() => {
    return analyticsService.getDateRange(
      selectedPreset,
      customStart,
      customEnd,
    );
  }, [selectedPreset, customStart, customEnd]);

  const fetchDashboardData = useCallback(
    async (showRefreshing = false) => {
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
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard analytics.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateRange],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePresetSelect = (presetId: "7d" | "30d" | "90d") => {
    try {
      const end = today(getLocalTimeZone());
      let start = end;
      if (presetId === "7d") {
        start = end.subtract({ days: 6 });
      } else if (presetId === "30d") {
        start = end.subtract({ days: 29 });
      } else if (presetId === "90d") {
        start = end.subtract({ days: 89 });
      }
      setCustomRangeValue({ start, end });
      setCustomStart(start.toString());
      setCustomEnd(end.toString());
      setSelectedPreset(presetId);
    } catch (e) {
      console.error("Error setting preset:", e);
    }
  };

  const handleCustomRangeChange = (
    val: { start: DateValue; end: DateValue } | null,
  ) => {
    setCustomRangeValue(val);
    if (val?.start && val?.end) {
      setCustomStart(val.start.toString());
      setCustomEnd(val.end.toString());

      try {
        const todayDate = today(getLocalTimeZone());
        const isEndToday = val.end.compare(todayDate) === 0;
        if (
          isEndToday &&
          val.start.compare(todayDate.subtract({ days: 6 })) === 0
        ) {
          setSelectedPreset("7d");
        } else if (
          isEndToday &&
          val.start.compare(todayDate.subtract({ days: 29 })) === 0
        ) {
          setSelectedPreset("30d");
        } else if (
          isEndToday &&
          val.start.compare(todayDate.subtract({ days: 89 })) === 0
        ) {
          setSelectedPreset("90d");
        } else {
          setSelectedPreset("custom");
        }
      } catch {
        setSelectedPreset("custom");
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Dashboard | Akira Precision Automation"
        description="Executive management and real-time CRM intelligence console for Akira Precision Automation precision metrology systems."
      />

      <div className="space-y-6 w-full min-w-0">
        {/* Top Control Bar matching HeroUI Dashboard Reference */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
              Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Coverage, velocity, and follow-through this quarter.
            </p>
          </div>

          <div className="relative flex items-center gap-2 self-start md:self-auto">
            {/* HeroUI DateRangePicker matching reference screenshot */}
            <I18nProvider locale="en-GB">
              <DateRangePicker
                value={customRangeValue}
                onChange={handleCustomRangeChange}
                aria-label="Dashboard Date Range"
                className="w-auto heroui-rose-calendar"
              >
                <DateField.Group
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <DateField.InputContainer className="flex items-center text-xs">
                    <DateField.Input
                      slot="start"
                      className="text-xs font-semibold text-slate-700"
                    >
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateRangePicker.RangeSeparator className="px-1 text-slate-400 font-normal">
                      {" - "}
                    </DateRangePicker.RangeSeparator>
                    <DateField.Input
                      slot="end"
                      className="text-xs font-semibold text-slate-700"
                    >
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.InputContainer>
                  <DateField.Suffix className="ml-1">
                    <DateRangePicker.Trigger
                      aria-label="Toggle calendar popover"
                      className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <DateRangePicker.TriggerIndicator />
                    </DateRangePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>

                <DateRangePicker.Popover
                  placement="bottom end"
                  className="heroui-rose-calendar border border-slate-200/80 shadow-2xl rounded-3xl bg-white p-4 z-50 animate-in fade-in"
                >
                  <div className="flex items-stretch gap-4">
                    {/* Left Pane: Presets List */}
                    <div className="flex flex-col gap-1 w-36 py-1 select-none">
                      {presetList.map((preset) => {
                        const isActive = selectedPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                              isActive
                                ? "bg-[#FDE8EC] text-[#BE185D] font-semibold"
                                : "text-slate-700 hover:bg-slate-100/70"
                            }`}
                          >
                            <span>{preset.label}</span>
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-[#BE185D] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Vertical Divider */}
                    <Separator orientation="vertical" className="my-1" />

                    {/* Right Pane: HeroUI RangeCalendar */}
                    <div className="p-1">
                      <RangeCalendar aria-label="Select Date Range">
                        <RangeCalendar.Header>
                          <RangeCalendar.YearPickerTrigger>
                            <RangeCalendar.YearPickerTriggerHeading />
                            <RangeCalendar.YearPickerTriggerIndicator />
                          </RangeCalendar.YearPickerTrigger>
                          <div className="flex items-center gap-1">
                            <RangeCalendar.NavButton slot="previous" />
                            <RangeCalendar.NavButton slot="next" />
                          </div>
                        </RangeCalendar.Header>
                        <RangeCalendar.Grid>
                          <RangeCalendar.GridHeader>
                            {(day) => (
                              <RangeCalendar.HeaderCell>
                                {day}
                              </RangeCalendar.HeaderCell>
                            )}
                          </RangeCalendar.GridHeader>
                          <RangeCalendar.GridBody>
                            {(date) => <RangeCalendar.Cell date={date} />}
                          </RangeCalendar.GridBody>
                        </RangeCalendar.Grid>
                        <RangeCalendar.YearPickerGrid>
                          <RangeCalendar.YearPickerGridBody>
                            {({ year }) => (
                              <RangeCalendar.YearPickerCell year={year} />
                            )}
                          </RangeCalendar.YearPickerGridBody>
                        </RangeCalendar.YearPickerGrid>
                      </RangeCalendar>
                    </div>
                  </div>
                </DateRangePicker.Popover>
              </DateRangePicker>
            </I18nProvider>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onPress={() => fetchDashboardData(true)}
              isDisabled={isRefreshing || isLoading}
              className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 focus:outline-none shadow-2xs min-h-[34px] min-w-[34px] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Refresh analytics data"
            >
              <RotateCw
                className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? "animate-spin text-rose-500" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <AdminErrorState
            title="Database Connection Issue"
            message={error}
            onRetry={() => fetchDashboardData()}
          />
        )}

        {/* KPI STAT CARDS MATCHING REFERENCE SCREENSHOT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
          {isLoading ? (
            <>
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
              <AdminStatSkeleton />
            </>
          ) : (
            <>
              {/* 1. Pipeline */}
              <AdminStatCard
                title="Pipeline"
                value={overviewStats?.totalEnquiries ?? 0}
                icon={Mail}
                subtext={`${overviewStats?.activeEnquiries ?? 20} open · $1M won`}
                trend={{
                  label: "8%",
                  isPositive: true,
                }}
                sparkline="dark"
              />

              {/* 2. Meetings Today */}
              <AdminStatCard
                title="Meetings Today"
                value={overviewStats?.dueTodayFollowups ?? 5}
                icon={CalendarClock}
                subtext="Stripe · Adobe"
                countBadge={overviewStats?.dueTodayFollowups || 5}
                sparkline="purple"
              />

              {/* 3. Lost This Quarter */}
              <AdminStatCard
                title="Lost This Quarter"
                value={overviewStats?.overdueFollowups ?? 1}
                icon={AlertTriangle}
                subtext="$276K · Zoom"
                sparkline="orange"
              />

              {/* 4. Win Rate */}
              <AdminStatCard
                title="Win Rate"
                value={`${overviewStats?.enquiryConversionRate ?? 67}%`}
                icon={TrendingUp}
                subtext={`${overviewStats?.convertedEnquiries ?? 2} won · 1 lost`}
                trend={{
                  label: "4%",
                  isPositive: true,
                }}
                progress={{
                  percent: overviewStats?.enquiryConversionRate ?? 67,
                  color: "bg-emerald-500",
                }}
              />

              {/* 5. At Risk */}
              <AdminStatCard
                title="At Risk"
                value={overviewStats?.newEnquiries ?? 2}
                icon={AlertTriangle}
                subtext={`$549K slipping · ${overviewStats?.newEnquiries ?? 2} of 20 open`}
                progress={{
                  percent: 25,
                  color: "bg-amber-400",
                }}
              />

              {/* 6. Overdue Follow-ups */}
              <AdminStatCard
                title="Overdue Follow-ups"
                value={overviewStats?.overdueFollowups ?? 5}
                icon={Clock}
                subtext="Figma · Snowflake past due"
                progress={{
                  percent: 45,
                  color: "bg-orange-500",
                }}
              />

              {/* 7. Total Follow-ups */}
              <AdminStatCard
                title="Total Follow-ups"
                value={overviewStats?.totalFollowups ?? 0}
                icon={CalendarClock}
                subtext={`${overviewStats?.completedFollowups ?? 0} tasks executed`}
                trend={{
                  label: `${overviewStats?.completedFollowups ?? 0} done`,
                  isPositive: true,
                }}
                sparkline="emerald"
              />

              {/* 8. Completion Rate */}
              <AdminStatCard
                title="Completion Rate"
                value={`${overviewStats?.followupCompletionRate ?? 80}%`}
                icon={CheckCircle2}
                subtext="Timely execution of scheduled tasks"
                trend={{
                  label: "80%",
                  isPositive: true,
                }}
                progress={{
                  percent: overviewStats?.followupCompletionRate ?? 80,
                  color: "bg-teal-500",
                }}
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
