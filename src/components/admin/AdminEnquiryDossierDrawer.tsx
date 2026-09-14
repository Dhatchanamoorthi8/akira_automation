import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Building2,
  Send,
  Plus,
  Edit2,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  UserX,
} from 'lucide-react';
import { EnquiryWithDetails, EnquiryStatus, StaffProfile } from '../../types/database';
import { formatDate, formatDateTimeDDMMYYYY } from '../../utils/date';
import { PersonAvatar, CompanyAvatar } from '../../utils/avatarHelper';
import { enquiryService } from '../../services/enquiryService';

export const STATUS_PALETTE: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string; dot: string; hoverBg: string }
> = {
  new: {
    label: 'New RFQ',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-50/80',
  },
  contacted: {
    label: 'Contacted',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-50/80',
  },
  quotation_sent: {
    label: 'Quotation Sent',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    hoverBg: 'hover:bg-purple-50/80',
  },
  follow_up: {
    label: 'Follow-up',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    hoverBg: 'hover:bg-cyan-50/80',
  },
  converted: {
    label: 'Converted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-50/80',
  },
  closed: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    hoverBg: 'hover:bg-slate-100/80',
  },
};

const ALL_STATUS_OPTIONS: EnquiryStatus[] = [
  'new',
  'contacted',
  'quotation_sent',
  'follow_up',
  'converted',
  'closed',
];

interface AdminEnquiryDossierDrawerProps {
  enquiry: EnquiryWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: EnquiryStatus) => Promise<void>;
  onAssignStaff?: (id: string, profileId: string | null, staffProfile?: StaffProfile | null) => Promise<void>;
  staffProfiles?: StaffProfile[];
}

export const AdminEnquiryDossierDrawer: React.FC<AdminEnquiryDossierDrawerProps> = ({
  enquiry,
  isOpen,
  onClose,
  onStatusChange: _onStatusChange,
  onAssignStaff: _onAssignStaff,
  staffProfiles: propStaffProfiles,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sequences' | 'deals' | 'conversations' | 'meetings' | 'custom'>('overview');

  // Status Selector State
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState<boolean>(false);
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Staff Assignment State
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState<boolean>(false);
  const [isSavingStaff, setIsSavingStaff] = useState<boolean>(false);
  const [justSavedStaff, setJustSavedStaff] = useState<boolean>(false);
  const [availableStaff, setAvailableStaff] = useState<StaffProfile[]>(propStaffProfiles || []);
  const staffMenuRef = useRef<HTMLDivElement>(null);

  // Load staff profiles if not provided via props
  useEffect(() => {
    if (propStaffProfiles && propStaffProfiles.length > 0) {
      setAvailableStaff(propStaffProfiles);
    } else {
      enquiryService.getAdminProfiles().then(setAvailableStaff).catch(() => {});
    }
  }, [propStaffProfiles]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
      if (staffMenuRef.current && !staffMenuRef.current.contains(e.target as Node)) {
        setIsStaffMenuOpen(false);
      }
    };
    if (isStatusMenuOpen || isStaffMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusMenuOpen, isStaffMenuOpen]);

  if (!isOpen || !enquiry) return null;

  const companyName = enquiry.company || 'Enterprise Customer';
  const jobTitle = enquiry.specific_product || enquiry.subject || 'Precision Metrology RFQ';
  const currentStatusConfig = STATUS_PALETTE[enquiry.status] || STATUS_PALETTE.new;

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
          profile?.full_name || undefined
        );
      }
      setJustSavedStaff(true);
      setTimeout(() => setJustSavedStaff(false), 2500);
    } catch {
      // Error handled
    } finally {
      setIsSavingStaff(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Slide-over panel */}
      <div
        className="w-full max-w-4xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col transform transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
      >
        {/* Sticky Header Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          {/* Breadcrumb & Close */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              type="button"
              onClick={onClose}
              className="hover:text-gray-900 flex items-center gap-1 font-medium transition-colors"
            >
              <span>People</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-semibold">{enquiry.name}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Action Row */}
        <div className="px-8 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <PersonAvatar name={enquiry.name} size="lg" className="ring-2 ring-white shadow-md" />
            <div>
              <h1 id="dossier-title" className="text-2xl font-bold text-gray-900 tracking-tight">
                {enquiry.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span>{jobTitle}</span>
                <span>•</span>
                <span className="font-medium text-gray-700">{companyName}</span>
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
                <span className={`w-2 h-2 rounded-full ${currentStatusConfig.dot}`} />
                <span>{currentStatusConfig.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Status Dropdown Menu */}
              {isStatusMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                    <span>Stage Pipeline</span>
                    <span className="text-emerald-600 font-medium lowercase">auto-saves</span>
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
                            isSelected ? 'bg-gray-50/90 font-bold' : 'font-medium text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={isSelected ? cfg.text : 'text-gray-800'}>{cfg.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-gray-900" />}
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
                    name={enquiry.assigned_profile.full_name || enquiry.assigned_profile.email}
                    size="sm"
                    className="w-4 h-4 text-[9px]"
                  />
                ) : (
                  <UserX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="max-w-[120px] truncate">
                  {enquiry.assigned_profile?.full_name || enquiry.assigned_profile?.email || 'Unassigned'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isStaffMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Staff Dropdown Menu */}
              {isStaffMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                    <span>Assigned Staff</span>
                    <span className="text-emerald-600 font-medium lowercase">auto-saves</span>
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {/* Option: Unassign */}
                    <button
                      type="button"
                      onClick={() => handleSelectStaff(null)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                        !enquiry.assigned_to ? 'bg-gray-50 font-bold' : 'font-medium text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                          <UserX className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-gray-700">Unassigned</span>
                          <span className="block text-[10px] text-gray-400">Remove current owner</span>
                        </div>
                      </div>
                      {!enquiry.assigned_to && <Check className="w-3.5 h-3.5 text-gray-900" />}
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
                            isSelected ? 'bg-blue-50/70 font-bold' : 'font-medium text-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PersonAvatar name={p.full_name || p.email} size="sm" />
                            <div className="min-w-0">
                              <span className="block text-gray-900 truncate text-xs">{p.full_name || p.email}</span>
                              <span className="block text-[10px] text-gray-400 font-mono uppercase">{p.role}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
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
            </div>

            {/* <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to list</span>
            </button> */}

            {enquiry.email ? (
              <a
                href={`mailto:${enquiry.email}?subject=RE: ${encodeURIComponent(enquiry.subject || 'AKIRA Precision Gauging Inquiry')}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-300 text-white text-xs font-semibold cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 border-b border-gray-100 flex items-center gap-6 overflow-x-auto no-scrollbar text-xs font-medium text-gray-500 mt-4">
          {[
            { id: 'overview', label: 'Contact overview' },
            { id: 'sequences', label: 'Sequences' },
            { id: 'deals', label: 'Deals' },
            { id: 'conversations', label: 'Conversations' },
            { id: 'meetings', label: 'Meetings' },
            { id: 'custom', label: 'Custom fields' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 relative whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900 font-semibold border-b-2 border-gray-900'
                  : 'hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 space-y-6 flex-1 bg-[#FAFAFA]">
          {/* Company Bio Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <CompanyAvatar company={companyName} size="lg" />
              <div>
                <h2 className="text-sm font-bold text-gray-900">{companyName}</h2>
                <p className="text-xs text-gray-500">
                  {enquiry.industry || 'Precision Manufacturing & Metrology'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {enquiry.company
                ? `${enquiry.company} is an active enterprise partner engaged in dimensional quality verification and automated air-electronic multi-channel inspection.`
                : 'Customer is exploring industrial metrology systems and custom fixture engineering.'}
            </p>
          </div>

          {/* Two Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Contact info & Attributes */}
            <div className="space-y-6">
              {/* Contact Information Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Contact information
                  </h3>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add information</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {enquiry.email && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-800 truncate font-mono">{enquiry.email}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium shrink-0">
                        Business
                      </span>
                    </div>
                  )}

                  {enquiry.phone && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-800 font-mono">{enquiry.phone}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium shrink-0">
                        Direct Line
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-800 truncate">{companyName}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium shrink-0">
                      Corporate
                    </span>
                  </div>
                </div>
              </div>

              {/* CRM Key Fields */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Requirement</span>
                  <span className="font-medium text-gray-900">{jobTitle}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Contact Stage</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.dot}`} />
                    {currentStatusConfig.label}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Contact Owner</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStaffMenuOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 transition-all text-xs"
                    title="Click to assign staff member"
                  >
                    <PersonAvatar
                      name={enquiry.assigned_profile?.full_name || enquiry.assigned_profile?.email || 'Unassigned'}
                      size="sm"
                    />
                    <span>
                      {enquiry.assigned_profile?.full_name || enquiry.assigned_profile?.email || 'Unassigned'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Engagement</span>
                  <span className="text-gray-700 font-medium">1 Inbound • Direct RFQ</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Added Date</span>
                  <span className="text-gray-700 font-mono">{formatDateTimeDDMMYYYY(enquiry.created_at)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Lead ID</span>
                  <span className="font-mono text-gray-600 text-[11px]">
                    {enquiry.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Activities, Data Sync, Notes */}
            <div className="space-y-6">
              {/* Activities details */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Activities details
                  </h3>
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[11px]">Last Activities/Log</span>
                    <span className="font-semibold text-gray-900 mt-1 block">Active In Review</span>
                  </div>
                  <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
                    <span className="text-gray-500 block text-[11px]">Enquiry Source</span>
                    <span className="font-semibold text-gray-900 mt-1 block capitalize">
                      {enquiry.source || 'Website Direct'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Synchronization */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Data Synchronization
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-gray-900 font-semibold">
                      RFQ-{enquiry.id.slice(0, 6).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Product / Requirement</span>
                    <span className="font-medium text-blue-600 truncate max-w-[200px]">
                      {enquiry.specific_product || enquiry.subject || 'Custom Air Gauging'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Received Date</span>
                    <span className="font-mono text-gray-700">{formatDate(enquiry.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status Tag</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Inquiry Requirement & Notes
                </h3>
                <div className="bg-gray-50/70 p-3.5 rounded-lg border border-gray-100 text-xs text-gray-700 leading-relaxed">
                  <p className="font-semibold text-gray-900 mb-1">
                    {enquiry.subject || 'Technical Requirement Details'}
                  </p>
                  <p className="whitespace-pre-line text-gray-600">
                    {enquiry.message || 'No additional specifications provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
