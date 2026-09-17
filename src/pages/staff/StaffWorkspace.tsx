import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  Check,
  RotateCw,
  LogOut,
  Building2,
  Inbox,
  X,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import {
  FollowupWithEnquiry,
  EnquiryWithDetails,
  FollowupTimeframe,
  FollowupPriority,
  FollowupType,
} from '../../types/database';
import { followupService } from '../../services/followupService';
import { enquiryService } from '../../services/enquiryService';
import { formatDate } from '../../utils/date';
import { SEOHead } from '../../components/layout/SEOHead';
import { company } from '../../config/company';

const PRIORITY_STYLES: Record<FollowupPriority, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'URGENT', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  high: { label: 'HIGH', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  medium: { label: 'MEDIUM', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  low: { label: 'LOW', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

export const StaffWorkspace: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'followups' | 'enquiries'>('followups');
  const [timeframe, setTimeframe] = useState<FollowupTimeframe>('today');

  // Follow-ups state
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [followupTotal, setFollowupTotal] = useState(0);
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(true);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<EnquiryWithDetails[]>([]);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(true);

  // Quick stats counts
  const [stats, setStats] = useState({
    myNewEnquiries: 0,
    dueToday: 0,
    overdue: 0,
    upcoming: 0,
    completed: 0,
  });

  // Complete Modal State
  const [completingTask, setCompletingTask] = useState<FollowupWithEnquiry | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Create Follow-up Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    enquiryId: '',
    title: '',
    scheduledAt: '',
    type: 'call' as FollowupType,
    priority: 'medium' as FollowupPriority,
    notes: '',
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Load staff tasks
  const loadStaffData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingFollowups(true);
    setIsLoadingEnquiries(true);

    try {
      // 1. Load follow-ups for current staff
      const folRes = await followupService.getFollowups({
        assignedTo: user.id,
        timeframe,
        limit: 50,
      });
      setFollowups(folRes.followups);
      setFollowupTotal(folRes.total);

      // 2. Load assigned enquiries
      const enqRes = await enquiryService.getEnquiries({
        assignedTo: user.id,
        limit: 50,
      });
      setEnquiries(enqRes.enquiries);
      setEnquiryTotal(enqRes.total);

      // 3. Load operational counts
      const [dueTodayRes, overdueRes, upcomingRes, completedRes, statusCounts] = await Promise.all([
        followupService.getFollowups({ assignedTo: user.id, timeframe: 'today', limit: 1 }),
        followupService.getFollowups({ assignedTo: user.id, timeframe: 'overdue', limit: 1 }),
        followupService.getFollowups({ assignedTo: user.id, timeframe: 'upcoming', limit: 1 }),
        followupService.getFollowups({ assignedTo: user.id, timeframe: 'completed', limit: 1 }),
        enquiryService.getStatusCounts(user.id),
      ]);

      setStats({
        myNewEnquiries: statusCounts.new,
        dueToday: dueTodayRes.total,
        overdue: overdueRes.total,
        upcoming: upcomingRes.total,
        completed: completedRes.total,
      });
    } finally {
      setIsLoadingFollowups(false);
      setIsLoadingEnquiries(false);
    }
  }, [user?.id, timeframe]);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    if (!outcomeNotes.trim()) {
      setCompleteError('Please record customer outcome notes before marking complete.');
      return;
    }

    setIsSubmittingComplete(true);
    setCompleteError(null);

    const res = await followupService.completeFollowup(
      completingTask.id,
      outcomeNotes.trim(),
      completingTask.enquiry_id,
      user?.id
    );

    if (res.error) {
      setCompleteError(res.error);
      setIsSubmittingComplete(false);
      return;
    }

    // Schedule next touchpoint if checked
    if (scheduleNext && nextDate) {
      await followupService.scheduleNextFollowup(
        completingTask.id,
        completingTask.enquiry_id,
        nextDate,
        'call',
        `Follow-up scheduled after: ${outcomeNotes.trim()}`,
        user?.id,
        `Successive touchpoint for ${completingTask.enquiry?.name || 'Customer'}`
      );
    }

    setIsSubmittingComplete(false);
    setCompletingTask(null);
    setOutcomeNotes('');
    setScheduleNext(false);
    setNextDate('');
    loadStaffData();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.enquiryId || !createForm.scheduledAt) {
      setCreateError('Enquiry selection and scheduled date are required.');
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError(null);

    const res = await followupService.createFollowup({
      enquiryId: createForm.enquiryId,
      title: createForm.title.trim() || `Follow-up on inquiry`,
      scheduledAt: createForm.scheduledAt,
      type: createForm.type,
      priority: createForm.priority,
      notes: createForm.notes.trim(),
      assignedTo: user?.id,
      createdBy: user?.id,
    });

    setIsSubmittingCreate(false);

    if (res.error) {
      setCreateError(res.error);
    } else {
      setShowCreateModal(false);
      setCreateForm({
        enquiryId: '',
        title: '',
        scheduledAt: '',
        type: 'call',
        priority: 'medium',
        notes: '',
      });
      loadStaffData();
    }
  };

  return (
    <>
      <SEOHead
        title="Staff Workspace | AKIRA AUTOMATION"
        description="Assigned tasks, client inquiries, and follow-up management for sales engineers."
        noIndex={true}
      />

      <div className="min-h-screen bg-industrial-bg">
        {/* Dedicated Staff Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-industrial-dark text-white flex items-center justify-center font-bold font-heading text-sm shadow-xs">
                AK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-industrial-dark font-heading">
                    {company.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Staff Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Precision CRM & Follow-up Desk</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-industrial-dark">
                  {profile?.full_name || user?.email}
                </div>
                <div className="text-[10px] text-slate-400 capitalize font-mono">
                  {profile?.role || 'Staff'} Access
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Welcome & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-industrial-dark font-heading">
                My Assigned Tasks
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review assigned client inquiries, follow-up calls, and customer touchpoints.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => loadStaffData()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-industrial-blue text-white hover:bg-sky-700 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Follow-up
              </button>
            </div>
          </div>

          {/* Operational Counts Strip (Part 14) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <Inbox className="w-3.5 h-3.5 text-sky-600" />
                <span>New RFQs</span>
              </div>
              <p className="text-xl font-bold font-mono text-industrial-dark mt-1">
                {stats.myNewEnquiries}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-blue-700 text-[11px] font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Due Today</span>
              </div>
              <p className="text-xl font-bold font-mono text-blue-700 mt-1">
                {stats.dueToday}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-sm ${
              stats.overdue > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Overdue</span>
              </div>
              <p className="text-xl font-bold font-mono text-rose-700 mt-1">
                {stats.overdue}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Upcoming</span>
              </div>
              <p className="text-xl font-bold font-mono text-industrial-dark mt-1">
                {stats.upcoming}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed</span>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {stats.completed}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Follow-ups vs Assigned Enquiries) */}
          <div className="border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('followups')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'followups'
                    ? 'border-industrial-blue text-industrial-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Follow-up Schedule ({followupTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab('enquiries')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'enquiries'
                    ? 'border-industrial-blue text-industrial-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Assigned Inquiries ({enquiryTotal})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Follow-up Queue */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              {/* Timeframe Sub-tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {(['today', 'overdue', 'upcoming', 'completed', 'all'] as FollowupTimeframe[]).map(tf => {
                  const isActive = timeframe === tf;
                  const label =
                    tf === 'today'
                      ? 'Due Today'
                      : tf === 'overdue'
                      ? 'Overdue Tasks'
                      : tf === 'upcoming'
                      ? 'Upcoming'
                      : tf === 'completed'
                      ? 'Completed'
                      : 'All Follow-ups';

                  return (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-industrial-dark text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {isLoadingFollowups ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading follow-ups...</p>
                </div>
              ) : followups.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Tasks in this Timeframe</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You have no scheduled follow-ups matching this filter. Schedule a new touchpoint or review other tabs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followups.map(item => {
                    const priorityStyle =
                      PRIORITY_STYLES[item.priority || 'medium'] || PRIORITY_STYLES.medium;
                    const isOverdue =
                      new Date(item.scheduled_at).getTime() < Date.now() &&
                      item.status !== 'completed' &&
                      item.status !== 'cancelled';

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border shadow-sm p-4 space-y-3 transition-shadow hover:shadow-md ${
                          isOverdue ? 'border-rose-200' : 'border-slate-200'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                              >
                                {priorityStyle.label}
                              </span>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                                {item.type}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-industrial-dark mt-1 leading-snug">
                              {item.title || `${item.type.toUpperCase()} Follow-up`}
                            </h3>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[11px] font-mono font-semibold block ${
                                isOverdue ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            >
                              {formatDate(item.scheduled_at)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.scheduled_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info */}
                        {item.enquiry && (
                          <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                            <div className="font-semibold text-slate-800 flex items-center justify-between">
                              <span>{item.enquiry.name}</span>
                              <span className="text-slate-500 font-normal">{item.enquiry.company}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                              {item.enquiry.phone && (
                                <a
                                  href={`tel:${item.enquiry.phone}`}
                                  className="inline-flex items-center gap-1 text-sky-700 hover:underline font-mono"
                                >
                                  <Phone className="w-3 h-3" />
                                  {item.enquiry.phone}
                                </a>
                              )}
                              {item.enquiry.email && (
                                <a
                                  href={`mailto:${item.enquiry.email}`}
                                  className="inline-flex items-center gap-1 text-sky-700 hover:underline font-mono truncate max-w-[160px]"
                                >
                                  <Mail className="w-3 h-3" />
                                  {item.enquiry.email}
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes / Description */}
                        {(item.notes || item.description) && (
                          <p className="text-xs text-slate-600 line-clamp-2 italic">
                            "{item.notes || item.description}"
                          </p>
                        )}

                        {/* Outcome if completed */}
                        {item.status === 'completed' && item.outcome && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800">
                            <strong>Outcome:</strong> {item.outcome}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <Link
                            to={`/admin/followups/${item.id}`}
                            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                          >
                            View Dossier
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          {item.status !== 'completed' && item.status !== 'cancelled' && (
                            <button
                              onClick={() => setCompletingTask(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Complete Follow-up
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Assigned Enquiries */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              {isLoadingEnquiries ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading assigned inquiries...</p>
                </div>
              ) : enquiries.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Assigned Inquiries</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You do not currently have any prospective inquiries delegated to your account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map(enq => (
                    <div
                      key={enq.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-industrial-dark">
                              {enq.name}
                            </span>
                            {enq.company && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {enq.company}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Product Interest:{' '}
                            <strong className="text-slate-700">
                              {enq.specific_product || enq.product_category || 'General Metrology Inquiry'}
                            </strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                            {enq.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                            {formatDate(enq.created_at)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded">
                        "{enq.message}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs">
                          {enq.phone && (
                            <a
                              href={`tel:${enq.phone}`}
                              className="inline-flex items-center gap-1 text-sky-700 hover:underline font-mono"
                            >
                              <Phone className="w-3 h-3" />
                              {enq.phone}
                            </a>
                          )}
                          <a
                            href={`mailto:${enq.email}`}
                            className="inline-flex items-center gap-1 text-sky-700 hover:underline font-mono truncate max-w-[180px]"
                          >
                            <Mail className="w-3 h-3" />
                            {enq.email}
                          </a>
                        </div>

                        <Link
                          to={`/admin/enquiries/${enq.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-industrial-dark text-white hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          Open Dossier
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Complete Follow-up Modal */}
        {completingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Complete CRM Follow-up
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Customer: {completingTask.enquiry?.name} ({completingTask.enquiry?.company})
                  </p>
                </div>
                <button
                  onClick={() => setCompletingTask(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {completeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{completeError}</span>
                </div>
              )}

              <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Outcome & Technical Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={outcomeNotes}
                    onChange={e => setOutcomeNotes(e.target.value)}
                    placeholder="e.g. Discussed air plug gauge tolerances. Customer requested formal quotation by Friday."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleNext}
                      onChange={e => setScheduleNext(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-semibold">Schedule Successive Touchpoint</span>
                  </label>
                </div>

                {scheduleNext && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Next Follow-up Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required={scheduleNext}
                      value={nextDate}
                      onChange={e => setNextDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCompletingTask(null)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingComplete}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingComplete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Completion
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Follow-up Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Schedule Client Follow-up
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Client Inquiry <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={createForm.enquiryId}
                    onChange={e => setCreateForm(prev => ({ ...prev, enquiryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">-- Choose an assigned customer inquiry --</option>
                    {enquiries.map(enq => (
                      <option key={enq.id} value={enq.id}>
                        {enq.name} ({enq.company || 'Direct'}) - {enq.specific_product || 'Inquiry'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Call to confirm bore diameter specifications"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Touchpoint Type
                    </label>
                    <select
                      value={createForm.type}
                      onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value as FollowupType }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="call">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">In-Person Meeting</option>
                      <option value="demo">Technical Demo</option>
                      <option value="quotation">Quotation Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={createForm.priority}
                      onChange={e => setCreateForm(prev => ({ ...prev, priority: e.target.value as FollowupPriority }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.scheduledAt}
                    onChange={e => setCreateForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Task Notes</label>
                  <textarea
                    rows={2}
                    value={createForm.notes}
                    onChange={e => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Brief background or objectives for this follow-up..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="px-4 py-2 rounded-lg bg-industrial-blue text-white hover:bg-sky-700 font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingCreate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
