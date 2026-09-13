import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  CalendarClock,
  History,
  Archive,
  Inbox,
  User,
  ExternalLink,
  FileText,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import {
  EnquiryWithDetails,
  EnquiryStatus,
  FollowupType,
  Followup,
  FollowupPriority,
  StaffProfile,
} from '../../types/database';
import { enquiryService } from '../../services/enquiryService';
import { followupService } from '../../services/followupService';
import { formatDate } from '../../utils/date';
import { PageLoader } from '../../components/common/PageLoader';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';
import { ActivityTimeline } from '../../components/admin/ActivityTimeline';

const STATUS_FLOW: { status: EnquiryStatus; label: string; icon: React.ElementType }[] = [
  { status: 'new', label: 'New RFQ', icon: Inbox },
  { status: 'contacted', label: 'Contacted', icon: Mail },
  { status: 'quotation_sent', label: 'Quotation Sent', icon: Send },
  { status: 'follow_up', label: 'Follow-up', icon: Clock },
  { status: 'converted', label: 'Converted', icon: CheckCircle2 },
  { status: 'closed', label: 'Closed', icon: Archive },
];

const FOLLOWUP_TYPE_ICONS: Record<FollowupType, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: User,
  demo: ExternalLink,
  quotation: Send,
  other: CalendarClock,
};

export const AdminEnquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [enquiry, setEnquiry] = useState<EnquiryWithDetails | null>(null);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status mutation state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Staff assign state
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Follow-up modal state
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState<boolean>(false);
  const [followupTitle, setFollowupTitle] = useState<string>('');
  const [followupType, setFollowupType] = useState<FollowupType>('call');
  const [followupPriority, setFollowupPriority] = useState<FollowupPriority>('medium');
  const [followupDate, setFollowupDate] = useState<string>('');
  const [followupTime, setFollowupTime] = useState<string>('10:00');
  const [followupNotes, setFollowupNotes] = useState<string>('');
  const [isSchedulingFollowup, setIsSchedulingFollowup] = useState<boolean>(false);
  const [followupError, setFollowupError] = useState<string | null>(null);

  // Complete follow-up modal
  const [completingFollowup, setCompletingFollowup] = useState<Followup | null>(null);
  const [completionOutcome, setCompletionOutcome] = useState<string>('');
  const [scheduleNext, setScheduleNext] = useState<boolean>(false);
  const [nextDate, setNextDate] = useState<string>('');
  const [nextType, setNextType] = useState<FollowupType>('call');
  const [nextNotes, setNextNotes] = useState<string>('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState<boolean>(false);

  const fetchEnquiry = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const [enquiryRes, staffRes] = await Promise.all([
      enquiryService.getEnquiryById(id),
      enquiryService.getAdminProfiles(),
    ]);

    if (enquiryRes.error || !enquiryRes.enquiry) {
      setError(enquiryRes.error || 'Customer enquiry could not be found.');
    } else {
      setEnquiry(enquiryRes.enquiry);
    }

    setStaffList(staffRes);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchEnquiry();
  }, [fetchEnquiry]);

  // Set default follow-up date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFollowupDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Handle Status Update
  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry || isUpdatingStatus || enquiry.status === newStatus) return;
    setIsUpdatingStatus(true);
    setStatusFeedback(null);

    const oldStatus = enquiry.status;
    // Optimistic update
    setEnquiry({ ...enquiry, status: newStatus });

    const result = await enquiryService.updateEnquiryStatus(enquiry.id, newStatus, oldStatus);
    if (result.error) {
      setStatusFeedback(`Failed: ${result.error}`);
      fetchEnquiry();
    } else {
      setStatusFeedback(`Status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setStatusFeedback(null), 3500);
      fetchEnquiry();
    }
    setIsUpdatingStatus(false);
  };

  // Handle Assignment Change
  const handleAssigneeChange = async (profileId: string) => {
    if (!enquiry || isAssigning) return;
    setIsAssigning(true);

    const selectedStaff = staffList.find((s) => s.id === profileId);
    const assignedId = profileId === 'unassigned' ? null : profileId;

    const result = await enquiryService.assignEnquiry(
      enquiry.id,
      assignedId,
      selectedStaff?.full_name || selectedStaff?.email
    );

    if (!result.error) {
      fetchEnquiry();
    }
    setIsAssigning(false);
  };

  // Handle Create Follow-up
  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || isSchedulingFollowup) return;

    if (!followupDate || !followupTime) {
      setFollowupError('Please specify date and time for follow-up.');
      return;
    }

    setIsSchedulingFollowup(true);
    setFollowupError(null);

    const scheduledIso = new Date(`${followupDate}T${followupTime}:00`).toISOString();

    const result = await followupService.createFollowup({
      enquiryId: enquiry.id,
      title: followupTitle.trim() || `Follow-up with ${enquiry.name}`,
      scheduledAt: scheduledIso,
      type: followupType,
      priority: followupPriority,
      assignedTo: enquiry.assigned_to,
      notes: followupNotes,
    });

    if (result.error) {
      setFollowupError(result.error);
    } else {
      setIsFollowupModalOpen(false);
      setFollowupTitle('');
      setFollowupNotes('');
      fetchEnquiry();
    }
    setIsSchedulingFollowup(false);
  };

  // Handle Complete Follow-up
  const handleConfirmCompletion = async () => {
    if (!completingFollowup || !enquiry || isSubmittingCompletion) return;

    if (!completionOutcome.trim()) {
      setFollowupError('Please enter the customer outcome or notes.');
      return;
    }

    setIsSubmittingCompletion(true);

    const result = await followupService.completeFollowup(
      completingFollowup.id,
      completionOutcome,
      enquiry.id
    );

    if (result.error) {
      setFollowupError(result.error);
    } else {
      // If user checked schedule next
      if (scheduleNext && nextDate) {
        await followupService.scheduleNextFollowup(
          completingFollowup.id,
          enquiry.id,
          new Date(nextDate).toISOString(),
          nextType,
          nextNotes
        );
      }

      setCompletingFollowup(null);
      setCompletionOutcome('');
      setScheduleNext(false);
      fetchEnquiry();
    }
    setIsSubmittingCompletion(false);
  };

  // Handle Cancel Follow-up
  const handleCancelFollowup = async (followupId: string) => {
    if (!enquiry) return;
    if (window.confirm('Are you sure you want to cancel this scheduled follow-up?')) {
      await followupService.cancelFollowup(followupId, enquiry.id);
      fetchEnquiry();
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !enquiry) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          to="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-industrial-primary"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Enquiries</span>
        </Link>
        <AdminErrorState
          title="Customer Enquiry Dossier"
          message={error || 'Enquiry record not found.'}
          onRetry={fetchEnquiry}
        />
      </div>
    );
  }

  const now = new Date();

  return (
    <>
      <SEOHead
        title={`Enquiry: ${enquiry.name} | AKIRA AUTOMATION Admin`}
        description={`Customer dossier and communication timeline for ${enquiry.name}.`}
      />

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/enquiries"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-industrial-dark hover:bg-slate-50 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-subtle"
              title="Return to enquiries list"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading tracking-tight">
                  {enquiry.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono bg-sky-100 text-industrial-primary border border-sky-200">
                  {enquiry.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Received on {formatDate(enquiry.created_at)} via{' '}
                <span className="font-semibold text-slate-700">{enquiry.source || 'website'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {enquiry.phone && (
              <a
                href={`tel:${enquiry.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-subtle min-h-[38px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
            )}
            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}?subject=RE: ${encodeURIComponent(enquiry.subject || 'AKIRA AUTOMATION Gauging Inquiry')}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover transition-colors shadow-subtle min-h-[38px]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            )}
          </div>
        </div>

        {/* Status Feedback Notification */}
        {statusFeedback && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-industrial-primary text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-industrial-primary" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Main 2-Column CRM Dossier Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Client Dossier & Technical Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Customer Identification */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <User className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Customer Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Primary Contact Name</span>
                  <span className="font-semibold text-industrial-dark text-sm">{enquiry.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Manufacturing Company</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {enquiry.company || <span className="text-slate-400 italic">Not specified</span>}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Business Email Address</span>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="font-mono text-industrial-primary hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3 text-slate-400" />
                    {enquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Direct Contact Number</span>
                  {enquiry.phone ? (
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="font-mono text-slate-800 hover:text-industrial-primary flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      {enquiry.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>
                {enquiry.industry && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Industrial Sector</span>
                    <span className="text-slate-700 font-medium">{enquiry.industry}</span>
                  </div>
                )}
                {enquiry.source && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Acquisition Channel</span>
                    <span className="text-slate-700 font-medium capitalize">{enquiry.source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Technical Specifications & Message */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <FileText className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Technical Requirements & Specifications</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Subject / Requirement Focus</span>
                  <p className="font-semibold text-industrial-dark text-sm">
                    {enquiry.subject || 'Precision Metrology Inquiry'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {enquiry.product_category && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 text-[11px] block">Product Category</span>
                      <span className="font-semibold text-slate-800">{enquiry.product_category}</span>
                    </div>
                  )}
                  {enquiry.specific_product && (
                    <div className="p-3 bg-sky-50 rounded-lg">
                      <span className="text-sky-600 text-[11px] block">Specific Gauge Model</span>
                      <span className="font-semibold text-industrial-primary">{enquiry.specific_product}</span>
                    </div>
                  )}
                </div>

                {enquiry.requirement && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Checking Parameter / Geometry</span>
                    <p className="text-slate-700 font-mono text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {enquiry.requirement}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block mb-1">Customer Detailed Message</span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {enquiry.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Historical Activity Trail */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <History className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Enquiry Activity Timeline</span>
              </h3>

              <ActivityTimeline entityType="enquiry" entityId={enquiry.id} logs={enquiry.activity_logs} />
            </div>
          </div>

          {/* Right Column: CRM Status, Assignment, and Follow-ups */}
          <div className="space-y-6">
            {/* Card 1: Lifecycle Status Transition Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Clock className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Lifecycle Status Progression</span>
              </h3>

              <div className="space-y-2">
                {STATUS_FLOW.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = enquiry.status === item.status;

                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => handleStatusChange(item.status)}
                      disabled={isUpdatingStatus}
                      className={`w-full p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all min-h-[40px] border ${
                        isCurrent
                          ? 'bg-industrial-primary text-white border-industrial-primary shadow-subtle'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Staff Assignment */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <UserCheck className="w-3.5 h-3.5 text-industrial-primary" />
                <span>Assigned Staff Member</span>
              </h3>

              <select
                value={enquiry.assigned_to || 'unassigned'}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={isAssigning}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-700"
                aria-label="Assign staff member"
              >
                <option value="unassigned">Unassigned Inbound Lead</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name || staff.email} ({staff.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Card 3: Follow-up Management Schedule */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Scheduled Follow-ups</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFollowupModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-industrial-primary text-white hover:bg-industrial-hover transition-colors shadow-subtle"
                >
                  <Plus className="w-3 h-3" />
                  <span>Schedule</span>
                </button>
              </div>

              {enquiry.followups && enquiry.followups.length > 0 ? (
                <div className="space-y-3">
                  {enquiry.followups.map((f) => {
                    const TypeIcon = FOLLOWUP_TYPE_ICONS[f.type as FollowupType] || Phone;
                    const scheduledTime = new Date(f.scheduled_at);
                    const isOverdue =
                      scheduledTime < now && f.status !== 'completed' && f.status !== 'cancelled';

                    return (
                      <div
                        key={f.id}
                        className={`p-3 rounded-xl border space-y-2 transition-all ${
                          isOverdue
                            ? 'bg-rose-50/60 border-rose-200'
                            : f.status === 'completed'
                            ? 'bg-slate-50 border-slate-200 opacity-75'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <TypeIcon className="w-3.5 h-3.5 text-industrial-primary" />
                            <span className="font-bold text-industrial-dark capitalize">
                              {f.title || `${f.type} Appointment`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {f.priority && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                {f.priority}
                              </span>
                            )}
                            {isOverdue ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                                OVERDUE
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-mono ${
                                  f.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {f.status}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(f.scheduled_at)}</span>
                          </div>
                          <Link
                            to={`/admin/followups/${f.id}`}
                            className="text-sky-700 hover:underline font-sans font-medium"
                          >
                            Details &rarr;
                          </Link>
                        </div>

                        {f.notes && (
                          <p className="text-xs text-slate-700 bg-white/70 p-2 rounded border border-slate-100">
                            {f.notes}
                          </p>
                        )}

                        {f.outcome && (
                          <div className="text-xs text-emerald-900 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                            <span className="font-semibold block text-[11px]">Outcome:</span>
                            {f.outcome}
                          </div>
                        )}

                        {f.status !== 'completed' && f.status !== 'cancelled' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setCompletingFollowup(f);
                                setCompletionOutcome('');
                                setScheduleNext(false);
                              }}
                              className="flex-1 py-1 px-2.5 rounded bg-industrial-primary text-white text-[11px] font-semibold hover:bg-industrial-hover transition-colors"
                            >
                              Mark Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelFollowup(f.id)}
                              className="py-1 px-2 rounded text-slate-400 hover:text-rose-600 text-[11px] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 space-y-2">
                  <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                  <p>No follow-up appointments scheduled yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Follow-up Modal */}
        {isFollowupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-dark/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-industrial-dark">Schedule Customer Follow-up</h3>
                <button
                  type="button"
                  onClick={() => setIsFollowupModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {followupError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{followupError}</span>
                </div>
              )}

              <form onSubmit={handleScheduleFollowup} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Follow-up Title</label>
                  <input
                    type="text"
                    required
                    value={followupTitle}
                    onChange={(e) => setFollowupTitle(e.target.value)}
                    placeholder="e.g. Call to clarify bore diameter and tolerance"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Channel</label>
                    <select
                      value={followupType}
                      onChange={(e) => setFollowupType(e.target.value as FollowupType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary"
                    >
                      <option value="call">Telephone Call</option>
                      <option value="email">Email Communication</option>
                      <option value="meeting">Video or In-Person</option>
                      <option value="demo">Product Demonstration</option>
                      <option value="quotation">Quotation Review</option>
                      <option value="other">Other Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={followupPriority}
                      onChange={(e) => setFollowupPriority(e.target.value as FollowupPriority)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scheduled Time</label>
                    <input
                      type="time"
                      required
                      value={followupTime}
                      onChange={(e) => setFollowupTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Follow-up Brief / Agenda Notes</label>
                  <textarea
                    rows={3}
                    value={followupNotes}
                    onChange={(e) => setFollowupNotes(e.target.value)}
                    placeholder="e.g. Discuss liner bore tolerances and review CAD drawing with quality manager..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFollowupModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSchedulingFollowup}
                    className="flex-1 py-2.5 rounded-lg bg-industrial-primary text-white font-semibold hover:bg-industrial-hover disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-subtle"
                  >
                    {isSchedulingFollowup ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Schedule Follow-up</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complete Follow-up Modal */}
        {completingFollowup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-dark/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-industrial-dark">Complete Follow-up Task</h3>
                <button
                  type="button"
                  onClick={() => setCompletingFollowup(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Outcome & Feedback <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={completionOutcome}
                    onChange={(e) => setCompletionOutcome(e.target.value)}
                    placeholder="e.g. Call completed. Client requested formal quote for 4 units of Air Plug Gauge Ø45mm..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-industrial-primary"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={scheduleNext}
                      onChange={(e) => setScheduleNext(e.target.checked)}
                      className="rounded border-slate-300 text-industrial-primary focus:ring-industrial-primary"
                    />
                    <span>Schedule next successive follow-up</span>
                  </label>

                  {scheduleNext && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Next Channel</label>
                          <select
                            value={nextType}
                            onChange={(e) => setNextType(e.target.value as FollowupType)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                          >
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="quotation">Send Quote</option>
                            <option value="meeting">Meeting</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-0.5">Next Date</label>
                          <input
                            type="date"
                            value={nextDate}
                            onChange={(e) => setNextDate(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-0.5">Next Notes</label>
                        <input
                          type="text"
                          value={nextNotes}
                          onChange={(e) => setNextNotes(e.target.value)}
                          placeholder="e.g. Follow up on received quote..."
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompletingFollowup(null)}
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCompletion}
                    disabled={isSubmittingCompletion}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-subtle"
                  >
                    {isSubmittingCompletion ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Completing...</span>
                      </>
                    ) : (
                      <span>Save & Complete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
