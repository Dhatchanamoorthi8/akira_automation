import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit,
  X,
  Loader2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import {
  FollowupWithEnquiry,
  FollowupPriority,
  FollowupType,
  FollowupStatus,
  StaffProfile,
} from '../../types/database';
import { followupService } from '../../services/followupService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/date';
import { SEOHead } from '../../components/layout/SEOHead';

const PRIORITY_STYLES: Record<FollowupPriority, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'URGENT', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  high: { label: 'HIGH', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  medium: { label: 'MEDIUM', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  low: { label: 'LOW', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const STATUS_BADGES: Record<FollowupStatus, { label: string; bg: string; text: string; border: string }> = {
  upcoming: { label: 'Upcoming', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  due_today: { label: 'Due Today', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  overdue: { label: 'Overdue', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
};

export const AdminFollowupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, isStaff } = useAuth();

  const [followup, setFollowup] = useState<FollowupWithEnquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);

  // Action Modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Edit / Reassign State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    type: 'call' as FollowupType,
    priority: 'medium' as FollowupPriority,
    assignedTo: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const loadFollowup = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const res = await followupService.getFollowupById(id);

    if (res.error || !res.followup) {
      setError(res.error || 'Follow-up record not found.');
    } else {
      setFollowup(res.followup);
      setEditForm({
        title: res.followup.title || '',
        description: res.followup.description || res.followup.notes || '',
        scheduledAt: res.followup.scheduled_at ? res.followup.scheduled_at.slice(0, 16) : '',
        type: res.followup.type,
        priority: res.followup.priority || 'medium',
        assignedTo: res.followup.assigned_to || '',
      });
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadFollowup();
    if (isAdmin) {
      userService.getAssignableStaff().then(setStaffProfiles);
    }
  }, [loadFollowup, isAdmin]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followup || !outcomeNotes.trim()) return;

    setIsSubmittingComplete(true);
    const res = await followupService.completeFollowup(
      followup.id,
      outcomeNotes.trim(),
      followup.enquiry_id,
      user?.id
    );

    if (res.error) {
      alert(`Could not complete follow-up: ${res.error}`);
      setIsSubmittingComplete(false);
      return;
    }

    if (scheduleNext && nextDate) {
      await followupService.scheduleNextFollowup(
        followup.id,
        followup.enquiry_id,
        nextDate,
        'call',
        `Successive follow-up after: ${outcomeNotes.trim()}`,
        followup.assigned_to,
        `Next touchpoint for ${followup.enquiry?.name || 'Customer'}`
      );
    }

    setIsSubmittingComplete(false);
    setShowCompleteModal(false);
    setOutcomeNotes('');
    loadFollowup();
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followup) return;

    setIsSubmittingCancel(true);
    const res = await followupService.cancelFollowup(
      followup.id,
      cancelReason.trim(),
      followup.enquiry_id
    );

    setIsSubmittingCancel(false);
    if (res.error) {
      alert(`Could not cancel follow-up: ${res.error}`);
    } else {
      setShowCancelModal(false);
      setCancelReason('');
      loadFollowup();
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followup) return;

    setIsSubmittingEdit(true);

    const res = await followupService.updateFollowup(
      followup.id,
      {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        scheduledAt: editForm.scheduledAt ? new Date(editForm.scheduledAt).toISOString() : undefined,
        type: editForm.type,
        priority: editForm.priority,
        assignedTo: isAdmin ? editForm.assignedTo || null : undefined, // Only admin can reassign
      },
      followup.enquiry_id
    );

    setIsSubmittingEdit(false);
    if (res.error) {
      alert(`Could not update follow-up: ${res.error}`);
    } else {
      setIsEditing(false);
      loadFollowup();
    }
  };

  const backUrl = isStaff && !isAdmin ? '/staff' : '/admin/followups';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error || !followup) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-industrial-dark">Follow-up Not Available</h2>
        <p className="text-xs text-slate-500">{error || 'The requested follow-up could not be located.'}</p>
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-industrial-dark text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Agenda
        </Link>
      </div>
    );
  }

  const priorityStyle = PRIORITY_STYLES[followup.priority || 'medium'] || PRIORITY_STYLES.medium;
  const statusBadge = STATUS_BADGES[followup.status] || STATUS_BADGES.upcoming;

  return (
    <>
      <SEOHead
        title={`Follow-up: ${followup.title || 'Task'} | Akira Precision Automation LLP`}
        description="Detailed CRM follow-up record and customer communication history."
      />

      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {isStaff && !isAdmin ? 'Staff Workspace' : 'Follow-ups Agenda'}</span>
          </Link>

          <div className="flex items-center gap-2">
            {followup.status !== 'completed' && followup.status !== 'cancelled' && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Follow-up</span>
                </button>
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                >
                  {priorityStyle.label} Priority
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                >
                  {statusBadge.label}
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  {followup.type} Task
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading">
                {followup.title || `${followup.type.toUpperCase()} Follow-up`}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                Scheduled For
              </span>
              <span className="text-base font-bold font-mono text-industrial-dark">
                {formatDate(followup.scheduled_at)}
              </span>
              <span className="text-xs font-mono text-slate-500 block">
                {new Date(followup.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Description */}
          {followup.description && (
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed">
              {followup.description}
            </div>
          )}

          {/* If Completed / Cancelled Notice */}
          {followup.status === 'completed' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Task Completed on {formatDate(followup.completed_at || '')}</span>
              </div>
              {followup.outcome && <p className="text-[11px]">Outcome: {followup.outcome}</p>}
            </div>
          )}

          {followup.status === 'cancelled' && (
            <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-600">
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Task Cancelled</span>
              </div>
              {followup.cancellation_reason && (
                <p className="text-[11px]">Reason: {followup.cancellation_reason}</p>
              )}
            </div>
          )}
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-industrial-dark font-heading">
              Edit Follow-up Specifications
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date/Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.scheduledAt}
                    onChange={e => setEditForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={e => setEditForm(prev => ({ ...prev, priority: e.target.value as FollowupPriority }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reassign Staff</label>
                    <select
                      value={editForm.assignedTo}
                      onChange={e => setEditForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="">-- Unassigned --</option>
                      {staffProfiles.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.full_name || s.email} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-1.5 bg-industrial-dark text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                >
                  {isSubmittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Enquiry Dossier */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-industrial-dark font-heading">
                Associated Customer Inquiry
              </h3>
              {followup.enquiry_id && (
                <Link
                  to={`/admin/enquiries/${followup.enquiry_id}`}
                  className="text-xs text-sky-700 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Open Full Dossier
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {followup.enquiry ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Customer Name</span>
                  <span className="font-bold text-industrial-dark text-sm">{followup.enquiry.name}</span>
                </div>

                {followup.enquiry.company && (
                  <div>
                    <span className="text-slate-400 block font-medium">Company / Enterprise</span>
                    <span className="font-semibold text-slate-700">{followup.enquiry.company}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block font-medium">Contact Phone</span>
                    {followup.enquiry.phone ? (
                      <a href={`tel:${followup.enquiry.phone}`} className="text-sky-700 font-mono hover:underline">
                        {followup.enquiry.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Business Email</span>
                    <a href={`mailto:${followup.enquiry.email}`} className="text-sky-700 font-mono hover:underline truncate block">
                      {followup.enquiry.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No parent inquiry information linked.</p>
            )}
          </div>

          {/* Assigned Staff & Metadata */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-industrial-dark font-heading">
                Task Assignment & Audit Trail
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Assigned Staff Engineer</span>
                {followup.assigned_profile ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px]">
                      {(followup.assigned_profile.full_name || followup.assigned_profile.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-industrial-dark">
                        {followup.assigned_profile.full_name || followup.assigned_profile.email}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono capitalize">
                        {followup.assigned_profile.role}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Scheduled By</span>
                <span className="font-medium text-slate-700">
                  {followup.creator_profile?.full_name || followup.creator_profile?.email || 'System'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Created On</span>
                  <span className="font-mono text-slate-600">{formatDate(followup.created_at)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Last Modified</span>
                  <span className="font-mono text-slate-600">{formatDate(followup.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Complete Task
                </h3>
                <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleComplete} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Outcome & Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={outcomeNotes}
                    onChange={e => setOutcomeNotes(e.target.value)}
                    placeholder="e.g. Customer approved quotation draft. Needs drawing sign-off."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleNext}
                      onChange={e => setScheduleNext(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600"
                    />
                    <span className="font-semibold">Schedule Next Follow-up</span>
                  </label>
                </div>

                {scheduleNext && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
                    <input
                      type="datetime-local"
                      required={scheduleNext}
                      value={nextDate}
                      onChange={e => setNextDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingComplete}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                  >
                    {isSubmittingComplete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Complete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Cancel Follow-up
                </h3>
                <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCancel} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cancellation Reason (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="e.g. Customer cancelled project requirement / Handled via direct email."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                  >
                    Keep Active
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCancel}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                  >
                    {isSubmittingCancel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Cancellation
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
