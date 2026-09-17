import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
  SlidersHorizontal,
  Clock,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  EnquiryWithDetails,
  EnquiryStatus,
  EnquiryFilters,
  StaffProfile,
} from '../../types/database';
import { enquiryService, StatusCounts } from '../../services/enquiryService';
import { formatDateTimeDDMMYYYY } from '../../utils/date';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';
import { PersonAvatar, CompanyAvatar } from '../../utils/avatarHelper';
import { AdminEnquiryDossierDrawer } from '../../components/admin/AdminEnquiryDossierDrawer';

const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = 'akira_enquiries_columns_v3';

interface StatusFilterOption {
  status: EnquiryStatus | 'all';
  label: string;
  countKey: keyof StatusCounts;
}

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { status: 'all', label: 'All Leads', countKey: 'all' },
  { status: 'new', label: 'New RFQ', countKey: 'new' },
  { status: 'contacted', label: 'Contacted', countKey: 'contacted' },
  { status: 'quotation_sent', label: 'Quotation Sent', countKey: 'quotation_sent' },
  { status: 'follow_up', label: 'In Follow-up', countKey: 'follow_up' },
  { status: 'converted', label: 'Converted', countKey: 'converted' },
  { status: 'closed', label: 'Closed / Inactive', countKey: 'closed' },
];

export const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  new: { label: 'New RFQ', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  contacted: { label: 'Contacted', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  quotation_sent: { label: 'Quotation Sent', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  follow_up: { label: 'In Follow-up', bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  converted: { label: 'Converted', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  closed: { label: 'Closed / Inactive', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
};

export type ColumnKey =
  | 'datetime'
  | 'name'
  | 'company'
  | 'email'
  | 'requirement'
  | 'phone'
  | 'assigned'
  | 'status';

export interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'datetime', label: 'Date & Time', visible: true },
  { key: 'name', label: 'Name', visible: true },
  { key: 'company', label: 'Company', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'requirement', label: 'Requirement', visible: true },
  { key: 'phone', label: 'Phone numbers', visible: true },
  { key: 'assigned', label: 'Assigned', visible: true },
  { key: 'status', label: 'Status', visible: true },
];

function loadColumns(): ColumnConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const keysSet = new Set(parsed.map((c: any) => c.key));
        const merged: ColumnConfig[] = parsed
          .filter((c: any) => DEFAULT_COLUMNS.some((d) => d.key === c.key))
          .map((c: any) => {
            const def = DEFAULT_COLUMNS.find((d) => d.key === c.key)!;
            return {
              key: c.key,
              label: def.label,
              visible: typeof c.visible === 'boolean' ? c.visible : true,
            };
          });

        DEFAULT_COLUMNS.forEach((def) => {
          if (!keysSet.has(def.key)) {
            merged.push(def);
          }
        });

        return merged;
      }
    }
  } catch {
    // Ignore error and return defaults
  }
  return DEFAULT_COLUMNS;
}

export const AdminEnquiries: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') as EnquiryStatus) || 'all';

  const [enquiries, setEnquiries] = useState<EnquiryWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0,
    new: 0,
    contacted: 0,
    quotation_sent: 0,
    follow_up: 0,
    converted: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus | 'all'>(initialStatus);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Drag & Drop Column Customization with LocalStorage Persistence
  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected row for dossier view
  const [selectedDossierEnquiry, setSelectedDossierEnquiry] = useState<EnquiryWithDetails | null>(null);

  // Close column dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.column-customizer-container')) {
        setIsColumnMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const saveColumns = (updated: ColumnConfig[]) => {
    setColumns(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const toggleColumn = (key: ColumnKey) => {
    const updated = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    saveColumns(updated);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= columns.length) return;
    const reordered = [...columns];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    saveColumns(reordered);
  };

  const resetColumns = () => {
    saveColumns(DEFAULT_COLUMNS);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveColumn(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const activeColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  // Fetch enquiries & counts from service
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: EnquiryFilters = {
      search: search.trim() || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 100,
      offset: 0,
    };

    const [enquiriesRes, countsRes] = await Promise.all([
      enquiryService.getEnquiries(filters),
      enquiryService.getStatusCounts(),
    ]);

    if (enquiriesRes.error) {
      setError(enquiriesRes.error);
    } else {
      setEnquiries(enquiriesRes.enquiries);
      setTotalCount(enquiriesRes.total);
    }

    setStatusCounts(countsRes);
    setIsLoading(false);
  }, [search, selectedStatus]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Handle status tab change
  const handleStatusChange = (status: EnquiryStatus | 'all') => {
    setSelectedStatus(status);
    setCurrentPage(1);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  // Direct Status Update Handler
  const handleStatusUpdate = async (id: string, newStatus: EnquiryStatus, oldStatus?: EnquiryStatus) => {
    // Optimistically update local list
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );

    if (selectedDossierEnquiry && selectedDossierEnquiry.id === id) {
      setSelectedDossierEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Call service
    const res = await enquiryService.updateEnquiryStatus(id, newStatus, oldStatus);
    if (!res.success) {
      // Revert if error
      fetchEnquiries();
    } else {
      // Re-fetch accurate counts
      enquiryService.getStatusCounts().then(setStatusCounts).catch(() => {});
    }
  };

  // Staff assignment state & handler
  const [adminProfiles, setAdminProfiles] = useState<StaffProfile[]>([]);

  useEffect(() => {
    enquiryService.getAdminProfiles().then(setAdminProfiles).catch(() => {});
  }, []);

  const handleAssignStaff = async (
    id: string,
    profileId: string | null,
    staffProfile?: StaffProfile | null
  ) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              assigned_to: profileId,
              assigned_profile: staffProfile || null,
            }
          : e
      )
    );

    if (selectedDossierEnquiry && selectedDossierEnquiry.id === id) {
      setSelectedDossierEnquiry((prev) =>
        prev
          ? {
              ...prev,
              assigned_to: profileId,
              assigned_profile: staffProfile || null,
            }
          : null
      );
    }

    const res = await enquiryService.assignEnquiry(
      id,
      profileId,
      staffProfile?.full_name || undefined
    );

    if (!res.success) {
      fetchEnquiries();
      alert(res.error || 'Failed to assign staff member');
    }
  };

  // Local pagination
  const totalPages = Math.max(1, Math.ceil(enquiries.length / ITEMS_PER_PAGE));
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return enquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [enquiries, currentPage]);

  const toggleSelectAll = () => {
    if (selectedRowIds.size === paginatedEnquiries.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedEnquiries.map((e) => e.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRowIds(next);
  };

  return (
    <>
      <SEOHead
        title="People | Akira Precision Automation LLP CRM"
        description="Enterprise CRM people and customer enquiries directory with precision metrology RFQs and lead management."
      />

      <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-gray-900">
        {/* Page Title & Customize Columns Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              People
            </h1>
            <span className="sr-only">Customer Enquiries & RFQs</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage inbound measurement requirements, customer requests for quotations, and active sales leads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Customize Columns Dropdown with LocalStorage */}
            <div className="relative column-customizer-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsColumnMenuOpen(!isColumnMenuOpen);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs ${
                  isColumnMenuOpen
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
                title="Customize visible columns"
                aria-label="Customize visible columns"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Customize Columns</span>
              </button>

              {isColumnMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 block">Display & Order</span>
                      <span className="text-[10px] text-gray-400">Drag or use arrows to reorder</span>
                    </div>
                    <button
                      type="button"
                      onClick={resetColumns}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                    {columns.map((col, idx) => (
                      <div
                        key={col.key}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all ${
                          draggedIndex === idx
                            ? 'bg-blue-50 border-blue-300 opacity-60'
                            : 'bg-white hover:bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0 cursor-grab" />
                          <label className="flex items-center gap-2 cursor-pointer select-none truncate">
                            <input
                              type="checkbox"
                              checked={col.visible}
                              onChange={() => toggleColumn(col.key)}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                            />
                            <span className={`text-xs font-medium truncate ${col.visible ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                              {col.label}
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveColumn(idx, idx - 1);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 transition-colors"
                            title="Move column up"
                            aria-label={`Move ${col.label} column up`}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === columns.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveColumn(idx, idx + 1);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 transition-colors"
                            title="Move column down"
                            aria-label={`Move ${col.label} column down`}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 pt-1.5 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Reorder applies to table</span>
                    <span className="text-emerald-600">Auto-saved</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={fetchEnquiries}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Refresh lead data"
              aria-label="Refresh lead data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Column Filter Row with Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt.status;
            const count = statusCounts[opt.countKey] || 0;

            return (
              <button
                key={opt.status}
                type="button"
                onClick={() => handleStatusChange(opt.status)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-gray-900 text-white border border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer name, company, email, phone, or requirement..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 shadow-2xs transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content Table Card */}
        {error ? (
          <AdminErrorState
            title="Database Connection Issue"
            message={`Unable to load enquiries: ${error}`}
            onRetry={fetchEnquiries}
          />
        ) : isLoading ? (
          <AdminTableSkeleton rows={8} />
        ) : paginatedEnquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No enquiries found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || selectedStatus !== 'all'
                ? 'No items match your active search filters. Try adjusting query parameters or reset filters.'
                : 'No customer enquiries or technical RFQs have been received yet. All new inbound leads will appear here automatically.'}
            </p>
            {(search || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  handleStatusChange('all');
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40 text-[12px] font-medium text-gray-500">
                    <th className="py-3.5 pl-5 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedEnquiries.length > 0 &&
                          selectedRowIds.size === paginatedEnquiries.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        aria-label="Select all rows"
                      />
                    </th>

                    {activeColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`py-3.5 px-4 font-medium whitespace-nowrap ${
                          col.key === 'status' ? 'text-center' : ''
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedEnquiries.map((enq) => {
                    const isRowSelected = selectedRowIds.has(enq.id);
                    const requirementDisplay =
                      enq.specific_product || enq.subject || enq.message || 'Custom Gauging Requirement';
                    const statusConfig = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;

                    return (
                      <tr
                        key={enq.id}
                        onClick={() => setSelectedDossierEnquiry(enq)}
                        className={`transition-colors cursor-pointer group ${
                          isRowSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td className="py-3.5 pl-5 pr-3 w-10" onClick={(e) => toggleSelectRow(enq.id, e)}>
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            aria-label={`Select ${enq.name}`}
                          />
                        </td>

                        {/* Dynamic Ordered Column Cells */}
                        {activeColumns.map((col) => {
                          switch (col.key) {
                            case 'datetime':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{formatDateTimeDDMMYYYY(enq.created_at)}</span>
                                  </div>
                                </td>
                              );

                            case 'name':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <PersonAvatar name={enq.name} size="md" />
                                    <span className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                      {enq.name}
                                    </span>
                                  </div>
                                </td>
                              );

                            case 'company':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <CompanyAvatar company={enq.company} size="sm" />
                                    <span className="text-sm text-gray-800 font-normal">
                                      {enq.company || 'Direct Client'}
                                    </span>
                                  </div>
                                </td>
                              );

                            case 'email':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  {enq.email ? (
                                    <a
                                      href={`mailto:${enq.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px] inline-block font-mono"
                                    >
                                      {enq.email}
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 italic">No email</span>
                                  )}
                                </td>
                              );

                            case 'requirement':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600 truncate max-w-[240px] inline-block font-normal">
                                    {requirementDisplay}
                                  </span>
                                </td>
                              );

                            case 'phone':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600 font-normal font-sans">
                                    {enq.phone || '—'}
                                  </span>
                                </td>
                              );

                            case 'assigned':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  {enq.assigned_profile ? (
                                    <div className="flex items-center gap-2">
                                      <PersonAvatar
                                        name={enq.assigned_profile.full_name || enq.assigned_profile.email}
                                        size="sm"
                                      />
                                      <span className="text-xs font-medium text-gray-800">
                                        {enq.assigned_profile.full_name || enq.assigned_profile.email}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 italic text-xs">Unassigned</span>
                                  )}
                                </td>
                              );

                            case 'status':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap text-center">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                    <span>{statusConfig.label}</span>
                                  </span>
                                </td>
                              );

                            default:
                              return null;
                          }
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-100 px-6 py-3.5 flex items-center justify-between text-xs text-gray-500">
              <div>
                Page {currentPage} of {totalPages} ({totalCount} total)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-gray-400 font-mono">...</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Detail Dossier Slide-Over Drawer */}
      <AdminEnquiryDossierDrawer
        enquiry={selectedDossierEnquiry}
        isOpen={!!selectedDossierEnquiry}
        onClose={() => setSelectedDossierEnquiry(null)}
        onStatusChange={async (id, newStatus) => {
          await handleStatusUpdate(id, newStatus, selectedDossierEnquiry?.status);
        }}
        onAssignStaff={handleAssignStaff}
        staffProfiles={adminProfiles}
      />
    </>
  );
};
