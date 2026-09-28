import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Button,
  Chip,
  Table,
  Input,
  Select,
  ListBox,
  TextArea,
  Checkbox,
  Label,
  Modal,
  Form,
  DatePicker,
  DateField,
  Calendar,
  TimeField,
  TextField,
  ComboBox,
} from "@heroui/react";
import {
  DateValue,
  getLocalTimeZone,
  now,
  today,
} from "@internationalized/date";
import {
  CalendarClock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Building2,
  Calendar as CalendarIcon,
  Plus,
  MessageSquare,
  ArrowUpRight,
  Check,
  X,
  FileText,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  FollowupWithEnquiry,
  FollowupType,
  FollowupTimeframe,
  FollowupPriority,
} from "../../types/database";
import { followupService } from "../../services/followupService";
import { enquiryService } from "../../services/enquiryService";
import {
  attendanceService,
  StaffWithAttendanceStatus,
} from "../../services/attendanceService";
import { formatDate } from "../../utils/date";
import { SEOHead } from "../../components/layout/SEOHead";

// ─── Timeframe helpers (client-side, fixes count bug) ───────────────────────
function getNow() {
  return new Date();
}
function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function getTomorrowStart() {
  const d = getTodayStart();
  d.setDate(d.getDate() + 1);
  return d;
}

function matchesTimeframe(
  item: FollowupWithEnquiry,
  tf: FollowupTimeframe,
): boolean {
  const scheduledAt = new Date(item.scheduled_at);
  const isCompleted = item.status === "completed";
  const isCancelled = item.status === "cancelled";
  const isPending = !isCompleted && !isCancelled;
  const now = getNow();
  const todayStart = getTodayStart();
  const tomorrowStart = getTomorrowStart();

  switch (tf) {
    case "overdue":
      return isPending && scheduledAt < now;
    case "today":
      return (
        isPending && scheduledAt >= todayStart && scheduledAt < tomorrowStart
      );
    case "upcoming":
      return isPending && scheduledAt >= tomorrowStart;
    case "completed":
      return isCompleted;
    case "cancelled":
      return isCancelled;
    case "all":
    default:
      return true;
  }
}

function getDefaultScheduleDate(): DateValue {
  try {
    const tz = getLocalTimeZone();
    return now(tz).add({ hours: 1 });
  } catch {
    return today(getLocalTimeZone());
  }
}

export const AdminFollowups: React.FC = () => {
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [timeframe, setTimeframe] = useState<FollowupTimeframe>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<StaffWithAttendanceStatus[]>([]);

  // Modals
  const [completingFollowup, setCompletingFollowup] =
    useState<FollowupWithEnquiry | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDateValue, setNextDateValue] = useState<DateValue | null>(
    getDefaultScheduleDate,
  );
  const [nextType, setNextType] = useState<FollowupType>("call");
  const [nextNotes, setNextNotes] = useState("");
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  // Quick Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recentEnquiries, setRecentEnquiries] = useState<
    { id: string; name: string; company: string | null; email?: string }[]
  >([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);
  const [enquiryFetchError, setEnquiryFetchError] = useState<string | null>(
    null,
  );
  const [targetEnquiryId, setTargetEnquiryId] = useState("");
  const [newScheduleDateValue, setNewScheduleDateValue] =
    useState<DateValue | null>(getDefaultScheduleDate);
  const [newScheduleType, setNewScheduleType] = useState<FollowupType>("call");
  const [newScheduleNotes, setNewScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // ─── Fetch all followups (no timeframe) — count is derived client-side ───
  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await followupService.getFollowups({
        type:
          selectedType !== "all" ? (selectedType as FollowupType) : undefined,
        assignedTo: selectedStaff !== "all" ? selectedStaff : undefined,
        priority:
          selectedPriority !== "all"
            ? (selectedPriority as FollowupPriority)
            : undefined,
        limit: 500,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setFollowups(res.followups);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred loading CRM follow-ups.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStaff, selectedPriority]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  useEffect(() => {
    attendanceService.getActiveStaffWithAttendance(true).then(setStaffList);
  }, []);

  // ─── Client-side counts (fixes the "all tabs show same number" bug) ───────
  const counts = useMemo<Record<FollowupTimeframe, number>>(() => {
    return {
      all: followups.length,
      overdue: followups.filter((f) => matchesTimeframe(f, "overdue")).length,
      today: followups.filter((f) => matchesTimeframe(f, "today")).length,
      upcoming: followups.filter((f) => matchesTimeframe(f, "upcoming")).length,
      completed: followups.filter((f) => matchesTimeframe(f, "completed"))
        .length,
      cancelled: followups.filter((f) => matchesTimeframe(f, "cancelled"))
        .length,
    };
  }, [followups]);

  // ─── Combined filter: timeframe + search ─────────────────────────────────
  const filteredFollowups = useMemo(() => {
    let list = followups.filter((f) => matchesTimeframe(f, timeframe));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => {
        return (
          f.enquiry?.name?.toLowerCase().includes(q) ||
          f.enquiry?.company?.toLowerCase().includes(q) ||
          f.notes?.toLowerCase().includes(q) ||
          f.outcome?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [followups, timeframe, searchQuery]);

  // ─── Enquiry options fetching & pre-loading for Quick Schedule Modal ─────
  const fetchEnquiryOptions = useCallback(
    async (force = false) => {
      if (!force && recentEnquiries.length > 0) return;
      setIsLoadingEnquiries(true);
      setEnquiryFetchError(null);
      try {
        const res = await enquiryService.getEnquiryOptions(100);
        if (res.error) {
          setEnquiryFetchError(res.error);
        } else if (res.options.length > 0) {
          setRecentEnquiries(res.options);
          setTargetEnquiryId((prev) => prev || res.options[0].id);
        }
      } catch (err: unknown) {
        setEnquiryFetchError(
          err instanceof Error
            ? err.message
            : "Failed to load customer enquiries.",
        );
      } finally {
        setIsLoadingEnquiries(false);
      }
    },
    [recentEnquiries.length],
  );

  // Pre-load enquiries in background on page load
  useEffect(() => {
    fetchEnquiryOptions();
  }, [fetchEnquiryOptions]);

  // Instant fallback: seed enquiries from loaded followups if options are still empty
  useEffect(() => {
    if (followups.length > 0 && recentEnquiries.length === 0) {
      const map = new Map<
        string,
        { id: string; name: string; company: string | null; email?: string }
      >();
      followups.forEach((f) => {
        if (f.enquiry?.id && !map.has(f.enquiry.id)) {
          map.set(f.enquiry.id, {
            id: f.enquiry.id,
            name: f.enquiry.name,
            company: f.enquiry.company || null,
            email: f.enquiry.email || undefined,
          });
        }
      });
      const options = Array.from(map.values());
      if (options.length > 0) {
        setRecentEnquiries(options);
        setTargetEnquiryId((prev) => prev || options[0].id);
      }
    }
  }, [followups, recentEnquiries.length]);

  // ─── Quick Schedule Modal ─────────────────────────────────────────────────
  const openQuickScheduleModal = () => {
    setShowScheduleModal(true);
    setScheduleError(null);
    setNewScheduleDateValue(getDefaultScheduleDate());
    if (recentEnquiries.length === 0) {
      fetchEnquiryOptions(true);
    } else if (!targetEnquiryId && recentEnquiries.length > 0) {
      setTargetEnquiryId(recentEnquiries[0].id);
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEnquiryId) {
      setScheduleError("Please select a customer enquiry.");
      return;
    }
    if (!newScheduleDateValue) {
      setScheduleError("Please select a scheduled date and time.");
      return;
    }

    setIsScheduling(true);
    setScheduleError(null);

    try {
      const tz = getLocalTimeZone();
      const scheduledAt =
        "toDate" in newScheduleDateValue &&
        typeof (newScheduleDateValue as any).toDate === "function"
          ? (newScheduleDateValue as any).toDate(tz).toISOString()
          : new Date(newScheduleDateValue.toString()).toISOString();

      const res = await followupService.createFollowup({
        enquiryId: targetEnquiryId,
        scheduledAt,
        type: newScheduleType,
        notes: newScheduleNotes.trim() || undefined,
      });

      setIsScheduling(false);

      if (res.error) {
        setScheduleError(res.error);
      } else {
        setShowScheduleModal(false);
        setNewScheduleDateValue(getDefaultScheduleDate());
        setNewScheduleNotes("");
        fetchFollowups();
      }
    } catch (err: unknown) {
      setIsScheduling(false);
      setScheduleError(
        err instanceof Error ? err.message : "Failed to schedule follow-up.",
      );
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowup) return;
    if (!outcomeNotes.trim()) {
      setOutcomeError("Please enter notes or outcome for this follow-up.");
      return;
    }

    setIsSubmittingOutcome(true);
    setOutcomeError(null);

    const res = await followupService.completeFollowup(
      completingFollowup.id,
      outcomeNotes.trim(),
      completingFollowup.enquiry_id,
    );

    if (res.error) {
      setOutcomeError(res.error);
      setIsSubmittingOutcome(false);
      return;
    }

    if (scheduleNext && nextDateValue) {
      const tz = getLocalTimeZone();
      const scheduledAt =
        "toDate" in nextDateValue &&
        typeof (nextDateValue as any).toDate === "function"
          ? (nextDateValue as any).toDate(tz).toISOString()
          : new Date(nextDateValue.toString()).toISOString();

      await followupService.scheduleNextFollowup(
        completingFollowup.id,
        completingFollowup.enquiry_id,
        scheduledAt,
        nextType,
        nextNotes.trim() || undefined,
      );
    }

    setIsSubmittingOutcome(false);
    setCompletingFollowup(null);
    setOutcomeNotes("");
    setScheduleNext(false);
    setNextDateValue(null);
    setNextNotes("");
    fetchFollowups();
  };

  const handleCancelFollowup = async (followup: FollowupWithEnquiry) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this scheduled follow-up?",
      )
    )
      return;
    const res = await followupService.cancelFollowup(
      followup.id,
      followup.enquiry_id,
    );
    if (res.error) {
      alert(`Error cancelling follow-up: ${res.error}`);
    } else {
      fetchFollowups();
    }
  };

  // ─── Filter state helpers ─────────────────────────────────────────────────
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedType !== "all" ||
    selectedPriority !== "all" ||
    selectedStaff !== "all",
  );

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedPriority("all");
    setSelectedStaff("all");
  };

  // ─── Badge helpers ────────────────────────────────────────────────────────
  const getTypeBadge = (type: FollowupType) => {
    switch (type) {
      case "call":
        return (
          <Chip
            size="sm"
            variant="soft"
            color="default"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </Chip>
        );
      case "email":
        return (
          <Chip
            size="sm"
            variant="soft"
            color="default"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </Chip>
        );
      case "meeting":
        return (
          <Chip
            size="sm"
            variant="soft"
            color="default"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80"
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Meeting
          </Chip>
        );
      case "demo":
        return (
          <Chip
            size="sm"
            variant="soft"
            color="default"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80"
          >
            <Clock className="w-3.5 h-3.5" /> Demo
          </Chip>
        );
      case "quotation":
        return (
          <Chip
            size="sm"
            variant="soft"
            color="default"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80"
          >
            <FileText className="w-3.5 h-3.5" /> Quotation
          </Chip>
        );
      default:
        return (
          <Chip
            size="sm"
            variant="soft"
            color="default"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
          >
            <MessageSquare className="w-3.5 h-3.5" /> {type}
          </Chip>
        );
    }
  };

  const getPriorityBadge = (priority?: string | null) => {
    if (!priority) return null;
    const styles: Record<string, string> = {
      urgent: "bg-rose-50 text-rose-700 border-rose-200",
      high: "bg-amber-50 text-amber-800 border-amber-200",
      medium: "bg-sky-50 text-sky-800 border-sky-200",
      low: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
      <Chip
        size="sm"
        variant="soft"
        color="default"
        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase font-mono border ${styles[priority] || styles.low}`}
      >
        {priority}
      </Chip>
    );
  };

  const isOverdue = (scheduledAt: string, status: string) =>
    status !== "completed" &&
    status !== "cancelled" &&
    new Date(scheduledAt).getTime() < Date.now();

  const getStatusIndicator = (scheduledAt: string, status: string) => {
    if (status === "completed") {
      return (
        <Chip
          size="sm"
          variant="soft"
          color="default"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide font-mono"
        >
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </Chip>
      );
    }
    if (status === "cancelled") {
      return (
        <Chip
          size="sm"
          variant="soft"
          color="default"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide font-mono"
        >
          <X className="w-3 h-3 text-slate-500" />
          <span>Cancelled</span>
        </Chip>
      );
    }
    const schedDate = new Date(scheduledAt);
    const currNow = getNow();
    const todayStart = getTodayStart();
    const tomorrowStart = getTomorrowStart();

    if (schedDate < currNow) {
      return (
        <Chip
          size="sm"
          variant="soft"
          color="default"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          <span>Overdue</span>
        </Chip>
      );
    }
    if (schedDate >= todayStart && schedDate < tomorrowStart) {
      return (
        <Chip
          size="sm"
          variant="soft"
          color="default"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Due Today</span>
        </Chip>
      );
    }
    return (
      <Chip
        size="sm"
        variant="soft"
        color="default"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wide font-mono"
      >
        <span>Upcoming</span>
      </Chip>
    );
  };

  return (
    <>
      <SEOHead
        title="CRM Follow-ups | Akira Precision Automation CRM"
        description="Executive follow-up management and scheduled client communications tracking."
      />

      <div className="space-y-4 w-full pb-12 font-sans text-slate-900">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading tracking-tight">
              CRM Follow-ups
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Track customer calls, demos, quotations, and scheduled
              touchpoints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onPress={fetchFollowups}
              isDisabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all text-xs font-semibold font-sans cursor-pointer"
              aria-label="Refresh list"
            >
              <RotateCw
                className={`w-3.5 h-3.5 shrink-0 ${loading ? "animate-spin text-blue-600" : ""}`}
              />
              <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={openQuickScheduleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-2xs font-sans cursor-pointer"
              aria-label="Schedule Follow-up"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Schedule Follow-up</span>
            </Button>
          </div>
        </div>

        {/* ── Odoo Sales CRM KPI Overview Deck ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* All Follow-ups */}
          <div
            onClick={() => setTimeframe("all")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setTimeframe("all");
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
              timeframe === "all"
                ? "border-slate-900 shadow-sm ring-2 ring-slate-900/10"
                : "border-slate-200/90 hover:border-slate-300 hover:shadow-2xs"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`View all ${counts.all} follow-ups`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                All Pipeline
              </span>
              <CalendarClock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading">
              {counts.all}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              Total logged touchpoints
            </div>
          </div>

          {/* Overdue */}
          <div
            onClick={() => setTimeframe("overdue")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setTimeframe("overdue");
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
              timeframe === "overdue"
                ? "border-rose-500 shadow-sm ring-2 ring-rose-500/20 bg-rose-50/20"
                : "border-slate-200/90 hover:border-rose-300 hover:shadow-2xs"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`View ${counts.overdue} overdue follow-ups`}
          >
            <div className="flex items-center justify-between text-rose-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                Overdue
              </span>
              <div className="p-1 rounded-lg bg-rose-50">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 font-heading">
              {counts.overdue}
            </div>
            <div className="text-[11px] text-rose-600/80 mt-0.5 truncate">
              {counts.overdue > 0
                ? "Requires urgent action"
                : "No overdue items"}
            </div>
          </div>

          {/* Due Today */}
          <div
            onClick={() => setTimeframe("today")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setTimeframe("today");
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
              timeframe === "today"
                ? "border-amber-500 shadow-sm ring-2 ring-amber-500/20 bg-amber-50/20"
                : "border-slate-200/90 hover:border-amber-300 hover:shadow-2xs"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`View ${counts.today} due today follow-ups`}
          >
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                Due Today
              </span>
              <div className="p-1 rounded-lg bg-amber-50">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 font-heading">
              {counts.today}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5 truncate">
              Target for end of day
            </div>
          </div>

          {/* Upcoming */}
          <div
            onClick={() => setTimeframe("upcoming")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setTimeframe("upcoming");
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
              timeframe === "upcoming"
                ? "border-sky-500 shadow-sm ring-2 ring-sky-500/20 bg-sky-50/20"
                : "border-slate-200/90 hover:border-sky-300 hover:shadow-2xs"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`View ${counts.upcoming} upcoming follow-ups`}
          >
            <div className="flex items-center justify-between text-sky-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                Upcoming
              </span>
              <div className="p-1 rounded-lg bg-sky-50">
                <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-sky-600 font-heading">
              {counts.upcoming}
            </div>
            <div className="text-[11px] text-sky-700/80 mt-0.5 truncate">
              Planned schedule ahead
            </div>
          </div>

          {/* Completed */}
          <div
            onClick={() => setTimeframe("completed")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setTimeframe("completed");
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white ${
              timeframe === "completed"
                ? "border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 bg-emerald-50/20"
                : "border-slate-200/90 hover:border-emerald-300 hover:shadow-2xs"
            }`}
            role="button"
            tabIndex={0}
            aria-label={`View ${counts.completed} completed follow-ups`}
          >
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                Completed
              </span>
              <div className="p-1 rounded-lg bg-emerald-50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-heading">
              {counts.completed}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5 truncate">
              Touchpoints closed
            </div>
          </div>
        </div>

        {/* ── Search + Filters ─────────────────────────────────────────────── */}
        <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px] flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search customer, company, notes or outcome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 font-sans transition-all text-slate-900"
                aria-label="Search customer, company or notes"
              />
              {searchQuery && (
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => setSearchQuery("")}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer z-10 min-w-0 h-auto"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Type Filter */}
              <div className="w-full sm:w-36 min-w-[130px]">
                <Select
                  value={selectedType}
                  onChange={(val) => setSelectedType(String(val || "all"))}
                  className="w-full"
                  aria-label="Filter by activity type"
                >
                  <Select.Trigger className="w-full h-9 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 truncate">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                    </div>
                    <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                  </Select.Trigger>
                  <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[150px]">
                    <ListBox className="outline-none space-y-0.5">
                      {[
                        { key: "all", label: "All Types" },
                        { key: "call", label: "Call" },
                        { key: "email", label: "Email" },
                        { key: "meeting", label: "Meeting" },
                        { key: "demo", label: "Demo" },
                        { key: "quotation", label: "Quotation" },
                        { key: "other", label: "Other" },
                      ].map((t) => (
                        <ListBox.Item
                          key={t.key}
                          id={t.key}
                          textValue={t.label}
                          className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                        >
                          {t.label}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="w-full sm:w-36 min-w-[120px]">
                <Select
                  value={selectedPriority}
                  onChange={(val) => setSelectedPriority(String(val || "all"))}
                  className="w-full"
                  aria-label="Filter by priority"
                >
                  <Select.Trigger className="w-full h-9 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                    <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                    <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                  </Select.Trigger>
                  <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                    <ListBox className="outline-none space-y-0.5">
                      {[
                        { key: "all", label: "All Priorities" },
                        { key: "urgent", label: "Urgent" },
                        { key: "high", label: "High" },
                        { key: "medium", label: "Medium" },
                        { key: "low", label: "Low" },
                      ].map((p) => (
                        <ListBox.Item
                          key={p.key}
                          id={p.key}
                          textValue={p.label}
                          className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                        >
                          {p.label}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              {/* Staff Filter */}
              <div className="w-full sm:w-48 min-w-[150px]">
                <Select
                  value={selectedStaff}
                  onChange={(val) => setSelectedStaff(String(val || "all"))}
                  className="w-full"
                  aria-label="Filter by staff member"
                >
                  <Select.Trigger className="w-full h-9 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
                    <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                    <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                  </Select.Trigger>
                  <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[240px] max-h-60 overflow-y-auto">
                    <ListBox className="outline-none space-y-0.5">
                      <ListBox.Item
                        id="all"
                        textValue="All Staff"
                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        All Staff
                      </ListBox.Item>
                      <ListBox.Item
                        id="unassigned"
                        textValue="Unassigned"
                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                      >
                        Unassigned
                      </ListBox.Item>
                      {staffList.map((s) => {
                        const statusPrefix =
                          s.role === "admin"
                            ? "👑 [Admin] "
                            : {
                                present: "🟢 [Present] ",
                                on_field: "🟡 [On Field] ",
                                clocked_out: "⚪ [Out] ",
                                not_reported: "🔴 ",
                              }[s.attendanceStatus];
                        const labelText = `${statusPrefix}${s.full_name || s.email}`;
                        return (
                          <ListBox.Item
                            key={s.id}
                            id={s.id}
                            textValue={labelText}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {labelText}
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              {/* Reset Filters button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={clearAllFilters}
                  className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50/70 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                  aria-label="Reset all filters"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Summary row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-600">Active View:</span>
              <span className="font-semibold text-slate-900 capitalize">
                {timeframe === "all" ? "All Follow-ups" : timeframe}
              </span>
              {selectedType !== "all" && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-md font-medium text-[11px]">
                  Type: {selectedType}
                </span>
              )}
              {selectedPriority !== "all" && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md font-medium text-[11px]">
                  Priority: {selectedPriority}
                </span>
              )}
              {selectedStaff !== "all" && (
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-md font-medium text-[11px]">
                  Staff:{" "}
                  {selectedStaff === "unassigned"
                    ? "Unassigned"
                    : staffList.find((s) => s.id === selectedStaff)
                        ?.full_name || selectedStaff}
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredFollowups.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {followups.length}
              </span>{" "}
              follow-ups
            </div>
          </div>
        </Card>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <Card className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-row items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900 font-heading">
                Unable to load follow-up entries
              </p>
              <p className="text-rose-600 mt-0.5">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onPress={fetchFollowups}
              className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 border-none cursor-pointer"
              aria-label="Retry loading follow-ups"
            >
              Retry
            </Button>
          </Card>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────────────── */}
        {loading && (
          <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0"
              >
                <div className="w-9 h-9 bg-slate-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-3.5 bg-slate-100 rounded" />
                  <div className="w-72 h-2.5 bg-slate-100 rounded" />
                </div>
                <div className="w-24 h-7 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </Card>
        )}

        {/* ── Empty State ───────────────────────────────────────────────────── */}
        {!loading && !error && filteredFollowups.length === 0 && (
          <Card className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200/60">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              No scheduled follow-ups found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {timeframe === "overdue"
                ? "Great work! No overdue follow-ups at this time."
                : timeframe === "today"
                  ? "No follow-ups scheduled for today."
                  : "No follow-ups match the selected filters."}
            </p>
            <Button
              variant="primary"
              size="sm"
              onPress={openQuickScheduleModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              aria-label="Schedule Follow-up"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Follow-up</span>
            </Button>
          </Card>
        )}

        {/* ── Follow-ups Table ──────────────────────────────────────────────── */}
        {!loading && !error && filteredFollowups.length > 0 && (
          <>
            <Table className="w-full">
              <Table.ScrollContainer className="overflow-x-auto">
                <Table.Content
                  aria-label="CRM Follow-ups Data Table"
                  className="w-full text-left text-xs min-w-[1240px]"
                >
                  {/* Table head */}
                  <Table.Header>
                    <Table.Column
                      isRowHeader
                      className="py-3.5 px-4 text-slate-700 font-semibold w-[280px]"
                    >
                      Customer
                    </Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold w-[120px]">
                      Type
                    </Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold w-[170px]">
                      Scheduled
                    </Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold w-[110px]">
                      Priority
                    </Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold w-[170px]">
                      Assigned
                    </Table.Column>
                    <Table.Column className="py-3.5 px-4 text-slate-700 font-semibold w-[240px]">
                      Notes / Outcome
                    </Table.Column>
                    <Table.Column className="py-3.5 px-4 text-right text-slate-700 font-semibold w-[240px]">
                      Actions
                    </Table.Column>
                  </Table.Header>

                  {/* Table body */}
                  <Table.Body>
                    {filteredFollowups.map((item) => {
                      const overdue = isOverdue(item.scheduled_at, item.status);
                      const isCompleted = item.status === "completed";
                      const isCancelled = item.status === "cancelled";
                      const isDueToday =
                        !overdue &&
                        !isCompleted &&
                        !isCancelled &&
                        matchesTimeframe(item, "today");

                      return (
                        <Table.Row
                          key={item.id}
                          className={`transition-colors group ${
                            overdue
                              ? "bg-rose-50/30 hover:bg-rose-50/60 border-l-4 border-l-rose-500"
                              : isDueToday
                                ? "bg-amber-50/30 hover:bg-amber-50/60 border-l-4 border-l-amber-500"
                                : isCompleted
                                  ? "bg-emerald-50/20 hover:bg-emerald-50/40 border-l-4 border-l-emerald-500"
                                  : isCancelled
                                    ? "bg-slate-50/40 hover:bg-slate-100/50 border-l-4 border-l-slate-300 opacity-75"
                                    : "hover:bg-slate-50/70 border-l-4 border-l-blue-400"
                          }`}
                        >
                          {/* Customer */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-2xs ${
                                  overdue
                                    ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                                    : isDueToday
                                      ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                                      : isCompleted
                                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                        : isCancelled
                                          ? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                                          : "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                }`}
                              >
                                {(item.enquiry?.name || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0 max-w-[210px]">
                                {item.enquiry ? (
                                  <Link
                                    to={`/admin/enquiries/${item.enquiry_id}`}
                                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 group-hover:text-blue-600 text-xs sm:text-sm truncate"
                                    title={item.enquiry.name}
                                  >
                                    <span className="truncate">
                                      {item.enquiry.name}
                                    </span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                    #{item.enquiry_id.substring(0, 8)}
                                  </span>
                                )}
                                {item.enquiry?.company ? (
                                  <div
                                    className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5 truncate"
                                    title={item.enquiry.company}
                                  >
                                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">
                                      {item.enquiry.company}
                                    </span>
                                  </div>
                                ) : null}
                                {item.title ? (
                                  <div
                                    className="text-[10px] text-slate-500 mt-0.5 italic truncate font-sans"
                                    title={item.title}
                                  >
                                    {item.title}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </Table.Cell>

                          {/* Type */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            {getTypeBadge(item.type)}
                          </Table.Cell>

                          {/* Scheduled */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-mono text-[11px]">
                                  {formatDate(item.scheduled_at)}
                                </span>
                              </div>
                              {getStatusIndicator(
                                item.scheduled_at,
                                item.status,
                              )}
                            </div>
                          </Table.Cell>

                          {/* Priority */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            {getPriorityBadge(item.priority) ?? (
                              <span className="text-slate-400 text-xs font-mono">
                                —
                              </span>
                            )}
                          </Table.Cell>

                          {/* Assigned */}
                          <Table.Cell className="py-3.5 px-4 whitespace-nowrap">
                            {item.assigned_profile ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 font-mono shadow-2xs">
                                  {(
                                    item.assigned_profile.full_name ||
                                    item.assigned_profile.email
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div className="min-w-0 max-w-[130px]">
                                  <div
                                    className="text-xs font-medium text-slate-800 truncate"
                                    title={
                                      item.assigned_profile.full_name ||
                                      item.assigned_profile.email
                                    }
                                  >
                                    {item.assigned_profile.full_name ||
                                      item.assigned_profile.email}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Chip
                                size="sm"
                                variant="soft"
                                color="default"
                                className="text-slate-600 text-[11px] bg-slate-100/80 border border-slate-200/90 rounded-md"
                              >
                                Unassigned
                              </Chip>
                            )}
                          </Table.Cell>

                          {/* Notes / Outcome */}
                          <Table.Cell className="py-3.5 px-4 max-w-[240px]">
                            {item.outcome ? (
                              <div
                                className="text-[11px] text-emerald-900 bg-emerald-50/90 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 line-clamp-2"
                                title={item.outcome}
                              >
                                <span className="font-bold text-emerald-800">
                                  Outcome:
                                </span>{" "}
                                {item.outcome}
                              </div>
                            ) : item.notes ? (
                              <div
                                className="text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 line-clamp-2"
                                title={item.notes}
                              >
                                {item.notes}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">
                                No notes
                              </span>
                            )}
                          </Table.Cell>

                          {/* Actions */}
                          <Table.Cell className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Phone */}
                              {item.enquiry?.phone && (
                                <a
                                  href={`tel:${item.enquiry.phone}`}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 inline-flex items-center justify-center shrink-0 shadow-2xs"
                                  title={`Call ${item.enquiry.phone}`}
                                  aria-label={`Call ${item.enquiry.name || "customer"} at ${item.enquiry.phone}`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Email */}
                              {item.enquiry?.email && (
                                <a
                                  href={`mailto:${item.enquiry.email}`}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 inline-flex items-center justify-center shrink-0 shadow-2xs"
                                  title={`Email ${item.enquiry.email}`}
                                  aria-label={`Email ${item.enquiry.name || "customer"} at ${item.enquiry.email}`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Complete / Cancel */}
                              {!isCompleted && !isCancelled && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onPress={() => {
                                      setCompletingFollowup(item);
                                      setOutcomeNotes("");
                                      setScheduleNext(false);
                                      setNextDateValue(
                                        getDefaultScheduleDate(),
                                      );
                                      setOutcomeError(null);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors shadow-2xs cursor-pointer shrink-0"
                                    aria-label={`Complete follow-up for ${item.enquiry?.name || "customer"}`}
                                  >
                                    <Check className="w-3 h-3 shrink-0 text-emerald-600" />
                                    <span>Complete</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onPress={() => handleCancelFollowup(item)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 cursor-pointer shrink-0 shadow-2xs"
                                    aria-label={`Cancel follow-up for ${item.enquiry?.name || "customer"}`}
                                  >
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                  </Button>
                                </>
                              )}

                              {/* Details */}
                              <Link
                                to={`/admin/followups/${item.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                                title="View full follow-up details"
                                aria-label={`View full details for follow-up ${item.id}`}
                              >
                                Details
                              </Link>

                              {/* Dossier */}
                              <Link
                                to={`/admin/enquiries/${item.enquiry_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                                aria-label={`View customer dossier for ${item.enquiry?.name || "customer"}`}
                                title="Open customer enquiry dossier"
                              >
                                Dossier
                              </Link>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>

            {/* Table footer */}
            <div className="border-t border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
              <span className="font-mono text-[11px]">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredFollowups.length}
                </span>{" "}
                follow-ups
              </span>
              <Button
                variant="outline"
                size="sm"
                onPress={openQuickScheduleModal}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/50 border border-blue-200 px-3 py-1.5 rounded-xl cursor-pointer"
                aria-label="Schedule new follow-up"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Schedule new</span>
              </Button>
            </div>
          </>
        )}

        {/* ── MODAL: Complete Follow-up ───────────────────────────────────── */}
        <Modal.Backdrop
          isOpen={!!completingFollowup}
          onOpenChange={(open) => {
            if (!open) {
              setCompletingFollowup(null);
              setOutcomeError(null);
            }
          }}
          variant="blur"
          isDismissable
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <Modal.Container placement="center" className="w-full max-w-lg">
            <Modal.Dialog
              className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full overflow-hidden relative flex flex-col focus:outline-none animate-in zoom-in-95 duration-150"
              aria-labelledby="complete-followup-title"
            >
              <Modal.CloseTrigger
                onPress={() => setCompletingFollowup(null)}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </Modal.CloseTrigger>

              <Modal.Header className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Modal.Icon className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </Modal.Icon>
                <div>
                  <Modal.Heading
                    id="complete-followup-title"
                    className="font-bold text-slate-900 font-heading text-base leading-snug"
                  >
                    Complete Follow-up
                  </Modal.Heading>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record outcome for{" "}
                    {completingFollowup?.enquiry?.name || "Customer"}
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="pt-4 overflow-visible">
                <Form onSubmit={handleCompleteSubmit} className="space-y-4">
                  {outcomeError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{outcomeError}</span>
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor="outcomeNotes"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono"
                    >
                      Outcome &amp; Discussion Notes{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <TextArea
                      id="outcomeNotes"
                      rows={3}
                      required
                      value={outcomeNotes}
                      onChange={(e) => setOutcomeNotes(e.target.value)}
                      placeholder="Summarize client response, key requirements discussed, or next agreements..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-sans bg-white"
                    />
                  </div>

                  <Card className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <Checkbox
                      id="scheduleNextCheck"
                      isSelected={scheduleNext}
                      onChange={(checked) => {
                        setScheduleNext(checked);
                        if (checked && !nextDateValue) {
                          try {
                            const tz = getLocalTimeZone();
                            setNextDateValue(now(tz).add({ days: 3 }));
                          } catch {}
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Checkbox.Content className="flex items-center gap-2">
                        <Checkbox.Control className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center data-[selected=true]:bg-blue-600 data-[selected=true]:border-blue-600 transition-colors">
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Label >
                          Schedule Next Follow-up with this customer
                        </Label>
                      </Checkbox.Content>
                    </Checkbox>

                    {scheduleNext && (
                      <div className="space-y-5">
                        <div>
                          <DatePicker
                            isRequired
                            granularity="minute"
                            hourCycle={12}
                            hideTimeZone={true}
                            value={nextDateValue}
                            onChange={setNextDateValue}
                            className="w-full"
                            aria-label="Next Follow-up Date and Time"
                          >
                            {({ state }) => (
                              <>
                                <Label>Next Date &amp; Time</Label>
                                <DateField.Group fullWidth>
                                  <DateField.Input>
                                    {(segment) => (
                                      <DateField.Segment segment={segment} />
                                    )}
                                  </DateField.Input>
                                  <DateField.Suffix>
                                    <DatePicker.Trigger>
                                      <DatePicker.TriggerIndicator />
                                    </DatePicker.Trigger>
                                  </DateField.Suffix>
                                </DateField.Group>
                                <DatePicker.Popover className="flex flex-col gap-3">
                                  <Calendar aria-label="Next Follow-up Date">
                                    <Calendar.Header>
                                      <Calendar.YearPickerTrigger>
                                        <Calendar.YearPickerTriggerHeading />
                                        <Calendar.YearPickerTriggerIndicator />
                                      </Calendar.YearPickerTrigger>

                                      <Calendar.NavButton slot="previous" />
                                      <Calendar.NavButton slot="next" />
                                    </Calendar.Header>
                                    <Calendar.Grid>
                                      <Calendar.GridHeader>
                                        {(day) => (
                                          <Calendar.HeaderCell>
                                            {day}
                                          </Calendar.HeaderCell>
                                        )}
                                      </Calendar.GridHeader>
                                      <Calendar.GridBody>
                                        {(date) => (
                                          <Calendar.Cell date={date} />
                                        )}
                                      </Calendar.GridBody>
                                    </Calendar.Grid>
                                    <Calendar.YearPickerGrid>
                                      <Calendar.YearPickerGridBody>
                                        {({ year }) => (
                                          <Calendar.YearPickerCell
                                            year={year}
                                          />
                                        )}
                                      </Calendar.YearPickerGridBody>
                                    </Calendar.YearPickerGrid>
                                  </Calendar>
                                  <div className="flex items-center justify-between">
                                    <Label>Time</Label>
                                    <TimeField
                                      aria-label="Next Follow-up Time"
                                      granularity="minute"
                                      hourCycle={12}
                                      hideTimeZone={true}
                                      value={state.timeValue}
                                      onChange={(v) => {
                                        if (v) state.setTimeValue(v);
                                      }}
                                    >
                                      <TimeField.Group>
                                        <TimeField.Input>
                                          {(segment) => (
                                            <TimeField.Segment
                                              segment={segment}
                                            />
                                          )}
                                        </TimeField.Input>
                                      </TimeField.Group>
                                    </TimeField>
                                  </div>
                                </DatePicker.Popover>
                              </>
                            )}
                          </DatePicker>
                        </div>

                        <div>
                          <ComboBox
                            id="nextType"
                            value={nextType}
                            onChange={(val) =>
                              setNextType(String(val || "call") as FollowupType)
                            }
                            className="w-full"
                            aria-label="Next follow-up type">
                            <Label>Activity Type</Label>
                            <ComboBox.InputGroup>
                              <Input placeholder="Search animals..." />
                              <ComboBox.Trigger />
                            </ComboBox.InputGroup>
                            <ComboBox.Popover>
                              <ListBox className="outline-none space-y-0.5">
                                {[
                                  { key: "call", label: "Call" },
                                  { key: "email", label: "Email" },
                                  { key: "meeting", label: "Meeting" },
                                  { key: "demo", label: "Demo" },
                                  { key: "quotation", label: "Quotation" },
                                  { key: "other", label: "Other" },
                                ].map((item) => (
                                  <ListBox.Item
                                    key={item.key}
                                    id={item.key}
                                    textValue={item.label}
                                    className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                                  >
                                    {item.label}
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </ComboBox.Popover>
                          </ComboBox>
                        </div>

                        <div>
                         

                          <TextField
                            className="w-full flex flex-col gap-1">
                            <Label htmlFor="newScheduleNotes">
                              Next Agenda / Notes
                            </Label>
                            <TextArea
                              id="nextNotes"
                              rows={3}
                              value={nextNotes}
                              onChange={(e) => setNextNotes(e.target.value)}
                              placeholder="e.g. Send formal quote revision #"
                            />
                          </TextField>
                        </div>
                      </div>
                    )}
                  </Card>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setCompletingFollowup(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-slate-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isDisabled={isSubmittingOutcome}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer border-none"
                    >
                      {isSubmittingOutcome
                        ? "Saving..."
                        : "Save & Mark Complete"}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* ── MODAL: Quick Schedule Follow-up ─────────────────────────────── */}
        <Modal.Backdrop
          isOpen={showScheduleModal}
          onOpenChange={(open) => {
            setShowScheduleModal(open);
            if (!open) {
              setScheduleError(null);
            }
          }}
          variant="blur"
          isDismissable
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <Modal.Container placement="center" className="w-full max-w-lg">
            <Modal.Dialog
              className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full overflow-hidden relative flex flex-col focus:outline-none animate-in zoom-in-95 duration-150"
              aria-labelledby="schedule-followup-title"
            >
              <Modal.CloseTrigger
                onPress={() => setShowScheduleModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </Modal.CloseTrigger>

              <Modal.Header className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Modal.Icon className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </Modal.Icon>
                <div>
                  <Modal.Heading
                    id="schedule-followup-title"
                    className="font-bold text-slate-900 font-heading text-base leading-snug"
                  >
                    Schedule CRM Follow-up
                  </Modal.Heading>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add a new touchpoint or reminder
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="pt-4 overflow-visible">
                <Form onSubmit={handleCreateFollowup} className="space-y-4">
                  {scheduleError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{scheduleError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-1">
                      {isLoadingEnquiries && (
                        <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium font-sans">
                          <RotateCw className="w-3 h-3 animate-spin" />
                          <span>Fetching enquiries...</span>
                        </span>
                      )}
                    </div>

                    {enquiryFetchError ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
                        <span className="truncate">{enquiryFetchError}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => fetchEnquiryOptions(true)}
                          className="text-[11px] h-6 px-2 py-0.5 border border-amber-300 rounded-lg hover:bg-amber-100 shrink-0 font-medium"
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ComboBox
                          id="targetEnquiryId"
                          name="targetEnquiryId"
                          isRequired
                          value={targetEnquiryId || null}
                          onChange={(val) => {
                            if (val) setTargetEnquiryId(String(val));
                          }}
                          className="w-full"
                          aria-label="Select Customer or Enquiry"
                          isDisabled={
                            isLoadingEnquiries && recentEnquiries.length === 0
                          }
                          variant="secondary"
                        >
                          <Label>Select Customer / Enquiry</Label>
                          <ComboBox.InputGroup>
                            <Input placeholder="Search animals..." />
                            <ComboBox.Trigger />
                          </ComboBox.InputGroup>
                          <ComboBox.Popover>
                            <ListBox className="outline-none space-y-0.5">
                              {recentEnquiries.length === 0 ? (
                                <div className="py-4 text-center text-xs text-slate-400">
                                  {isLoadingEnquiries
                                    ? "Loading customer enquiries..."
                                    : "No customer enquiries found"}
                                </div>
                              ) : (
                                recentEnquiries.map((e) => {
                                  const label = `${e.name}${e.company ? ` (${e.company})` : ""} - #${e.id.substring(0, 8)}`;
                                  return (
                                    <ListBox.Item
                                      key={e.id}
                                      id={e.id}
                                      textValue={label}
                                      className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium text-slate-800">
                                          {e.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          {e.company ? `${e.company} • ` : ""}#
                                          {e.id.substring(0, 8)}
                                        </span>
                                      </div>
                                    </ListBox.Item>
                                  );
                                })
                              )}
                            </ListBox>
                          </ComboBox.Popover>
                        </ComboBox>
                      </>
                    )}
                  </div>

                  <div>
                    <DatePicker
                      isRequired
                      className="w-full"
                      granularity="minute"
                      hourCycle={12}
                      hideTimeZone={true}
                      value={newScheduleDateValue}
                      onChange={setNewScheduleDateValue}
                      aria-label="Date and Time"
                    >
                      {({ state }) => (
                        <>
                          <Label>Date and time</Label>
                          <DateField.Group fullWidth variant="secondary">
                            <DateField.Input>
                              {(segment) => (
                                <DateField.Segment segment={segment} />
                              )}
                            </DateField.Input>
                            <DateField.Suffix>
                              <DatePicker.Trigger>
                                <DatePicker.TriggerIndicator />
                              </DatePicker.Trigger>
                            </DateField.Suffix>
                          </DateField.Group>
                          <DatePicker.Popover className="flex flex-col gap-3">
                            <Calendar aria-label="Follow-up Date">
                              <Calendar.Header>
                                <Calendar.YearPickerTrigger>
                                  <Calendar.YearPickerTriggerHeading />
                                  <Calendar.YearPickerTriggerIndicator />
                                </Calendar.YearPickerTrigger>
                                <Calendar.NavButton slot="previous" />
                                <Calendar.NavButton slot="next" />
                              </Calendar.Header>
                              <Calendar.Grid>
                                <Calendar.GridHeader>
                                  {(day) => (
                                    <Calendar.HeaderCell>
                                      {day}
                                    </Calendar.HeaderCell>
                                  )}
                                </Calendar.GridHeader>
                                <Calendar.GridBody>
                                  {(date) => <Calendar.Cell date={date} />}
                                </Calendar.GridBody>
                              </Calendar.Grid>
                              <Calendar.YearPickerGrid>
                                <Calendar.YearPickerGridBody>
                                  {({ year }) => (
                                    <Calendar.YearPickerCell year={year} />
                                  )}
                                </Calendar.YearPickerGridBody>
                              </Calendar.YearPickerGrid>
                            </Calendar>
                            <div className="flex items-center justify-between">
                              <Label>Time</Label>
                              <TimeField
                                aria-label="Follow-up Time"
                                granularity="minute"
                                hourCycle={12}
                                hideTimeZone={true}
                                value={state.timeValue}
                                onChange={(v) => {
                                  if (v) state.setTimeValue(v);
                                }}
                              >
                                <TimeField.Group variant="secondary">
                                  <TimeField.Input>
                                    {(segment) => (
                                      <TimeField.Segment
                                        segment={segment}
                                        //className="px-0.5 rounded-xs outline-none focus:bg-blue-100 focus:text-blue-900"
                                      />
                                    )}
                                  </TimeField.Input>
                                </TimeField.Group>
                              </TimeField>
                            </div>
                          </DatePicker.Popover>
                        </>
                      )}
                    </DatePicker>
                  </div>

                  <div>
                    <ComboBox
                      className="w-full"
                      id="newScheduleType"
                      value={newScheduleType}
                      onChange={(val) =>
                        setNewScheduleType(
                          String(val || "call") as FollowupType,
                        )
                      }
                      variant="secondary"
                    >
                      <Label>Activity Type</Label>
                      <ComboBox.InputGroup>
                        <Input placeholder="Search animals..." />
                        <ComboBox.Trigger />
                      </ComboBox.InputGroup>
                      <ComboBox.Popover>
                        <ListBox className="outline-none space-y-0.5">
                          {[
                            { key: "call", label: "Call" },
                            { key: "email", label: "Email" },
                            { key: "meeting", label: "Meeting" },
                            { key: "demo", label: "Demo" },
                            { key: "quotation", label: "Quotation" },
                            { key: "other", label: "Other" },
                          ].map((item) => (
                            <ListBox.Item
                              key={item.key}
                              id={item.key}
                              textValue={item.label}
                              className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                            >
                              {item.label}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </ComboBox.Popover>
                    </ComboBox>
                  </div>
                  <div>
                    <TextField
                      className="w-full flex flex-col gap-1"
                      variant="secondary"
                    >
                      <Label htmlFor="newScheduleNotes">
                        Notes &amp; Discussion Goal
                      </Label>
                      <TextArea
                        id="newScheduleNotes"
                        rows={3}
                        value={newScheduleNotes}
                        onChange={(e) => setNewScheduleNotes(e.target.value)}
                        placeholder="e.g. Call engineering manager to discuss dial gauge repeatability specs"
                      />
                    </TextField>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="md"
                      onPress={() => setShowScheduleModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-slate-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      isDisabled={isScheduling}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer border-none"
                    >
                      {isScheduling ? "Scheduling..." : "Confirm Schedule"}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </div>
    </>
  );
};

export default AdminFollowups;
