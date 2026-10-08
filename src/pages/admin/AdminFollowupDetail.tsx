import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit,
  Loader2,
  Check,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button, Checkbox, Input, Label, Modal, TextArea, TextField, Select, ListBox } from '@heroui/react';
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

  // Delete Follow-up State
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteFollowup = async () => {
    if (!followup) return;
    setIsSubmittingDelete(true);
    setDeleteError(null);
    try {
      const res = await followupService.deleteFollowup(followup.id, followup.enquiry_id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        navigate('/admin/followups');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete follow-up.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

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
        title={`Follow-up: ${followup.title || 'Task'} | Akira Precision Automation`}
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
            {isAdmin && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </button>
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
                <Label className="block font-semibold text-slate-700 mb-1 text-xs">Title</Label>
                <Input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                />
              </div>

              <div>
                <Label className="block font-semibold text-slate-700 mb-1 text-xs">Description / Notes</Label>
                <TextArea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Scheduled Date/Time</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.scheduledAt}
                    onChange={e => setEditForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Priority</Label>
                  <Select
                    value={editForm.priority}
                    onChange={val => setEditForm(prev => ({ ...prev, priority: (val as FollowupPriority) || 'medium' }))}
                    className="w-full"
                    aria-label="Priority"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                      <ListBox className="outline-none space-y-0.5">
                        {[
                          { id: 'urgent', label: 'Urgent' },
                          { id: 'high', label: 'High' },
                          { id: 'medium', label: 'Medium' },
                          { id: 'low', label: 'Low' },
                        ].map(p => (
                          <ListBox.Item
                            key={p.id}
                            id={p.id}
                            textValue={p.label}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {p.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {isAdmin && (
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">Reassign Staff</Label>
                    <Select
                      value={editForm.assignedTo || 'unassigned'}
                      onChange={val => setEditForm(prev => ({ ...prev, assignedTo: val === 'unassigned' ? '' : (val as string) }))}
                      className="w-full"
                      aria-label="Reassign Staff"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-colors cursor-pointer">
                        <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[200px] max-h-60 overflow-y-auto">
                        <ListBox className="outline-none space-y-0.5">
                          <ListBox.Item
                            id="unassigned"
                            textValue="-- Unassigned --"
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-500 italic hover:bg-slate-100 cursor-pointer outline-none"
                          >
                            -- Unassigned --
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          {staffProfiles.map(s => {
                            const label = `${s.full_name || s.email} (${s.role})`;
                            return (
                              <ListBox.Item
                                key={s.id}
                                id={s.id}
                                textValue={label}
                                className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                              >
                                {label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            );
                          })}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onPress={() => setIsEditing(false)}
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isDisabled={isSubmittingEdit}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </Button>
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
        <Modal.Backdrop isOpen={showCompleteModal} onOpenChange={setShowCompleteModal}>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Complete Task</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleComplete} id="complete-followup-form" className="space-y-3.5 text-xs">
                  <TextField className="w-full" isRequired>
                    <Label className="text-xs font-semibold text-slate-700">
                      Customer Outcome & Notes
                    </Label>
                    <TextArea
                      rows={3}
                      value={outcomeNotes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOutcomeNotes(e.target.value)}
                      placeholder="e.g. Customer approved quotation draft. Needs drawing sign-off."
                      className="w-full text-xs"
                    />
                  </TextField>

                  <div className="pt-1">
                    <Checkbox
                      isSelected={scheduleNext}
                      onChange={(isSelected: boolean) => setScheduleNext(isSelected)}
                    >
                      <span className="text-xs font-semibold text-slate-700">Schedule Next Follow-up</span>
                    </Checkbox>
                  </div>

                  {scheduleNext && (
                    <TextField className="w-full">
                      <Label className="text-xs font-semibold text-slate-700">Next Follow-up Date</Label>
                      <Input
                        type="datetime-local"
                        value={nextDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNextDate(e.target.value)}
                        className="w-full font-mono text-xs"
                      />
                    </TextField>
                  )}
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => setShowCompleteModal(false)}
                  onClick={() => setShowCompleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="complete-followup-form"
                  variant="primary"
                  size="sm"
                  isDisabled={isSubmittingComplete}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmittingComplete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Complete
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Cancel Modal */}
        <Modal.Backdrop isOpen={showCancelModal} onOpenChange={setShowCancelModal}>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Cancel Follow-up</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleCancel} id="cancel-followup-form" className="space-y-3.5 text-xs">
                  <TextField className="w-full">
                    <Label className="text-xs font-semibold text-slate-700">
                      Cancellation Reason (Optional)
                    </Label>
                    <TextArea
                      rows={3}
                      value={cancelReason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
                      placeholder="e.g. Customer cancelled project requirement / Handled via direct email."
                      className="w-full text-xs"
                    />
                  </TextField>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => setShowCancelModal(false)}
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Active
                </Button>
                <Button
                  type="submit"
                  form="cancel-followup-form"
                  variant="danger"
                  size="sm"
                  isDisabled={isSubmittingCancel}
                  className="gap-1.5"
                >
                  {isSubmittingCancel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Cancellation
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Modal.Backdrop
            isOpen={showDeleteModal}
            onOpenChange={(open) => {
              if (!open) {
                setShowDeleteModal(false);
                setDeleteError(null);
              }
            }}
          >
            <Modal.Container>
              <Modal.Dialog className="max-w-md w-full p-6 space-y-4 bg-white rounded-2xl shadow-xl border border-slate-200">
                <div className="flex items-center gap-2 text-rose-600 border-b border-slate-100 pb-3">
                  <Trash2 className="w-5 h-5 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Delete CRM Follow-up?
                  </h3>
                </div>

                {deleteError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                    {deleteError}
                  </div>
                )}

                <div className="text-xs text-slate-600 space-y-2 py-2">
                  <p>
                    Are you sure you want to permanently delete this follow-up record for{" "}
                    <strong className="text-slate-900">{followup.enquiry?.name || "customer"}</strong>?
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    This action will remove the record from all agenda lists and timelines.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => setShowDeleteModal(false)}
                    onClick={() => setShowDeleteModal(false)}
                    className="text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    isDisabled={isSubmittingDelete}
                    onPress={handleDeleteFollowup}
                    onClick={handleDeleteFollowup}
                    className="gap-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                  >
                    {isSubmittingDelete ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete Record</span>
                  </Button>
                </div>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}
      </div>
    </>
  );
};
