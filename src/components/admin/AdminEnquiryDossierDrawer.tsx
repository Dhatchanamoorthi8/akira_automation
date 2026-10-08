import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  Card,
  Chip,
  Button,
  Modal,
  Input,
  TextArea,
  Label,
  Surface,
  TextField,
} from "@heroui/react";
import {
  Mail,
  Phone,
  Building2,
  Send,
  Edit2,
  ChevronDown,
  Check,
  CheckCircle2,
  UserX,
  ExternalLink,
  Loader2,
  Save,
} from "lucide-react";
import {
  EnquiryWithDetails,
  EnquiryStatus,
  StaffProfile,
} from "../../types/database";
import { formatDate, formatDateTimeDDMMYYYY } from "../../utils/date";
import { PersonAvatar, CompanyAvatar } from "../../utils/avatarHelper";
import { enquiryService } from "../../services/enquiryService";
import { Pencil } from "@gravity-ui/icons";

export const STATUS_PALETTE: Record<
  EnquiryStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    hoverBg: string;
  }
> = {
  new: {
    label: "New RFQ",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    hoverBg: "hover:bg-blue-50/80",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    hoverBg: "hover:bg-amber-50/80",
  },
  quotation_sent: {
    label: "Quotation Sent",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
    hoverBg: "hover:bg-purple-50/80",
  },
  follow_up: {
    label: "Follow-up",
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
    hoverBg: "hover:bg-cyan-50/80",
  },
  converted: {
    label: "Converted",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    hoverBg: "hover:bg-emerald-50/80",
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
    hoverBg: "hover:bg-slate-100/80",
  },
};

const ALL_STATUS_OPTIONS: EnquiryStatus[] = [
  "new",
  "contacted",
  "quotation_sent",
  "follow_up",
  "converted",
  "closed",
];

interface AdminEnquiryDossierDrawerProps {
  enquiry: EnquiryWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: EnquiryStatus) => Promise<void>;
  onAssignStaff?: (
    id: string,
    profileId: string | null,
    staffProfile?: StaffProfile | null,
  ) => Promise<void>;
  onEnquiryUpdated?: (updated: EnquiryWithDetails) => void;
  staffProfiles?: StaffProfile[];
}

export const AdminEnquiryDossierDrawer: React.FC<
  AdminEnquiryDossierDrawerProps
> = ({
  enquiry: initialEnquiry,
  isOpen,
  onClose,
  onStatusChange: _onStatusChange,
  onAssignStaff: _onAssignStaff,
  onEnquiryUpdated,
  staffProfiles: propStaffProfiles,
}) => {
  const [localEnquiry, setLocalEnquiry] = useState<EnquiryWithDetails | null>(
    initialEnquiry,
  );

  useEffect(() => {
    setLocalEnquiry(initialEnquiry);
  }, [initialEnquiry]);

  const enquiry = localEnquiry || initialEnquiry;

  const [activeTab, setActiveTab] = useState<
    "overview" | "sequences" | "deals" | "conversations" | "meetings" | "custom"
  >("overview");

  // Status Selector State
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState<boolean>(false);
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Staff Assignment State
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState<boolean>(false);
  const [isSavingStaff, setIsSavingStaff] = useState<boolean>(false);
  const [justSavedStaff, setJustSavedStaff] = useState<boolean>(false);
  const [availableStaff, setAvailableStaff] = useState<StaffProfile[]>(
    propStaffProfiles || [],
  );
  const staffMenuRef = useRef<HTMLDivElement>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "",
    subject: "",
    specific_product: "",
    message: "",
    deal_value: "",
    deal_title: "",
    expected_close_date: "",
  });

  const handleOpenEdit = () => {
    if (!enquiry) return;
    setEditForm({
      name: enquiry.name || "",
      company: enquiry.company || "",
      email: enquiry.email || "",
      phone: enquiry.phone || "",
      industry: enquiry.industry || "",
      subject: enquiry.subject || "",
      specific_product: enquiry.specific_product || "",
      message: enquiry.message || "",
      deal_value: enquiry.deal_value ? String(enquiry.deal_value) : "",
      deal_title: enquiry.deal_title || "",
      expected_close_date: enquiry.expected_close_date || "",
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry) return;
    setIsSavingEdit(true);
    setEditError(null);
    try {
      const res = await enquiryService.updateEnquiry(enquiry.id, {
        name: editForm.name.trim(),
        company: editForm.company.trim() || null,
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        industry: editForm.industry.trim() || null,
        subject: editForm.subject.trim() || null,
        specific_product: editForm.specific_product.trim() || null,
        message: editForm.message.trim(),
        deal_value: editForm.deal_value
          ? parseFloat(editForm.deal_value)
          : null,
        deal_title: editForm.deal_title.trim() || null,
        expected_close_date: editForm.expected_close_date || null,
      });

      if (res.error || !res.enquiry) {
        setEditError(res.error || "Failed to update enquiry.");
      } else {
        setLocalEnquiry(res.enquiry);
        if (onEnquiryUpdated) {
          onEnquiryUpdated(res.enquiry);
        }
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to save edits.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Load staff profiles if not provided via props
  useEffect(() => {
    if (propStaffProfiles && propStaffProfiles.length > 0) {
      setAvailableStaff(propStaffProfiles);
    } else {
      enquiryService
        .getAdminProfiles()
        .then(setAvailableStaff)
        .catch(() => {});
    }
  }, [propStaffProfiles]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(e.target as Node)
      ) {
        setIsStatusMenuOpen(false);
      }
      if (
        staffMenuRef.current &&
        !staffMenuRef.current.contains(e.target as Node)
      ) {
        setIsStaffMenuOpen(false);
      }
    };
    if (isStatusMenuOpen || isStaffMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusMenuOpen, isStaffMenuOpen]);

  if (!isOpen || !enquiry) return null;

  const companyName = enquiry.company || "Enterprise Customer";
  const jobTitle =
    enquiry.specific_product || enquiry.subject || "Precision Metrology RFQ";
  const currentStatusConfig =
    STATUS_PALETTE[enquiry.status] || STATUS_PALETTE.new;

  const handleSelectStatus = async (newStatus: EnquiryStatus) => {
    if (newStatus === enquiry.status || isSavingStatus) {
      setIsStatusMenuOpen(false);
      return;
    }
    setIsStatusMenuOpen(false);
    setIsSavingStatus(true);
    try {
      if (_onStatusChange) {
        await _onStatusChange(enquiry.id, newStatus);
      }
      setLocalEnquiry((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSelectStaff = async (profile: StaffProfile | null) => {
    if (isSavingStaff || !enquiry) return;
    const targetId = profile ? profile.id : null;
    if (enquiry.assigned_to === targetId) {
      setIsStaffMenuOpen(false);
      return;
    }
    setIsStaffMenuOpen(false);
    setIsSavingStaff(true);
    try {
      if (_onAssignStaff) {
        await _onAssignStaff(enquiry.id, targetId, profile);
      } else {
        await enquiryService.assignEnquiry(
          enquiry.id,
          targetId,
          profile?.full_name || undefined,
        );
      }
      setLocalEnquiry((prev) =>
        prev
          ? {
              ...prev,
              assigned_to: targetId,
              assigned_profile: profile,
            }
          : prev,
      );
      setJustSavedStaff(true);
      setTimeout(() => setJustSavedStaff(false), 2500);
    } catch {
      // Error handled
    } finally {
      setIsSavingStaff(false);
    }
  };

  return (
    <Drawer.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      variant="blur"
      isDismissable
    >
      <Drawer.Content placement="bottom">
        <Drawer.Dialog>
          <Drawer.Handle />
          <Drawer.CloseTrigger />

          <Drawer.Header>
            <Drawer.Heading>Customer RFQ & Engineering Dossier</Drawer.Heading>
          </Drawer.Header>

          <Drawer.Body>
            {/* Title & Action Row */}
            <div className="px-8 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <PersonAvatar
                  name={enquiry.name}
                  size="lg"
                  className="ring-2 ring-white shadow-md"
                />
                <div>
                  <h1
                    id="dossier-title"
                    className="text-2xl font-bold text-gray-900 tracking-tight"
                  >
                    {enquiry.name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span>{jobTitle}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">
                      {companyName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {/* Custom Interactive Status Dropdown with Auto-Save */}
                <div className="relative" ref={statusMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                    disabled={isSavingStatus}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border} hover:shadow-xs`}
                    aria-haspopup="listbox"
                    aria-expanded={isStatusMenuOpen}
                    title="Click to change enquiry stage"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${currentStatusConfig.dot}`}
                    />
                    <span>{currentStatusConfig.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 transition-transform ${isStatusMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Status Dropdown Menu */}
                  {isStatusMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                        <span>Stage Pipeline</span>
                        <span className="text-emerald-600 font-medium lowercase">
                          auto-saves
                        </span>
                      </div>
                      <div className="py-1">
                        {ALL_STATUS_OPTIONS.map((opt) => {
                          const cfg = STATUS_PALETTE[opt];
                          const isSelected = enquiry.status === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectStatus(opt)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${cfg.hoverBg} ${
                                isSelected
                                  ? "bg-gray-50/90 font-bold"
                                  : "font-medium text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${cfg.dot}`}
                                />
                                <span
                                  className={
                                    isSelected ? cfg.text : "text-gray-800"
                                  }
                                >
                                  {cfg.label}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-gray-900" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Auto-saved indicator */}
                  {justSaved && (
                    <div className="absolute top-full right-0 mt-1 text-[10px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Saved</span>
                    </div>
                  )}
                </div>
                {/* Custom Interactive Assigned Staff Selector with Auto-Save */}
                <div className="relative" ref={staffMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
                    disabled={isSavingStaff}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:shadow-xs"
                    aria-haspopup="listbox"
                    aria-expanded={isStaffMenuOpen}
                    title="Click to assign staff member"
                  >
                    {enquiry.assigned_profile ? (
                      <PersonAvatar
                        name={
                          enquiry.assigned_profile.full_name ||
                          enquiry.assigned_profile.email
                        }
                        size="sm"
                        className="w-4 h-4 text-[9px]"
                      />
                    ) : (
                      <UserX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="max-w-[120px] truncate">
                      {enquiry.assigned_profile?.full_name ||
                        enquiry.assigned_profile?.email ||
                        "Unassigned"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 transition-transform ${isStaffMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Staff Dropdown Menu */}
                  {isStaffMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                        <span>Assigned Staff</span>
                        <span className="text-emerald-600 font-medium lowercase">
                          auto-saves
                        </span>
                      </div>

                      <div className="py-1 max-h-60 overflow-y-auto">
                        {/* Option: Unassign */}
                        <button
                          type="button"
                          onClick={() => handleSelectStaff(null)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                            !enquiry.assigned_to
                              ? "bg-gray-50 font-bold"
                              : "font-medium text-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                              <UserX className="w-3 h-3" />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-gray-700">
                                Unassigned
                              </span>
                              <span className="block text-[10px] text-gray-400">
                                Remove current owner
                              </span>
                            </div>
                          </div>
                          {!enquiry.assigned_to && (
                            <Check className="w-3.5 h-3.5 text-gray-900" />
                          )}
                        </button>

                        {/* Active Staff Profiles */}
                        {availableStaff.map((p) => {
                          const isSelected = enquiry.assigned_to === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectStaff(p)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                                isSelected
                                  ? "bg-blue-50/70 font-bold"
                                  : "font-medium text-gray-800"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <PersonAvatar
                                  name={p.full_name || p.email}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <span className="block text-gray-900 truncate text-xs">
                                    {p.full_name || p.email}
                                  </span>
                                  <span className="block text-[10px] text-gray-400 font-mono uppercase">
                                    {p.role}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Auto-saved indicator */}
                  {justSavedStaff && (
                    <div className="absolute top-full right-0 mt-1 text-[10px] text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Assigned</span>
                    </div>
                  )}
                </div>{" "}
                <Link
                  to={`/admin/enquiries/${enquiry.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                  title="Open full dedicated enquiry page"
                  aria-label={`Open full dossier page for ${enquiry.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  <span>Full Dossier</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                  aria-label={`Edit enquiry details for ${enquiry.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Info</span>
                </Button>
                {enquiry.email ? (
                  <a
                    href={`mailto:${enquiry.email}?subject=RE: ${encodeURIComponent(enquiry.subject || "AKIRA Precision Gauging Inquiry")}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    isDisabled
                    className="gap-1.5 px-4 py-1.5 text-xs font-semibold cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-8 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-medium text-gray-500 mt-4">
              {[
                { id: "overview", label: "Contact overview" },
                { id: "sequences", label: "Sequences" },
                { id: "deals", label: "Deals" },
                { id: "conversations", label: "Conversations" },
                { id: "meetings", label: "Meetings" },
                { id: "custom", label: "Custom fields" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-3 relative whitespace-nowrap transition-colors rounded-lg font-sans text-xs ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8 space-y-6 flex-1 bg-[#FAFAFA]">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  {/* Company Bio Card */}
                  <Card className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center gap-3">
                      <CompanyAvatar company={companyName} size="lg" />
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">
                          {companyName}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {enquiry.industry ||
                            "Precision Manufacturing & Metrology"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {enquiry.company
                        ? `${enquiry.company} is an active enterprise partner engaged in dimensional quality verification and automated air-electronic multi-channel inspection.`
                        : "Customer is exploring industrial metrology systems and custom fixture engineering."}
                    </p>
                  </Card>

                  {/* Two Columns Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Contact info & Attributes */}
                    <div className="space-y-6">
                      {/* Contact Information Card */}
                      <Card className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Contact information
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={handleOpenEdit}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold h-auto p-1 min-w-0 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Info</span>
                          </Button>
                        </div>

                        <div className="space-y-3 text-xs">
                          {enquiry.email && (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-gray-800 truncate font-mono">
                                  {enquiry.email}
                                </span>
                              </div>
                              <Chip
                                size="sm"
                                variant="soft"
                                color="default"
                                className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium shrink-0 font-mono"
                              >
                                Business
                              </Chip>
                            </div>
                          )}

                          {enquiry.phone && (
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-gray-800 font-mono">
                                  {enquiry.phone}
                                </span>
                              </div>
                              <Chip
                                size="sm"
                                variant="soft"
                                color="default"
                                className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium shrink-0 font-mono"
                              >
                                Direct Line
                              </Chip>
                            </div>
                          )}

                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-gray-800 truncate">
                                {companyName}
                              </span>
                            </div>
                            <Chip
                              size="sm"
                              variant="soft"
                              color="default"
                              className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium shrink-0 font-mono"
                            >
                              Corporate
                            </Chip>
                          </div>
                        </div>
                      </Card>

                      {/* CRM Key Fields */}
                      <Card className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-gray-500">Requirement</span>
                          <span className="font-medium text-gray-900">
                            {jobTitle}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-gray-500">Contact Stage</span>
                          <Chip
                            size="sm"
                            variant="soft"
                            color="default"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.dot}`}
                            />
                            <span>{currentStatusConfig.label}</span>
                          </Chip>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-gray-500">Contact Owner</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => {
                              setIsStaffMenuOpen(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="flex items-center gap-1.5 font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 transition-all text-xs h-auto min-w-0"
                            aria-label="Assign staff member"
                          >
                            <PersonAvatar
                              name={
                                enquiry.assigned_profile?.full_name ||
                                enquiry.assigned_profile?.email ||
                                "Unassigned"
                              }
                              size="sm"
                            />
                            <span>
                              {enquiry.assigned_profile?.full_name ||
                                enquiry.assigned_profile?.email ||
                                "Unassigned"}
                            </span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-gray-500">Engagement</span>
                          <span className="text-gray-700 font-medium">
                            1 Inbound • Direct RFQ
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-gray-500">Added Date</span>
                          <span className="text-gray-700 font-mono">
                            {formatDateTimeDDMMYYYY(enquiry.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Lead ID</span>
                          <span className="font-mono text-gray-600 text-[11px]">
                            {enquiry.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </Card>
                    </div>

                    {/* Right Column: Activities, Data Sync, Notes */}
                    <div className="space-y-6">
                      {/* Activities details */}
                      <Card className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Activities details
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={handleOpenEdit}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold h-auto p-1 min-w-0 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
                            <span className="text-gray-500 block text-[11px]">
                              Last Activities/Log
                            </span>
                            <span className="font-semibold text-gray-900 mt-1 block">
                              Active In Review
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
                            <span className="text-gray-500 block text-[11px]">
                              Enquiry Source
                            </span>
                            <span className="font-semibold text-gray-900 mt-1 block capitalize">
                              {enquiry.source || "Website Direct"}
                            </span>
                          </div>
                        </div>
                      </Card>

                      {/* Data Synchronization */}
                      <Card className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Data Synchronization
                        </h3>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <span className="text-gray-500">
                              Transaction ID
                            </span>
                            <span className="font-mono text-gray-900 font-semibold">
                              RFQ-{enquiry.id.slice(0, 6).toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <span className="text-gray-500">
                              Product / Requirement
                            </span>
                            <span className="font-medium text-blue-600 truncate max-w-[200px]">
                              {enquiry.specific_product ||
                                enquiry.subject ||
                                "Custom Air Gauging"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <span className="text-gray-500">Received Date</span>
                            <span className="font-mono text-gray-700">
                              {formatDate(enquiry.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Status Tag</span>
                            <Chip
                              size="sm"
                              variant="soft"
                              color="success"
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              Active
                            </Chip>
                          </div>
                        </div>
                      </Card>

                      {/* Notes Card */}
                      <Card className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-2.5">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Inquiry Requirement & Notes
                        </h3>
                        <div className="bg-gray-50/70 p-3.5 rounded-lg border border-gray-100 text-xs text-gray-700 leading-relaxed">
                          <p className="font-semibold text-gray-900 mb-1">
                            {enquiry.subject || "Technical Requirement Details"}
                          </p>
                          <p className="whitespace-pre-line text-gray-600">
                            {enquiry.message ||
                              "No additional specifications provided."}
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: SEQUENCES */}
              {activeTab === "sequences" && (
                <div className="space-y-4">
                  <Card className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Lifecycle Progression Sequence
                    </h3>
                    <p className="text-xs text-gray-500">
                      Standard operating sequence for precision metrology
                      RFQ-to-Commissioning pipeline.
                    </p>

                    <div className="space-y-3 pt-2">
                      {[
                        {
                          step: "01",
                          title: "RFQ Ingestion",
                          desc: "Inbound customer specifications received from digital channels.",
                          statusKey: "new",
                        },
                        {
                          step: "02",
                          title: "Engineering Qualification",
                          desc: "Application engineer verifies part drawing and tolerance tolerances.",
                          statusKey: "contacted",
                        },
                        {
                          step: "03",
                          title: "Quotation & Layout Submission",
                          desc: "Commercial quotation and calibration gauge setup drawing submitted.",
                          statusKey: "quotation_sent",
                        },
                        {
                          step: "04",
                          title: "Technical Review & Demo",
                          desc: "Live metrology trial and follow-up consultation with plant QA team.",
                          statusKey: "follow_up",
                        },
                        {
                          step: "05",
                          title: "Order Handover / Won",
                          desc: "PO confirmed; production job order dispatched to manufacturing shop floor.",
                          statusKey: "converted",
                        },
                      ].map((item, idx) => {
                        const isCurrent = enquiry.status === item.statusKey;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                              isCurrent
                                ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/10"
                                : "bg-white border-gray-200/80"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                                  isCurrent
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {item.step}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">
                                  {item.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isCurrent ? "primary" : "outline"}
                              onPress={() =>
                                handleSelectStatus(
                                  item.statusKey as EnquiryStatus,
                                )
                              }
                              className="text-xs font-semibold shrink-0 cursor-pointer"
                            >
                              {isCurrent ? "Current Stage" : "Set Stage"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 3: DEALS */}
              {activeTab === "deals" && (
                <div className="space-y-4">
                  <Card className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Commercial Deal & Opportunity
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={handleOpenEdit}
                        className="gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update Deal Parameters</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                      <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                        <span className="text-[11px] font-semibold text-emerald-800 uppercase font-mono">
                          Deal Value
                        </span>
                        <div className="text-xl font-bold font-mono text-emerald-700">
                          {enquiry.deal_value
                            ? new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                              }).format(enquiry.deal_value)
                            : "₹0.00 (Unset)"}
                        </div>
                      </div>

                      <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
                        <span className="text-[11px] font-semibold text-sky-800 uppercase font-mono">
                          Target Close Date
                        </span>
                        <div className="text-base font-bold font-mono text-sky-900 mt-1">
                          {enquiry.expected_close_date
                            ? formatDate(enquiry.expected_close_date)
                            : "Open / Ongoing"}
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1">
                        <span className="text-[11px] font-semibold text-purple-800 uppercase font-mono">
                          Pipeline Stage
                        </span>
                        <div className="text-base font-bold text-purple-900 capitalize mt-1">
                          {enquiry.status.replace("_", " ")}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
                      <span className="text-gray-500 font-medium">
                        Deal Title:
                      </span>
                      <p className="font-semibold text-gray-900">
                        {enquiry.deal_title ||
                          enquiry.subject ||
                          "Metrology Solution Supply"}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 4: CONVERSATIONS */}
              {activeTab === "conversations" && (
                <div className="space-y-4">
                  <Card className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Client Communications & Logs
                    </h3>

                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {enquiry.name} ({enquiry.company || "Client"})
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            {formatDateTimeDDMMYYYY(enquiry.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200/60 whitespace-pre-line">
                          {enquiry.message ||
                            "Customer initiated contact via website RFQ submission."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {enquiry.email && (
                          <a
                            href={`mailto:${enquiry.email}?subject=RE: ${encodeURIComponent(enquiry.subject || "Akira Technical Quotation")}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply via Email</span>
                          </a>
                        )}
                        {enquiry.phone && (
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Phone</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 5: MEETINGS */}
              {activeTab === "meetings" && (
                <div className="space-y-4">
                  <Card className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Meetings & Touchpoint Agenda
                      </h3>
                      <Link
                        to="/admin/followups"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Open CRM Agenda</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <p className="text-xs text-gray-500">
                      Coordinate on-site customer visits, plant inspection
                      demonstrations, and scheduled touchpoints.
                    </p>

                    <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl text-xs space-y-1">
                      <span className="text-gray-500 font-medium">
                        Customer Location:
                      </span>
                      <p className="font-semibold text-gray-800">
                        {enquiry.company
                          ? `${enquiry.company} Works`
                          : "Client Works / Manufacturing Plant"}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 6: CUSTOM FIELDS */}
              {activeTab === "custom" && (
                <div className="space-y-4">
                  <Card className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Technical Specs & Metadata
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block text-[11px]">
                          Product Category
                        </span>
                        <span className="font-semibold text-gray-900 mt-0.5 block">
                          {enquiry.product_category || "Standard Air Gauging"}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block text-[11px]">
                          Specific Model
                        </span>
                        <span className="font-semibold text-gray-900 mt-0.5 block">
                          {enquiry.specific_product ||
                            "Custom Air Electronic Gauge"}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block text-[11px]">
                          Raw Lead UUID
                        </span>
                        <span className="font-mono text-gray-700 mt-0.5 block truncate">
                          {enquiry.id}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block text-[11px]">
                          Acquisition Source
                        </span>
                        <span className="font-semibold text-gray-900 mt-0.5 block capitalize">
                          {enquiry.source || "Website Form"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>

      {/* Edit Customer Enquiry & Technical RFQ Modal */}
      {isEditModalOpen && (
        <Modal.Backdrop
          isOpen={isEditModalOpen}
          onOpenChange={(open) => {
            if (!open) setIsEditModalOpen(false);
          }}
        >
          <Modal.Container placement="center" className="w-full max-w-lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                  <Pencil />
                </Modal.Icon>
                <Modal.Heading>
                  Edit Customer Enquiry & Technical RFQ
                </Modal.Heading>
              </Modal.Header>

              {editError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                  {editError}
                </div>
              )}

              <Modal.Body>
                <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                  <Surface
                    className="flex w-full min-w-[340px] flex-col gap-4 rounded-3xl p-6"
                    variant="secondary"
                  >
                    <TextField name="name">
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Name *
                      </Label>
                      <Input
                        required
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full text-xs"
                      />
                    </TextField>
                    <TextField name="company">
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company Name
                      </Label>
                      <Input
                        value={editForm.company}
                        onChange={(e) =>
                          setEditForm({ ...editForm, company: e.target.value })
                        }
                        className="w-full text-xs"
                      />
                    </TextField>

                    <TextField>
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full text-xs font-mono"
                      />
                    </TextField>
                    <TextField name="phone">
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full text-xs font-mono"
                      />
                    </TextField>

                    <TextField>
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Industry / Sector
                      </Label>
                      <Input
                        value={editForm.industry}
                        onChange={(e) =>
                          setEditForm({ ...editForm, industry: e.target.value })
                        }
                        className="w-full text-xs"
                        placeholder="e.g. Automotive, Aerospace, Metrology"
                      />
                    </TextField>

                    <TextField>
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Subject / Requirement
                      </Label>
                      <Input
                        value={editForm.subject}
                        onChange={(e) =>
                          setEditForm({ ...editForm, subject: e.target.value })
                        }
                        className="w-full text-xs"
                      />
                    </TextField>
                    <TextField>
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Product / Model
                      </Label>
                      <Input
                        value={editForm.specific_product}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specific_product: e.target.value,
                          })
                        }
                        className="w-full text-xs"
                      />
                    </TextField>

                    <TextField className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="block text-xs font-semibold text-slate-700 mb-1">
                          Deal Value (₹)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.deal_value}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              deal_value: e.target.value,
                            })
                          }
                          className="w-full text-xs font-mono"
                          placeholder="e.g. 50000"
                        />
                      </div>
                      <div>
                        <Label className="block text-xs font-semibold text-slate-700 mb-1">
                          Deal Title
                        </Label>
                        <Input
                          value={editForm.deal_title}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              deal_title: e.target.value,
                            })
                          }
                          className="w-full text-xs"
                          placeholder="Order scope"
                        />
                      </div>
                      <div>
                        <Label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expected Close
                        </Label>
                        <Input
                          type="date"
                          value={editForm.expected_close_date}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              expected_close_date: e.target.value,
                            })
                          }
                          className="w-full text-xs font-mono"
                        />
                      </div>
                    </TextField>

                    <TextField>
                      <Label className="block text-xs font-semibold text-slate-700 mb-1">
                        Technical Message / Notes
                      </Label>
                      <TextArea
                        rows={3}
                        value={editForm.message}
                        onChange={(e) =>
                          setEditForm({ ...editForm, message: e.target.value })
                        }
                        className="w-full text-xs"
                      />
                    </TextField>
                  </Surface>
                </form>
              </Modal.Body>

              <Modal.Footer className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setIsEditModalOpen(false)}
                  className="text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isDisabled={isSavingEdit}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </Drawer.Backdrop>
  );
};
