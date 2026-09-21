import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
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
  MapPin,
  Receipt,
  Navigation,
  UserCheck,
  Send,
  Trash2,
  TrendingUp,
  XCircle,
  Search,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import {
  FollowupWithEnquiry,
  EnquiryWithDetails,
  FollowupTimeframe,
  FollowupPriority,
  FollowupType,
  StaffAttendance,
  FieldVisit,
  Invoice,
  VisitPurpose,
  InvoiceType,
} from '../../types/database';
import { followupService } from '../../services/followupService';
import { enquiryService } from '../../services/enquiryService';
import { attendanceService } from '../../services/attendanceService';
import { visitService } from '../../services/visitService';
import { invoiceService, CustomerSearchResult } from '../../services/invoiceService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { formatDate } from '../../utils/date';
import { SEOHead } from '../../components/layout/SEOHead';
import { company } from '../../config/company';
import { AdminEnquiryDossierDrawer } from '../../components/admin/AdminEnquiryDossierDrawer';

const PRIORITY_STYLES: Record<FollowupPriority, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'URGENT', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  high: { label: 'HIGH', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  medium: { label: 'MEDIUM', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  low: { label: 'LOW', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const LOST_REASONS = [
  'Price / Budget Constraint',
  'Competitor Selected',
  'Requirements Mismatch / Out of Scope',
  'Customer Postponed / Cancelled Project',
  'Customer Unresponsive',
  'Other',
];

export const StaffWorkspace: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'followups' | 'enquiries' | 'visits' | 'invoices'>('followups');
  const [timeframe, setTimeframe] = useState<FollowupTimeframe>('today');

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState<StaffAttendance | null>(null);
  const [isClocking, setIsClocking] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState<string | null>(null);

  // Follow-ups state
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [followupTotal, setFollowupTotal] = useState(0);
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(true);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<EnquiryWithDetails[]>([]);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(true);

  // Field Visits state
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [visitTotal, setVisitTotal] = useState(0);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  // Quick stats counts
  const [stats, setStats] = useState({
    myNewEnquiries: 0,
    dueToday: 0,
    overdue: 0,
    upcoming: 0,
    completed: 0,
  });

  // Complete Follow-up Modal State
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

  // Lead Conversion Modal State
  const [convertingEnquiry, setConvertingEnquiry] = useState<EnquiryWithDetails | null>(null);
  const [dealForm, setDealForm] = useState({
    dealTitle: '',
    dealValue: '',
    expectedCloseDate: '',
    notes: '',
  });
  const [isSubmittingConversion, setIsSubmittingConversion] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Lead Closure Modal State
  const [closingEnquiry, setClosingEnquiry] = useState<EnquiryWithDetails | null>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [lostNotes, setLostNotes] = useState('');
  const [isSubmittingClosure, setIsSubmittingClosure] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);

  // Dossier Drawer State
  const [selectedDossierEnquiry, setSelectedDossierEnquiry] = useState<EnquiryWithDetails | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const handleOpenDossier = async (enquiryId: string) => {
    const found = enquiries.find((e) => e.id === enquiryId);
    if (found) {
      setSelectedDossierEnquiry(found);
      setIsDossierOpen(true);
    } else {
      const { enquiry } = await enquiryService.getEnquiryById(enquiryId);
      if (enquiry) {
        setSelectedDossierEnquiry(enquiry);
        setIsDossierOpen(true);
      }
    }
  };

  // Schedule Visit Modal State
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    enquiryId: '',
    title: '',
    visitPurpose: 'consultation' as VisitPurpose,
    scheduledAt: '',
    customerContactPerson: '',
    notes: '',
  });
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  // Complete Visit Modal State
  const [completingVisit, setCompletingVisit] = useState<FieldVisit | null>(null);
  const [visitOutcomeNotes, setVisitOutcomeNotes] = useState('');
  const [visitPhotoUrl, setVisitPhotoUrl] = useState('');
  const [isSubmittingVisitComplete, setIsSubmittingVisitComplete] = useState(false);
  const [visitCompleteError, setVisitCompleteError] = useState<string | null>(null);

  // Create Invoice / Quotation Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [productCatalog, setProductCatalog] = useState<Product[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSearchResult[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<{
    enquiryId: string;
    customerName: string;
    customerCompany: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerGst: string;
    type: InvoiceType;
    items: Array<{
      productId?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }>;
  }>({
    enquiryId: '',
    customerName: '',
    customerCompany: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGst: '',
    type: 'quotation',
    items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 18 }],
  });
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [invoiceErrorMsg, setInvoiceErrorMsg] = useState<string | null>(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  // Load product catalog for invoice generation
  useEffect(() => {
    productService.getProducts().then(setProductCatalog).catch(() => {});
  }, []);

  // Customer search handler for invoice auto-fill
  const handleCustomerSearch = async (val: string) => {
    setCustomerSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearchingCustomers(true);
      const results = await invoiceService.searchCustomers(val.trim());
      setCustomerSuggestions(results);
      setIsSearchingCustomers(false);
      setShowCustomerDropdown(true);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (c: CustomerSearchResult) => {
    setInvoiceForm((prev) => ({
      ...prev,
      enquiryId: c.id || prev.enquiryId,
      customerName: c.name,
      customerCompany: c.company || '',
      customerEmail: c.email,
      customerPhone: c.phone || '',
      customerAddress: c.address || '',
      customerGst: c.gst || '',
    }));
    setShowCustomerDropdown(false);
    setCustomerSearchQuery('');
  };

  // Load staff data
  const loadStaffData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingFollowups(true);
    setIsLoadingEnquiries(true);

    try {
      // 1. Load attendance for today (exempt for administrators)
      if (profile?.role !== 'admin') {
        const att = await attendanceService.getTodayAttendance(user.id);
        setTodayAttendance(att);
      }

      // 2. Load follow-ups
      const folRes = await followupService.getFollowups({
        assignedTo: user.id,
        timeframe,
        limit: 50,
      });
      setFollowups(folRes.followups);
      setFollowupTotal(folRes.total);

      // 3. Load assigned enquiries
      const enqRes = await enquiryService.getEnquiries({
        assignedTo: user.id,
        limit: 50,
      });
      setEnquiries(enqRes.enquiries);
      setEnquiryTotal(enqRes.total);

      // 4. Load field visits
      const visRes = await visitService.getVisits({
        staffId: user.id,
        limit: 50,
      });
      setVisits(visRes.visits);
      setVisitTotal(visRes.total);

      // 5. Load invoices
      const invRes = await invoiceService.getInvoices({
        createdBy: user.id,
        limit: 50,
      });
      setInvoices(invRes.invoices);
      setInvoiceTotal(invRes.total);

      // 6. Load operational counts
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

  // Helper to obtain browser geolocation
  const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  };

  // Attendance Clock-in
  const handleClockIn = async (status: 'present' | 'on_field' = 'present') => {
    if (!user?.id || isClocking) return;
    setIsClocking(true);
    setAttendanceMsg(null);

    const coords = await getCurrentLocation();
    const res = await attendanceService.clockIn({
      staffId: user.id,
      status,
      coords,
      notes: coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Location not shared',
    });

    setIsClocking(false);
    if (res.error) {
      setAttendanceMsg(`Notice: ${res.error}`);
    } else {
      setTodayAttendance(res.attendance);
      setAttendanceMsg(`Clocked in as ${status === 'on_field' ? 'On Field' : 'Present'} successfully.`);
      setTimeout(() => setAttendanceMsg(null), 4000);
    }
  };

  // Attendance Clock-out
  const handleClockOut = async () => {
    if (!todayAttendance || isClocking) return;
    setIsClocking(true);
    setAttendanceMsg(null);

    const coords = await getCurrentLocation();
    const res = await attendanceService.clockOut({
      attendanceId: todayAttendance.id,
      coords,
    });

    setIsClocking(false);
    if (res.error) {
      setAttendanceMsg(`Error: ${res.error}`);
    } else {
      setTodayAttendance(res.attendance);
      setAttendanceMsg('Clocked out successfully for today.');
      setTimeout(() => setAttendanceMsg(null), 4000);
    }
  };

  // Check in to Field Visit
  const handleCheckInVisit = async (visitId: string) => {
    const coords = await getCurrentLocation();
    const res = await visitService.checkInVisit(
      visitId,
      coords || { lat: 12.9716, lng: 77.5946 }
    );
    if (res.success) {
      loadStaffData();
    } else {
      alert(`Check-in failed: ${res.error}`);
    }
  };

  // Complete Field Visit Submit
  const handleCompleteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingVisit) return;

    if (!visitOutcomeNotes.trim()) {
      setVisitCompleteError('Please record outcome notes from the customer visit.');
      return;
    }

    setIsSubmittingVisitComplete(true);
    setVisitCompleteError(null);

    const coords = await getCurrentLocation();
    const photos = visitPhotoUrl.trim() ? [visitPhotoUrl.trim()] : [];

    const res = await visitService.checkOutVisit(
      completingVisit.id,
      coords || { lat: 12.9716, lng: 77.5946 },
      visitOutcomeNotes.trim(),
      photos
    );

    setIsSubmittingVisitComplete(false);
    if (res.error) {
      setVisitCompleteError(res.error);
    } else {
      setCompletingVisit(null);
      setVisitOutcomeNotes('');
      setVisitPhotoUrl('');
      loadStaffData();
    }
  };

  // Schedule Field Visit Submit
  const handleCreateVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.enquiryId || !visitForm.scheduledAt) {
      setVisitError('Inquiry selection and scheduled date/time are required.');
      return;
    }

    setIsSubmittingVisit(true);
    setVisitError(null);

    const res = await visitService.createVisit({
      enquiryId: visitForm.enquiryId,
      staffId: user!.id,
      title: visitForm.title.trim() || 'Client Site Inspection & Demo',
      visitPurpose: visitForm.visitPurpose,
      scheduledAt: visitForm.scheduledAt,
      customerContactPerson: visitForm.customerContactPerson.trim(),
      notes: visitForm.notes.trim(),
      createdBy: user?.id,
    });

    setIsSubmittingVisit(false);
    if (res.error) {
      setVisitError(res.error);
    } else {
      setShowVisitModal(false);
      setVisitForm({
        enquiryId: '',
        title: '',
        visitPurpose: 'consultation',
        scheduledAt: '',
        customerContactPerson: '',
        notes: '',
      });
      loadStaffData();
    }
  };

  // Lead Conversion Submit
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingEnquiry) return;

    if (!dealForm.dealTitle.trim()) {
      setConversionError('Deal title is required to convert this lead.');
      return;
    }

    setIsSubmittingConversion(true);
    setConversionError(null);

    const res = await enquiryService.convertEnquiry(convertingEnquiry.id, {
      dealTitle: dealForm.dealTitle.trim(),
      dealValue: dealForm.dealValue ? parseFloat(dealForm.dealValue) : undefined,
      expectedCloseDate: dealForm.expectedCloseDate || undefined,
      notes: dealForm.notes.trim(),
      convertedBy: user?.id,
    });

    setIsSubmittingConversion(false);
    if (res.error) {
      setConversionError(res.error);
    } else {
      setConvertingEnquiry(null);
      setDealForm({ dealTitle: '', dealValue: '', expectedCloseDate: '', notes: '' });
      loadStaffData();
    }
  };

  // Lead Closure Submit
  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingEnquiry) return;

    setIsSubmittingClosure(true);
    setClosureError(null);

    const res = await enquiryService.closeEnquiry(closingEnquiry.id, {
      lostReason,
      lostNotes: lostNotes.trim(),
      closedBy: user?.id,
    });

    setIsSubmittingClosure(false);
    if (res.error) {
      setClosureError(res.error);
    } else {
      setClosingEnquiry(null);
      setLostNotes('');
      loadStaffData();
    }
  };

  // Invoice / Quotation Submit
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.customerName || !invoiceForm.customerEmail) {
      setInvoiceErrorMsg('Customer name and email are required.');
      return;
    }

    setIsSubmittingInvoice(true);
    setInvoiceErrorMsg(null);

    const res = await invoiceService.createInvoice({
      enquiryId: invoiceForm.enquiryId || null,
      customerName: invoiceForm.customerName.trim(),
      customerCompany: invoiceForm.customerCompany.trim() || null,
      customerEmail: invoiceForm.customerEmail.trim(),
      customerPhone: invoiceForm.customerPhone.trim() || null,
      customerAddress: invoiceForm.customerAddress.trim() || null,
      customerGst: invoiceForm.customerGst.trim() || null,
      type: invoiceForm.type,
      createdBy: user?.id,
      items: invoiceForm.items.map((i) => ({
        productId: i.productId || null,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: i.taxRate,
      })),
    });

    setIsSubmittingInvoice(false);
    if (res.error) {
      setInvoiceErrorMsg(res.error);
    } else {
      setShowInvoiceModal(false);
      setCustomerSearchQuery('');
      setInvoiceForm({
        enquiryId: '',
        customerName: '',
        customerCompany: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerGst: '',
        type: 'quotation',
        items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 18 }],
      });
      loadStaffData();
    }
  };

  // Send Invoice to Customer via Email
  const handleSendInvoice = async (invoiceId: string) => {
    setSendingInvoiceId(invoiceId);
    const res = await invoiceService.sendInvoiceToCustomer(invoiceId, {
      id: user!.id,
      full_name: profile?.full_name,
      email: user?.email,
    });
    setSendingInvoiceId(null);
    if (res.success) {
      loadStaffData();
    } else {
      alert(`Unable to dispatch invoice: ${res.error}`);
    }
  };

  // Follow-up Completion Submit
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

  // Follow-up Create Submit
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
      title: createForm.title.trim() || 'Follow-up on inquiry',
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
        title="Staff Workspace | Akira Precision Automation LLP"
        description="Assigned tasks, client inquiries, field visits, and invoice management for sales engineers."
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
                <p className="text-[11px] text-slate-500">Precision CRM, Field Visits & Billing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {profile?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs"
                  title="Return to Admin Console"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
              )}
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
          {/* Top Banner: ERP Attendance Widget (Hidden for Admin, active for field & sales staff) */}
          {profile?.role !== 'admin' ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  todayAttendance && !todayAttendance.clock_out_at
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-industrial-dark">ERP Daily Attendance</h2>
                    {todayAttendance ? (
                      todayAttendance.clock_out_at ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          Clocked Out
                        </span>
                      ) : todayAttendance.status === 'on_field' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          On Field
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Present
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        Not Clocked In
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {todayAttendance
                      ? `Clocked in at ${new Date(todayAttendance.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
                          todayAttendance.clock_out_at
                            ? ` • Clocked out at ${new Date(todayAttendance.clock_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : ''
                        }`
                      : 'Record your daily punch to activate your availability for lead assignment.'}
                  </p>
                  {attendanceMsg && (
                    <p className="text-xs font-semibold text-sky-700 mt-1">{attendanceMsg}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!todayAttendance && (
                  <>
                    <button
                      onClick={() => handleClockIn('present')}
                      disabled={isClocking}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {isClocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Clock In (Office)
                    </button>
                    <button
                      onClick={() => handleClockIn('on_field')}
                      disabled={isClocking}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Clock In (Field)
                    </button>
                  </>
                )}

                {todayAttendance && !todayAttendance.clock_out_at && (
                  <button
                    onClick={handleClockOut}
                    disabled={isClocking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {isClocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    Clock Out
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/80 rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded font-mono uppercase text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Administrator
                </span>
                <span className="text-slate-600 font-medium">
                  Logged in with full supervisory access. ERP daily attendance punch is exempt for administrators.
                </span>
              </div>
              <Link
                to="/admin/attendance"
                className="text-sky-700 hover:text-sky-800 font-semibold inline-flex items-center gap-1 text-[11px]"
              >
                <span>Team Attendance Roster</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Welcome & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-industrial-dark font-heading">
                Sales & Field Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage inquiries, follow-up calls, field visits with GPS, and customer billing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => loadStaffData()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowVisitModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Schedule Visit</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Invoice</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-industrial-blue text-white hover:bg-sky-700 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Follow-up</span>
              </button>
            </div>
          </div>

          {/* Operational Counts Strip */}
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
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Site Visits</span>
              </div>
              <p className="text-xl font-bold font-mono text-industrial-dark mt-1">
                {visitTotal}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invoices</span>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {invoiceTotal}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('followups')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'followups'
                    ? 'border-industrial-blue text-industrial-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Follow-ups ({followupTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab('enquiries')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'enquiries'
                    ? 'border-industrial-blue text-industrial-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Inquiries ({enquiryTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab('visits')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'visits'
                    ? 'border-industrial-blue text-industrial-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Field Visits ({visitTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'border-industrial-blue text-industrial-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Invoices & Quotes ({invoiceTotal})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Follow-up Queue */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
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
                        className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow space-y-3 ${
                          isOverdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                                {priorityStyle.label}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500 capitalize">
                                {item.type}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-industrial-dark mt-1 font-heading">
                              {item.title || 'Follow-up Call'}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-slate-700 block">
                              {formatDate(item.scheduled_at)}
                            </span>
                            {item.due_time && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {item.due_time}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.enquiry && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{item.enquiry.name}</span>
                              {item.enquiry.company && (
                                <span className="text-slate-500 text-[11px]">{item.enquiry.company}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-sky-700 font-mono pt-0.5">
                              {item.enquiry.phone && <span>{item.enquiry.phone}</span>}
                              <span>{item.enquiry.email}</span>
                            </div>
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-xs text-slate-600 italic line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenDossier(item.enquiry_id)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-industrial-blue font-semibold transition-colors"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

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

          {/* TAB 2: Assigned Enquiries */}
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
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            enq.status === 'converted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : enq.status === 'closed'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {enq.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                            {formatDate(enq.created_at)}
                          </span>
                        </div>
                      </div>

                      {enq.deal_title && (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-900">
                            <span>Deal: {enq.deal_title}</span>
                            {enq.deal_value && <span>₹{enq.deal_value.toLocaleString('en-IN')}</span>}
                          </div>
                          {enq.expected_close_date && (
                            <div className="text-[11px] text-emerald-700">
                              Target Close: {enq.expected_close_date}
                            </div>
                          )}
                        </div>
                      )}

                      {enq.lost_reason && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                          <strong>Closed Reason:</strong> {enq.lost_reason}
                          {enq.lost_notes && <p className="italic mt-0.5">"{enq.lost_notes}"</p>}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded">
                        "{enq.message}"
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
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

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCreateForm({
                                enquiryId: enq.id,
                                title: `Follow-up: ${enq.company || enq.name}`,
                                scheduledAt: new Date().toISOString().slice(0, 16),
                                type: 'call',
                                priority: 'high',
                                notes: `Follow-up on inquiry: ${enq.specific_product || enq.product_category || 'General requirement'}`,
                              });
                              setShowCreateModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                            title="Schedule Follow-up"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Follow-up</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVisitForm({
                                enquiryId: enq.id,
                                title: `Site Visit: ${enq.company || enq.name}`,
                                visitPurpose: 'consultation',
                                scheduledAt: '',
                                customerContactPerson: enq.name,
                                notes: enq.requirement || '',
                              });
                              setShowVisitModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                            title="Schedule Customer Site Visit"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Visit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceForm({
                                enquiryId: enq.id,
                                customerName: enq.name,
                                customerCompany: enq.company || '',
                                customerEmail: enq.email,
                                customerPhone: enq.phone || '',
                                customerAddress: '',
                                customerGst: '',
                                type: 'quotation',
                                items: [{
                                  description: enq.specific_product || enq.product_category || 'Metrology Gauging Requirement',
                                  quantity: 1,
                                  unitPrice: 0,
                                  taxRate: 18,
                                }],
                              });
                              setShowInvoiceModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            title="Create Quotation"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Quote</span>
                          </button>

                          {enq.status !== 'converted' && enq.status !== 'closed' && (
                            <>
                              <button
                                onClick={() => {
                                  setConvertingEnquiry(enq);
                                  setDealForm({
                                    dealTitle: `${enq.company || enq.name} - ${enq.specific_product || 'Gauging Requirement'}`,
                                    dealValue: '',
                                    expectedCloseDate: '',
                                    notes: '',
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                              >
                                <TrendingUp className="w-3 h-3" />
                                Convert to Deal
                              </button>
                              <button
                                onClick={() => {
                                  setClosingEnquiry(enq);
                                  setLostReason(LOST_REASONS[0]);
                                  setLostNotes('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Close Lead
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenDossier(enq.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-industrial-dark text-white hover:bg-slate-800 transition-colors shadow-xs"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Field Visits */}
          {activeTab === 'visits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Customer Site Visits & Inspections
                </h3>
                <button
                  onClick={() => setShowVisitModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-industrial-blue text-white hover:bg-sky-700 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  Schedule Visit
                </button>
              </div>

              {visits.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Field Visits Scheduled</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Schedule customer on-site visits to record GPS check-in/out and inspection evidence.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visits.map((vis) => (
                    <div
                      key={vis.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            vis.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : vis.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {vis.status.replace('_', ' ')}
                          </span>
                          <h4 className="text-sm font-bold text-industrial-dark font-heading mt-1">
                            {vis.title}
                          </h4>
                          <p className="text-xs text-slate-500 capitalize">Purpose: {vis.visit_purpose.replace('_', ' ')}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {formatDate(vis.scheduled_at)}
                        </span>
                      </div>

                      {vis.enquiry && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                          <p className="font-bold text-slate-800">{vis.enquiry.name} ({vis.enquiry.company || 'Client'})</p>
                          <p className="text-[11px] text-slate-500 font-mono">{vis.enquiry.phone} • {vis.enquiry.email}</p>
                        </div>
                      )}

                      {vis.check_in_at && (
                        <div className="text-[11px] text-slate-500 space-y-0.5 bg-sky-50/50 p-2 rounded border border-sky-100">
                          <p className="flex items-center gap-1 text-sky-800 font-semibold">
                            <Navigation className="w-3 h-3" />
                            Checked In: {new Date(vis.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {vis.check_in_address && <p className="text-slate-600 truncate">{vis.check_in_address}</p>}
                        </div>
                      )}

                      {vis.outcome_notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded italic">
                          "{vis.outcome_notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {vis.duration_minutes ? `Duration: ${vis.duration_minutes} mins` : 'Pending Check-out'}
                        </span>

                        {vis.status === 'scheduled' && (
                          <button
                            onClick={() => handleCheckInVisit(vis.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
                          >
                            <Navigation className="w-3 h-3" />
                            Check In (GPS)
                          </button>
                        )}

                        {vis.status === 'in_progress' && (
                          <button
                            onClick={() => setCompletingVisit(vis)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            Complete Visit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Invoices & Quotations */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Generated Quotations & Tax Invoices
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  New Quotation / Invoice
                </button>
              </div>

              {invoices.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Invoices or Quotations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Create formal quotations or proforma invoices with tax calculations for your assigned leads.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-industrial-dark">
                              {inv.invoice_number}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              {inv.type}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {inv.customer_name} {inv.customer_company ? `(${inv.customer_company})` : ''}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inv.status === 'sent'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {inv.status}
                          </span>
                          <span className="text-sm font-bold font-mono text-emerald-700 block mt-1">
                            ₹{inv.total_amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {inv.items && inv.items.length > 0 && (
                        <div className="bg-slate-50 p-2 rounded text-xs space-y-1">
                          {inv.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-600">
                              <span>{it.quantity}x {it.description}</span>
                              <span className="font-mono">₹{it.total_price.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          Issued: {inv.issue_date}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendInvoice(inv.id)}
                            disabled={sendingInvoiceId === inv.id}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                          >
                            {sendingInvoiceId === inv.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Send to Customer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modal 1: Complete Follow-up Modal */}
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleNext}
                      onChange={e => setScheduleNext(e.target.checked)}
                      className="rounded border-slate-300 text-industrial-blue focus:ring-sky-500"
                    />
                    <span className="font-semibold text-slate-700">
                      Schedule successive touchpoint
                    </span>
                  </label>

                  {scheduleNext && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Next Touchpoint Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required={scheduleNext}
                        value={nextDate}
                        onChange={e => setNextDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCompletingTask(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingComplete}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmittingComplete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm Complete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Schedule Follow-up Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Schedule New Follow-up
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
                    onChange={e => setCreateForm({ ...createForm, enquiryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  >
                    <option value="">-- Choose Assigned Client --</option>
                    {enquiries.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} {e.company ? `(${e.company})` : ''} - {e.specific_product || e.product_category || 'Inquiry'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="e.g. Call client regarding quotation feedback"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Type</label>
                    <select
                      value={createForm.type}
                      onChange={e => setCreateForm({ ...createForm, type: e.target.value as FollowupType })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    >
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="demo">Demo</option>
                      <option value="quotation">Quotation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={createForm.priority}
                      onChange={e => setCreateForm({ ...createForm, priority: e.target.value as FollowupPriority })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.scheduledAt}
                    onChange={e => setCreateForm({ ...createForm, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={createForm.notes}
                    onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Specific points to discuss or client requests..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-industrial-blue text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
                  >
                    {isSubmittingCreate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Convert Lead to Deal */}
        {convertingEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Convert Lead to Deal / Opportunity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Client: {convertingEnquiry.name} ({convertingEnquiry.company || 'N/A'})
                  </p>
                </div>
                <button
                  onClick={() => setConvertingEnquiry(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {conversionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{conversionError}</span>
                </div>
              )}

              <form onSubmit={handleConvertSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Deal Title / Order Description <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dealForm.dealTitle}
                    onChange={e => setDealForm({ ...dealForm, dealTitle: e.target.value })}
                    placeholder="e.g. 5x Custom Air Ring Gauges Ø30mm"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estimated Value (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={dealForm.dealValue}
                      onChange={e => setDealForm({ ...dealForm, dealValue: e.target.value })}
                      placeholder="e.g. 75000"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Close Date</label>
                    <input
                      type="date"
                      value={dealForm.expectedCloseDate}
                      onChange={e => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conversion Notes</label>
                  <textarea
                    rows={2}
                    value={dealForm.notes}
                    onChange={e => setDealForm({ ...dealForm, notes: e.target.value })}
                    placeholder="Client agreed on technical parameters and formal proposal..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConvertingEnquiry(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingConversion}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmittingConversion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    Confirm Deal Conversion
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Close Lead (Lost Reason) */}
        {closingEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Close Lead (Lost Opportunity)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Client: {closingEnquiry.name} ({closingEnquiry.company || 'N/A'})
                  </p>
                </div>
                <button
                  onClick={() => setClosingEnquiry(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {closureError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{closureError}</span>
                </div>
              )}

              <form onSubmit={handleCloseSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Reason for Closing <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={lostReason}
                    onChange={e => setLostReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  >
                    {LOST_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation</label>
                  <textarea
                    rows={3}
                    value={lostNotes}
                    onChange={e => setLostNotes(e.target.value)}
                    placeholder="Provide context on why the client opted not to proceed..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setClosingEnquiry(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClosure}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 disabled:opacity-50"
                  >
                    {isSubmittingClosure ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Confirm Closure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 5: Schedule Field Visit */}
        {showVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Schedule Client Site Visit
                </h3>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {visitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{visitError}</span>
                </div>
              )}

              <form onSubmit={handleCreateVisitSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Client Inquiry <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={visitForm.enquiryId}
                    onChange={e => setVisitForm({ ...visitForm, enquiryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                  >
                    <option value="">-- Choose Client --</option>
                    {enquiries.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} {e.company ? `(${e.company})` : ''} - {e.specific_product || e.product_category || 'Inquiry'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Title</label>
                  <input
                    type="text"
                    value={visitForm.title}
                    onChange={e => setVisitForm({ ...visitForm, title: e.target.value })}
                    placeholder="e.g. On-site Calibration & Dimension Verification"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Purpose</label>
                    <select
                      value={visitForm.visitPurpose}
                      onChange={e => setVisitForm({ ...visitForm, visitPurpose: e.target.value as VisitPurpose })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="demo">Demo</option>
                      <option value="site_inspection">Site Inspection</option>
                      <option value="installation">Installation</option>
                      <option value="troubleshooting">Troubleshooting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={visitForm.customerContactPerson}
                      onChange={e => setVisitForm({ ...visitForm, customerContactPerson: e.target.value })}
                      placeholder="e.g. Quality Manager"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={visitForm.scheduledAt}
                    onChange={e => setVisitForm({ ...visitForm, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Agenda / Notes</label>
                  <textarea
                    rows={2}
                    value={visitForm.notes}
                    onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                    placeholder="Inspect workpiece fixture, verify air line pressure..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowVisitModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingVisit}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-industrial-blue text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
                  >
                    {isSubmittingVisit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                    Confirm Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 6: Complete Field Visit */}
        {completingVisit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Check Out & Complete Field Visit
                  </h3>
                  <p className="text-[11px] text-slate-500">{completingVisit.title}</p>
                </div>
                <button
                  onClick={() => setCompletingVisit(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {visitCompleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{visitCompleteError}</span>
                </div>
              )}

              <form onSubmit={handleCompleteVisitSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Visit Outcome & Findings <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={visitOutcomeNotes}
                    onChange={e => setVisitOutcomeNotes(e.target.value)}
                    placeholder="Documented component dimensions. Customer agreed to standard 2-jet air ring gauge."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Inspection Photo / Proof URL
                  </label>
                  <input
                    type="url"
                    value={visitPhotoUrl}
                    onChange={e => setVisitPhotoUrl(e.target.value)}
                    placeholder="https://... (photo of setup or job card)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCompletingVisit(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingVisitComplete}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmittingVisitComplete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm Check-out
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 7: Create Invoice / Quotation */}
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Create Formal Quotation / Tax Invoice
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {invoiceErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{invoiceErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                    <select
                      value={invoiceForm.type}
                      onChange={e => setInvoiceForm({ ...invoiceForm, type: e.target.value as InvoiceType })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    >
                      <option value="quotation">Formal Quotation</option>
                      <option value="proforma">Proforma Invoice</option>
                      <option value="tax_invoice">Tax Invoice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Link to Inquiry</label>
                    <select
                      value={invoiceForm.enquiryId}
                      onChange={e => {
                        const selectedId = e.target.value;
                        const matched = enquiries.find(en => en.id === selectedId);
                        if (matched) {
                          setInvoiceForm({
                            ...invoiceForm,
                            enquiryId: selectedId,
                            customerName: matched.name,
                            customerCompany: matched.company || '',
                            customerEmail: matched.email,
                            customerPhone: matched.phone || '',
                          });
                        } else {
                          setInvoiceForm({ ...invoiceForm, enquiryId: selectedId });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white"
                    >
                      <option value="">-- Standalone (No Inquiry) --</option>
                      {enquiries.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.company || 'Client'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer Auto-fill / Search Bar */}
                <div className="relative p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-sky-600" />
                      <span>Search Customer Database (Auto-fill)</span>
                    </label>
                    {(invoiceForm.customerName || invoiceForm.customerEmail) && (
                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceForm({
                            ...invoiceForm,
                            enquiryId: '',
                            customerName: '',
                            customerCompany: '',
                            customerEmail: '',
                            customerPhone: '',
                            customerAddress: '',
                            customerGst: '',
                          });
                          setCustomerSearchQuery('');
                        }}
                        className="text-[10px] text-sky-700 hover:underline font-semibold"
                      >
                        + New Customer (Clear)
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type name, company, or email to search past records..."
                      value={customerSearchQuery}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      onFocus={() => {
                        if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white text-xs"
                    />
                    {isSearchingCustomers && (
                      <div className="absolute right-2.5 top-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      </div>
                    )}
                    {showCustomerDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {customerSuggestions.length > 0 ? (
                          customerSuggestions.map((c, i) => (
                            <div
                              key={i}
                              onClick={() => handleSelectCustomer(c)}
                              className="p-2.5 hover:bg-sky-50 cursor-pointer text-xs transition-colors flex items-center justify-between"
                            >
                              <div>
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span>{c.name}</span>
                                  {c.company && (
                                    <span className="text-[10px] text-slate-500 font-normal">({c.company})</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {c.email} {c.phone ? `• ${c.phone}` : ''}
                                </div>
                                {c.address && (
                                  <div className="text-[9px] text-slate-400 truncate max-w-xs">{c.address}</div>
                                )}
                              </div>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">
                                {c.source === 'invoice' ? 'Past Client' : 'Inquiry Lead'}
                              </span>
                            </div>
                          ))
                        ) : !isSearchingCustomers && customerSearchQuery.trim().length >= 2 ? (
                          <div className="p-3 text-center text-slate-500 text-xs space-y-1">
                            <p className="font-medium text-slate-700">No matching customer found</p>
                            <p className="text-[11px] text-slate-400">
                              You can enter customer details manually in the fields below.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.customerName}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={invoiceForm.customerCompany}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerCompany: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Customer Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={invoiceForm.customerEmail}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Phone</label>
                    <input
                      type="text"
                      value={invoiceForm.customerPhone}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                    <input
                      type="text"
                      placeholder="Plot No, Industrial Estate, City..."
                      value={invoiceForm.customerAddress}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      value={invoiceForm.customerGst}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerGst: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Line Items</label>
                    <button
                      type="button"
                      onClick={() => setInvoiceForm({
                        ...invoiceForm,
                        items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 18 }],
                      })}
                      className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {invoiceForm.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Select Product from Catalogue
                          </label>
                          {invoiceForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = invoiceForm.items.filter((_, i) => i !== idx);
                                setInvoiceForm({ ...invoiceForm, items: newItems });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <select
                          value={item.productId || ''}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const p = productCatalog.find((prod) => prod.id === pId);
                            const newItems = [...invoiceForm.items];
                            if (p) {
                              newItems[idx] = {
                                ...newItems[idx],
                                productId: p.id,
                                description: `${p.title}${p.tagline ? ' - ' + p.tagline : ''}`,
                                taxRate: 18,
                              };
                            } else {
                              newItems[idx] = {
                                ...newItems[idx],
                                productId: undefined,
                              };
                            }
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white text-xs font-medium text-slate-700"
                        >
                          <option value="">-- Custom / Service Line Item --</option>
                          {productCatalog.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.title} ({prod.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Item Description / Specifications</label>
                        <input
                          type="text"
                          required
                          placeholder="Item Description (e.g. Air Electronic Column Gauge Model AEC-100)"
                          value={item.description}
                          onChange={e => {
                            const newItems = [...invoiceForm.items];
                            newItems[idx].description = e.target.value;
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-hidden bg-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx].quantity = parseInt(e.target.value) || 1;
                              setInvoiceForm({ ...invoiceForm, items: newItems });
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 font-mono bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                              setInvoiceForm({ ...invoiceForm, items: newItems });
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 font-mono bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">GST Rate (%)</label>
                          <select
                            value={item.taxRate}
                            onChange={e => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx].taxRate = parseFloat(e.target.value);
                              setInvoiceForm({ ...invoiceForm, items: newItems });
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 font-mono bg-white text-xs"
                          >
                            <option value="18">18% (Metrology Standard)</option>
                            <option value="12">12%</option>
                            <option value="5">5%</option>
                            <option value="0">0% (Exempt)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Total Calculation */}
                {(() => {
                  let subtotal = 0;
                  let tax = 0;
                  invoiceForm.items.forEach(it => {
                    const line = it.quantity * it.unitPrice;
                    subtotal += line;
                    tax += (line * it.taxRate) / 100;
                  });
                  const grandTotal = subtotal + tax;

                  return (
                    <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-200 text-xs flex justify-between items-center font-mono">
                      <div>
                        <span className="text-slate-600 block">Subtotal: ₹{subtotal.toLocaleString('en-IN')}</span>
                        <span className="text-slate-600 block">GST: ₹{tax.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-sky-800 uppercase font-bold block">Grand Total</span>
                        <span className="text-base font-bold text-industrial-dark">₹{grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvoice}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmittingInvoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                    Generate Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Drawer: Enquiry Dossier Drawer */}
        <AdminEnquiryDossierDrawer
          enquiry={selectedDossierEnquiry}
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
        />
      </div>
    </>
  );
};

export default StaffWorkspace;
