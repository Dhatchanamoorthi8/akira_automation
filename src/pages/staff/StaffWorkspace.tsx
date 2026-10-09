import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone } from "@internationalized/date";
import { Trash2, Send } from "lucide-react";
import {
  PersonPlus,
  Pin,
  Receipt,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  CircleCheck,
  CircleExclamation,
  Megaphone,
  LocationArrow,
} from "@gravity-ui/icons";
import { useAuth } from "../../auth/useAuth";
import {
  FollowupWithEnquiry,
  EnquiryWithDetails,
  FollowupTimeframe,
  StaffAttendance,
  FieldVisit,
  Invoice,
} from "../../types/database";
import { Product } from "../../types";
import { followupService } from "../../services/followupService";
import { enquiryService } from "../../services/enquiryService";
import { attendanceService } from "../../services/attendanceService";
import { visitService } from "../../services/visitService";
import {
  invoiceService,
  CustomerSearchResult,
} from "../../services/invoiceService";
import { productService } from "../../services/productService";
import { SEOHead } from "../../components/layout/SEOHead";
import { AdminEnquiryDossierDrawer } from "../../components/admin/AdminEnquiryDossierDrawer";
import { InvoicePdfViewerModal } from "../../components/invoices/InvoicePdfViewerModal";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import {
  getExactCurrentPosition,
  formatAccuracy,
} from "../../utils/geolocation";

// Modularized components
import { StaffSidebar } from "./components/StaffSidebar";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { StaffAttendanceCard } from "./components/StaffAttendanceCard";
import { StaffStatCards } from "./components/StaffStatCards";
import { StaffWorkspaceTabs } from "./components/StaffWorkspaceTabs";
import { StaffFollowupsTab } from "./components/StaffFollowupsTab";
import { StaffEnquiriesTab } from "./components/StaffEnquiriesTab";
import { StaffVisitsTab } from "./components/StaffVisitsTab";
import { StaffInvoicesTab } from "./components/StaffInvoicesTab";
import { StaffDynamicFormScreen } from "./components/forms/StaffDynamicFormScreen";

// Modal components
import { CompleteFollowupModal } from "./components/modals/CompleteFollowupModal";
import { ConvertLeadModal } from "./components/modals/ConvertLeadModal";
import { CloseLeadModal } from "./components/modals/CloseLeadModal";
import { CompleteVisitModal } from "./components/modals/CompleteVisitModal";

// Types & constants
import {
  WorkspaceTab,
  FormViewType,
  StaffStats,
  CreateFollowupFormData,
  LeadFormData,
  DealFormData,
  VisitFormData,
  InvoiceFormData,
  ActionFeedbackState,
  DeleteConfirmInvoiceState,
  SendConfirmInvoiceState,
} from "./types";
import { LOST_REASONS } from "./constants";

export const StaffWorkspace: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // URL search parameter synchronization for active tab
  const [searchParams] = useSearchParams();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("akira_staff_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("akira_staff_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const { tab: routeTab } = useParams<{ tab?: string }>();
  const location = useLocation();

  const validTabs: WorkspaceTab[] = [
    "overview",
    "followups",
    "enquiries",
    "visits",
    "invoices",
  ];

  const resolveActiveTab = useCallback((): WorkspaceTab => {
    if (routeTab && validTabs.includes(routeTab as WorkspaceTab)) {
      return routeTab as WorkspaceTab;
    }
    // Also parse from pathname (e.g. /staff/invoices, /staff/followups, /stafft/overview)
    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] as WorkspaceTab;
    if (lastSegment && validTabs.includes(lastSegment)) {
      return lastSegment;
    }
    const tabParam = searchParams.get("tab") as WorkspaceTab | null;
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "overview";
  }, [routeTab, location.pathname, searchParams]);

  const [activeTab, setActiveTabState] = useState<WorkspaceTab>(resolveActiveTab);
  const [activeFormView, setActiveFormView] = useState<FormViewType | null>(null);

  // Sync state if URL changes externally (e.g. browser back/forward, route change)
  useEffect(() => {
    const currentTab = resolveActiveTab();
    if (currentTab !== activeTab) {
      setActiveTabState(currentTab);
    }
    // CRITICAL: Whenever navigation occurs or URL changes, dismiss open forms so the tab content renders
    setActiveFormView(null);
  }, [location.pathname, routeTab, searchParams, resolveActiveTab]);

  const handleTabChange = useCallback(
    (tab: WorkspaceTab) => {
      // 1. Immediately dismiss any open form screen so the tab's related content is shown!
      setActiveFormView(null);
      // 2. Set active tab state
      setActiveTabState(tab);
      // 3. Clean React Router navigation to /staff/:tab
      navigate(`/staff/${tab}`);
    },
    [navigate]
  );

  const [timeframe, setTimeframe] = useState<FollowupTimeframe>("today");

  // Attendance state
  const [todayAttendance, setTodayAttendance] =
    useState<StaffAttendance | null>(null);
  const [isClocking, setIsClocking] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState<string | null>(null);

  // Core entities state
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [followupTotal, setFollowupTotal] = useState(0);
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(true);

  const [enquiries, setEnquiries] = useState<EnquiryWithDetails[]>([]);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(true);

  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [visitTotal, setVisitTotal] = useState(0);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  // Quick stats counts
  const [stats, setStats] = useState<StaffStats>({
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

  const [createForm, setCreateForm] = useState<CreateFollowupFormData>({
    enquiryId: "",
    title: "",
    scheduledAt: "",
    type: "call",
    priority: "medium",
    notes: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [followupDateValue, setFollowupDateValue] =
    useState<DateValue | null>(null);

  // Lead Conversion Modal State
  const [convertingEnquiry, setConvertingEnquiry] =
    useState<EnquiryWithDetails | null>(null);
  const [dealForm, setDealForm] = useState<DealFormData>({
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

  const [leadForm, setLeadForm] = useState<LeadFormData>({
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
    followupType: "call",
    followupPriority: "medium",
  });
  const [leadFollowupDateValue, setLeadFollowupDateValue] =
    useState<DateValue | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const [visitDateValue, setVisitDateValue] = useState<DateValue | null>(null);
  const [visitForm, setVisitForm] = useState<VisitFormData>({
    enquiryId: "",
    title: "",
    visitPurpose: "consultation",
    scheduledAt: "",
    customerContactPerson: "",
    notes: "",
  });
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  // Complete Visit Modal State
  const [completingVisit, setCompletingVisit] = useState<FieldVisit | null>(null);
  const [visitOutcomeNotes, setVisitOutcomeNotes] = useState("");
  const [visitPhotoUrl, setVisitPhotoUrl] = useState("");
  const [isSubmittingVisitComplete, setIsSubmittingVisitComplete] =
    useState(false);
  const [visitCompleteError, setVisitCompleteError] = useState<string | null>(
    null,
  );
  const [isCheckingInVisitId, setIsCheckingInVisitId] = useState<string | null>(
    null,
  );

  const [productCatalog, setProductCatalog] = useState<Product[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<
    CustomerSearchResult[]
  >([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>({
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
  const [deleteConfirmInvoice, setDeleteConfirmInvoice] =
    useState<DeleteConfirmInvoiceState | null>(null);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);

  const [sendConfirmInvoice, setSendConfirmInvoice] =
    useState<SendConfirmInvoiceState | null>(null);

  // HeroUI Action Feedback state
  const [actionFeedback, setActionFeedback] =
    useState<ActionFeedbackState | null>(null);

  // Auto-dismiss feedback message after 5 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => {
        setActionFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Load product catalog for invoice generation
  useEffect(() => {
    productService
      .getProducts()
      .then(setProductCatalog)
      .catch(() => {});
  }, []);

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
      followupType: "call",
      followupPriority: "medium",
    });
    setLeadFollowupDateValue(null);
    setLeadError(null);
  };

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
    setActiveFormView("invoice");
  };

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
  }, [user?.id, timeframe, profile?.role]);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleClockIn = async (status: "present" | "on_field" = "present") => {
    if (!user?.id || isClocking) return;
    setIsClocking(true);
    setAttendanceMsg("Acquiring exact GPS coordinates & address...");

    const geoResult = await getExactCurrentPosition();
    const loc = geoResult.location;

    // For field engineers, verified GPS coordinates are mandatory for on_field punch
    if (!loc && status === "on_field") {
      setIsClocking(false);
      setActionFeedback({
        status: "danger",
        title: "Exact Location Required",
        message:
          geoResult.error ||
          "On-field attendance requires verified GPS coordinates. Please allow browser location access in device settings.",
      });
      return;
    }

    const res = await attendanceService.clockIn({
      staffId: user.id,
      status,
      coords: loc ? { lat: loc.lat, lng: loc.lng } : null,
      address: loc?.address || null,
      notes: loc
        ? `${loc.address ? `${loc.address} • ` : ""}GPS: ${loc.formattedCoords} (${formatAccuracy(loc.accuracy)})`
        : "Location not shared (Office IP default)",
    });

    setIsClocking(false);
    if (res.error) {
      setAttendanceMsg(`Notice: ${res.error}`);
    } else {
      setTodayAttendance(res.attendance);
      setAttendanceMsg(
        `Clocked in as ${status === "on_field" ? "On Field" : "Present"} successfully.${
          loc ? ` Location: ${loc.address || loc.formattedCoords}` : ""
        }`,
      );
      setTimeout(() => setAttendanceMsg(null), 5000);
    }
  };

  const handleClockOut = async () => {
    if (!todayAttendance || isClocking) return;
    setIsClocking(true);
    setAttendanceMsg("Acquiring clock-out GPS location & address...");

    const geoResult = await getExactCurrentPosition();
    const loc = geoResult.location;

    const res = await attendanceService.clockOut({
      attendanceId: todayAttendance.id,
      coords: loc ? { lat: loc.lat, lng: loc.lng } : null,
      address: loc?.address || null,
    });

    setIsClocking(false);
    if (res.error) {
      setAttendanceMsg(`Error: ${res.error}`);
    } else {
      setTodayAttendance(res.attendance);
      setAttendanceMsg(
        `Clocked out successfully.${
          loc ? ` Location: ${loc.address || loc.formattedCoords}` : ""
        }`,
      );
      setTimeout(() => setAttendanceMsg(null), 5000);
    }
  };

  const handleCheckInVisit = async (visitId: string) => {
    setIsCheckingInVisitId(visitId);
    setActionFeedback({
      status: "accent",
      title: "Capturing Site GPS Location...",
      message: "Acquiring satellite GPS coordinates & client address...",
    });

    try {
      const geoResult = await getExactCurrentPosition();
      const loc = geoResult.location;

      if (!loc) {
        setActionFeedback({
          status: "danger",
          title: "Exact Location Required for Site Check-in",
          message:
            geoResult.error ||
            "Could not acquire your current GPS coordinates. Please ensure device GPS is turned on and browser permissions are granted.",
        });
        return;
      }

      const res = await visitService.checkInVisit(
        visitId,
        { lat: loc.lat, lng: loc.lng },
        loc.address,
      );

      if (res.success) {
        setActionFeedback({
          status: "success",
          title: "Site Check-in Verified",
          message: `Checked in at ${loc.address || loc.formattedCoords}`,
        });
        loadStaffData();
      } else {
        setActionFeedback({
          status: "danger",
          title: "Check-in Failed",
          message: res.error || "Unable to check in to visit.",
        });
      }
    } finally {
      setIsCheckingInVisitId(null);
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled visit?"))
      return;
    const res = await visitService.cancelVisit(
      visitId,
      "Cancelled by field engineer",
    );
    if (res.success) {
      loadStaffData();
    } else {
      setActionFeedback({
        status: "danger",
        title: "Cancel Visit Failed",
        message: res.error || "Unable to cancel visit.",
      });
    }
  };

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

  const handleDeleteInvoice = async (
    invoiceId: string,
    invoiceNumber?: string,
  ) => {
    const inv = invoices.find((i) => i.id === invoiceId) || viewingPdfInvoice;
    promptDeleteInvoice({
      id: invoiceId,
      invoice_number: invoiceNumber || inv?.invoice_number,
      customer_name: inv?.customer_name,
    });
  };

  const handleDirectDownloadPdf = async (inv: Invoice) => {
    await handleViewInvoice(inv);
  };

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledAtValue = (() => {
      if (followupDateValue) {
        try {
          const tz = getLocalTimeZone();
          return "toDate" in followupDateValue &&
            typeof (followupDateValue as any).toDate === "function"
            ? (followupDateValue as any).toDate(tz).toISOString()
            : new Date(followupDateValue.toString()).toISOString();
        } catch {
          return followupDateValue.toString();
        }
      }
      return createForm.scheduledAt;
    })();

    if (!createForm.enquiryId || !scheduledAtValue) {
      setCreateError("Enquiry selection and scheduled date are required.");
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError(null);

    const res = await followupService.createFollowup({
      enquiryId: createForm.enquiryId,
      title: createForm.title.trim() || "Follow-up on inquiry",
      scheduledAt: scheduledAtValue,
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
      setActiveFormView((prev) => (prev === "followup" ? null : prev));
      setFollowupDateValue(null);
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
      const emailVal = leadForm.email.trim()
        ? leadForm.email.trim().toLowerCase()
        : `${leadForm.phone.trim().replace(/[^0-9]/g, "") || "lead"}_${Date.now()}@offline.akira`;

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
      setActiveFormView((prev) => (prev === "lead" ? null : prev));

      setActionFeedback({
        status: "success",
        title: "Customer Lead Added",
        message: `Customer "${savedCustomerName}" has been added to your CRM pipeline successfully.`,
      });

      await loadStaffData();
    } catch (err: unknown) {
      console.error("Create lead error:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the offline customer.";
      setLeadError(errMsg);
    } finally {
      setIsSubmittingLead(false);
    }
  };

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
      setActiveFormView((prev) => (prev === "visit" ? null : prev));
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

    const geoResult = await getExactCurrentPosition();
    const loc = geoResult.location;

    if (!loc) {
      setIsSubmittingVisitComplete(false);
      setVisitCompleteError(
        geoResult.error ||
          "Could not acquire your current GPS coordinates for site checkout. Please ensure GPS is enabled and allow browser location access.",
      );
      return;
    }

    const photos = visitPhotoUrl.trim() ? [visitPhotoUrl.trim()] : [];

    const res = await visitService.checkOutVisit(
      completingVisit.id,
      { lat: loc.lat, lng: loc.lng },
      visitOutcomeNotes.trim(),
      photos,
      undefined,
      loc.address,
    );

    setIsSubmittingVisitComplete(false);
    if (res.error) {
      setVisitCompleteError(res.error);
    } else {
      setCompletingVisit(null);
      setVisitOutcomeNotes("");
      setVisitPhotoUrl("");
      setActionFeedback({
        status: "success",
        title: "Visit Completed",
        message: `Site departure verified at ${loc.address || loc.formattedCoords}`,
      });
      loadStaffData();
    }
  };

  const handleCreateInvoiceSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!invoiceForm.customerName.trim() || !invoiceForm.customerEmail.trim()) {
      setInvoiceErrorMsg("Customer name and email are required.");
      return;
    }

    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        invoiceForm.customerEmail.trim(),
      )
    ) {
      setInvoiceErrorMsg("Please enter a valid email address.");
      return;
    }

    const hasInvalidItem = invoiceForm.items.some(
      (i) => !i.description.trim() || i.quantity < 1,
    );
    if (hasInvalidItem) {
      setInvoiceErrorMsg(
        "Every line item must have a valid description and a quantity of at least 1.",
      );
      return;
    }

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
        resetInvoiceForm();
        setActiveFormView((prev) => (prev === "invoice" ? null : prev));
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
      resetInvoiceForm();
      setActiveFormView((prev) => (prev === "invoice" ? null : prev));
      await loadStaffData();
      if (res.invoice) {
        const fresh = await invoiceService.getInvoiceById(res.invoice.id);
        setViewingPdfInvoice(fresh.invoice || res.invoice);
        setActionFeedback({
          status: "success",
          title: "Invoice Created",
          message: `${
            res.invoice.type === "quotation"
              ? "Formal Quotation"
              : "Tax Invoice"
          } #${res.invoice.invoice_number} generated successfully with line items.`,
        });
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Staff Workspace | Akira Precision Automation"
        description="Assigned tasks, client inquiries, field visits, and invoice management for sales engineers."
        noIndex={true}
      />

      <div className="min-h-screen bg-[#F8F9FA] flex text-slate-800 font-sans antialiased">
        {/* Desktop Sticky Rail + Mobile Slide-over Drawer */}
        <StaffSidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          stats={stats}
          followupTotal={followupTotal}
          enquiryTotal={enquiryTotal}
          visitTotal={visitTotal}
          invoiceTotal={invoiceTotal}
          userName={profile?.full_name}
          userEmail={user?.email}
          role={profile?.role}
          isAdmin={profile?.role === "admin"}
          onSignOut={handleSignOut}
          onOpenFollowupModal={() => setActiveFormView("followup")}
          onOpenVisitModal={() => setActiveFormView("visit")}
          onOpenInvoiceModal={() => {
            resetInvoiceForm();
            setActiveFormView("invoice");
          }}
          onOpenAddLeadModal={() => setActiveFormView("lead")}
          todayAttendance={todayAttendance}
          isClocking={isClocking}
        />

        {/* Main Workspace Column */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Admin panel Header used in staff panel Header */}
          <AdminHeader
            portal="staff"
            activeTab={activeTab}
            userName={profile?.full_name}
            userEmail={user?.email || undefined}
            role={profile?.role}
            isAdmin={profile?.role === "admin"}
            onSignOut={handleSignOut}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={handleToggleSidebarCollapse}
          />

          {/* Main Workspace Area */}
          <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
            {activeFormView ? (
              <StaffDynamicFormScreen
                formType={activeFormView}
                onClose={() => {
                  setActiveFormView(null);
                }}
                enquiries={enquiries}
                leadForm={leadForm}
                setLeadForm={setLeadForm}
                leadFollowupDateValue={leadFollowupDateValue}
                setLeadFollowupDateValue={setLeadFollowupDateValue}
                isSubmittingLead={isSubmittingLead}
                leadError={leadError}
                onSubmitLead={handleCreateLead}
                visitForm={visitForm}
                setVisitForm={setVisitForm}
                visitDateValue={visitDateValue}
                setVisitDateValue={setVisitDateValue}
                isSubmittingVisit={isSubmittingVisit}
                visitError={visitError}
                onSubmitVisit={handleCreateVisitSubmit}
                editingInvoice={editingInvoice}
                invoiceForm={invoiceForm}
                setInvoiceForm={setInvoiceForm}
                productCatalog={productCatalog}
                customerSearchQuery={customerSearchQuery}
                customerSuggestions={customerSuggestions}
                isSearchingCustomers={isSearchingCustomers}
                handleCustomerSearch={handleCustomerSearch}
                handleSelectCustomer={handleSelectCustomer}
                isSubmittingInvoice={isSubmittingInvoice}
                invoiceErrorMsg={invoiceErrorMsg}
                setInvoiceErrorMsg={setInvoiceErrorMsg}
                onSubmitInvoice={handleCreateInvoiceSubmit}
                createFollowupForm={createForm}
                setCreateFollowupForm={setCreateForm}
                followupDateValue={followupDateValue}
                setFollowupDateValue={setFollowupDateValue}
                isSubmittingFollowup={isSubmittingCreate}
                followupError={createError}
                onSubmitFollowup={handleCreateSubmit}
              />
            ) : (
              <>
                {/* VIEW 1: Overview Dashboard (renders on default /staff or when activeTab === "overview") */}
                {activeTab === "overview" && (
                  <>
                    {/* Top Banner: ERP Attendance Widget */}
                    <StaffAttendanceCard
                      isAdmin={profile?.role === "admin"}
                      todayAttendance={todayAttendance}
                      isClocking={isClocking}
                      attendanceMsg={attendanceMsg}
                      onClockIn={handleClockIn}
                      onClockOut={handleClockOut}
                    />

                    {/* Welcome & Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                          Sales & Field Workspace
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage inquiries, follow-up calls, field visits with GPS, and customer billing.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => setActiveFormView("lead")}
                          className="gap-2 text-xs font-semibold bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-2xs cursor-pointer w-full sm:w-auto justify-center rounded-2xl h-9"
                        >
                          <PersonPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Add Customer</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => setActiveFormView("visit")}
                          className="gap-2 text-xs font-semibold bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer w-full sm:w-auto justify-center rounded-2xl h-9"
                        >
                          <Pin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Schedule Visit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => {
                            resetInvoiceForm();
                            setActiveFormView("invoice");
                          }}
                          className="gap-2 text-xs font-semibold bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer w-full sm:w-auto justify-center rounded-2xl h-9"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Create Invoice</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => setActiveFormView("followup")}
                          className="gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 shadow-2xs text-white cursor-pointer w-full sm:w-auto justify-center rounded-2xl h-9"
                        >
                          <Plus className="w-3.5 h-3.5 shrink-0" />
                          <span>Follow-up</span>
                        </Button>
                      </div>
                    </div>

                    {/* Operational Counts Strip */}
                    <StaffStatCards
                      stats={stats}
                      visitTotal={visitTotal}
                      invoiceTotal={invoiceTotal}
                    />

                    {/* Navigation Tabs */}
                    <StaffWorkspaceTabs
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      followupTotal={followupTotal}
                      enquiryTotal={enquiryTotal}
                      visitTotal={visitTotal}
                      invoiceTotal={invoiceTotal}
                    />

                    {/* Overview Follow-up Tasks Queue */}
                    <StaffFollowupsTab
                      timeframe={timeframe}
                      onTimeframeChange={setTimeframe}
                      followups={followups}
                      isLoading={isLoadingFollowups}
                      onOpenDossier={handleOpenDossier}
                      onStartCompleteTask={(item) => {
                        setCompletingTask(item);
                        setOutcomeNotes("");
                        setScheduleNext(false);
                        setNextDate("");
                        setCompleteError(null);
                      }}
                    />
                  </>
                )}

                {/* VIEW 2: Follow-ups Page (ONLY follow-up related content) */}
                {activeTab === "followups" && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                          Follow-up Tasks
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage scheduled customer touchpoints, telephone calls, and pipeline reminders.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => setActiveFormView("followup")}
                        className="gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 shadow-2xs text-white cursor-pointer rounded-2xl h-9 px-4"
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>Follow-up</span>
                      </Button>
                    </div>

                    {/* Focused Follow-up Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-blue-700">Due Today</span>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-700 font-mono">
                            {stats.dueToday}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Scheduled today</span>
                        </div>
                      </Card>

                      <Card className={`rounded-2xl p-4 shadow-2xs border ${stats.overdue > 0 ? "bg-rose-50/50 border-rose-200/90" : "bg-white border-slate-200/70"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${stats.overdue > 0 ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200/70"}`}>
                              <CircleExclamation className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-rose-700">Overdue</span>
                          </div>
                          {stats.overdue > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-700 font-mono">
                            {stats.overdue}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Requires urgent action</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                              <CalendarIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Upcoming</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {stats.upcoming}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Future touchpoints</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                              <CircleCheck className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Completed</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {stats.completed}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Logged outcomes</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Total Queue</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {followupTotal}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Assigned follow-ups</span>
                        </div>
                      </Card>
                    </div>

                    <StaffWorkspaceTabs
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      followupTotal={followupTotal}
                      enquiryTotal={enquiryTotal}
                      visitTotal={visitTotal}
                      invoiceTotal={invoiceTotal}
                    />

                    <StaffFollowupsTab
                      timeframe={timeframe}
                      onTimeframeChange={setTimeframe}
                      followups={followups}
                      isLoading={isLoadingFollowups}
                      onOpenDossier={handleOpenDossier}
                      onStartCompleteTask={(item) => {
                        setCompletingTask(item);
                        setOutcomeNotes("");
                        setScheduleNext(false);
                        setNextDate("");
                        setCompleteError(null);
                      }}
                    />
                  </>
                )}

                {/* VIEW 3: Inquiries Page (ONLY inquiry related content) */}
                {activeTab === "enquiries" && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                          Client Inquiries & RFQs
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Track inbound customer specifications, RFQ requests, and sales pipeline stages.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => setActiveFormView("lead")}
                        className="gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 shadow-2xs text-white cursor-pointer rounded-2xl h-9 px-4"
                      >
                        <PersonPlus className="w-3.5 h-3.5 shrink-0" />
                        <span>Add Customer</span>
                      </Button>
                    </div>

                    {/* Focused Inquiries Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                              <Megaphone className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">New RFQs</span>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {stats.myNewEnquiries}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Uncontacted leads</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Contacted</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {enquiries.filter((e) => e.status === "contacted").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Under discussion</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                              <CircleCheck className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Converted</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {enquiries.filter((e) => e.status === "converted").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Deals won</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                              <Megaphone className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Total Inquiries</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {enquiryTotal}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Assigned in pipeline</span>
                        </div>
                      </Card>
                    </div>

                    <StaffWorkspaceTabs
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      followupTotal={followupTotal}
                      enquiryTotal={enquiryTotal}
                      visitTotal={visitTotal}
                      invoiceTotal={invoiceTotal}
                    />

                    <StaffEnquiriesTab
                      enquiries={enquiries}
                      isLoading={isLoadingEnquiries}
                      onOpenAddLeadModal={() => setActiveFormView("lead")}
                      onScheduleFollowup={(enq) => {
                        setCreateForm({
                          enquiryId: enq.id,
                          title: `Follow-up: ${enq.company || enq.name}`,
                          scheduledAt: new Date().toISOString().slice(0, 16),
                          type: "call",
                          priority: "high",
                          notes: `Follow-up on inquiry: ${enq.specific_product || enq.product_category || "General requirement"}`,
                        });
                        setActiveFormView("followup");
                      }}
                      onScheduleVisit={(enq) => {
                        setVisitForm({
                          enquiryId: enq.id,
                          title: `Site Visit: ${enq.company || enq.name}`,
                          visitPurpose: "consultation",
                          scheduledAt: "",
                          customerContactPerson: enq.name,
                          notes: enq.requirement || "",
                        });
                        setActiveFormView("visit");
                      }}
                      onCreateQuote={(enq) => {
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
                        setActiveFormView("invoice");
                      }}
                      onConvertLead={(enq) => {
                        setConvertingEnquiry(enq);
                        setDealForm({
                          dealTitle: `${enq.company || enq.name} - ${enq.specific_product || "Gauging Requirement"}`,
                          dealValue: "",
                          expectedCloseDate: "",
                          notes: "",
                        });
                      }}
                      onCloseLead={(enq) => {
                        setClosingEnquiry(enq);
                        setLostReason(LOST_REASONS[0]);
                        setLostNotes("");
                      }}
                      onOpenDossier={handleOpenDossier}
                    />
                  </>
                )}

                {/* VIEW 4: Field Visits Page (ONLY field visits related content) */}
                {activeTab === "visits" && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                          Field Visits & GPS Inspections
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          GPS-verified on-site client visits, metrology audits, and dimension verification demos.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => setActiveFormView("visit")}
                        className="gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 shadow-2xs text-white cursor-pointer rounded-2xl h-9 px-4"
                      >
                        <Pin className="w-3.5 h-3.5 shrink-0" />
                        <span>Schedule Visit</span>
                      </Button>
                    </div>

                    {/* Focused Field Visits Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                              <LocationArrow className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Site Visits</span>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {visitTotal}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Client site inspections</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Scheduled</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {visits.filter((v) => v.status === "scheduled").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting inspection</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                              <Pin className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">In Progress</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {visits.filter((v) => v.status === "in_progress").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">GPS checked-in</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                              <CircleCheck className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Completed</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {visits.filter((v) => v.status === "completed").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Verified demos</span>
                        </div>
                      </Card>
                    </div>

                    <StaffWorkspaceTabs
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      followupTotal={followupTotal}
                      enquiryTotal={enquiryTotal}
                      visitTotal={visitTotal}
                      invoiceTotal={invoiceTotal}
                    />

                    <StaffVisitsTab
                      visits={visits}
                      isCheckingInId={isCheckingInVisitId}
                      onOpenScheduleModal={() => setActiveFormView("visit")}
                      onCancelVisit={handleCancelVisit}
                      onCheckInVisit={handleCheckInVisit}
                      onStartCompleteVisit={(vis) => {
                        setCompletingVisit(vis);
                        setVisitOutcomeNotes("");
                        setVisitPhotoUrl("");
                        setVisitCompleteError(null);
                      }}
                    />
                  </>
                )}

                {/* VIEW 5: Invoices Page (ONLY invoices related content) */}
                {activeTab === "invoices" && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                          Invoices & Formal Quotations
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Generate proforma quotations, GST tax invoices, customer dispatch, and billing status.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => {
                          resetInvoiceForm();
                          setActiveFormView("invoice");
                        }}
                        className="gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 shadow-2xs text-white cursor-pointer rounded-2xl h-9 px-4"
                      >
                        <Receipt className="w-3.5 h-3.5 shrink-0" />
                        <span>Create Invoice</span>
                      </Button>
                    </div>

                    {/* Focused Invoices Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                              <Receipt className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Invoices</span>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {invoiceTotal}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Formal quotes & billing</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                              <Receipt className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Quotations</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {invoices.filter((i) => i.type === "quotation").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Price proposals</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                              <Receipt className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Tax Invoices</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {invoices.filter((i) => i.type === "tax_invoice").length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">GST billings</span>
                        </div>
                      </Card>

                      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                              <CircleCheck className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">Dispatched</span>
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                            {invoices.filter((i) => !!i.sent_at).length}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Sent to clients</span>
                        </div>
                      </Card>
                    </div>

                    <StaffWorkspaceTabs
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      followupTotal={followupTotal}
                      enquiryTotal={enquiryTotal}
                      visitTotal={visitTotal}
                      invoiceTotal={invoiceTotal}
                    />

                    <StaffInvoicesTab
                      invoices={invoices}
                      actionFeedback={actionFeedback}
                      onDismissFeedback={() => setActionFeedback(null)}
                      onOpenCreateInvoice={() => {
                        resetInvoiceForm();
                        setActiveFormView("invoice");
                      }}
                      onViewInvoice={handleViewInvoice}
                      onDownloadPdf={handleDirectDownloadPdf}
                      onEditInvoice={handleStartEditInvoice}
                      onSendInvoice={handleSendInvoice}
                      onDeleteInvoice={handleDeleteInvoice}
                      sendingInvoiceId={sendingInvoiceId}
                    />
                  </>
                )}
              </>
            )}
          </main>


        {/* Modal 1: Complete Follow-up Modal */}
        {completingTask && (
          <CompleteFollowupModal
            task={completingTask}
            outcomeNotes={outcomeNotes}
            setOutcomeNotes={setOutcomeNotes}
            scheduleNext={scheduleNext}
            setScheduleNext={setScheduleNext}
            nextDate={nextDate}
            setNextDate={setNextDate}
            isSubmitting={isSubmittingComplete}
            error={completeError}
            onClose={() => setCompletingTask(null)}
            onSubmit={handleCompleteSubmit}
          />
        )}


        {/* Modal 3: Convert Lead to Deal */}
        {convertingEnquiry && (
          <ConvertLeadModal
            enquiry={convertingEnquiry}
            dealForm={dealForm}
            setDealForm={setDealForm}
            isSubmitting={isSubmittingConversion}
            error={conversionError}
            onClose={() => setConvertingEnquiry(null)}
            onSubmit={handleConvertSubmit}
          />
        )}

        {/* Modal 4: Close Lead (Lost Reason) */}
        {closingEnquiry && (
          <CloseLeadModal
            enquiry={closingEnquiry}
            lostReason={lostReason}
            setLostReason={setLostReason}
            lostNotes={lostNotes}
            setLostNotes={setLostNotes}
            isSubmitting={isSubmittingClosure}
            error={closureError}
            onClose={() => setClosingEnquiry(null)}
            onSubmit={handleCloseSubmit}
          />
        )}


        {/* Modal 6: Complete Field Visit */}
        {completingVisit && (
          <CompleteVisitModal
            visit={completingVisit}
            outcomeNotes={visitOutcomeNotes}
            setOutcomeNotes={setVisitOutcomeNotes}
            photoUrl={visitPhotoUrl}
            setPhotoUrl={setVisitPhotoUrl}
            isSubmitting={isSubmittingVisitComplete}
            error={visitCompleteError}
            onClose={() => setCompletingVisit(null)}
            onSubmit={handleCompleteVisitSubmit}
          />
        )}


        {/* Modal 8: View PDF Invoice / Formal Quotation */}
        {viewingPdfInvoice && (
          <InvoicePdfViewerModal
            isOpen={!!viewingPdfInvoice}
            invoice={viewingPdfInvoice}
            onClose={() => setViewingPdfInvoice(null)}
            onEdit={(inv) => handleStartEditInvoice(inv)}
            onDelete={(id) =>
              handleDeleteInvoice(id, viewingPdfInvoice.invoice_number)
            }
            onSendEmail={(id) => handleSendInvoice(id)}
            isSendingEmail={!!sendingInvoiceId}
          />
        )}


        {/* Reusable HeroUI Confirmation Dialog: Delete Invoice */}
        <ConfirmationDialog
          isOpen={Boolean(deleteConfirmInvoice)}
          onClose={() => {
            if (!isDeletingInvoice) setDeleteConfirmInvoice(null);
          }}
          onConfirm={executeDeleteInvoice}
          title="Delete Quotation / Invoice"
          status="danger"
          confirmText="Delete Permanently"
          cancelText="Cancel"
          confirmVariant="danger"
          confirmIcon={<Trash2 className="w-4 h-4" />}
          isPending={isDeletingInvoice}
          description={
            <div className="space-y-2 text-sm">
              <p className="text-slate-600">
                Are you sure you want to permanently delete document{" "}
                <strong className="text-slate-900 font-mono">
                  #{deleteConfirmInvoice?.invoiceNumber}
                </strong>
                {deleteConfirmInvoice?.customerName ? (
                  <>
                    {" "}for{" "}
                    <strong className="text-slate-900">
                      {deleteConfirmInvoice.customerName}
                    </strong>
                  </>
                ) : null}
                ?
              </p>
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                This action is permanent and will delete all associated line items and records. It cannot be undone.
              </p>
            </div>
          }
        />

        {/* Reusable HeroUI Confirmation Dialog: Send Invoice */}
        <ConfirmationDialog
          isOpen={Boolean(sendConfirmInvoice)}
          onClose={() => {
            if (!sendingInvoiceId) setSendConfirmInvoice(null);
          }}
          onConfirm={executeSendInvoice}
          title="Send Document to Customer"
          status="accent"
          confirmText="Send Document"
          cancelText="Cancel"
          confirmVariant="primary"
          confirmIcon={<Send className="w-4 h-4" />}
          isPending={Boolean(sendingInvoiceId)}
          description={
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
                  <strong className="text-slate-800">
                    {sendConfirmInvoice?.customerName}
                  </strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Email Address:</span>
                  <strong className="text-sky-700 font-mono">
                    {sendConfirmInvoice?.customerEmail}
                  </strong>
                </p>
              </div>
              <p className="text-xs text-slate-500">
                The document will be dispatched with standard Akira company terms and payment instructions.
              </p>
            </div>
          }
        />

        {/* Drawer: Enquiry Dossier Drawer */}
        <AdminEnquiryDossierDrawer
          enquiry={selectedDossierEnquiry}
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
        />
        </div>
      </div>
    </>
  );
};

export default StaffWorkspace;
