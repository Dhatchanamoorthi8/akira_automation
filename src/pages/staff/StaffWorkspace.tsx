import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Chip,
  Button,
  Modal,
  Input,
  TextArea,
  Select,
  ListBox,
  Label,
  Checkbox,
  Surface,
  TextField,
  DatePicker,
  DateField,
  Calendar,
  TimeField,
  ComboBox,
  Form,
  FieldError,
  Description,
  Spinner,
  AlertDialog,
  Alert,
} from "@heroui/react";
import { ComboBoxStateContext } from "react-aria-components";
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone } from "@internationalized/date";
import { Link, useNavigate } from "react-router-dom";
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
  Eye,
  Edit3,
  Download,
  UserPlus,
} from "lucide-react";
import { InvoicePdfViewerModal } from "../../components/invoices/InvoicePdfViewerModal";
import { useAuth } from "../../auth/useAuth";
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
} from "../../types/database";
import { followupService } from "../../services/followupService";
import { enquiryService } from "../../services/enquiryService";
import { attendanceService } from "../../services/attendanceService";
import { visitService } from "../../services/visitService";
import {
  invoiceService,
  CustomerSearchResult,
} from "../../services/invoiceService";
import { productService } from "../../services/productService";
import { Product } from "../../types";
import { formatDate } from "../../utils/date";
import { SEOHead } from "../../components/layout/SEOHead";
import { company } from "../../config/company";
import { AdminEnquiryDossierDrawer } from "../../components/admin/AdminEnquiryDossierDrawer";
import { productCategories } from "../../data/productSummaries";
import { industries } from "../../data/industries";

const PRIORITY_STYLES: Record<
  FollowupPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: {
    label: "URGENT",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  high: {
    label: "HIGH",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  medium: {
    label: "MEDIUM",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  low: {
    label: "LOW",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

const LOST_REASONS = [
  "Price / Budget Constraint",
  "Competitor Selected",
  "Requirements Mismatch / Out of Scope",
  "Customer Postponed / Cancelled Project",
  "Customer Unresponsive",
  "Other",
];

const ComboBoxSearchInput: React.FC<React.ComponentProps<typeof Input>> = (props) => {
  const state = React.useContext(ComboBoxStateContext);
  return (
    <Input
      {...props}
      onClick={(e) => {
        state?.open(null, "manual");
        props.onClick?.(e);
      }}
    />
  );
};

export const StaffWorkspace: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "followups" | "enquiries" | "visits" | "invoices"
  >("followups");
  const [timeframe, setTimeframe] = useState<FollowupTimeframe>("today");

  // Attendance state
  const [todayAttendance, setTodayAttendance] =
    useState<StaffAttendance | null>(null);
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
  const [completingTask, setCompletingTask] =
    useState<FollowupWithEnquiry | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Create Follow-up Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    enquiryId: "",
    title: "",
    scheduledAt: "",
    type: "call" as FollowupType,
    priority: "medium" as FollowupPriority,
    notes: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Lead Conversion Modal State
  const [convertingEnquiry, setConvertingEnquiry] =
    useState<EnquiryWithDetails | null>(null);
  const [dealForm, setDealForm] = useState({
    dealTitle: "",
    dealValue: "",
    expectedCloseDate: "",
    notes: "",
  });
  const [isSubmittingConversion, setIsSubmittingConversion] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Lead Closure Modal State
  const [closingEnquiry, setClosingEnquiry] =
    useState<EnquiryWithDetails | null>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [lostNotes, setLostNotes] = useState("");
  const [isSubmittingClosure, setIsSubmittingClosure] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);

  // Dossier Drawer State
  const [selectedDossierEnquiry, setSelectedDossierEnquiry] =
    useState<EnquiryWithDetails | null>(null);
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

  // Add Offline Customer / Lead Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    source: "offline_walkin",
    industry: "",
    productCategory: "",
    specificProduct: "",
    notes: "",
    scheduleFollowup: true,
    followupDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    followupType: "call" as FollowupType,
    followupPriority: "medium" as FollowupPriority,
  });
  const [leadFollowupDateValue, setLeadFollowupDateValue] =
    useState<DateValue | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const resetLeadModal = () => {
    setLeadForm({
      name: "",
      companyName: "",
      phone: "",
      email: "",
      source: "offline_walkin",
      industry: "",
      productCategory: "",
      specificProduct: "",
      notes: "",
      scheduleFollowup: true,
      followupDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      followupType: "call" as FollowupType,
      followupPriority: "medium" as FollowupPriority,
    });
    setLeadFollowupDateValue(null);
    setLeadError(null);
    setShowAddLeadModal(false);
  };

  // Schedule Visit Modal State
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDateValue, setVisitDateValue] = useState<DateValue | null>(null);
  const [visitForm, setVisitForm] = useState({
    enquiryId: "",
    title: "",
    visitPurpose: "consultation" as VisitPurpose,
    scheduledAt: "",
    customerContactPerson: "",
    notes: "",
  });
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  // Complete Visit Modal State
  const [completingVisit, setCompletingVisit] = useState<FieldVisit | null>(
    null,
  );
  const [visitOutcomeNotes, setVisitOutcomeNotes] = useState("");
  const [visitPhotoUrl, setVisitPhotoUrl] = useState("");
  const [isSubmittingVisitComplete, setIsSubmittingVisitComplete] =
    useState(false);
  const [visitCompleteError, setVisitCompleteError] = useState<string | null>(
    null,
  );

  // Create Invoice / Quotation Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [productCatalog, setProductCatalog] = useState<Product[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<
    CustomerSearchResult[]
  >([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
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
    enquiryId: "",
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerGst: "",
    type: "quotation",
    items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }],
  });
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [invoiceErrorMsg, setInvoiceErrorMsg] = useState<string | null>(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [viewingPdfInvoice, setViewingPdfInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // HeroUI Confirmation Dialog State
  const [deleteConfirmInvoice, setDeleteConfirmInvoice] = useState<{
    id: string;
    invoiceNumber: string;
    customerName?: string;
  } | null>(null);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);

  const [sendConfirmInvoice, setSendConfirmInvoice] = useState<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
  } | null>(null);

  // HeroUI Action Feedback state (replaces browser alert())
  const [actionFeedback, setActionFeedback] = useState<{
    status: "success" | "danger" | "accent";
    title: string;
    message: string;
  } | null>(null);

  // Auto-dismiss feedback message after 5 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => {
        setActionFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const resetInvoiceForm = () => {
    setEditingInvoice(null);
    setInvoiceErrorMsg(null);
    setCustomerSearchQuery("");
    setCustomerSuggestions([]);
    setInvoiceForm({
      enquiryId: "",
      customerName: "",
      customerCompany: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      customerGst: "",
      type: "quotation",
      items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }],
    });
  };

  const handleStartEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceForm({
      enquiryId: inv.enquiry_id || "",
      customerName: inv.customer_name,
      customerCompany: inv.customer_company || "",
      customerEmail: inv.customer_email,
      customerPhone: inv.customer_phone || "",
      customerAddress: inv.customer_address || "",
      customerGst: inv.customer_gst || "",
      type: inv.type,
      items:
        inv.items && inv.items.length > 0
          ? inv.items.map((it) => ({
              productId: it.product_id || undefined,
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unit_price,
              taxRate: it.tax_rate,
            }))
          : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }],
    });
    setCustomerSearchQuery(inv.customer_name);
    setInvoiceErrorMsg(null);
    setShowInvoiceModal(true);
  };

  // Load product catalog for invoice generation
  useEffect(() => {
    productService
      .getProducts()
      .then(setProductCatalog)
      .catch(() => {});
  }, []);

  // Customer search handler for invoice auto-fill
  const handleCustomerSearch = async (val: string) => {
    setCustomerSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearchingCustomers(true);
      const results = await invoiceService.searchCustomers(val.trim());
      setCustomerSuggestions(results);
      setIsSearchingCustomers(false);
    } else {
      setCustomerSuggestions([]);
    }
  };

  const handleSelectCustomer = (c: CustomerSearchResult) => {
    setInvoiceForm((prev) => ({
      ...prev,
      enquiryId: c.id || prev.enquiryId,
      customerName: c.name,
      customerCompany: c.company || "",
      customerEmail: c.email,
      customerPhone: c.phone || "",
      customerAddress: c.address || "",
      customerGst: c.gst || "",
    }));
    setCustomerSearchQuery("");
  };

  // Load staff data
  const loadStaffData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingFollowups(true);
    setIsLoadingEnquiries(true);

    try {
      // 1. Load attendance for today (exempt for administrators)
      if (profile?.role !== "admin") {
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
      const [dueTodayRes, overdueRes, upcomingRes, completedRes, statusCounts] =
        await Promise.all([
          followupService.getFollowups({
            assignedTo: user.id,
            timeframe: "today",
            limit: 1,
          }),
          followupService.getFollowups({
            assignedTo: user.id,
            timeframe: "overdue",
            limit: 1,
          }),
          followupService.getFollowups({
            assignedTo: user.id,
            timeframe: "upcoming",
            limit: 1,
          }),
          followupService.getFollowups({
            assignedTo: user.id,
            timeframe: "completed",
            limit: 1,
          }),
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
    navigate("/admin/login");
  };

  // Helper to obtain browser geolocation
  const getCurrentLocation = (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 8000, enableHighAccuracy: true },
      );
    });
  };

  // Attendance Clock-in
  const handleClockIn = async (status: "present" | "on_field" = "present") => {
    if (!user?.id || isClocking) return;
    setIsClocking(true);
    setAttendanceMsg(null);

    const coords = await getCurrentLocation();
    const res = await attendanceService.clockIn({
      staffId: user.id,
      status,
      coords,
      notes: coords
        ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
        : "Location not shared",
    });

    setIsClocking(false);
    if (res.error) {
      setAttendanceMsg(`Notice: ${res.error}`);
    } else {
      setTodayAttendance(res.attendance);
      setAttendanceMsg(
        `Clocked in as ${status === "on_field" ? "On Field" : "Present"} successfully.`,
      );
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
      setAttendanceMsg("Clocked out successfully for today.");
      setTimeout(() => setAttendanceMsg(null), 4000);
    }
  };

  // Check in to Field Visit
  const handleCheckInVisit = async (visitId: string) => {
    const coords = await getCurrentLocation();
    const res = await visitService.checkInVisit(
      visitId,
      coords || { lat: 12.9716, lng: 77.5946 },
    );
    if (res.success) {
      loadStaffData();
    } else {
      alert(`Check-in failed: ${res.error}`);
    }
  };

  // Cancel Scheduled Visit
  const handleCancelVisit = async (visitId: string) => {
    if (
      !window.confirm("Are you sure you want to cancel this scheduled visit?")
    )
      return;
    const res = await visitService.cancelVisit(
      visitId,
      "Cancelled by field engineer",
    );
    if (res.success) {
      loadStaffData();
    } else {
      alert(`Cancel visit failed: ${res.error}`);
    }
  };

  // Prompt Delete Quotation / Invoice with HeroUI Confirmation Dialog
  const promptDeleteInvoice = (inv: {
    id: string;
    invoice_number?: string;
    customer_name?: string;
  }) => {
    setDeleteConfirmInvoice({
      id: inv.id,
      invoiceNumber: inv.invoice_number || inv.id,
      customerName: inv.customer_name,
    });
  };

  const executeDeleteInvoice = async () => {
    if (!deleteConfirmInvoice) return;
    setIsDeletingInvoice(true);
    const invoiceId = deleteConfirmInvoice.id;
    const invNum = deleteConfirmInvoice.invoiceNumber;
    const res = await invoiceService.deleteInvoice(invoiceId);
    setIsDeletingInvoice(false);
    setDeleteConfirmInvoice(null);
    if (res.success) {
      if (viewingPdfInvoice?.id === invoiceId) {
        setViewingPdfInvoice(null);
      }
      await loadStaffData();
      setActionFeedback({
        status: "success",
        title: "Invoice Deleted",
        message: `Quotation / Invoice #${invNum} and all line items have been permanently deleted.`,
      });
    } else {
      setActionFeedback({
        status: "danger",
        title: "Delete Failed",
        message: res.error || "Unable to delete invoice. Please try again.",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber?: string) => {
    const inv = invoices.find((i) => i.id === invoiceId) || viewingPdfInvoice;
    promptDeleteInvoice({
      id: invoiceId,
      invoice_number: invoiceNumber || inv?.invoice_number,
      customer_name: inv?.customer_name,
    });
  };

  // Direct Download Invoice PDF (routes through high-fidelity preview viewer for 100% matching PDF)
  const handleDirectDownloadPdf = async (inv: Invoice) => {
    await handleViewInvoice(inv);
  };

  // View PDF Invoice (always guarantees complete fresh line items)
  const handleViewInvoice = async (inv: Invoice) => {
    setViewingPdfInvoice(inv);
    try {
      const fullRes = await invoiceService.getInvoiceById(inv.id);
      if (fullRes.invoice) {
        setViewingPdfInvoice(fullRes.invoice);
      }
    } catch (err) {
      console.error("Failed to load invoice items:", err);
    }
  };

  // Complete Field Visit Submit
  const handleCompleteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingVisit) return;

    if (!visitOutcomeNotes.trim()) {
      setVisitCompleteError(
        "Please record outcome notes from the customer visit.",
      );
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
      photos,
    );

    setIsSubmittingVisitComplete(false);
    if (res.error) {
      setVisitCompleteError(res.error);
    } else {
      setCompletingVisit(null);
      setVisitOutcomeNotes("");
      setVisitPhotoUrl("");
      loadStaffData();
    }
  };

  // Schedule Field Visit Submit
  const handleCreateVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledAtValue = (() => {
      if (visitDateValue) {
        try {
          const tz = getLocalTimeZone();
          return "toDate" in visitDateValue &&
            typeof (visitDateValue as any).toDate === "function"
            ? (visitDateValue as any).toDate(tz).toISOString()
            : new Date(visitDateValue.toString()).toISOString();
        } catch {
          return visitDateValue.toString();
        }
      }
      return visitForm.scheduledAt;
    })();

    if (!visitForm.enquiryId || !scheduledAtValue) {
      setVisitError("Inquiry selection and scheduled date/time are required.");
      return;
    }

    setIsSubmittingVisit(true);
    setVisitError(null);

    const res = await visitService.createVisit({
      enquiryId: visitForm.enquiryId,
      staffId: user!.id,
      title: visitForm.title.trim() || "Client Site Inspection & Demo",
      visitPurpose: visitForm.visitPurpose,
      scheduledAt: scheduledAtValue,
      customerContactPerson: visitForm.customerContactPerson.trim(),
      notes: visitForm.notes.trim(),
      createdBy: user?.id,
    });

    setIsSubmittingVisit(false);
    if (res.error) {
      setVisitError(res.error);
    } else {
      setShowVisitModal(false);
      setVisitDateValue(null);
      setVisitForm({
        enquiryId: "",
        title: "",
        visitPurpose: "consultation",
        scheduledAt: "",
        customerContactPerson: "",
        notes: "",
      });
      loadStaffData();
    }
  };

  // Add Offline Lead / Customer Submit Handler
  const handleCreateLead = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!leadForm.name.trim()) {
      setLeadError("Customer / Contact Name is required.");
      return;
    }
    if (!leadForm.phone.trim() && !leadForm.email.trim()) {
      setLeadError("Please provide at least a Phone Number or an Email Address.");
      return;
    }

    setIsSubmittingLead(true);
    setLeadError(null);

    try {
      // Auto-generate fallback email if offline customer only provided mobile/phone number
      const emailVal = leadForm.email.trim()
        ? leadForm.email.trim().toLowerCase()
        : `${(leadForm.phone.trim().replace(/[^0-9]/g, "") || "lead")}_${Date.now()}@offline.akira`;

      const sourceLabelMap: Record<string, string> = {
        offline_walkin: "Offline Walk-in / Facility Visit",
        phone_call: "Inbound Phone Call / WhatsApp",
        trade_expo: "Trade Show / Expo Exhibition",
        referral: "Client Referral",
        existing_client: "Existing Client Offline Re-order",
        other_offline: "Other Offline Source",
      };

      const messageVal = leadForm.notes.trim()
        ? leadForm.notes.trim()
        : `Offline lead registered by staff (${profile?.full_name || user?.email || "Staff"}). Source: ${sourceLabelMap[leadForm.source] || leadForm.source}. Product interest: ${leadForm.specificProduct || leadForm.productCategory || "General Metrology"}.`;

      const res = await enquiryService.createEnquiry({
        name: leadForm.name.trim(),
        companyName: leadForm.companyName.trim() || undefined,
        email: emailVal,
        phone: leadForm.phone.trim() || undefined,
        industry: leadForm.industry || undefined,
        productCategory: leadForm.productCategory || undefined,
        specificProduct: leadForm.specificProduct || undefined,
        message: messageVal,
        source: leadForm.source,
        assignedTo: user?.id,
        status: "new",
      });

      if (res.error || !res.enquiry) {
        console.error("Enquiry service returned error:", res.error);
        setLeadError(res.error || "Failed to create customer lead.");
        return;
      }

      // If staff chose to schedule an immediate follow-up task
      if (leadForm.scheduleFollowup && leadForm.followupDate) {
        try {
          await followupService.createFollowup({
            enquiryId: res.enquiry.id,
            title: `Follow up with ${res.enquiry.name}`,
            scheduledAt: `${leadForm.followupDate}T10:00:00`,
            type: leadForm.followupType,
            priority: leadForm.followupPriority,
            assignedTo: user?.id,
            createdBy: user?.id,
            notes: `Initial follow-up for offline lead: ${leadForm.notes || "Discuss gauging requirements"}`,
          });
        } catch (fErr) {
          console.warn("Followup auto-schedule error:", fErr);
        }
      }

      const savedCustomerName = leadForm.name;
      resetLeadModal();

      setActionFeedback({
        status: "success",
        title: "Customer Lead Added",
        message: `Customer "${savedCustomerName}" has been added to your CRM pipeline successfully.`,
      });

      await loadStaffData();
    } catch (err: unknown) {
      console.error("Create lead error:", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred while saving the offline customer.";
      setLeadError(errMsg);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Lead Conversion Submit
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingEnquiry) return;

    if (!dealForm.dealTitle.trim()) {
      setConversionError("Deal title is required to convert this lead.");
      return;
    }

    setIsSubmittingConversion(true);
    setConversionError(null);

    const res = await enquiryService.convertEnquiry(convertingEnquiry.id, {
      dealTitle: dealForm.dealTitle.trim(),
      dealValue: dealForm.dealValue
        ? parseFloat(dealForm.dealValue)
        : undefined,
      expectedCloseDate: dealForm.expectedCloseDate || undefined,
      notes: dealForm.notes.trim(),
      convertedBy: user?.id,
    });

    setIsSubmittingConversion(false);
    if (res.error) {
      setConversionError(res.error);
    } else {
      setConvertingEnquiry(null);
      setDealForm({
        dealTitle: "",
        dealValue: "",
        expectedCloseDate: "",
        notes: "",
      });
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
      setLostNotes("");
      loadStaffData();
    }
  };

  // Invoice / Quotation Submit
  const handleCreateInvoiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invoiceForm.customerName.trim() || !invoiceForm.customerEmail.trim()) {
      setInvoiceErrorMsg("Customer name and email are required.");
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(invoiceForm.customerEmail.trim())) {
      setInvoiceErrorMsg("Please enter a valid email address.");
      return;
    }

    const hasInvalidItem = invoiceForm.items.some(
      (i) => !i.description.trim() || i.quantity < 1
    );
    if (hasInvalidItem) {
      setInvoiceErrorMsg("Every line item must have a valid description and a quantity of at least 1.");
      return;
    }

    // Prevent duplicate product selection across line items
    const nonNullProductIds = invoiceForm.items
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id));
    const uniqueProductIds = new Set(nonNullProductIds);
    if (uniqueProductIds.size < nonNullProductIds.length) {
      setInvoiceErrorMsg(
        "Duplicate products detected. Each catalogue product can only be added once per invoice. Please adjust quantity instead.",
      );
      return;
    }

    setIsSubmittingInvoice(true);
    setInvoiceErrorMsg(null);

    if (editingInvoice) {
      const res = await invoiceService.updateInvoice(editingInvoice.id, {
        customerName: invoiceForm.customerName.trim(),
        customerCompany: invoiceForm.customerCompany.trim() || null,
        customerEmail: invoiceForm.customerEmail.trim(),
        customerPhone: invoiceForm.customerPhone.trim() || null,
        customerAddress: invoiceForm.customerAddress.trim() || null,
        customerGst: invoiceForm.customerGst.trim() || null,
        type: invoiceForm.type,
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
        resetInvoiceForm();
        await loadStaffData();
        if (res.invoice) {
          const fresh = await invoiceService.getInvoiceById(res.invoice.id);
          setViewingPdfInvoice(fresh.invoice || res.invoice);
          setActionFeedback({
            status: "success",
            title: "Invoice Updated",
            message: `Invoice #${res.invoice.invoice_number} has been updated successfully.`,
          });
        }
      }
      return;
    }

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
      resetInvoiceForm();
      await loadStaffData();
      if (res.invoice) {
        const fresh = await invoiceService.getInvoiceById(res.invoice.id);
        setViewingPdfInvoice(fresh.invoice || res.invoice);
        setActionFeedback({
          status: "success",
          title: "Invoice Created",
          message: `${res.invoice.type === "quotation" ? "Formal Quotation" : "Tax Invoice"} #${res.invoice.invoice_number} generated successfully with line items.`,
        });
      }
    }
  };

  // Prompt Send Invoice to Customer via HeroUI Dialog
  const promptSendInvoice = (inv: {
    id: string;
    invoice_number?: string;
    customer_name?: string;
    customer_email?: string;
  }) => {
    setSendConfirmInvoice({
      id: inv.id,
      invoiceNumber: inv.invoice_number || inv.id,
      customerName: inv.customer_name || "Valued Customer",
      customerEmail: inv.customer_email || "",
    });
  };

  const executeSendInvoice = async () => {
    if (!sendConfirmInvoice) return;
    const invoiceId = sendConfirmInvoice.id;
    const invNum = sendConfirmInvoice.invoiceNumber;
    const recipient = sendConfirmInvoice.customerEmail;
    setSendingInvoiceId(invoiceId);
    const res = await invoiceService.sendInvoiceToCustomer(invoiceId, {
      id: user?.id || "",
      full_name: profile?.full_name,
      email: user?.email,
    });
    setSendingInvoiceId(null);
    setSendConfirmInvoice(null);
    if (res.success) {
      await loadStaffData();
      if (viewingPdfInvoice?.id === invoiceId) {
        setViewingPdfInvoice((prev) =>
          prev ? { ...prev, status: "sent" } : null,
        );
      }
      setActionFeedback({
        status: "success",
        title: "Dispatched to Customer",
        message: `Quotation / Invoice #${invNum} has been successfully sent to ${recipient}.`,
      });
    } else {
      setActionFeedback({
        status: "danger",
        title: "Dispatch Failed",
        message: res.error || "Unable to dispatch invoice. Please try again.",
      });
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId) || viewingPdfInvoice;
    if (inv) {
      promptSendInvoice(inv);
    }
  };

  // Follow-up Completion Submit
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    if (!outcomeNotes.trim()) {
      setCompleteError(
        "Please record customer outcome notes before marking complete.",
      );
      return;
    }

    setIsSubmittingComplete(true);
    setCompleteError(null);

    const res = await followupService.completeFollowup(
      completingTask.id,
      outcomeNotes.trim(),
      completingTask.enquiry_id,
      user?.id,
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
        "call",
        `Follow-up scheduled after: ${outcomeNotes.trim()}`,
        user?.id,
        `Successive touchpoint for ${completingTask.enquiry?.name || "Customer"}`,
      );
    }

    setIsSubmittingComplete(false);
    setCompletingTask(null);
    setOutcomeNotes("");
    setScheduleNext(false);
    setNextDate("");
    loadStaffData();
  };

  // Follow-up Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.enquiryId || !createForm.scheduledAt) {
      setCreateError("Enquiry selection and scheduled date are required.");
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError(null);

    const res = await followupService.createFollowup({
      enquiryId: createForm.enquiryId,
      title: createForm.title.trim() || "Follow-up on inquiry",
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
        enquiryId: "",
        title: "",
        scheduledAt: "",
        type: "call",
        priority: "medium",
        notes: "",
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
                  <Chip
                    size="sm"
                    color="success"
                    variant="soft"
                    className="font-mono text-[10px] uppercase font-bold"
                  >
                    Staff Portal
                  </Chip>
                </div>
                <p className="text-[11px] text-slate-500">
                  Precision CRM, Field Visits & Billing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {profile?.role === "admin" && (
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
                  {profile?.role || "Staff"} Access
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
          {profile?.role !== "admin" ? (
            <Card className="p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    todayAttendance && !todayAttendance.clock_out_at
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-industrial-dark">
                      ERP Daily Attendance
                    </h2>
                    {todayAttendance ? (
                      todayAttendance.clock_out_at ? (
                        <Chip
                          size="sm"
                          color="default"
                          variant="soft"
                          className="font-bold uppercase text-[10px]"
                        >
                          Clocked Out
                        </Chip>
                      ) : todayAttendance.status === "on_field" ? (
                        <Chip
                          size="sm"
                          color="warning"
                          variant="soft"
                          className="font-bold uppercase text-[10px]"
                        >
                          On Field
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          color="success"
                          variant="soft"
                          className="font-bold uppercase text-[10px]"
                        >
                          Present
                        </Chip>
                      )
                    ) : (
                      <Chip
                        size="sm"
                        color="danger"
                        variant="soft"
                        className="font-bold uppercase text-[10px]"
                      >
                        Not Clocked In
                      </Chip>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {todayAttendance
                      ? `Clocked in at ${new Date(todayAttendance.clock_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${
                          todayAttendance.clock_out_at
                            ? ` • Clocked out at ${new Date(todayAttendance.clock_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : ""
                        }`
                      : "Record your daily punch to activate your availability for lead assignment."}
                  </p>
                  {attendanceMsg && (
                    <p className="text-xs font-semibold text-sky-700 mt-1">
                      {attendanceMsg}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!todayAttendance && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleClockIn("present")}
                      onClick={() => handleClockIn("present")}
                      isDisabled={isClocking}
                      className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isClocking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Clock In (Office)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleClockIn("on_field")}
                      onClick={() => handleClockIn("on_field")}
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
                    {isClocking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    Clock Out
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-100/80 p-3.5 border border-slate-200 flex flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Chip
                  size="sm"
                  color="accent"
                  variant="soft"
                  className="font-mono uppercase text-[10px] font-bold"
                >
                  Administrator
                </Chip>
                <span className="text-slate-600 font-medium">
                  Logged in with full supervisory access. ERP daily attendance
                  punch is exempt for administrators.
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
                Manage inquiries, follow-up calls, field visits with GPS, and
                customer billing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onPress={() => loadStaffData()}
                className="gap-1.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowAddLeadModal(true)}
                className="gap-1.5 text-xs font-semibold bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Customer</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowVisitModal(true)}
                className="gap-1.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Schedule Visit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  resetInvoiceForm();
                  setShowInvoiceModal(true);
                }}
                className="gap-1.5 text-xs font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Invoice</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={() => setShowCreateModal(true)}
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

            <Card
              className={`p-3.5 border shadow-xs ${
                stats.overdue > 0
                  ? "bg-rose-50/50 border-rose-200"
                  : "bg-white border-slate-200"
              }`}
            >
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
                onClick={() => setActiveTab("followups")}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "followups"
                    ? "border-industrial-blue text-industrial-blue"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Follow-ups ({followupTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab("enquiries")}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "enquiries"
                    ? "border-industrial-blue text-industrial-blue"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Inquiries ({enquiryTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab("visits")}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "visits"
                    ? "border-industrial-blue text-industrial-blue"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Field Visits ({visitTotal})</span>
              </button>

              <button
                onClick={() => setActiveTab("invoices")}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "invoices"
                    ? "border-industrial-blue text-industrial-blue"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Invoices & Quotes ({invoiceTotal})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Follow-up Queue */}
          {activeTab === "followups" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {(
                  [
                    "today",
                    "overdue",
                    "upcoming",
                    "completed",
                    "all",
                  ] as FollowupTimeframe[]
                ).map((tf) => {
                  const isActive = timeframe === tf;
                  const label =
                    tf === "today"
                      ? "Due Today"
                      : tf === "overdue"
                        ? "Overdue Tasks"
                        : tf === "upcoming"
                          ? "Upcoming"
                          : tf === "completed"
                            ? "Completed"
                            : "All Follow-ups";

                  return (
                    <Button
                      key={tf}
                      size="sm"
                      variant={isActive ? "primary" : "outline"}
                      onPress={() => setTimeframe(tf)}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isActive
                          ? "bg-industrial-dark text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
                  <p className="text-xs text-slate-500">
                    Loading follow-ups...
                  </p>
                </Card>
              ) : followups.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">
                    No Tasks in this Timeframe
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You have no scheduled follow-ups matching this filter.
                    Schedule a new touchpoint or review other tabs.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followups.map((item) => {
                    const priorityStyle =
                      PRIORITY_STYLES[item.priority || "medium"] ||
                      PRIORITY_STYLES.medium;
                    const isOverdue =
                      new Date(item.scheduled_at).getTime() < Date.now() &&
                      item.status !== "completed" &&
                      item.status !== "cancelled";

                    return (
                      <Card
                        key={item.id}
                        className={`p-4 border shadow-xs hover:shadow-md transition-shadow space-y-3 ${
                          isOverdue
                            ? "border-rose-300 ring-1 ring-rose-200"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Chip
                                size="sm"
                                variant="soft"
                                color={
                                  item.priority === "urgent"
                                    ? "danger"
                                    : item.priority === "high"
                                      ? "warning"
                                      : "accent"
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
                              {item.title || "Follow-up Call"}
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
                              <span className="font-bold text-slate-800">
                                {item.enquiry.name}
                              </span>
                              {item.enquiry.company && (
                                <span className="text-slate-500 text-[11px]">
                                  {item.enquiry.company}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-sky-700 font-mono pt-0.5">
                              {item.enquiry.phone && (
                                <span>{item.enquiry.phone}</span>
                              )}
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

                          {item.status !== "completed" &&
                            item.status !== "cancelled" && (
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
          {activeTab === "enquiries" && (
            <div className="space-y-4">
              {/* Inquiries Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 font-heading flex items-center gap-2">
                    <span>Assigned Inquiries & Customer Pipeline</span>
                    <Chip size="sm" variant="soft" color="accent" className="font-mono text-[10px]">
                      {enquiries.length} Total
                    </Chip>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prospective client leads from website inquiries and staff offline entries (walk-ins, phone calls, expos).
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => setShowAddLeadModal(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold text-xs shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Offline Customer / Lead</span>
                </Button>
              </div>

              {isLoadingEnquiries ? (
                <Card className="p-8 text-center border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Loading assigned inquiries...
                  </p>
                </Card>
              ) : enquiries.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">
                    No Assigned Inquiries
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You do not currently have any prospective inquiries delegated to your account.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => setShowAddLeadModal(true)}
                    className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold text-xs mx-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add First Offline Customer</span>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enq) => (
                    <Card
                      key={enq.id}
                      className="p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
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
                            Product Interest:{" "}
                            <strong className="text-slate-700">
                              {enq.specific_product ||
                                enq.product_category ||
                                "General Metrology Inquiry"}
                            </strong>
                          </div>
                        </div>{" "}
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {enq.source && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                                  enq.source === "offline_walkin"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : enq.source === "phone_call"
                                      ? "bg-sky-50 text-sky-700 border-sky-200"
                                      : enq.source === "trade_expo"
                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                        : enq.source === "referral"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : enq.source === "existing_client"
                                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {enq.source === "offline_walkin"
                                  ? "Walk-in"
                                  : enq.source === "phone_call"
                                    ? "Phone / WhatsApp"
                                    : enq.source === "trade_expo"
                                      ? "Trade Expo"
                                      : enq.source === "referral"
                                        ? "Referral"
                                        : enq.source === "existing_client"
                                          ? "Existing Client"
                                          : enq.source === "website"
                                            ? "Website RFQ"
                                            : enq.source}
                              </span>
                            )}
                            <Chip
                              size="sm"
                              variant="soft"
                              color={
                                enq.status === "converted"
                                  ? "success"
                                  : enq.status === "closed"
                                    ? "default"
                                    : "accent"
                              }
                              className="font-bold uppercase text-[10px]"
                            >
                              {enq.status.replace("_", " ")}
                            </Chip>
                          </div>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {formatDate(enq.created_at)}
                          </span>
                        </div>
                      </div>

                      {enq.deal_title && (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-900">
                            <span>Deal: {enq.deal_title}</span>
                            {enq.deal_value && (
                              <span>
                                ₹{enq.deal_value.toLocaleString("en-IN")}
                              </span>
                            )}
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
                          {enq.lost_notes && (
                            <p className="italic mt-0.5">"{enq.lost_notes}"</p>
                          )}
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
                                scheduledAt: new Date()
                                  .toISOString()
                                  .slice(0, 16),
                                type: "call",
                                priority: "high",
                                notes: `Follow-up on inquiry: ${enq.specific_product || enq.product_category || "General requirement"}`,
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
                                visitPurpose: "consultation",
                                scheduledAt: "",
                                customerContactPerson: enq.name,
                                notes: enq.requirement || "",
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
                              resetInvoiceForm();
                              setInvoiceForm({
                                enquiryId: enq.id,
                                customerName: enq.name,
                                customerCompany: enq.company || "",
                                customerEmail: enq.email,
                                customerPhone: enq.phone || "",
                                customerAddress: "",
                                customerGst: "",
                                type: "quotation",
                                items: [
                                  {
                                    description:
                                      enq.specific_product ||
                                      enq.product_category ||
                                      "Metrology Gauging Requirement",
                                    quantity: 1,
                                    unitPrice: 0,
                                    taxRate: 18,
                                  },
                                ],
                              });
                              setShowInvoiceModal(true);
                            }}
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            aria-label="Create Quotation"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Quote</span>
                          </Button>

                          {enq.status !== "converted" &&
                            enq.status !== "closed" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onPress={() => {
                                    setConvertingEnquiry(enq);
                                    setDealForm({
                                      dealTitle: `${enq.company || enq.name} - ${enq.specific_product || "Gauging Requirement"}`,
                                      dealValue: "",
                                      expectedCloseDate: "",
                                      notes: "",
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
                                    setLostNotes("");
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
          {activeTab === "visits" && (
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
                  <h3 className="text-sm font-bold text-slate-800 font-heading">
                    No Field Visits Scheduled
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Schedule customer on-site visits to record GPS check-in/out
                    and inspection evidence.
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
                              vis.status === "completed"
                                ? "success"
                                : vis.status === "in_progress"
                                  ? "warning"
                                  : "accent"
                            }
                            className="font-bold uppercase text-[10px]"
                          >
                            {(vis.status || "").replace("_", " ")}
                          </Chip>
                          <h4 className="text-sm font-bold text-industrial-dark font-heading mt-1">
                            {vis.title}
                          </h4>
                          <p className="text-xs text-slate-500 capitalize">
                            Purpose:{" "}
                            {(
                              vis.visit_purpose ||
                              (vis as any).purpose ||
                              "General"
                            ).replace("_", " ")}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {formatDate(vis.scheduled_at)}
                        </span>
                      </div>

                      {vis.enquiry && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                          <p className="font-bold text-slate-800">
                            {vis.enquiry.name} (
                            {vis.enquiry.company || "Client"})
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {vis.enquiry.phone} • {vis.enquiry.email}
                          </p>
                        </div>
                      )}

                      {vis.check_in_at && (
                        <div className="text-[11px] text-slate-500 space-y-0.5 bg-sky-50/50 p-2 rounded border border-sky-100">
                          <p className="flex items-center gap-1 text-sky-800 font-semibold">
                            <Navigation className="w-3 h-3" />
                            Checked In:{" "}
                            {new Date(vis.check_in_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {vis.check_in_address && (
                            <p className="text-slate-600 truncate">
                              {vis.check_in_address}
                            </p>
                          )}
                        </div>
                      )}

                      {vis.outcome_notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded italic">
                          "{vis.outcome_notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {vis.duration_minutes
                            ? `Duration: ${vis.duration_minutes} mins`
                            : "Pending Check-out"}
                        </span>

                        {vis.status === "scheduled" && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onPress={() => handleCancelVisit(vis.id)}
                              onClick={() => handleCancelVisit(vis.id)}
                              className="gap-1 px-2.5 h-7 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                              aria-label={`Cancel visit ${vis.title}`}
                            >
                              <X className="w-3 h-3" />
                              <span>Cancel</span>
                            </Button>
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
                          </div>
                        )}

                        {vis.status === "in_progress" && (
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
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-industrial-dark font-heading">
                  Generated Quotations & Tax Invoices
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    resetInvoiceForm();
                    setShowInvoiceModal(true);
                  }}
                  onClick={() => {
                    resetInvoiceForm();
                    setShowInvoiceModal(true);
                  }}
                  className="gap-1 text-xs font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-3 h-3" />
                  New Quotation / Invoice
                </Button>
              </div>

              {actionFeedback && (
                <div className="mb-4">
                  <Alert status={actionFeedback.status} className="shadow-xs">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{actionFeedback.title}</Alert.Title>
                      <Alert.Description>{actionFeedback.message}</Alert.Description>
                    </Alert.Content>
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      onPress={() => setActionFeedback(null)}
                      className="text-slate-400 hover:text-slate-700 h-6 w-6"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </Alert>
                </div>
              )}

              {invoices.length === 0 ? (
                <Card className="p-12 text-center border border-slate-200 shadow-xs">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 font-heading">
                    No Invoices or Quotations
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Create formal quotations or proforma invoices with tax
                    calculations for your assigned leads.
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
                            <Chip
                              size="sm"
                              variant="soft"
                              color="default"
                              className="font-bold uppercase text-[10px]"
                            >
                              {inv.type}
                            </Chip>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {inv.customer_name}{" "}
                            {inv.customer_company
                              ? `(${inv.customer_company})`
                              : ""}
                          </p>
                        </div>

                        <div className="text-right">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              inv.status === "paid"
                                ? "success"
                                : inv.status === "sent"
                                  ? "accent"
                                  : "default"
                            }
                            className="font-bold uppercase text-[10px]"
                          >
                            {inv.status}
                          </Chip>
                          <span className="text-sm font-bold font-mono text-emerald-700 block mt-1">
                            ₹{inv.total_amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {inv.items && inv.items.length > 0 && (
                        <div className="bg-slate-50 p-2 rounded text-xs space-y-1">
                          {inv.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-slate-600"
                            >
                              <span>
                                {it.quantity}x {it.description}
                              </span>
                              <span className="font-mono">
                                ₹{it.total_price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          Issued: {inv.issue_date}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => handleViewInvoice(inv)}
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            aria-label={`View PDF for ${inv.invoice_number}`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>View PDF</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => handleDirectDownloadPdf(inv)}
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                            aria-label={`Download PDF for ${inv.invoice_number}`}
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => handleStartEditInvoice(inv)}
                            className="gap-1 px-2.5 h-7 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                            aria-label={`Edit ${inv.invoice_number}`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
                            className="gap-1 px-2.5 h-7 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                            aria-label={`Delete invoice ${inv.invoice_number}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </Button>
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
          <Modal.Backdrop
            isOpen={!!completingTask}
            isDismissable={false}
            onOpenChange={(open) => {
              if (!open) setCompletingTask(null);
            }}
          >
            <Modal.Container placement="center" className="w-full max-w-md">
              <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
                <Modal.CloseTrigger
                  onPress={() => setCompletingTask(null)}
                  className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Modal.CloseTrigger>
                <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
                  <div>
                    <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                      Complete CRM Follow-up
                    </Modal.Heading>
                    <p className="text-[11px] text-slate-500">
                      Customer: {completingTask.enquiry?.name} (
                      {completingTask.enquiry?.company})
                    </p>
                  </div>
                </Modal.Header>

                <Modal.Body className="p-0 overflow-visible">
                  {completeError && (
                    <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{completeError}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleCompleteSubmit}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Customer Outcome & Technical Notes{" "}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <TextArea
                        required
                        rows={3}
                        value={outcomeNotes}
                        onChange={(e) => setOutcomeNotes(e.target.value)}
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
                            onChange={(e) => setNextDate(e.target.value)}
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
                        {isSubmittingComplete ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Confirm Complete
                      </Button>
                    </div>
                  </form>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}

        {/* Modal 2: Schedule Follow-up Modal */}
        <Modal.Backdrop
          isOpen={showCreateModal}
          isDismissable={false}
          onOpenChange={setShowCreateModal}
        >
          <Modal.Container placement="center" className="w-full max-w-md">
            <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
              <Modal.CloseTrigger
                onPress={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </Modal.CloseTrigger>
              <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
                <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                  Schedule New Follow-up
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="p-0 overflow-visible">
                {createError && (
                  <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <form
                  onSubmit={handleCreateSubmit}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Select Client Inquiry{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={createForm.enquiryId}
                      onChange={(val) =>
                        setCreateForm({
                          ...createForm,
                          enquiryId: (val as string) || "",
                        })
                      }
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
                          {enquiries.map((e) => {
                            const label = `${e.name} ${e.company ? `(${e.company})` : ""} - ${e.specific_product || e.product_category || "Inquiry"}`;
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
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Task Title
                    </Label>
                    <Input
                      type="text"
                      value={createForm.title}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, title: e.target.value })
                      }
                      placeholder="e.g. Call client regarding quotation feedback"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Type
                      </Label>
                      <Select
                        value={createForm.type}
                        onChange={(val) =>
                          setCreateForm({
                            ...createForm,
                            type: (val as FollowupType) || "call",
                          })
                        }
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
                              { id: "call", label: "Call" },
                              { id: "email", label: "Email" },
                              { id: "meeting", label: "Demo" },
                              { id: "demo", label: "Demo" },
                              { id: "quotation", label: "Quotation" },
                              { id: "other", label: "Other" },
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
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Priority
                      </Label>
                      <Select
                        value={createForm.priority}
                        onChange={(val) =>
                          setCreateForm({
                            ...createForm,
                            priority: (val as FollowupPriority) || "medium",
                          })
                        }
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
                              { id: "low", label: "Low" },
                              { id: "medium", label: "Medium" },
                              { id: "high", label: "High" },
                              { id: "urgent", label: "Urgent" },
                            ].map((p) => (
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
                      Scheduled Date & Time{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      value={createForm.scheduledAt}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          scheduledAt: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Internal Notes
                    </Label>
                    <TextArea
                      rows={2}
                      value={createForm.notes}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, notes: e.target.value })
                      }
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
                      {isSubmittingCreate ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      Create Task
                    </Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Modal 3: Convert Lead to Deal */}
        {convertingEnquiry && (
          <Modal.Backdrop
            isOpen={!!convertingEnquiry}
            isDismissable={false}
            onOpenChange={(open) => {
              if (!open) setConvertingEnquiry(null);
            }}
          >
            <Modal.Container placement="center" className="w-full max-w-md">
              <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
                <Modal.CloseTrigger
                  onPress={() => setConvertingEnquiry(null)}
                  className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Modal.CloseTrigger>
                <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
                  <div>
                    <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                      Convert Lead to Deal / Opportunity
                    </Modal.Heading>
                    <p className="text-[11px] text-slate-500">
                      Client: {convertingEnquiry.name} (
                      {convertingEnquiry.company || "N/A"})
                    </p>
                  </div>
                </Modal.Header>

                <Modal.Body className="p-0 overflow-visible">
                  {conversionError && (
                    <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{conversionError}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleConvertSubmit}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Deal Title / Order Description{" "}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        required
                        value={dealForm.dealTitle}
                        onChange={(e) =>
                          setDealForm({
                            ...dealForm,
                            dealTitle: e.target.value,
                          })
                        }
                        placeholder="e.g. 5x Custom Air Ring Gauges Ø30mm"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                          Estimated Value (₹)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={dealForm.dealValue}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              dealValue: e.target.value,
                            })
                          }
                          placeholder="e.g. 75000"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                          Target Close Date
                        </Label>
                        <Input
                          type="date"
                          value={dealForm.expectedCloseDate}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              expectedCloseDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1 text-xs">
                        Conversion Notes
                      </Label>
                      <TextArea
                        rows={2}
                        value={dealForm.notes}
                        onChange={(e) =>
                          setDealForm({ ...dealForm, notes: e.target.value })
                        }
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
                        {isSubmittingConversion ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        Confirm Deal Conversion
                      </Button>
                    </div>
                  </form>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}

        {/* Modal 4: Close Lead (Lost Reason) */}
        {closingEnquiry && (
          <Modal.Backdrop
            isOpen={!!closingEnquiry}
            isDismissable={false}
            onOpenChange={(open) => {
              if (!open) setClosingEnquiry(null);
            }}
          >
            <Modal.Container placement="center" className="w-full max-w-md">
              <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
                <Modal.CloseTrigger
                  onPress={() => setClosingEnquiry(null)}
                  className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Modal.CloseTrigger>
                <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
                  <div>
                    <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                      Close Lead (Lost Opportunity)
                    </Modal.Heading>
                    <p className="text-[11px] text-slate-500">
                      Client: {closingEnquiry.name} (
                      {closingEnquiry.company || "N/A"})
                    </p>
                  </div>
                </Modal.Header>

                <Modal.Body className="p-0 overflow-visible">
                  {closureError && (
                    <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{closureError}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleCloseSubmit}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1">
                        Primary Reason for Closing{" "}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={lostReason}
                        onChange={(val) => setLostReason((val as string) || "")}
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
                      <Label className="block font-semibold text-slate-700 mb-1">
                        Detailed Explanation
                      </Label>
                      <TextArea
                        rows={3}
                        value={lostNotes}
                        onChange={(e) => setLostNotes(e.target.value)}
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
                        {isSubmittingClosure ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Confirm Closure
                      </Button>
                    </div>
                  </form>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}

        {/* Modal 5: Schedule Field Visit */}
        <Modal.Backdrop
          isOpen={showVisitModal}
          isDismissable={false}
          onOpenChange={setShowVisitModal}
        >
          <Modal.Container placement="center" className="w-full max-w-lg">
            <Modal.Dialog>
              <Modal.CloseTrigger
                onPress={() => {
                  setShowVisitModal(false);
                  setVisitDateValue(null);
                }}
                aria-label="Close modal"
              ></Modal.CloseTrigger>
              <Modal.Header>
                <Modal.Heading>Schedule Client Site Visit</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="p-0 overflow-visible">
                {visitError && (
                  <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{visitError}</span>
                  </div>
                )}

                <form
                  id="create-visit-form"
                  onSubmit={handleCreateVisitSubmit}
                  className="space-y-3.5 text-xs"
                >
                  <Surface
                    className="flex min-w-[320px] flex-col gap-4 rounded-3xl p-6"
                    variant="secondary"
                  >
                    <TextField>
                      <Label>
                        Select Client Inquiry{" "}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={visitForm.enquiryId}
                        onChange={(val) =>
                          setVisitForm({
                            ...visitForm,
                            enquiryId: (val as string) || "",
                          })
                        }
                        className="w-full"
                        aria-label="Select Client Inquiry"
                        placeholder="-- Choose Client --"
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox className="outline-none space-y-0.5">
                            {enquiries.map((e) => (
                              <ListBox.Item
                                key={e.id}
                                id={e.id}
                                textValue={`${e.name} ${e.company ? `(${e.company})` : ""} - ${e.specific_product || e.product_category || "Inquiry"}`}
                              >
                                {e.name}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </TextField>

                    <TextField>
                      <Label>Visit Title</Label>
                      <Input
                        type="text"
                        value={visitForm.title}
                        onChange={(e) =>
                          setVisitForm({ ...visitForm, title: e.target.value })
                        }
                        placeholder="e.g. On-site Calibration & Dimension Verification"
                      />
                    </TextField>

                    <TextField>
                      <Label>Purpose</Label>
                      <Select
                        value={visitForm.visitPurpose}
                        onChange={(val) =>
                          setVisitForm({
                            ...visitForm,
                            visitPurpose:
                              (val as VisitPurpose) || "consultation",
                          })
                        }
                        className="w-full"
                        aria-label="Visit Purpose"
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox className="outline-none space-y-0.5">
                            {[
                              { id: "consultation", label: "Consultation" },
                              { id: "demo", label: "Demo" },
                              {
                                id: "site_inspection",
                                label: "Site Inspection",
                              },
                              { id: "installation", label: "Installation" },
                              {
                                id: "troubleshooting",
                                label: "Troubleshooting",
                              },
                              { id: "other", label: "Other" },
                            ].map((item) => (
                              <ListBox.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                              >
                                {item.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </TextField>

                    <TextField>
                      <Label>Contact Person</Label>
                      <Input
                        type="text"
                        value={visitForm.customerContactPerson}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            customerContactPerson: e.target.value,
                          })
                        }
                        placeholder="e.g. Quality Manager"
                      />
                    </TextField>

                    <DatePicker
                      isRequired
                      granularity="minute"
                      hourCycle={12}
                      hideTimeZone={true}
                      value={visitDateValue}
                      onChange={(val) => {
                        setVisitDateValue(val);
                        if (val) {
                          try {
                            const tz = getLocalTimeZone();
                            const iso =
                              "toDate" in val &&
                              typeof (val as any).toDate === "function"
                                ? (val as any).toDate(tz).toISOString()
                                : new Date(val.toString()).toISOString();
                            setVisitForm((prev) => ({
                              ...prev,
                              scheduledAt: iso,
                            }));
                          } catch {
                            setVisitForm((prev) => ({
                              ...prev,
                              scheduledAt: val.toString(),
                            }));
                          }
                        } else {
                          setVisitForm((prev) => ({
                            ...prev,
                            scheduledAt: "",
                          }));
                        }
                      }}
                      className="w-full"
                      aria-label="Scheduled Date & Time"
                    >
                      {({ state }) => (
                        <>
                          <Label>Scheduled Date & Time</Label>
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
                            <Calendar aria-label="Visit Date">
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
                                aria-label="Visit Time"
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
                                      <TimeField.Segment segment={segment} />
                                    )}
                                  </TimeField.Input>
                                </TimeField.Group>
                              </TimeField>
                            </div>
                          </DatePicker.Popover>
                        </>
                      )}
                    </DatePicker>

                    <TextField>
                      <Label>Visit Agenda / Notes</Label>
                      <TextArea
                        rows={2}
                        value={visitForm.notes}
                        onChange={(e) =>
                          setVisitForm({ ...visitForm, notes: e.target.value })
                        }
                        placeholder="Inspect workpiece fixture, verify air line pressure..."
                      />
                    </TextField>
                  </Surface>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setShowVisitModal(false);
                    setVisitDateValue(null);
                  }}
                  onClick={() => {
                    setShowVisitModal(false);
                    setVisitDateValue(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-visit-form"
                  variant="primary"
                  size="sm"
                  isDisabled={isSubmittingVisit}
                >
                  {isSubmittingVisit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  Confirm Visit
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Modal 6: Complete Field Visit */}
        {completingVisit && (
          <Modal.Backdrop
            isOpen={!!completingVisit}
            isDismissable={false}
            onOpenChange={(open) => {
              if (!open) setCompletingVisit(null);
            }}
          >
            <Modal.Container placement="center" className="w-full max-w-md">
              <Modal.Dialog className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
                <Modal.CloseTrigger
                  onPress={() => setCompletingVisit(null)}
                  className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </Modal.CloseTrigger>
                <Modal.Header className="pb-3 border-b border-slate-100 pr-8">
                  <div>
                    <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                      Check Out & Complete Field Visit
                    </Modal.Heading>
                    <p className="text-[11px] text-slate-500">
                      {completingVisit.title}
                    </p>
                  </div>
                </Modal.Header>

                <Modal.Body className="p-0 overflow-visible">
                  {visitCompleteError && (
                    <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{visitCompleteError}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleCompleteVisitSubmit}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <Label className="block font-semibold text-slate-700 mb-1">
                        Visit Outcome & Findings{" "}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <TextArea
                        required
                        rows={3}
                        value={visitOutcomeNotes}
                        onChange={(e) => setVisitOutcomeNotes(e.target.value)}
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
                        onChange={(e) => setVisitPhotoUrl(e.target.value)}
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
                        {isSubmittingVisitComplete ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Confirm Check-out
                      </Button>
                    </div>
                  </form>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        )}

        {/* Modal 7: Create Invoice / Quotation */}
        <Modal.Backdrop
          isOpen={showInvoiceModal}
          isDismissable={false}
          onOpenChange={setShowInvoiceModal}
          data-react-aria-top-layer="true"
         
        >
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog data-react-aria-top-layer="true">
              <Modal.CloseTrigger
                onPress={() => {
                  setShowInvoiceModal(false);
                  resetInvoiceForm();
                }}
                aria-label="Close modal"
              ></Modal.CloseTrigger>
              <Modal.Header>
                <Modal.Heading className="text-sm font-bold text-industrial-dark font-heading">
                  {editingInvoice
                    ? `Edit ${editingInvoice.type === "quotation" ? "Quotation" : "Tax Invoice"} (${editingInvoice.invoice_number})`
                    : "Create Formal Quotation / Tax Invoice"}
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                {invoiceErrorMsg && (
                  <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{invoiceErrorMsg}</span>
                  </div>
                )}

                <Form
                  id="create-invoice-form"
                  validationBehavior="native"
                  onSubmit={handleCreateInvoiceSubmit}
                  className="space-y-4"
                >
                  <Surface
                    className="flex min-w-[320px] flex-col gap-4 rounded-3xl p-6"
                    variant="secondary"
                  >
                    {/* Document Type */}
                    <Select
                      fullWidth
                      value={invoiceForm.type}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          type: (val as InvoiceType) || "quotation",
                        }))
                      }
                      aria-label="Document Type"
                    >
                      <Label>Document Type</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {[
                            { id: "quotation", label: "Formal Quotation" },
                            { id: "proforma", label: "Proforma Invoice" },
                            { id: "tax_invoice", label: "Tax Invoice" },
                          ].map((t) => (
                            <ListBox.Item
                              key={t.id}
                              id={t.id}
                              textValue={t.label}
                            >
                              {t.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    {/* Link to Inquiry */}
                    <Select
                      fullWidth
                      value={invoiceForm.enquiryId}
                      onChange={(val) => {
                        const selectedId = (val as string) || "";
                        const matched = enquiries.find(
                          (en) => en.id === selectedId,
                        );
                        if (matched) {
                          setInvoiceForm((prev) => ({
                            ...prev,
                            enquiryId: selectedId,
                            customerName: matched.name,
                            customerCompany: matched.company || "",
                            customerEmail: matched.email,
                            customerPhone: matched.phone || "",
                          }));
                        } else {
                          setInvoiceForm((prev) => ({
                            ...prev,
                            enquiryId: selectedId,
                          }));
                        }
                      }}
                      aria-label="Link to Inquiry"
                      placeholder="-- Standalone (No Inquiry) --"
                    >
                      <Label>Link to Inquiry</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="" textValue="-- Standalone (No Inquiry) --">
                            <span className="text-muted italic">-- Standalone (No Inquiry) --</span>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          {enquiries.map((e) => (
                            <ListBox.Item
                              key={e.id}
                              id={e.id}
                              textValue={`${e.name} (${e.company || "Client"})`}
                            >
                              <div className="flex flex-col">
                                <Label>{e.name}</Label>
                                <Description>{e.company || e.email}</Description>
                              </div>
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    {/* Customer Auto-fill / Search ComboBox */}
                    <ComboBox
                      fullWidth
                      allowsCustomValue
                      allowsEmptyCollection
                      menuTrigger="focus"
                      inputValue={customerSearchQuery}
                      onInputChange={(val) => {
                        handleCustomerSearch(val);
                      }}
                      onSelectionChange={(key) => {
                        if (key) {
                          const pool: CustomerSearchResult[] =
                            customerSuggestions.length > 0
                              ? customerSuggestions
                              : enquiries.map(
                                  (e): CustomerSearchResult => ({
                                    id: e.id,
                                    name: e.name,
                                    company: e.company || null,
                                    email: e.email,
                                    phone: e.phone || null,
                                    address: null,
                                    gst: null,
                                    source: "enquiry",
                                  }),
                                );
                          const selected = pool.find(
                            (c, i) =>
                              (c.id ||
                                `${c.source}-${c.email || c.name}-${i}`) ===
                              key,
                          );
                          if (selected) {
                            handleSelectCustomer(selected);
                          }
                        }
                      }}
                      aria-label="Search Customer Database (Auto-fill)"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5 font-semibold">
                          <Search className="w-3.5 h-3.5 text-primary" />
                          <span>Search Customer Database (Auto-fill)</span>
                        </Label>
                        {(invoiceForm.customerName ||
                          invoiceForm.customerEmail) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onPress={() => {
                              setInvoiceForm((prev) => ({
                                ...prev,
                                enquiryId: "",
                                customerName: "",
                                customerCompany: "",
                                customerEmail: "",
                                customerPhone: "",
                                customerAddress: "",
                                customerGst: "",
                              }));
                              setCustomerSearchQuery("");
                              setCustomerSuggestions([]);
                            }}
                          >
                            + New Customer (Clear)
                          </Button>
                        )}
                      </div>

                      <ComboBox.InputGroup>
                        <ComboBoxSearchInput
                          placeholder="Type name, company, or email to search past records..."
                        />
                        <ComboBox.Trigger aria-label="Show customer suggestions">
                          {isSearchingCustomers ? (
                            <Spinner size="sm" />
                          ) : undefined}
                        </ComboBox.Trigger>
                      </ComboBox.InputGroup>

                      <ComboBox.Popover>
                        <ListBox
                          renderEmptyState={() => (
                            <div className="p-3 text-center text-xs">
                              {isSearchingCustomers ? (
                                <div className="flex items-center justify-center gap-2 py-1 text-muted">
                                  <Spinner size="sm" />
                                  <span>Searching database...</span>
                                </div>
                              ) : customerSearchQuery.trim().length >= 2 ? (
                                <>
                                  <p className="font-medium text-foreground">
                                    No matching customer found
                                  </p>
                                  <p className="text-xs text-muted">
                                    You can enter customer details manually in the fields below.
                                  </p>
                                </>
                              ) : (
                                <p className="text-muted">
                                  Type at least 2 characters to search past records...
                                </p>
                              )}
                            </div>
                          )}
                        >
                          {(customerSuggestions.length > 0
                            ? customerSuggestions
                            : enquiries.slice(0, 8).map(
                                (e): CustomerSearchResult => ({
                                  id: e.id,
                                  name: e.name,
                                  company: e.company || null,
                                  email: e.email,
                                  phone: e.phone || null,
                                  address: null,
                                  gst: null,
                                  source: "enquiry",
                                }),
                              )
                          ).map((c, i) => {
                            const itemKey =
                              c.id ||
                              `${c.source}-${c.email || c.name}-${i}`;
                            const searchText =
                              `${c.name} ${c.company || ""} ${c.email} ${c.phone || ""}`.trim();
                            return (
                              <ListBox.Item
                                key={itemKey}
                                id={itemKey}
                                textValue={searchText}
                              >
                                <div className="flex items-center justify-between gap-2 w-full">
                                  <div className="flex flex-col min-w-0">
                                    <Label className="font-medium">
                                      {c.name} {c.company ? `(${c.company})` : ""}
                                    </Label>
                                    <Description className="truncate">
                                      {c.email}{c.phone ? ` • ${c.phone}` : ""}
                                    </Description>
                                    {c.address && (
                                      <Description className="text-xs text-muted truncate">
                                        {c.address}
                                      </Description>
                                    )}
                                  </div>
                                  <Chip
                                    size="sm"
                                    variant="soft"
                                    color={c.source === "invoice" ? "accent" : "default"}
                                    className="shrink-0"
                                  >
                                    {c.source === "invoice"
                                      ? "Past Client"
                                      : "Inquiry Lead"}
                                  </Chip>
                                </div>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            );
                          })}
                        </ListBox>
                      </ComboBox.Popover>
                    </ComboBox>

                    {/* Customer Name */}
                    <TextField
                      isRequired
                      fullWidth
                      name="customerName"
                      value={invoiceForm.customerName}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          customerName: val,
                        }))
                      }
                      validate={(value) => {
                        if (!value || !value.trim()) {
                          return "Customer Name is required";
                        }
                        return null;
                      }}
                    >
                      <Label>Customer Name</Label>
                      <Input placeholder="e.g. Acme Corporation or Contact Person" />
                      <FieldError />
                    </TextField>

                    {/* Company / Organization */}
                    <TextField
                      fullWidth
                      name="customerCompany"
                      value={invoiceForm.customerCompany}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          customerCompany: val,
                        }))
                      }
                    >
                      <Label>Company / Organization</Label>
                      <Input placeholder="e.g. Precision Components Ltd" />
                      <FieldError />
                    </TextField>

                    {/* Customer Email */}
                    <TextField
                      isRequired
                      fullWidth
                      name="customerEmail"
                      type="email"
                      value={invoiceForm.customerEmail}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          customerEmail: val,
                        }))
                      }
                      validate={(value) => {
                        if (!value || !value.trim()) {
                          return "Customer Email is required";
                        }
                        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())) {
                          return "Please enter a valid email address";
                        }
                        return null;
                      }}
                    >
                      <Label>Customer Email</Label>
                      <Input placeholder="e.g. contact@company.com" />
                      <FieldError />
                    </TextField>

                    {/* Customer Phone */}
                    <TextField
                      fullWidth
                      name="customerPhone"
                      type="tel"
                      value={invoiceForm.customerPhone}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          customerPhone: val,
                        }))
                      }
                      validate={(value) => {
                        if (value && value.trim() && !/^[+0-9\s-]{7,15}$/.test(value.trim())) {
                          return "Please enter a valid phone number";
                        }
                        return null;
                      }}
                    >
                      <Label>Customer Phone</Label>
                      <Input placeholder="e.g. +91 98765 43210" />
                      <FieldError />
                    </TextField>

                    {/* Billing Address */}
                    <TextField
                      fullWidth
                      name="customerAddress"
                      value={invoiceForm.customerAddress}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          customerAddress: val,
                        }))
                      }
                    >
                      <Label>Billing Address</Label>
                      <Input placeholder="Plot No, Industrial Estate, City..." />
                      <FieldError />
                    </TextField>

                    {/* GSTIN Number */}
                    <TextField
                      fullWidth
                      name="customerGst"
                      value={invoiceForm.customerGst}
                      onChange={(val) =>
                        setInvoiceForm((prev) => ({
                          ...prev,
                          customerGst: val.toUpperCase(),
                        }))
                      }
                      validate={(value) => {
                        if (
                          value &&
                          value.trim() &&
                          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(value.trim())
                        ) {
                          return "Invalid GSTIN format (e.g. 33AAAAA0000A1Z5)";
                        }
                        return null;
                      }}
                    >
                      <Label>GSTIN Number</Label>
                      <Input placeholder="e.g. 33AAAAA0000A1Z5" />
                      <FieldError />
                    </TextField>

                    {/* Line Items Section Header */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Label className="font-semibold text-foreground">
                        Line Items
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onPress={() =>
                          setInvoiceForm((prev) => ({
                            ...prev,
                            items: [
                              ...prev.items,
                              {
                                description: "",
                                quantity: 1,
                                unitPrice: 0,
                                taxRate: 18,
                              },
                            ],
                          }))
                        }
                        className="gap-1 text-primary"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </Button>
                    </div>

                    {/* Line Items Loop */}
                    {invoiceForm.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-surface border border-border rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Item #{idx + 1}
                          </span>
                          {invoiceForm.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              isIconOnly
                              onPress={() => {
                                const newItems = invoiceForm.items.filter(
                                  (_, i) => i !== idx,
                                );
                                setInvoiceForm((prev) => ({
                                  ...prev,
                                  items: newItems,
                                }));
                              }}
                              aria-label="Remove item"
                              className="text-danger hover:text-danger-hover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>

                        <Select
                          fullWidth
                          value={item.productId || ""}
                          onChange={(val) => {
                            const pId = (val as string) || "";
                            if (pId) {
                              const isAlreadySelected = invoiceForm.items.some(
                                (other, oIdx) => oIdx !== idx && other.productId === pId
                              );
                              if (isAlreadySelected) {
                                setInvoiceErrorMsg(
                                  "This catalogue product has already been selected on this invoice. Duplicate selection is not permitted; please adjust the quantity instead.",
                                );
                                return;
                              }
                            }
                            const p = productCatalog.find(
                              (prod) => prod.id === pId,
                            );
                            const newItems = [...invoiceForm.items];
                            if (p) {
                              newItems[idx] = {
                                ...newItems[idx],
                                productId: p.id,
                                description: `${p.title}${p.tagline ? " - " + p.tagline : ""}`,
                                taxRate: 18,
                              };
                            } else {
                              newItems[idx] = {
                                ...newItems[idx],
                                productId: undefined,
                              };
                            }
                            setInvoiceForm((prev) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          placeholder="-- Custom / Service Line Item --"
                          aria-label="Select Product from Catalogue"
                        >
                          <Label>Product from Catalogue</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item
                                id=""
                                textValue="-- Custom / Service Line Item --"
                              >
                                <span className="text-muted italic">
                                  -- Custom / Service Line Item --
                                </span>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              {productCatalog.map((prod) => {
                                const isSelectedElsewhere = invoiceForm.items.some(
                                  (other, oIdx) => oIdx !== idx && other.productId === prod.id
                                );
                                return (
                                  <ListBox.Item
                                    key={prod.id}
                                    id={prod.id}
                                    isDisabled={isSelectedElsewhere}
                                    textValue={`${prod.title} (${prod.category})${isSelectedElsewhere ? " (Already Selected)" : ""}`}
                                    className={
                                      isSelectedElsewhere
                                        ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 pointer-events-none"
                                        : ""
                                    }
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex items-center justify-between gap-2">
                                        <Label className={isSelectedElsewhere ? "text-slate-400 line-through" : ""}>
                                          {prod.title}
                                        </Label>
                                        {isSelectedElsewhere && (
                                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                            Already Selected
                                          </span>
                                        )}
                                      </div>
                                      <Description>{prod.category}</Description>
                                    </div>
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                );
                              })}
                            </ListBox>
                          </Select.Popover>
                        </Select>

                        <TextField
                          isRequired
                          fullWidth
                          name={`item-description-${idx}`}
                          value={item.description}
                          onChange={(val) => {
                            const newItems = [...invoiceForm.items];
                            newItems[idx] = {
                              ...newItems[idx],
                              description: val,
                            };
                            setInvoiceForm((prev) => ({
                              ...prev,
                              items: newItems,
                            }));
                          }}
                          validate={(value) => {
                            if (!value || !value.trim()) {
                              return "Item description is required";
                            }
                            return null;
                          }}
                        >
                          <Label>Item Description / Specifications</Label>
                          <Input placeholder="e.g. Air Electronic Column Gauge Model AEC-100" />
                          <FieldError />
                        </TextField>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <TextField
                            isRequired
                            fullWidth
                            name={`item-qty-${idx}`}
                            value={String(item.quantity)}
                            onChange={(val) => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx] = {
                                ...newItems[idx],
                                quantity: parseInt(val, 10) || 1,
                              };
                              setInvoiceForm((prev) => ({
                                ...prev,
                                items: newItems,
                              }));
                            }}
                            validate={(value) => {
                              const q = parseInt(value, 10);
                              if (isNaN(q) || q < 1) {
                                return "Min 1";
                              }
                              return null;
                            }}
                          >
                            <Label>Quantity</Label>
                            <Input type="number" min="1" />
                            <FieldError />
                          </TextField>

                          <TextField
                            isRequired
                            fullWidth
                            name={`item-price-${idx}`}
                            value={String(item.unitPrice)}
                            onChange={(val) => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx] = {
                                ...newItems[idx],
                                unitPrice: parseFloat(val) || 0,
                              };
                              setInvoiceForm((prev) => ({
                                ...prev,
                                items: newItems,
                              }));
                            }}
                            validate={(value) => {
                              const p = parseFloat(value);
                              if (isNaN(p) || p < 0) {
                                return "Must be >= 0";
                              }
                              return null;
                            }}
                          >
                            <Label>Unit Price (₹)</Label>
                            <Input type="number" min="0" step="0.01" />
                            <FieldError />
                          </TextField>

                          <Select
                            fullWidth
                            value={String(item.taxRate)}
                            onChange={(val) => {
                              const newItems = [...invoiceForm.items];
                              newItems[idx] = {
                                ...newItems[idx],
                                taxRate: parseFloat(val as string) || 0,
                              };
                              setInvoiceForm((prev) => ({
                                ...prev,
                                items: newItems,
                              }));
                            }}
                            aria-label="GST Rate"
                          >
                            <Label>GST Rate (%)</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {[
                                  {
                                    id: "18",
                                    label: "18%",
                                  },
                                  { id: "12", label: "12%" },
                                  { id: "5", label: "5%" },
                                  { id: "0", label: "0% (Exempt)" },
                                ].map((rate) => (
                                  <ListBox.Item
                                    key={rate.id}
                                    id={rate.id}
                                    textValue={rate.label}
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
                    ))}

                    {/* Live Total Calculation */}
                    {(() => {
                      let subtotal = 0;
                      let tax = 0;
                      invoiceForm.items.forEach((it) => {
                        const line = it.quantity * it.unitPrice;
                        subtotal += line;
                        tax += (line * it.taxRate) / 100;
                      });
                      const grandTotal = subtotal + tax;

                      return (
                        <div className="bg-primary-soft/30 p-3 rounded-xl border border-primary/20 flex justify-between items-center font-mono">
                          <div>
                            <span className="text-xs text-muted block">
                              Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-muted block">
                              GST: ₹{tax.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-primary uppercase font-bold block">
                              Grand Total
                            </span>
                            <span className="text-base font-bold text-foreground">
                              ₹{grandTotal.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </Surface>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setShowInvoiceModal(false);
                    resetInvoiceForm();
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-invoice-form"
                  variant="primary"
                  size="sm"
                  isDisabled={isSubmittingInvoice}
                  className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmittingInvoice ? (
                    <Spinner size="sm" />
                  ) : (
                    <Receipt className="w-3.5 h-3.5" />
                  )}
                  {editingInvoice ? "Save Changes" : "Generate Document"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* Modal 8: View PDF Invoice / Formal Quotation */}
        {viewingPdfInvoice && (
          <InvoicePdfViewerModal
            isOpen={!!viewingPdfInvoice}
            invoice={viewingPdfInvoice}
            onClose={() => setViewingPdfInvoice(null)}
            onEdit={(inv) => handleStartEditInvoice(inv)}
            onDelete={(id) => handleDeleteInvoice(id, viewingPdfInvoice.invoice_number)}
            onSendEmail={(id) => handleSendInvoice(id)}
            isSendingEmail={!!sendingInvoiceId}
          />
        )}

        {/* Modal 9: Add Offline Customer / Lead Modal */}
        <Modal.Backdrop
          isOpen={showAddLeadModal}
          isDismissable={false}
          onOpenChange={(open) => {
            if (!open && !isSubmittingLead) resetLeadModal();
          }}
          className="z-50"
        >
          <Modal.Container placement="center" size="lg" className="p-3 sm:p-6 flex items-center justify-center">
            <Modal.Dialog className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[88vh] flex flex-col relative overflow-hidden my-auto">
              <Modal.CloseTrigger
                onPress={resetLeadModal}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </Modal.CloseTrigger>

              <Form
                id="add-offline-lead-form"
                validationBehavior="native"
                onSubmit={handleCreateLead}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                <Modal.Header className="px-6 py-4.5 border-b border-slate-100 flex-shrink-0 bg-white pr-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <Modal.Heading className="text-base font-bold text-industrial-dark font-heading">
                        Add Offline Customer / Inbound Lead
                      </Modal.Heading>
                      <p className="text-xs text-slate-500">
                        Record walk-in clients, direct phone calls, WhatsApp inquiries, and trade expo contacts into your CRM.
                      </p>
                    </div>
                  </div>
                </Modal.Header>

                <Modal.Body className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
                  {leadError && (
                    <Alert status="danger">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>Submission Error</Alert.Title>
                        <Alert.Description>{leadError}</Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                  {/* Surface 1: Customer Contact & Source */}
                  <Surface className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 bg-slate-50/70 border border-slate-200/80">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Customer Contact & Source</span>
                    </h4>

                    <Select
                      fullWidth
                      isRequired
                      value={leadForm.source}
                      onChange={(val) =>
                        setLeadForm((prev) => ({
                          ...prev,
                          source: (val as string) || "offline_walkin",
                        }))
                      }
                      aria-label="Customer / Lead Source"
                    >
                      <Label>Customer / Lead Source</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-[280px]">
                        <ListBox>
                          {[
                            { id: "offline_walkin", label: "Facility Walk-in / Direct Customer Visit" },
                            { id: "phone_call", label: "Inbound Phone Call / WhatsApp Inquiry" },
                            { id: "trade_expo", label: "Trade Show / Industrial Expo Exhibition" },
                            { id: "referral", label: "Customer / Vendor Referral" },
                            { id: "existing_client", label: "Existing Client Offline Re-order" },
                            { id: "other_offline", label: "Other Offline Channel" },
                          ].map((s) => (
                            <ListBox.Item key={s.id} id={s.id} textValue={s.label}>
                              {s.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <Description>Origin of customer interaction or lead source</Description>
                      <FieldError />
                    </Select>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField
                        isRequired
                        fullWidth
                        name="name"
                        value={leadForm.name}
                        onChange={(val) =>
                          setLeadForm((prev) => ({ ...prev, name: val }))
                        }
                        validate={(value) => {
                          if (!value || !value.trim()) {
                            return "Contact person / customer name is required";
                          }
                          return null;
                        }}
                      >
                        <Label>Contact Person / Customer Name</Label>
                        <Input placeholder="e.g. Rajesh Kumar" />
                        <Description>Primary contact person name</Description>
                        <FieldError />
                      </TextField>

                      <TextField
                        fullWidth
                        name="companyName"
                        value={leadForm.companyName}
                        onChange={(val) =>
                          setLeadForm((prev) => ({ ...prev, companyName: val }))
                        }
                      >
                        <Label>Company / Workshop Name</Label>
                        <Input placeholder="e.g. Precision Engineering Works" />
                        <Description>Registered company or shop</Description>
                        <FieldError />
                      </TextField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField
                        fullWidth
                        name="phone"
                        type="tel"
                        value={leadForm.phone}
                        onChange={(val) =>
                          setLeadForm((prev) => ({ ...prev, phone: val }))
                        }
                        validate={(val) => {
                          if (!leadForm.email.trim() && (!val || !val.trim())) {
                            return "Please enter at least a phone number or email address";
                          }
                          return null;
                        }}
                      >
                        <Label>Phone / WhatsApp Number</Label>
                        <Input placeholder="e.g. +91 98765 43210" />
                        <Description>WhatsApp or calling number</Description>
                        <FieldError />
                      </TextField>

                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={leadForm.email}
                        onChange={(val) =>
                          setLeadForm((prev) => ({ ...prev, email: val }))
                        }
                        validate={(val) => {
                          if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                            return "Please enter a valid email address";
                          }
                          return null;
                        }}
                      >
                        <Label>
                          Email Address{" "}
                          <span className="text-slate-400 font-normal text-[11px]">
                            (Optional for offline)
                          </span>
                        </Label>
                        <Input placeholder="e.g. purchase@precisionworks.com" />
                        <Description>Official RFQ or purchase email</Description>
                        <FieldError />
                      </TextField>
                    </div>
                  </Surface>

                  {/* Surface 2: Technical Interest & Requirements */}
                  <Surface className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 bg-slate-50/70 border border-slate-200/80">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Technical Interest & Gauging Requirements</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        fullWidth
                        value={leadForm.industry}
                        onChange={(val) =>
                          setLeadForm((prev) => ({
                            ...prev,
                            industry: (val as string) || "",
                          }))
                        }
                        aria-label="Industry Vertical"
                        placeholder="-- Select Industry --"
                      >
                        <Label>Industry Vertical</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="max-h-60 overflow-y-auto">
                          <ListBox>
                            {industries.map((ind) => (
                              <ListBox.Item key={ind.id} id={ind.name} textValue={ind.name}>
                                {ind.name}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                        <Description>Customer industry domain</Description>
                      </Select>

                      <Select
                        fullWidth
                        value={leadForm.productCategory}
                        onChange={(val) =>
                          setLeadForm((prev) => ({
                            ...prev,
                            productCategory: (val as string) || "",
                          }))
                        }
                        aria-label="Product Category"
                        placeholder="-- Select Category --"
                      >
                        <Label>Product Category</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="max-h-60 overflow-y-auto">
                          <ListBox>
                            {productCategories
                              .filter((c) => c.slug !== "all")
                              .map((cat) => (
                                <ListBox.Item key={cat.slug} id={cat.name} textValue={cat.name}>
                                  {cat.name}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                          </ListBox>
                        </Select.Popover>
                        <Description>Gauging product group</Description>
                      </Select>
                    </div>

                    <TextField
                      fullWidth
                      name="specificProduct"
                      value={leadForm.specificProduct}
                      onChange={(val) =>
                        setLeadForm((prev) => ({ ...prev, specificProduct: val }))
                      }
                    >
                      <Label>Specific Gauge / Tooling Model Interest</Label>
                      <Input placeholder="e.g. Air Plug Gauge Ø25H7, Electronic Snap Gauge, Column Unit" />
                      <Description>Exact bore diameter, tolerance class, or unit</Description>
                      <FieldError />
                    </TextField>

                    <TextField
                      fullWidth
                      name="notes"
                      value={leadForm.notes}
                      onChange={(val) =>
                        setLeadForm((prev) => ({ ...prev, notes: val }))
                      }
                    >
                      <Label>Customer Requirement / Discussion Notes</Label>
                      <TextArea
                        rows={3}
                        placeholder="Mention tolerances, bore depths, production quantities, or specific customer requests discussed..."
                      />
                      <Description>Technical specifications discussed during interaction</Description>
                      <FieldError />
                    </TextField>
                  </Surface>

                  {/* Surface 3: Immediate Follow-up Task Scheduling */}
                  <Surface className="p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 bg-emerald-50/50 border border-emerald-200/80">
                    <Checkbox
                      isSelected={leadForm.scheduleFollowup}
                      onChange={(isSelected) =>
                        setLeadForm((prev) => ({
                          ...prev,
                          scheduleFollowup: isSelected,
                        }))
                      }
                    >
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <span className="text-xs sm:text-sm font-semibold text-emerald-950">
                          Schedule immediate follow-up task for this lead
                        </span>
                      </Checkbox.Content>
                      <Description className="ml-7 text-[11px] text-slate-500">
                        Automatically creates an actionable task assigned to you in your CRM pipeline
                      </Description>
                    </Checkbox>

                    {leadForm.scheduleFollowup && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <DatePicker
                          granularity="day"
                          isRequired
                          value={leadFollowupDateValue}
                          onChange={(val) => {
                            setLeadFollowupDateValue(val);
                            if (val) {
                              try {
                                const tz = getLocalTimeZone();
                                const iso =
                                  "toDate" in val && typeof (val as any).toDate === "function"
                                    ? (val as any).toDate(tz).toISOString().slice(0, 10)
                                    : new Date(val.toString()).toISOString().slice(0, 10);
                                setLeadForm((prev) => ({ ...prev, followupDate: iso }));
                              } catch {
                                setLeadForm((prev) => ({ ...prev, followupDate: val.toString() }));
                              }
                            } else {
                              setLeadForm((prev) => ({ ...prev, followupDate: "" }));
                            }
                          }}
                          className="w-full"
                          aria-label="Follow-up Date"
                        >
                          <Label>Follow-up Date</Label>
                          <DateField.Group fullWidth>
                            <DateField.Input>
                              {(segment) => <DateField.Segment segment={segment} />}
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
                                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                </Calendar.GridHeader>
                                <Calendar.GridBody>
                                  {(date) => <Calendar.Cell date={date} />}
                                </Calendar.GridBody>
                              </Calendar.Grid>
                              <Calendar.YearPickerGrid>
                                <Calendar.YearPickerGridBody>
                                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                                </Calendar.YearPickerGridBody>
                              </Calendar.YearPickerGrid>
                            </Calendar>
                          </DatePicker.Popover>
                          <FieldError />
                        </DatePicker>

                        <Select
                          fullWidth
                          value={leadForm.followupType}
                          onChange={(val) =>
                            setLeadForm((prev) => ({
                              ...prev,
                              followupType: (val as FollowupType) || "call",
                            }))
                          }
                          aria-label="Action Type"
                        >
                          <Label>Action Type</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {[
                                { id: "call", label: "Phone Call" },
                                { id: "quotation", label: "Send Quotation" },
                                { id: "meeting", label: "Customer Visit" },
                                { id: "demo", label: "Product Demo" },
                                { id: "email", label: "Email Catalog" },
                              ].map((t) => (
                                <ListBox.Item key={t.id} id={t.id} textValue={t.label}>
                                  {t.label}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>

                        <Select
                          fullWidth
                          value={leadForm.followupPriority}
                          onChange={(val) =>
                            setLeadForm((prev) => ({
                              ...prev,
                              followupPriority: (val as FollowupPriority) || "medium",
                            }))
                          }
                          aria-label="Priority"
                        >
                          <Label>Priority</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {[
                                { id: "urgent", label: "Urgent" },
                                { id: "high", label: "High" },
                                { id: "medium", label: "Medium" },
                                { id: "low", label: "Low" },
                              ].map((p) => (
                                <ListBox.Item key={p.id} id={p.id} textValue={p.label}>
                                  {p.label}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>
                    )}
                  </Surface>
                </Modal.Body>

                <Modal.Footer className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onPress={resetLeadModal}
                    isDisabled={isSubmittingLead}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isPending={isSubmittingLead}
                    isDisabled={isSubmittingLead}
                    onPress={() => handleCreateLead()}
                    className="gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs px-5"
                  >
                    {({ isPending }) => (
                      <>
                        {isPending ? (
                          <Spinner size="sm" color="current" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span>Save Customer Lead</span>
                      </>
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* HeroUI Confirmation Dialog: Delete Invoice */}
        <AlertDialog.Backdrop
          isOpen={Boolean(deleteConfirmInvoice)}
          onOpenChange={(open) => {
            if (!open && !isDeletingInvoice) setDeleteConfirmInvoice(null);
          }}
          className="z-[70]"
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[440px]">
              <AlertDialog.CloseTrigger isDisabled={isDeletingInvoice} />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete Quotation / Invoice</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600">
                    Are you sure you want to permanently delete document{" "}
                    <strong className="text-slate-900 font-mono">
                      #{deleteConfirmInvoice?.invoiceNumber}
                    </strong>
                    {deleteConfirmInvoice?.customerName ? (
                      <>
                        {" "}for <strong className="text-slate-900">{deleteConfirmInvoice.customerName}</strong>
                      </>
                    ) : null}
                    ?
                  </p>
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    This action is permanent and will delete all associated line items and records. It cannot be undone.
                  </p>
                </div>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  onPress={() => setDeleteConfirmInvoice(null)}
                  isDisabled={isDeletingInvoice}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onPress={executeDeleteInvoice}
                  isDisabled={isDeletingInvoice}
                  className="gap-1.5"
                >
                  {isDeletingInvoice ? (
                    <Spinner size="sm" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Permanently</span>
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>

        {/* HeroUI Confirmation Dialog: Send Invoice */}
        <AlertDialog.Backdrop
          isOpen={Boolean(sendConfirmInvoice)}
          onOpenChange={(open) => {
            if (!open && !sendingInvoiceId) setSendConfirmInvoice(null);
          }}
          className="z-[70]"
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[460px]">
              <AlertDialog.CloseTrigger isDisabled={Boolean(sendingInvoiceId)} />
              <AlertDialog.Header>
                <AlertDialog.Icon status="accent" />
                <AlertDialog.Heading>Send Document to Customer</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <div className="space-y-3 text-sm">
                  <p className="text-slate-600">
                    You are about to dispatch formal quotation / invoice{" "}
                    <strong className="text-slate-900 font-mono">
                      #{sendConfirmInvoice?.invoiceNumber}
                    </strong>{" "}
                    directly to the customer.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Recipient:</span>
                      <strong className="text-slate-800">{sendConfirmInvoice?.customerName}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Email Address:</span>
                      <strong className="text-sky-700 font-mono">{sendConfirmInvoice?.customerEmail}</strong>
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    The document will be dispatched with standard Akira company terms and payment instructions.
                  </p>
                </div>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  onPress={() => setSendConfirmInvoice(null)}
                  isDisabled={Boolean(sendingInvoiceId)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={executeSendInvoice}
                  isDisabled={Boolean(sendingInvoiceId)}
                  className="gap-1.5 bg-sky-600 hover:bg-sky-500 text-white"
                >
                  {sendingInvoiceId ? (
                    <Spinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send Document</span>
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>

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
