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
  Loader2,
  Check,
  MessageSquare,
  SendHorizontal,
  CornerDownRight,
  Sparkles,
  RefreshCw,
  CheckCheck,
  Receipt,
  MapPin,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  EnquiryWithDetails,
  EnquiryStatus,
  FollowupType,
  Followup,
  FollowupPriority,
} from '../../types/database';
import { EmailMessage } from '../../types/email';
import { enquiryService } from '../../services/enquiryService';
import { followupService } from '../../services/followupService';
import { emailMessageService } from '../../services/emailMessageService';
import { attendanceService, StaffWithAttendanceStatus } from '../../services/attendanceService';
import { formatDate } from '../../utils/date';
import { PageLoader } from '../../components/common/PageLoader';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';
import { ActivityTimeline } from '../../components/admin/ActivityTimeline';
import { Button, Modal, Input, TextArea, Select, ListBox, Label, Checkbox } from '@heroui/react';

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
  const [staffList, setStaffList] = useState<StaffWithAttendanceStatus[]>([]);
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

  // Email Communications & Reply state
  const [emailThread, setEmailThread] = useState<EmailMessage[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEmailThread = useCallback(async (enquiryId: string) => {
    setIsLoadingThread(true);
    const res = await emailMessageService.getEnquiryThread(enquiryId);
    setEmailThread(res.messages || []);
    setIsLoadingThread(false);
  }, []);

  const fetchEnquiry = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const [enquiryRes, staffRes] = await Promise.all([
      enquiryService.getEnquiryById(id),
      attendanceService.getActiveStaffWithAttendance(true),
    ]);

    if (enquiryRes.error || !enquiryRes.enquiry) {
      setError(enquiryRes.error || 'Customer enquiry could not be found.');
    } else {
      setEnquiry(enquiryRes.enquiry);
    }

    setStaffList(staffRes);
    setIsLoading(false);
    fetchEmailThread(id);
  }, [id, fetchEmailThread]);

  useEffect(() => {
    fetchEnquiry();
  }, [fetchEnquiry]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !emailMessage.trim() || isSendingEmail) return;

    setIsSendingEmail(true);
    setEmailFeedback(null);

    const res = await emailMessageService.sendAdminReply({
      enquiryId: enquiry.id,
      subject: emailSubject.trim() || `Re: [Akira Precision Automation] ${enquiry.subject || 'Precision Metrology Inquiry'}`,
      message: emailMessage.trim(),
    });

    if (res.success) {
      setEmailFeedback({
        type: 'success',
        message: 'Email accepted by provider and dispatched successfully.',
      });
      setEmailMessage('');
      fetchEmailThread(enquiry.id);
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailFeedback(null);
      }, 1800);
    } else {
      setEmailFeedback({
        type: 'error',
        message: res.error || 'Provider rejected email dispatch.',
      });
    }
    setIsSendingEmail(false);
  };

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
        title={`Enquiry: ${enquiry.name} | Akira Precision Automation Admin`}
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
              <Button
                variant="primary"
                size="sm"
                onPress={() => {
                  setEmailSubject(`Re: [Akira Precision Automation] ${enquiry.subject || enquiry.specific_product || 'Precision Metrology Inquiry'}`);
                  setEmailMessage('');
                  setEmailFeedback(null);
                  setIsEmailModalOpen(true);
                }}
                className="bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover shadow-subtle min-h-[38px] gap-1.5 cursor-pointer"
                aria-label="Send direct email to customer via Resend"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </Button>
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

            {/* Card 3: Email Communications & Conversation Thread */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-industrial-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Email Communications & Thread ({emailThread.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={() => enquiry?.id && fetchEmailThread(enquiry.id)}
                    isDisabled={isLoadingThread}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors h-7 w-7 min-w-7 cursor-pointer"
                    aria-label="Refresh conversation thread"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingThread ? 'animate-spin' : ''}`} />
                  </Button>
                  {enquiry.email && (
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => {
                        setEmailSubject(`Re: [Akira Precision Automation] ${enquiry.subject || enquiry.specific_product || 'Precision Metrology Inquiry'}`);
                        setEmailMessage('');
                        setEmailFeedback(null);
                        setIsEmailModalOpen(true);
                      }}
                      className="gap-1 px-2.5 py-1 bg-industrial-primary text-white text-[11px] font-semibold hover:bg-industrial-hover cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Reply to Customer</span>
                    </Button>
                  )}
                </div>
              </div>

              {isLoadingThread ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-industrial-primary" />
                  <span className="text-xs">Loading email conversation history...</span>
                </div>
              ) : emailThread.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No outbound or inbound emails recorded yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Replies sent to <span className="font-mono text-slate-600">{enquiry.email}</span> will be recorded here with delivery receipts and threading headers.
                  </p>
                  {enquiry.email && (
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => {
                        setEmailSubject(`Re: [Akira Precision Automation] ${enquiry.subject || enquiry.specific_product || 'Precision Metrology Inquiry'}`);
                        setEmailMessage('');
                        setEmailFeedback(null);
                        setIsEmailModalOpen(true);
                      }}
                      className="mt-2 gap-1.5 px-3 py-1.5 bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover shadow-subtle cursor-pointer"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                      <span>Send First Response</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {emailThread.map((msg) => {
                    const isOutbound = msg.direction === 'OUTBOUND';

                    return (
                      <div
                        key={msg.id}
                        className={`rounded-xl p-4 border transition-all ${
                          isOutbound
                            ? 'bg-slate-50/70 border-slate-200'
                            : 'bg-emerald-50/40 border-emerald-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                                isOutbound
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {msg.direction}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                msg.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : msg.status === 'BOUNCED' || msg.status === 'FAILED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {msg.status}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate max-w-xs">
                              {msg.subject}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(msg.created_at)}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200/80">
                          {msg.body}
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-3">
                            <span>
                              <span className="font-semibold text-slate-500">From:</span>{' '}
                              <span className="font-mono text-slate-600">{msg.from_email}</span>
                            </span>
                            {msg.provider_message_id && (
                              <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
                                ID: {msg.provider_message_id.slice(0, 16)}...
                              </span>
                            )}
                          </div>

                          {!isOutbound && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => {
                                setEmailSubject(msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`);
                                setEmailMessage('');
                                setEmailFeedback(null);
                                setIsEmailModalOpen(true);
                              }}
                              className="gap-1 text-industrial-primary hover:underline font-semibold text-xs p-0 h-auto cursor-pointer"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>Reply</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 4: Invoices & Quotations */}
            {enquiry.invoices && enquiry.invoices.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Receipt className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Quotations & Invoices ({enquiry.invoices.length})</span>
                </h3>
                <div className="space-y-3">
                  {enquiry.invoices.map((inv) => (
                    <div key={inv.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-industrial-dark">{inv.invoice_number}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white border border-slate-200">{inv.type}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] block mt-0.5">Issued: {inv.issue_date} • Status: {inv.status}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 text-sm">₹{inv.total_amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 5: Field Visits */}
            {enquiry.field_visits && enquiry.field_visits.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Field Visits ({enquiry.field_visits.length})</span>
                </h3>
                <div className="space-y-3">
                  {enquiry.field_visits.map((vis) => (
                    <div key={vis.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-industrial-dark">{vis.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-slate-200">{vis.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>{formatDate(vis.scheduled_at)}</span>
                        {vis.check_in_at && <span className="text-sky-700 font-semibold">• GPS Checked In</span>}
                        {vis.duration_minutes && <span>• {vis.duration_minutes} mins</span>}
                      </div>
                      {vis.outcome_notes && (
                        <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                          "{vis.outcome_notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 6: Historical Activity Trail */}
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

              {/* Deal or Lost Reason Callout */}
              {enquiry.deal_title && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Converted Deal: {enquiry.deal_title}</span>
                  </div>
                  {enquiry.deal_value && (
                    <p className="font-mono text-emerald-800 font-bold text-sm">
                      ₹{enquiry.deal_value.toLocaleString('en-IN')}
                    </p>
                  )}
                  {enquiry.expected_close_date && (
                    <p className="text-[11px] text-emerald-700">
                      Target Close Date: {enquiry.expected_close_date}
                    </p>
                  )}
                </div>
              )}

              {enquiry.lost_reason && (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <XCircle className="w-4 h-4 text-slate-500" />
                    <span>Closed (Lost Opportunity)</span>
                  </div>
                  <p className="text-slate-600"><strong>Reason:</strong> {enquiry.lost_reason}</p>
                  {enquiry.lost_notes && (
                    <p className="text-slate-500 italic mt-0.5">"{enquiry.lost_notes}"</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {STATUS_FLOW.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = enquiry.status === item.status;

                  return (
                    <Button
                      key={item.status}
                      variant={isCurrent ? "primary" : "outline"}
                      size="sm"
                      onPress={() => handleStatusChange(item.status)}
                      isDisabled={isUpdatingStatus}
                      className={`w-full p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all min-h-[40px] border cursor-pointer ${
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
                    </Button>
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

              <Select
                value={enquiry.assigned_to || 'unassigned'}
                onChange={(val) => handleAssigneeChange((val as string) || 'unassigned')}
                isDisabled={isAssigning}
                className="w-full"
                aria-label="Assign staff member"
              >
                <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-700 font-medium flex items-center justify-between cursor-pointer shadow-2xs">
                  <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                </Select.Trigger>
                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px] max-h-60 overflow-y-auto">
                  <ListBox className="outline-none space-y-0.5">
                    <ListBox.Item
                      id="unassigned"
                      textValue="Unassigned Inbound Lead"
                      className="px-2.5 py-1.5 text-xs rounded-lg text-slate-500 italic hover:bg-slate-100 cursor-pointer outline-none"
                    >
                      Unassigned Inbound Lead
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    {staffList.map((staff) => {
                      let badge = '🔴 [Not Reported]';
                      let timeInfo = '';
                      if (staff.role === 'admin') {
                        badge = '👑 [Admin]';
                      } else if (staff.attendanceStatus === 'present') {
                        badge = '🟢 [Present]';
                        if (staff.todayAttendance?.clock_in_at) {
                          timeInfo = ` • In: ${new Date(staff.todayAttendance.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        }
                      } else if (staff.attendanceStatus === 'on_field') {
                        badge = '🟡 [On Field]';
                        if (staff.todayAttendance?.clock_in_at) {
                          timeInfo = ` • In: ${new Date(staff.todayAttendance.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        }
                      } else if (staff.attendanceStatus === 'clocked_out') {
                        badge = '⚪ [Clocked Out]';
                        if (staff.todayAttendance?.clock_out_at) {
                          timeInfo = ` • Left: ${new Date(staff.todayAttendance.clock_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        }
                      }
                      const label = `${badge} ${staff.full_name || staff.email} (${staff.role})${timeInfo}`;
                      return (
                        <ListBox.Item
                          key={staff.id}
                          id={staff.id}
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

              {/* Real-time Staff Presence Status Indicator (only for operational staff, not admin) */}
              {(() => {
                const assignedStaff = staffList.find((s) => s.id === enquiry.assigned_to);
                if (!assignedStaff || assignedStaff.role === 'admin') return null;

                const statusConfig = {
                  present: {
                    label: 'Present & Active Today',
                    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    dotClass: 'bg-emerald-500',
                  },
                  on_field: {
                    label: 'Currently On Field Visit',
                    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                    dotClass: 'bg-amber-500',
                  },
                  clocked_out: {
                    label: 'Clocked Out for the Day',
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    dotClass: 'bg-slate-400',
                  },
                  not_reported: {
                    label: 'Not Checked In Today',
                    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
                    dotClass: 'bg-rose-500',
                  },
                }[assignedStaff.attendanceStatus];

                return (
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${statusConfig.badgeClass}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${statusConfig.dotClass}`} />
                      <span className="font-semibold">{statusConfig.label}</span>
                    </div>
                    {assignedStaff.todayAttendance?.clock_in_at && (
                      <span className="font-mono text-[11px]">
                        In: {new Date(assignedStaff.todayAttendance.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Card 3: Follow-up Management Schedule */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Scheduled Follow-ups</span>
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => setIsFollowupModalOpen(true)}
                  className="gap-1 px-2.5 py-1 text-xs font-semibold bg-industrial-primary text-white hover:bg-industrial-hover shadow-subtle cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Schedule</span>
                </Button>
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
                            <Button
                              variant="primary"
                              size="sm"
                              onPress={() => {
                                setCompletingFollowup(f);
                                setCompletionOutcome('');
                                setScheduleNext(false);
                              }}
                              className="flex-1 py-1 px-2.5 bg-industrial-primary text-white text-[11px] font-semibold hover:bg-industrial-hover cursor-pointer"
                            >
                              Mark Complete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => handleCancelFollowup(f.id)}
                              className="py-1 px-2 text-slate-400 hover:text-rose-600 text-[11px] cursor-pointer"
                            >
                              Cancel
                            </Button>
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
        <Modal.Backdrop isOpen={isFollowupModalOpen} onOpenChange={setIsFollowupModalOpen}>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Schedule Customer Follow-up</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {followupError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{followupError}</span>
                  </div>
                )}

                <form onSubmit={handleScheduleFollowup} id="schedule-followup-form" className="space-y-4 text-xs">
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">Follow-up Title</Label>
                    <Input
                      type="text"
                      required
                      value={followupTitle}
                      onChange={(e) => setFollowupTitle(e.target.value)}
                      placeholder="e.g. Call to clarify bore diameter and tolerance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">Channel</Label>
                      <Select
                        value={followupType}
                        onChange={(val) => setFollowupType((val as FollowupType) || 'call')}
                        className="w-full"
                        aria-label="Channel"
                      >
                        <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-700 flex items-center justify-between cursor-pointer shadow-2xs">
                          <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                          <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                        </Select.Trigger>
                        <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[150px]">
                          <ListBox className="outline-none space-y-0.5">
                            {[
                              { id: 'call', label: 'Telephone Call' },
                              { id: 'email', label: 'Email Communication' },
                              { id: 'meeting', label: 'Video or In-Person' },
                              { id: 'demo', label: 'Product Demonstration' },
                              { id: 'quotation', label: 'Quotation Review' },
                              { id: 'other', label: 'Other Action' },
                            ].map(item => (
                              <ListBox.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                                className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                              >
                                {item.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>

                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">Priority</Label>
                      <Select
                        value={followupPriority}
                        onChange={(val) => setFollowupPriority((val as FollowupPriority) || 'medium')}
                        className="w-full"
                        aria-label="Priority"
                      >
                        <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-700 flex items-center justify-between cursor-pointer shadow-2xs">
                          <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                          <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                        </Select.Trigger>
                        <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[130px]">
                          <ListBox className="outline-none space-y-0.5">
                            {[
                              { id: 'urgent', label: 'Urgent' },
                              { id: 'high', label: 'High' },
                              { id: 'medium', label: 'Medium' },
                              { id: 'low', label: 'Low' },
                            ].map(item => (
                              <ListBox.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                                className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                              >
                                {item.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">Scheduled Date</Label>
                      <Input
                        type="date"
                        required
                        value={followupDate}
                        onChange={(e) => setFollowupDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">Scheduled Time</Label>
                      <Input
                        type="time"
                        required
                        value={followupTime}
                        onChange={(e) => setFollowupTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">Follow-up Brief / Agenda Notes</Label>
                    <TextArea
                      rows={3}
                      value={followupNotes}
                      onChange={(e) => setFollowupNotes(e.target.value)}
                      placeholder="e.g. Discuss liner bore tolerances and review CAD drawing with quality manager..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                    />
                  </div>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setIsFollowupModalOpen(false)}
                  onClick={() => setIsFollowupModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="schedule-followup-form"
                  variant="primary"
                  size="sm"
                  isDisabled={isSchedulingFollowup}
                  className="bg-industrial-primary hover:bg-industrial-hover text-white gap-1.5"
                >
                  {isSchedulingFollowup && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSchedulingFollowup ? 'Saving...' : 'Schedule Follow-up'}</span>
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Complete Follow-up Modal */}
        {completingFollowup && (
          <Modal.Backdrop isOpen={!!completingFollowup} onOpenChange={(open) => { if (!open) setCompletingFollowup(null); }}>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-md">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Complete Follow-up Task</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4 text-xs">
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1">
                        Customer Outcome & Feedback <span className="text-rose-500">*</span>
                      </Label>
                      <TextArea
                        rows={3}
                        required
                        value={completionOutcome}
                        onChange={(e) => setCompletionOutcome(e.target.value)}
                        placeholder="e.g. Call completed. Client requested formal quote for 4 units of Air Plug Gauge Ø45mm..."
                        className="w-full text-xs font-sans"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <Checkbox
                        isSelected={scheduleNext}
                        onChange={(isSelected) => setScheduleNext(isSelected)}
                        className="font-semibold text-slate-800 text-xs"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content>
                          <span>Schedule next successive follow-up</span>
                        </Checkbox.Content>
                      </Checkbox>

                      {scheduleNext && (
                        <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="block text-[11px] text-slate-500 mb-0.5">Next Channel</Label>
                              <Select
                                value={nextType}
                                onChange={(val) => setNextType((val as FollowupType) || 'call')}
                                className="w-full"
                                aria-label="Next Channel"
                              >
                                <Select.Trigger className="w-full h-8 px-2 py-1.5 border border-slate-300 rounded-xl text-xs bg-white flex items-center justify-between cursor-pointer">
                                  <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                                  <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                                </Select.Trigger>
                                <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[130px]">
                                  <ListBox className="outline-none space-y-0.5">
                                    {[
                                      { id: 'call', label: 'Call' },
                                      { id: 'email', label: 'Email' },
                                      { id: 'quotation', label: 'Send Quote' },
                                      { id: 'meeting', label: 'Meeting' },
                                    ].map(item => (
                                      <ListBox.Item
                                        key={item.id}
                                        id={item.id}
                                        textValue={item.label}
                                        className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                                      >
                                        {item.label}
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ))}
                                  </ListBox>
                                </Select.Popover>
                              </Select>
                            </div>
                            <div>
                              <Label className="block text-[11px] text-slate-500 mb-0.5">Next Date</Label>
                              <Input
                                type="date"
                                value={nextDate}
                                onChange={(e) => setNextDate(e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="block text-[11px] text-slate-500 mb-0.5">Next Notes</Label>
                            <Input
                              type="text"
                              value={nextNotes}
                              onChange={(e) => setNextNotes(e.target.value)}
                              placeholder="e.g. Follow up on received quote..."
                              className="w-full px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-sans"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setCompletingFollowup(null)}
                    onClick={() => setCompletingFollowup(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingCompletion}
                    onPress={handleConfirmCompletion}
                    onClick={handleConfirmCompletion}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    {isSubmittingCompletion && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmittingCompletion ? 'Completing...' : 'Save & Complete'}</span>
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}

        {/* Modal: Send Email to Customer */}
        {isEmailModalOpen && enquiry && (
          <Modal.Backdrop isOpen={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
            <Modal.Container size="lg">
              <Modal.Dialog className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-industrial-primary flex items-center justify-center">
                      <SendHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <Modal.Heading>Send Email to Customer</Modal.Heading>
                      <p className="text-[11px] text-slate-400 font-normal">
                        Dispatched via notifications@akiraautomation.com with server-enforced recipient
                      </p>
                    </div>
                  </div>
                </Modal.Header>
                <Modal.Body>
                  {emailFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 mb-3 ${
                        emailFeedback.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {emailFeedback.type === 'success' ? (
                        <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{emailFeedback.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendAdminReply} id="send-customer-email-form" className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1 flex items-center justify-between">
                        <span>Customer Recipient</span>
                        <span className="text-[10px] text-slate-400 font-normal">Server-Locked Recipient</span>
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold">{enquiry.name}</span>
                        <span className="text-slate-400">({enquiry.email})</span>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-slate-600 font-semibold mb-1 text-xs">
                        Subject Line
                      </Label>
                      <Input
                        type="text"
                        required
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Subject line..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-medium text-xs font-sans"
                      />
                    </div>

                    {/* Quick Template Chips */}
                    <div>
                      <span className="block text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Quick Engineering Response Templates:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onPress={() => {
                            setEmailSubject(`Re: [Akira Precision Automation] Technical Drawing & Tolerance Request - #${enquiry.id.slice(0, 8)}`);
                            setEmailMessage(
                              `Dear ${enquiry.name},\n\nThank you for reaching out to Akira Precision Automation regarding your metrology requirement.\n\nTo ensure we provide the most precise gauging recommendation and quote for your application, could you kindly share:\n1. 2D component drawing with dimensional tolerances.\n2. Checking parameters (Bore diameter, taper, ovality, etc.).\n3. Target production cycle time / inspection throughput.\n\nLooking forward to your reply.\n\nRegards,\nAkira Precision Automation Engineering Team`
                            );
                          }}
                          className="px-2.5 py-1 text-slate-700 text-[10px] font-medium"
                        >
                          + Request Drawing & Tolerances
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onPress={() => {
                            setEmailSubject(`Re: [Akira Precision Automation] Formal Proposal & Commercial Discussion - #${enquiry.id.slice(0, 8)}`);
                            setEmailMessage(
                              `Dear ${enquiry.name},\n\nThank you for your interest in Akira Precision Automation precision inspection systems.\n\nWe have reviewed your requirements for ${enquiry.specific_product || enquiry.product_category || 'industrial gauges'} and our applications team is currently compiling your formal technical proposal.\n\nCould we schedule a brief 15-minute discussion to review master setting ring specifications and calibration certificate preferences?\n\nRegards,\nAkira Precision Automation Sales & Applications`
                            );
                          }}
                          className="px-2.5 py-1 text-slate-700 text-[10px] font-medium"
                        >
                          + Proposal Discussion
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onPress={() => {
                            setEmailSubject(`Re: [Akira Precision Automation] Technical Video Demonstration - #${enquiry.id.slice(0, 8)}`);
                            setEmailMessage(
                              `Dear ${enquiry.name},\n\nWe would be delighted to demonstrate our ${enquiry.specific_product || 'electronic column & multi-jet gauging system'} live via a video consultation.\n\nPlease let us know your availability over the coming days for a 20-minute live demonstration of measurement repeatability and SPC data export.\n\nRegards,\nAkira Precision Automation Metrology Team`
                            );
                          }}
                          className="px-2.5 py-1 text-slate-700 text-[10px] font-medium"
                        >
                          + Video Demonstration
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-slate-600 font-semibold mb-1 text-xs">
                        Message Content
                      </Label>
                      <TextArea
                        rows={7}
                        required
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Write your email message to the customer..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans leading-relaxed text-slate-800 text-xs"
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onPress={() => setIsEmailModalOpen(false)}
                    onClick={() => setIsEmailModalOpen(false)}
                    isDisabled={isSendingEmail}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="send-customer-email-form"
                    variant="primary"
                    size="sm"
                    isDisabled={isSendingEmail || !emailMessage.trim()}
                    className="bg-industrial-primary hover:bg-industrial-hover text-white gap-1.5"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending via Resend...</span>
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="w-4 h-4" />
                        <span>Send Email</span>
                      </>
                    )}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}
      </div>
    </>
  );
};
