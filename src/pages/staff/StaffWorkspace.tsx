import React, { useState, useEffect, useCallback } from 'react';
import { Card, Chip, Button, Modal, Input, TextArea, Select, ListBox, Label, Checkbox } from '@heroui/react';
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
        title="Staff Workspace | Akira Precision Automation"
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
                  <Chip size="sm" color="success" variant="soft" className="font-mono text-[10px] uppercase font-bold">
                    Staff Portal
                  </Chip>
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
              <Button
                variant="ghost"
                size="sm"
                onPress={handleSignOut}
                onClick={handleSignOut}
                className="gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Banner: ERP Attendance Widget (Hidden for Admin, active for field & sales staff) */}
          {profile?.role !== 'admin' ? (
            <Card className="p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                        <Chip size="sm" color="default" variant="soft" className="font-bold uppercase text-[10px]">
                          Clocked Out
                        </Chip>
                      ) : todayAttendance.status === 'on_field' ? (
                        <Chip size="sm" color="warning" variant="soft" className="font-bold uppercase text-[10px]">
                          On Field
                        </Chip>
                      ) : (
                        <Chip size="sm" color="success" variant="soft" className="font-bold uppercase text-[10px]">
                          Present
                        </Chip>
                      )
                    ) : (
                      <Chip size="sm" color="danger" variant="soft" className="font-bold uppercase text-[10px]">
                        Not Clocked In
                      </Chip>
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
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleClockIn('present')}
                      onClick={() => handleClockIn('present')}
                      isDisabled={isClocking}
                      className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isClocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Clock In (Office)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleClockIn('on_field')}
                      onClick={() => handleClockIn('on_field')}
                      isDisabled={isClocking}
                      className="gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Clock In (Field)
                    </Button>
                  </>
                )}

                {todayAttendance && !todayAttendance.clock_out_at && (
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={handleClockOut}
                    onClick={handleClockOut}
                    isDisabled={isClocking}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    {isClocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                    Clock Out
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-100/80 p-3.5 border border-slate-200 flex flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Chip size="sm" color="accent" variant="soft" className="font-mono uppercase text-[10px] font-bold">
                  Administrator
                </Chip>
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
            </Card>
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
              <Button
                variant="outline"
                size="sm"
                onPress={() => loadStaffData()}
                onClick={() => loadStaffData()}
                className="gap-1.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowVisitModal(true)}
                onClick={() => setShowVisitModal(true)}
                className="gap-1.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Schedule Visit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowInvoiceModal(true)}
                onClick={() => setShowInvoiceModal(true)}
                className="gap-1.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Invoice</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={() => setShowCreateModal(true)}
                onClick={() => setShowCreateModal(true)}
                className="gap-1.5 text-xs font-semibold bg-industrial-blue hover:bg-sky-700 shadow-xs text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Follow-up</span>
              </Button>
            </div>
          </div>

          {/* Operational Counts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <Card className="p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <Inbox className="w-3.5 h-3.5 text-sky-600" />
                <span>New RFQs</span>
              </div>
              <p className="text-xl font-bold font-mono text-industrial-dark mt-1">
                {stats.myNewEnquiries}
              </p>
            </Card>

            <Card className="p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-700 text-[11px] font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Due Today</span>
              </div>
              <p className="text-xl font-bold font-mono text-blue-700 mt-1">
                {stats.dueToday}
              </p>
            </Card>

            <Card className={`p-3.5 border shadow-xs ${
              stats.overdue > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Overdue</span>
              </div>
              <p className="text-xl font-bold font-mono text-rose-700 mt-1">
                {stats.overdue}
              </p>
            </Card>

            <Card className="p-3.5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Site Visits</span>
              </div>
              <p className="text-xl font-bold font-mono text-industrial-dark mt-1">
                {visitTotal}
              </p>
            </Card>

            <Card className="p-3.5 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Invoices</span>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {invoiceTotal}
              </p>
            </Card>
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
                    <Button
                      key={tf}
                      size="sm"
                      variant={isActive ? 'primary' : 'outline'}
                      onPress={() => setTimeframe(tf)}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isActive
                          ? 'bg-industrial-dark text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              {isLoadingFollowups ? (
                <Card className="p-8 text-center border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading follow-ups...</p>
                </Card>
              ) : followups.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Tasks in this Timeframe</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You have no scheduled follow-ups matching this filter. Schedule a new touchpoint or review other tabs.
                  </p>
                </Card>
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
                      <Card
                        key={item.id}
                        className={`p-4 border shadow-xs hover:shadow-md transition-shadow space-y-3 ${
                          isOverdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Chip
                                size="sm"
                                variant="soft"
                                color={
                                  item.priority === 'urgent'
                                    ? 'danger'
                                    : item.priority === 'high'
                                    ? 'warning'
                                    : 'accent'
                                }
                                className="font-bold uppercase text-[10px]"
                              >
                                {priorityStyle.label}
                              </Chip>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => handleOpenDossier(item.enquiry_id)}
                            onClick={() => handleOpenDossier(item.enquiry_id)}
                            className="gap-1 text-slate-600 hover:text-industrial-blue font-semibold text-xs h-7 px-2"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>

                          {item.status !== 'completed' && item.status !== 'cancelled' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onPress={() => setCompletingTask(item)}
                              onClick={() => setCompletingTask(item)}
                              className="gap-1 text-xs font-semibold h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Complete Follow-up
                            </Button>
                          )}
                        </div>
                      </Card>
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
                <Card className="p-8 text-center border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading assigned inquiries...</p>
                </Card>
              ) : enquiries.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Assigned Inquiries</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You do not currently have any prospective inquiries delegated to your account.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {enquiries.map(enq => (
                    <Card
                      key={enq.id}
                      className="p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
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
                        </div>                        <div className="text-right">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              enq.status === 'converted'
                                ? 'success'
                                : enq.status === 'closed'
                                ? 'default'
                                : 'accent'
                            }
                            className="font-bold uppercase text-[10px]"
                          >
                            {enq.status.replace('_', ' ')}
                          </Chip>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => {
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
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                            aria-label="Schedule Follow-up"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Follow-up</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => {
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
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            aria-label="Schedule Customer Site Visit"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Visit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => {
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
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            aria-label="Create Quotation"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Quote</span>
                          </Button>

                          {enq.status !== 'converted' && enq.status !== 'closed' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onPress={() => {
                                  setConvertingEnquiry(enq);
                                  setDealForm({
                                    dealTitle: `${enq.company || enq.name} - ${enq.specific_product || 'Gauging Requirement'}`,
                                    dealValue: '',
                                    expectedCloseDate: '',
                                    notes: '',
                                  });
                                }}
                                onClick={() => {
                                  setConvertingEnquiry(enq);
                                  setDealForm({
                                    dealTitle: `${enq.company || enq.name} - ${enq.specific_product || 'Gauging Requirement'}`,
                                    dealValue: '',
                                    expectedCloseDate: '',
                                    notes: '',
                                  });
                                }}
                                className="gap-1 px-2.5 h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <TrendingUp className="w-3 h-3" />
                                Convert to Deal
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onPress={() => {
                                  setClosingEnquiry(enq);
                                  setLostReason(LOST_REASONS[0]);
                                  setLostNotes('');
                                }}
                                onClick={() => {
                                  setClosingEnquiry(enq);
                                  setLostReason(LOST_REASONS[0]);
                                  setLostNotes('');
                                }}
                                className="gap-1 px-2.5 h-7 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                              >
                                <XCircle className="w-3 h-3" />
                                Close Lead
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            onPress={() => handleOpenDossier(enq.id)}
                            onClick={() => handleOpenDossier(enq.id)}
                            className="gap-1 px-3 h-7 text-xs font-semibold bg-industrial-dark text-white hover:bg-slate-800"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
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
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => setShowVisitModal(true)}
                  onClick={() => setShowVisitModal(true)}
                  className="gap-1 text-xs font-semibold bg-industrial-blue hover:bg-sky-700 shadow-xs text-white"
                >
                  <Plus className="w-3 h-3" />
                  Schedule Visit
                </Button>
              </div>

              {visits.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Field Visits Scheduled</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Schedule customer on-site visits to record GPS check-in/out and inspection evidence.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visits.map((vis) => (
                    <Card
                      key={vis.id}
                      className="p-4 border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              vis.status === 'completed'
                                ? 'success'
                                : vis.status === 'in_progress'
                                ? 'warning'
                                : 'accent'
                            }
                            className="font-bold uppercase text-[10px]"
                          >
                            {(vis.status || '').replace('_', ' ')}
                          </Chip>
                          <h4 className="text-sm font-bold text-industrial-dark font-heading mt-1">
                            {vis.title}
                          </h4>
                          <p className="text-xs text-slate-500 capitalize">
                            Purpose: {(vis.visit_purpose || (vis as any).purpose || 'General').replace('_', ' ')}
                          </p>
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
                          <Button
                            size="sm"
                            variant="primary"
                            onPress={() => handleCheckInVisit(vis.id)}
                            onClick={() => handleCheckInVisit(vis.id)}
                            className="gap-1 px-3 h-7 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <Navigation className="w-3 h-3" />
                            Check In (GPS)
                          </Button>
                        )}

                        {vis.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onPress={() => setCompletingVisit(vis)}
                            onClick={() => setCompletingVisit(vis)}
                            className="gap-1 px-3 h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Complete Visit
                          </Button>
                        )}
                      </div>
                    </Card>
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
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => setShowInvoiceModal(true)}
                  onClick={() => setShowInvoiceModal(true)}
                  className="gap-1 text-xs font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-3 h-3" />
                  New Quotation / Invoice
                </Button>
              </div>

              {invoices.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">No Invoices or Quotations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Create formal quotations or proforma invoices with tax calculations for your assigned leads.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <Card
                      key={inv.id}
                      className="p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-industrial-dark">
                              {inv.invoice_number}
                            </span>
                            <Chip size="sm" variant="soft" color="default" className="font-bold uppercase text-[10px]">
                              {inv.type}
                            </Chip>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {inv.customer_name} {inv.customer_company ? `(${inv.customer_company})` : ''}
                          </p>
                        </div>

                        <div className="text-right">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              inv.status === 'paid'
                                ? 'success'
                                : inv.status === 'sent'
                                ? 'accent'
                                : 'default'
                            }
                            className="font-bold uppercase text-[10px]"
                          >
                            {inv.status}
                          </Chip>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => handleSendInvoice(inv.id)}
                            onClick={() => handleSendInvoice(inv.id)}
                            isDisabled={sendingInvoiceId === inv.id}
                            className="gap-1 px-3 h-7 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                          >
                            {sendingInvoiceId === inv.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Send to Customer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modal 1: Complete Follow-up Modal */}
        {completingTask && (
          <Modal.Backdrop isOpen={!!completingTask} onOpenChange={(open) => { if (!open) setCompletingTask(null); }}>
            <Modal.Container>
              <Card className="shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Complete CRM Follow-up
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Customer: {completingTask.enquiry?.name} ({completingTask.enquiry?.company})
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setCompletingTask(null)}
                  onClick={() => setCompletingTask(null)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {completeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{completeError}</span>
                </div>
              )}

              <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Customer Outcome & Technical Notes <span className="text-rose-500">*</span>
                  </Label>
                  <TextArea
                    required
                    rows={3}
                    value={outcomeNotes}
                    onChange={e => setOutcomeNotes(e.target.value)}
                    placeholder="e.g. Discussed air plug gauge tolerances. Customer requested formal quotation by Friday."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <Checkbox
                    isSelected={scheduleNext}
                    onChange={(isSelected) => setScheduleNext(isSelected)}
                    className="font-semibold text-slate-700 text-xs"
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <span>Schedule successive touchpoint</span>
                    </Checkbox.Content>
                  </Checkbox>

                  {scheduleNext && (
                    <div>
                      <Label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Next Touchpoint Date & Time
                      </Label>
                      <Input
                        type="datetime-local"
                        required={scheduleNext}
                        value={nextDate}
                        onChange={e => setNextDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setCompletingTask(null)}
                    onClick={() => setCompletingTask(null)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingComplete}
                    className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmittingComplete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm Complete
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
        )}

        {/* Modal 2: Schedule Follow-up Modal */}
        <Modal.Backdrop isOpen={showCreateModal} onOpenChange={setShowCreateModal}>
          <Modal.Container>
            <Card className="shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Schedule New Follow-up
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setShowCreateModal(false)}
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Select Client Inquiry <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={createForm.enquiryId}
                    onChange={val => setCreateForm({ ...createForm, enquiryId: (val as string) || '' })}
                    className="w-full"
                    aria-label="Select Client Inquiry"
                    placeholder="-- Choose Assigned Client --"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px] max-h-60 overflow-y-auto">
                      <ListBox className="outline-none space-y-0.5">
                        {enquiries.map(e => {
                          const label = `${e.name} ${e.company ? `(${e.company})` : ''} - ${e.specific_product || e.product_category || 'Inquiry'}`;
                          return (
                            <ListBox.Item
                              key={e.id}
                              id={e.id}
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

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Task Title</Label>
                  <Input
                    type="text"
                    value={createForm.title}
                    onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="e.g. Call client regarding quotation feedback"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">Type</Label>
                    <Select
                      value={createForm.type}
                      onChange={val => setCreateForm({ ...createForm, type: (val as FollowupType) || 'call' })}
                      className="w-full"
                      aria-label="Type"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                        <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                        <ListBox className="outline-none space-y-0.5">
                          {[
                            { id: 'call', label: 'Call' },
                            { id: 'email', label: 'Email' },
                            { id: 'meeting', label: 'Meeting' },
                            { id: 'demo', label: 'Demo' },
                            { id: 'quotation', label: 'Quotation' },
                            { id: 'other', label: 'Other' },
                          ].map(t => (
                            <ListBox.Item
                              key={t.id}
                              id={t.id}
                              textValue={t.label}
                              className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                            >
                              {t.label}
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
                      value={createForm.priority}
                      onChange={val => setCreateForm({ ...createForm, priority: (val as FollowupPriority) || 'medium' })}
                      className="w-full"
                      aria-label="Priority"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                        <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                        <ListBox className="outline-none space-y-0.5">
                          {[
                            { id: 'low', label: 'Low' },
                            { id: 'medium', label: 'Medium' },
                            { id: 'high', label: 'High' },
                            { id: 'urgent', label: 'Urgent' },
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
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Scheduled Date & Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    required
                    value={createForm.scheduledAt}
                    onChange={e => setCreateForm({ ...createForm, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Internal Notes</Label>
                  <TextArea
                    rows={2}
                    value={createForm.notes}
                    onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Specific points to discuss or client requests..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowCreateModal(false)}
                    onClick={() => setShowCreateModal(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingCreate}
                    className="gap-1.5 bg-industrial-blue hover:bg-sky-700 text-white font-semibold"
                  >
                    {isSubmittingCreate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Create Task
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Modal 3: Convert Lead to Deal */}
        {convertingEnquiry && (
          <Modal.Backdrop isOpen={!!convertingEnquiry} onOpenChange={(open) => { if (!open) setConvertingEnquiry(null); }}>
            <Modal.Container>
              <Card className="shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Convert Lead to Deal / Opportunity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Client: {convertingEnquiry.name} ({convertingEnquiry.company || 'N/A'})
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setConvertingEnquiry(null)}
                  onClick={() => setConvertingEnquiry(null)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {conversionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{conversionError}</span>
                </div>
              )}

              <form onSubmit={handleConvertSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                    Deal Title / Order Description <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={dealForm.dealTitle}
                    onChange={e => setDealForm({ ...dealForm, dealTitle: e.target.value })}
                    placeholder="e.g. 5x Custom Air Ring Gauges Ø30mm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">Estimated Value (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={dealForm.dealValue}
                      onChange={e => setDealForm({ ...dealForm, dealValue: e.target.value })}
                      placeholder="e.g. 75000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">Target Close Date</Label>
                    <Input
                      type="date"
                      value={dealForm.expectedCloseDate}
                      onChange={e => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1 text-xs">Conversion Notes</Label>
                  <TextArea
                    rows={2}
                    value={dealForm.notes}
                    onChange={e => setDealForm({ ...dealForm, notes: e.target.value })}
                    placeholder="Client agreed on technical parameters and formal proposal..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setConvertingEnquiry(null)}
                    onClick={() => setConvertingEnquiry(null)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingConversion}
                    className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmittingConversion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    Confirm Deal Conversion
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
        )}

        {/* Modal 4: Close Lead (Lost Reason) */}
        {closingEnquiry && (
          <Modal.Backdrop isOpen={!!closingEnquiry} onOpenChange={(open) => { if (!open) setClosingEnquiry(null); }}>
            <Modal.Container>
              <Card className="shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Close Lead (Lost Opportunity)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Client: {closingEnquiry.name} ({closingEnquiry.company || 'N/A'})
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setClosingEnquiry(null)}
                  onClick={() => setClosingEnquiry(null)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {closureError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{closureError}</span>
                </div>
              )}

              <form onSubmit={handleCloseSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Primary Reason for Closing <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={lostReason}
                    onChange={(val) => setLostReason((val as string) || '')}
                    className="w-full"
                    aria-label="Primary Reason for Closing"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[240px]">
                      <ListBox className="outline-none space-y-0.5">
                        {LOST_REASONS.map((r) => (
                          <ListBox.Item
                            key={r}
                            id={r}
                            textValue={r}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {r}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">Detailed Explanation</Label>
                  <TextArea
                    rows={3}
                    value={lostNotes}
                    onChange={e => setLostNotes(e.target.value)}
                    placeholder="Provide context on why the client opted not to proceed..."
                    className="w-full text-xs font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setClosingEnquiry(null)}
                    onClick={() => setClosingEnquiry(null)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isDisabled={isSubmittingClosure}
                    className="gap-1.5 bg-slate-800 text-white font-semibold hover:bg-slate-900"
                  >
                    {isSubmittingClosure ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Confirm Closure
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
        )}

        {/* Modal 5: Schedule Field Visit */}
        <Modal.Backdrop isOpen={showVisitModal} onOpenChange={setShowVisitModal}>
          <Modal.Container>
            <Card className="shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Schedule Client Site Visit
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setShowVisitModal(false)}
                  onClick={() => setShowVisitModal(false)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {visitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{visitError}</span>
                </div>
              )}

              <form onSubmit={handleCreateVisitSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Select Client Inquiry <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={visitForm.enquiryId}
                    onChange={(val) => setVisitForm({ ...visitForm, enquiryId: (val as string) || '' })}
                    className="w-full"
                    aria-label="Select Client Inquiry"
                    placeholder="-- Choose Client --"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                      <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px] max-h-60 overflow-y-auto">
                      <ListBox className="outline-none space-y-0.5">
                        {enquiries.map((e) => (
                          <ListBox.Item
                            key={e.id}
                            id={e.id}
                            textValue={`${e.name} ${e.company ? `(${e.company})` : ''} - ${e.specific_product || e.product_category || 'Inquiry'}`}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            <span className="font-semibold text-slate-800">{e.name}</span>
                            {e.company && <span className="text-slate-500 font-normal"> ({e.company})</span>}
                            <span className="text-slate-400"> - {e.specific_product || e.product_category || 'Inquiry'}</span>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">Visit Title</Label>
                  <Input
                    type="text"
                    value={visitForm.title}
                    onChange={e => setVisitForm({ ...visitForm, title: e.target.value })}
                    placeholder="e.g. On-site Calibration & Dimension Verification"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">Purpose</Label>
                    <Select
                      value={visitForm.visitPurpose}
                      onChange={(val) => setVisitForm({ ...visitForm, visitPurpose: (val as VisitPurpose) || 'consultation' })}
                      className="w-full"
                      aria-label="Visit Purpose"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                        <Select.Value className="text-xs font-medium text-slate-700 capitalize truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[160px]">
                        <ListBox className="outline-none space-y-0.5">
                          {[
                            { id: 'consultation', label: 'Consultation' },
                            { id: 'demo', label: 'Demo' },
                            { id: 'site_inspection', label: 'Site Inspection' },
                            { id: 'installation', label: 'Installation' },
                            { id: 'troubleshooting', label: 'Troubleshooting' },
                            { id: 'other', label: 'Other' },
                          ].map((item) => (
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
                    <Label className="block font-semibold text-slate-700 mb-1">Contact Person</Label>
                    <Input
                      type="text"
                      value={visitForm.customerContactPerson}
                      onChange={e => setVisitForm({ ...visitForm, customerContactPerson: e.target.value })}
                      placeholder="e.g. Quality Manager"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Date & Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    required
                    value={visitForm.scheduledAt}
                    onChange={e => setVisitForm({ ...visitForm, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">Visit Agenda / Notes</Label>
                  <TextArea
                    rows={2}
                    value={visitForm.notes}
                    onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                    placeholder="Inspect workpiece fixture, verify air line pressure..."
                    className="w-full text-xs font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowVisitModal(false)}
                    onClick={() => setShowVisitModal(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingVisit}
                    className="gap-1.5 bg-industrial-blue text-white font-semibold hover:bg-sky-700"
                  >
                    {isSubmittingVisit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                    Confirm Visit
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Modal 6: Complete Field Visit */}
        {completingVisit && (
          <Modal.Backdrop isOpen={!!completingVisit} onOpenChange={(open) => { if (!open) setCompletingVisit(null); }}>
            <Modal.Container>
              <Card className="shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-industrial-dark font-heading">
                    Check Out & Complete Field Visit
                  </h3>
                  <p className="text-[11px] text-slate-500">{completingVisit.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setCompletingVisit(null)}
                  onClick={() => setCompletingVisit(null)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {visitCompleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{visitCompleteError}</span>
                </div>
              )}

              <form onSubmit={handleCompleteVisitSubmit} className="space-y-3.5 text-xs">
                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Visit Outcome & Findings <span className="text-rose-500">*</span>
                  </Label>
                  <TextArea
                    required
                    rows={3}
                    value={visitOutcomeNotes}
                    onChange={e => setVisitOutcomeNotes(e.target.value)}
                    placeholder="Documented component dimensions. Customer agreed to standard 2-jet air ring gauge."
                    className="w-full text-xs font-sans"
                  />
                </div>

                <div>
                  <Label className="block font-semibold text-slate-700 mb-1">
                    Inspection Photo / Proof URL
                  </Label>
                  <Input
                    type="url"
                    value={visitPhotoUrl}
                    onChange={e => setVisitPhotoUrl(e.target.value)}
                    placeholder="https://... (photo of setup or job card)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setCompletingVisit(null)}
                    onClick={() => setCompletingVisit(null)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingVisitComplete}
                    className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmittingVisitComplete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm Check-out
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
        )}

        {/* Modal 7: Create Invoice / Quotation */}
        <Modal.Backdrop isOpen={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <Modal.Container size="lg">
            <Card className="shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Create Formal Quotation / Tax Invoice
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setShowInvoiceModal(false)}
                  onClick={() => setShowInvoiceModal(false)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
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
                    <Label className="block font-semibold text-slate-700 mb-1">Document Type</Label>
                    <Select
                      value={invoiceForm.type}
                      onChange={(val) => setInvoiceForm({ ...invoiceForm, type: (val as InvoiceType) || 'quotation' })}
                      className="w-full"
                      aria-label="Document Type"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                        <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[160px]">
                        <ListBox className="outline-none space-y-0.5">
                          {[
                            { id: 'quotation', label: 'Formal Quotation' },
                            { id: 'proforma', label: 'Proforma Invoice' },
                            { id: 'tax_invoice', label: 'Tax Invoice' },
                          ].map((t) => (
                            <ListBox.Item
                              key={t.id}
                              id={t.id}
                              textValue={t.label}
                              className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                            >
                              {t.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">Link to Inquiry</Label>
                    <Select
                      value={invoiceForm.enquiryId}
                      onChange={(val) => {
                        const selectedId = (val as string) || '';
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
                      className="w-full"
                      aria-label="Link to Inquiry"
                      placeholder="-- Standalone (No Inquiry) --"
                    >
                      <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                        <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                        <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                      </Select.Trigger>
                      <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px] max-h-60 overflow-y-auto">
                        <ListBox className="outline-none space-y-0.5">
                          <ListBox.Item
                            id=""
                            textValue="-- Standalone (No Inquiry) --"
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-500 italic hover:bg-slate-100 hover:text-slate-900 cursor-pointer outline-none"
                          >
                            -- Standalone (No Inquiry) --
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          {enquiries.map((e) => (
                            <ListBox.Item
                              key={e.id}
                              id={e.id}
                              textValue={`${e.name} (${e.company || 'Client'})`}
                              className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                            >
                              <span className="font-semibold text-slate-800">{e.name}</span>
                              <span className="text-slate-500"> ({e.company || 'Client'})</span>
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>

                {/* Customer Auto-fill / Search Bar */}
                <div className="relative p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-sky-600" />
                      <span>Search Customer Database (Auto-fill)</span>
                    </Label>
                    {(invoiceForm.customerName || invoiceForm.customerEmail) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => {
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
                        className="h-5 px-1 text-[10px] text-sky-700 hover:underline font-semibold"
                      >
                        + New Customer (Clear)
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Type name, company, or email to search past records..."
                      value={customerSearchQuery}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      onFocus={() => {
                        if (customerSuggestions.length > 0) setShowCustomerDropdown(true);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-xs font-sans"
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
                    <Label className="block font-semibold text-slate-700 mb-1">
                      Customer Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      required
                      value={invoiceForm.customerName}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">Company / Organization</Label>
                    <Input
                      type="text"
                      value={invoiceForm.customerCompany}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerCompany: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">
                      Customer Email <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      required
                      value={invoiceForm.customerEmail}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">Customer Phone</Label>
                    <Input
                      type="text"
                      value={invoiceForm.customerPhone}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">Billing Address</Label>
                    <Input
                      type="text"
                      placeholder="Plot No, Industrial Estate, City..."
                      value={invoiceForm.customerAddress}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1">GSTIN Number</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      value={invoiceForm.customerGst}
                      onChange={e => setInvoiceForm({ ...invoiceForm, customerGst: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700">Line Items</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => setInvoiceForm({
                        ...invoiceForm,
                        items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 18 }],
                      })}
                      onClick={() => setInvoiceForm({
                        ...invoiceForm,
                        items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 18 }],
                      })}
                      className="h-7 text-xs font-semibold text-sky-700 hover:text-sky-800 gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </Button>
                  </div>

                  {invoiceForm.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Select Product from Catalogue
                          </Label>
                          {invoiceForm.items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              isIconOnly
                              onPress={() => {
                                const newItems = invoiceForm.items.filter((_, i) => i !== idx);
                                setInvoiceForm({ ...invoiceForm, items: newItems });
                              }}
                              onClick={() => {
                                const newItems = invoiceForm.items.filter((_, i) => i !== idx);
                                setInvoiceForm({ ...invoiceForm, items: newItems });
                              }}
                              aria-label="Remove item"
                              className="h-7 w-7 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                        <Select
                          value={item.productId || ''}
                          onChange={(val) => {
                            const pId = (val as string) || '';
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
                          className="w-full"
                          aria-label="Select Product from Catalogue"
                          placeholder="-- Custom / Service Line Item --"
                        >
                          <Select.Trigger className="w-full h-8 px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                            <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                            <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                          </Select.Trigger>
                          <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[280px] max-h-60 overflow-y-auto">
                            <ListBox className="outline-none space-y-0.5">
                              <ListBox.Item
                                id=""
                                textValue="-- Custom / Service Line Item --"
                                className="px-2.5 py-1.5 text-xs rounded-lg text-slate-500 italic hover:bg-slate-100 hover:text-slate-900 cursor-pointer outline-none"
                              >
                                -- Custom / Service Line Item --
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              {productCatalog.map((prod) => (
                                <ListBox.Item
                                  key={prod.id}
                                  id={prod.id}
                                  textValue={`${prod.title} (${prod.category})`}
                                  className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                                >
                                  <span className="font-semibold text-slate-800">{prod.title}</span>
                                  <span className="text-slate-400 text-[11px]"> ({prod.category})</span>
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-[10px] text-slate-500 block mb-0.5">Item Description / Specifications</Label>
                        <Input
                          type="text"
                          required
                          placeholder="Item Description (e.g. Air Electronic Column Gauge Model AEC-100)"
                          value={item.description}
                          onChange={e => {
                            const newItems = [...invoiceForm.items];
                            newItems[idx].description = e.target.value;
                            setInvoiceForm({ ...invoiceForm, items: newItems });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-xs font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <Label className="text-[10px] text-slate-500 block">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx].quantity = parseInt(e.target.value) || 1;
                              setInvoiceForm({ ...invoiceForm, items: newItems });
                            }}
                            className="w-full px-2 py-1 rounded-xl border border-slate-300 font-mono bg-white text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-500 block">Unit Price (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                              setInvoiceForm({ ...invoiceForm, items: newItems });
                            }}
                            className="w-full px-2 py-1 rounded-xl border border-slate-300 font-mono bg-white text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-slate-500 block">GST Rate (%)</Label>
                          <Select
                            value={String(item.taxRate)}
                            onChange={(val) => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx].taxRate = parseFloat(val as string) || 0;
                              setInvoiceForm({ ...invoiceForm, items: newItems });
                            }}
                            className="w-full"
                            aria-label="GST Rate"
                          >
                            <Select.Trigger className="w-full h-8 px-2 py-1 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 flex items-center justify-between shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer">
                              <Select.Value className="text-xs font-medium text-slate-700 truncate" />
                              <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                            </Select.Trigger>
                            <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[140px]">
                              <ListBox className="outline-none space-y-0.5">
                                {[
                                  { id: '18', label: '18% (Metrology Standard)' },
                                  { id: '12', label: '12%' },
                                  { id: '5', label: '5%' },
                                  { id: '0', label: '0% (Exempt)' },
                                ].map((rate) => (
                                  <ListBox.Item
                                    key={rate.id}
                                    id={rate.id}
                                    textValue={rate.label}
                                    className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                                  >
                                    {rate.label}
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowInvoiceModal(false)}
                    onClick={() => setShowInvoiceModal(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isDisabled={isSubmittingInvoice}
                    className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmittingInvoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                    Generate Document
                  </Button>
                </div>
              </form>
            </Card>
          </Modal.Container>
        </Modal.Backdrop>
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
