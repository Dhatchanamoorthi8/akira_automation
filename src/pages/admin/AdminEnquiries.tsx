import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, Button, Chip, Table, Input, Checkbox, Modal } from "@heroui/react";
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
  Eye,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  EnquiryWithDetails,
  EnquiryStatus,
  EnquiryFilters,
  StaffProfile,
} from "../../types/database";
import { enquiryService, StatusCounts } from "../../services/enquiryService";
import { formatDateTimeDDMMYYYY } from "../../utils/date";
import { AdminTableSkeleton } from "../../components/admin/AdminSkeleton";
import { AdminErrorState } from "../../components/admin/AdminErrorState";
import { SEOHead } from "../../components/layout/SEOHead";
import { PersonAvatar, CompanyAvatar } from "../../utils/avatarHelper";
import { AdminEnquiryDossierDrawer } from "../../components/admin/AdminEnquiryDossierDrawer";

const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = "akira_enquiries_columns_v3";

interface StatusFilterOption {
  status: EnquiryStatus | "all";
  label: string;
  countKey: keyof StatusCounts;
}

const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { status: "all", label: "All Leads", countKey: "all" },
  { status: "new", label: "New RFQ", countKey: "new" },
  { status: "contacted", label: "Contacted", countKey: "contacted" },
  {
    status: "quotation_sent",
    label: "Quotation Sent",
    countKey: "quotation_sent",
  },
  { status: "follow_up", label: "In Follow-up", countKey: "follow_up" },
  { status: "converted", label: "Converted", countKey: "converted" },
  { status: "closed", label: "Closed / Inactive", countKey: "closed" },
];

export const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  new: {
    label: "New RFQ",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  quotation_sent: {
    label: "Quotation Sent",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  follow_up: {
    label: "In Follow-up",
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
  },
  converted: {
    label: "Converted",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed / Inactive",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export type ColumnKey =
  | "datetime"
  | "name"
  | "company"
  | "email"
  | "requirement"
  | "phone"
  | "assigned"
  | "status";

export interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visible: boolean;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "datetime", label: "Date & Time", visible: true },
  { key: "name", label: "Name", visible: true },
  { key: "company", label: "Company", visible: true },
  { key: "email", label: "Email", visible: true },
  { key: "requirement", label: "Requirement", visible: true },
  { key: "phone", label: "Phone numbers", visible: true },
  { key: "assigned", label: "Assigned", visible: true },
  { key: "status", label: "Status", visible: true },
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
              visible: typeof c.visible === "boolean" ? c.visible : true,
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
  const initialStatus = (searchParams.get("status") as EnquiryStatus) || "all";

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
  const [search, setSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus | "all">(
    initialStatus,
  );
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Drag & Drop Column Customization with LocalStorage Persistence
  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected row for dossier view
  const [selectedDossierEnquiry, setSelectedDossierEnquiry] =
    useState<EnquiryWithDetails | null>(null);

  // Close column dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".column-customizer-container")) {
        setIsColumnMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const saveColumns = (updated: ColumnConfig[]) => {
    setColumns(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const toggleColumn = (key: ColumnKey) => {
    const updated = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col,
    );
    saveColumns(updated);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= columns.length)
      return;
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

  const activeColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns],
  );

  // Fetch enquiries & counts from service
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: EnquiryFilters = {
      search: search.trim() || undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      sortBy: "created_at",
      sortOrder: "desc",
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
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
  }, [search, selectedStatus, currentPage]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Handle status tab change
  const handleStatusChange = (status: EnquiryStatus | "all") => {
    setSelectedStatus(status);
    setCurrentPage(1);
    if (status === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", status);
    }
    setSearchParams(searchParams);
  };

  // Direct Status Update Handler
  const handleStatusUpdate = async (
    id: string,
    newStatus: EnquiryStatus,
    oldStatus?: EnquiryStatus,
  ) => {
    // Optimistically update local list
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );

    if (selectedDossierEnquiry && selectedDossierEnquiry.id === id) {
      setSelectedDossierEnquiry((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }

    // Call service
    const res = await enquiryService.updateEnquiryStatus(
      id,
      newStatus,
      oldStatus,
    );
    if (!res.success) {
      // Revert if error
      fetchEnquiries();
    } else {
      // Re-fetch accurate counts
      enquiryService
        .getStatusCounts()
        .then(setStatusCounts)
        .catch(() => {});
    }
  };

  // Staff assignment state & handler
  const [adminProfiles, setAdminProfiles] = useState<StaffProfile[]>([]);

  useEffect(() => {
    enquiryService
      .getAdminProfiles()
      .then(setAdminProfiles)
      .catch(() => {});
  }, []);

  const handleAssignStaff = async (
    id: string,
    profileId: string | null,
    staffProfile?: StaffProfile | null,
  ) => {
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              assigned_to: profileId,
              assigned_profile: staffProfile || null,
            }
          : e,
      ),
    );

    if (selectedDossierEnquiry && selectedDossierEnquiry.id === id) {
      setSelectedDossierEnquiry((prev) =>
        prev
          ? {
              ...prev,
              assigned_to: profileId,
              assigned_profile: staffProfile || null,
            }
          : null,
      );
    }

    const res = await enquiryService.assignEnquiry(
      id,
      profileId,
      staffProfile?.full_name || undefined,
    );

    if (!res.success) {
      fetchEnquiries();
      alert(res.error || "Failed to assign staff member");
    }
  };

  // Delete Enquiry State & Handler
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await enquiryService.deleteEnquiry(enquiryToDelete.id);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        setEnquiryToDelete(null);
        fetchEnquiries();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete enquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Server-side pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paginatedEnquiries = enquiries;

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
        title="Customer Enquiries & RFQs | Akira Precision Automation CRM"
        description="Enterprise CRM people and customer enquiries directory with precision metrology RFQs and lead management."
      />

      <div className="space-y-4 w-full pb-12 font-sans text-slate-900">
        {/* Page Title & Customize Columns Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading tracking-tight">
                Customer Enquiries & RFQs
              </h1>
              <Chip
                size="sm"
                variant="soft"
                color="default"
                className="hidden sm:inline-flex font-mono text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200"
              >
                People
              </Chip>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Manage inbound measurement requirements, customer requests for
              quotations, and active sales leads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Customize Columns Dropdown with LocalStorage */}
            <div className="relative column-customizer-container">
              <Button
                variant="outline"
                size="sm"
                onPress={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs font-sans cursor-pointer ${
                  isColumnMenuOpen
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                aria-label="Customize visible columns"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>Customize Columns</span>
              </Button>

              {isColumnMenuOpen && (
                <Card className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-0 z-40 text-xs animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800 font-heading block">
                        Display & Order
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Drag or use arrows to reorder
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={resetColumns}
                      onClick={resetColumns}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer h-auto p-1 min-w-0"
                    >
                      Reset All
                    </Button>
                  </div>

                  <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                    {columns.map((col, idx) => (
                      <div
                        key={col.key}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs cursor-grab active:cursor-grabbing transition-all ${
                          draggedIndex === idx
                            ? "bg-blue-50 border-blue-300 opacity-60"
                            : "bg-white hover:bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 cursor-grab" />
                          <div className="flex items-center gap-2 select-none truncate">
                            <Checkbox
                              isSelected={col.visible}
                              onChange={() => toggleColumn(col.key)}
                              aria-label={col.label}
                            >
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox>
                            <span
                              onClick={() => toggleColumn(col.key)}
                              className={`text-xs font-semibold truncate cursor-pointer ${col.visible ? "text-slate-800" : "text-slate-400 line-through"}`}
                            >
                              {col.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            isDisabled={idx === 0}
                            onPress={() => moveColumn(idx, idx - 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 transition-colors cursor-pointer min-w-0 h-auto"
                            aria-label={`Move ${col.label} column up`}
                          >
                            <span
                              title="Move column up"
                              className="pointer-events-none"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </span>
                          </Button>
                          <Button
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            isDisabled={idx === columns.length - 1}
                            onPress={() => moveColumn(idx, idx + 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 transition-colors cursor-pointer min-w-0 h-auto"
                            aria-label={`Move ${col.label} column down`}
                          >
                            <span
                              title="Move column down"
                              className="pointer-events-none"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-3.5 py-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between bg-slate-50/50 font-mono">
                    <span>Reorder applies to table</span>
                    <span className="text-emerald-600 font-bold">
                      Auto-saved
                    </span>
                  </div>
                </Card>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onPress={fetchEnquiries}
              isDisabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all text-xs font-semibold font-sans cursor-pointer"
              aria-label="Refresh lead data"
            >
              <RotateCw
                className={`w-3.5 h-3.5 shrink-0 ${isLoading ? "animate-spin text-blue-600" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status Column Filter Row with Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt.status;
            const count = statusCounts[opt.countKey] || 0;

            return (
              <Button
                key={opt.status}
                variant={isSelected ? "primary" : "outline"}
                size="sm"
                onPress={() => handleStatusChange(opt.status)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs whitespace-nowrap shrink-0 font-sans cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Search Bar & Selected Rows Bar */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none z-10" />
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, company, email, phone, or requirement..."
              className="w-full pl-10 pr-28 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 shadow-2xs transition-all font-sans text-slate-800"
            />
            <div className="absolute right-3 flex items-center gap-2 z-10">
              {search && (
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer min-w-0 h-auto"
                  aria-label="Clear search"
                >
                  <span title="Clear search" className="pointer-events-none">
                    <X className="w-3.5 h-3.5" />
                  </span>
                </Button>
              )}
              <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                {paginatedEnquiries.length} of {totalCount}
              </span>
            </div>
          </div>

          {selectedRowIds.size > 0 && (
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 font-sans shadow-2xs">
              <div className="flex items-center gap-2 font-medium">
                <span className="font-bold text-blue-700 font-mono">
                  {selectedRowIds.size}
                </span>
                <span>leads selected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setSelectedRowIds(new Set())}
                className="text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                Deselect All
              </Button>
            </div>
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
          <Card className="rounded-2xl border p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200/60">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              No enquiries found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {search || selectedStatus !== "all"
                ? "No items match your active search filters. Try adjusting query parameters or reset filters."
                : "No customer enquiries or technical RFQs have been received yet. All new inbound leads will appear here automatically."}
            </p>
            {(search || selectedStatus !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  setSearch("");
                  handleStatusChange("all");
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/50 border border-blue-200 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Clear all filters
              </Button>
            )}
          </Card>
        ) : (
          <>
            <Table className="w-full">
              <Table.ScrollContainer className="overflow-x-auto">
                <Table.Content
                  aria-label="Customer Enquiries and RFQs Data Grid"
                  onRowAction={(key) => {
                    const found = enquiries.find((e) => e.id === String(key));
                    if (found) setSelectedDossierEnquiry(found);
                  }}
                  className="w-full text-left text-xs min-w-[840px]"
                >
                  {/* Table Header */}
                  <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                    <Table.Column className="py-3.5 pl-5 pr-3 w-10">
                      <span className="sr-only">Select All</span>
                      <Checkbox
                        slot="selection"
                        isSelected={
                          paginatedEnquiries.length > 0 &&
                          selectedRowIds.size === paginatedEnquiries.length
                        }
                        onChange={toggleSelectAll}
                        aria-label="Select all rows"
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox>
                    </Table.Column>

                    {activeColumns.map((col) => (
                      <Table.Column
                        key={col.key}
                        isRowHeader={col.key === "name"}
                        className={`py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap ${
                          col.key === "status" ? "text-center" : ""
                        }`}
                      >
                        {col.label}
                      </Table.Column>
                    ))}

                    <Table.Column className="py-3.5 px-4 text-right w-16 font-semibold text-slate-600 whitespace-nowrap">
                      Action
                    </Table.Column>
                  </Table.Header>

                  {/* Table Body */}
                  <Table.Body className="divide-y divide-slate-100 text-xs">
                    {paginatedEnquiries.map((enq) => {
                      const isRowSelected = selectedRowIds.has(enq.id);
                      const requirementDisplay =
                        enq.specific_product ||
                        enq.subject ||
                        enq.message ||
                        "Custom Gauging Requirement";
                      const statusConfig =
                        STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;

                      return (
                        <Table.Row
                          key={enq.id}
                          id={enq.id}
                          onAction={() => setSelectedDossierEnquiry(enq)}
                          onClick={() => setSelectedDossierEnquiry(enq)}
                          className={`transition-colors cursor-pointer group ${
                            isRowSelected
                              ? "bg-blue-50/30"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Row Checkbox */}
                          <Table.Cell
                            className="py-3.5 pl-5 pr-3 w-10"
                            onClick={(e) => toggleSelectRow(enq.id, e)}
                          >
                            <Checkbox
                              slot="selection"
                              isSelected={isRowSelected}
                              aria-label={`Select ${enq.name}`}
                            >
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox>
                          </Table.Cell>

                          {/* Dynamic Ordered Column Cells */}
                          {activeColumns.map((col) => {
                            switch (col.key) {
                              case "datetime":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>
                                        {formatDateTimeDDMMYYYY(enq.created_at)}
                                      </span>
                                    </div>
                                  </Table.Cell>
                                );

                              case "name":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap"
                                  >
                                    <div className="flex items-center gap-3">
                                      <PersonAvatar name={enq.name} size="md" />
                                      <div>
                                        <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors block">
                                          {enq.name}
                                        </span>
                                        {enq.source && (
                                          <span className="text-[10px] text-slate-600 font-mono capitalize">
                                            via {enq.source.replace("_", " ")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Table.Cell>
                                );

                              case "company":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <CompanyAvatar
                                        company={enq.company}
                                        size="sm"
                                      />
                                      <span className="text-sm text-slate-800 font-medium">
                                        {enq.company || "Direct Client"}
                                      </span>
                                    </div>
                                  </Table.Cell>
                                );

                              case "email":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap"
                                  >
                                    {enq.email ? (
                                      <a
                                        href={`mailto:${enq.email}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px] inline-block font-mono font-medium"
                                      >
                                        {enq.email}
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 italic text-xs">
                                        No email
                                      </span>
                                    )}
                                  </Table.Cell>
                                );

                              case "requirement":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap"
                                  >
                                    <div className="max-w-[240px]">
                                      <span className="text-xs text-slate-700 truncate block font-medium">
                                        {requirementDisplay}
                                      </span>
                                      {enq.product_category && (
                                        <span className="text-[10px] text-slate-600 font-mono">
                                          {enq.product_category}
                                        </span>
                                      )}
                                    </div>
                                  </Table.Cell>
                                );

                              case "phone":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap"
                                  >
                                    <span className="text-xs text-slate-600 font-mono">
                                      {enq.phone || "—"}
                                    </span>
                                  </Table.Cell>
                                );

                              case "assigned":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap"
                                  >
                                    {enq.assigned_profile ? (
                                      <div className="flex items-center gap-2">
                                        <PersonAvatar
                                          name={
                                            enq.assigned_profile.full_name ||
                                            enq.assigned_profile.email
                                          }
                                          size="sm"
                                        />
                                        <span className="text-xs font-semibold text-slate-800">
                                          {enq.assigned_profile.full_name ||
                                            enq.assigned_profile.email}
                                        </span>
                                      </div>
                                    ) : (
                                      <Chip
                                        size="sm"
                                        variant="soft"
                                        color="default"
                                        className="text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200"
                                      >
                                        Unassigned
                                      </Chip>
                                    )}
                                  </Table.Cell>
                                );

                              case "status":
                                return (
                                  <Table.Cell
                                    key={col.key}
                                    className="py-3.5 px-4 whitespace-nowrap text-center"
                                  >
                                    <Chip
                                      size="sm"
                                      variant="soft"
                                      color="default"
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                                      />
                                      <span>{statusConfig.label}</span>
                                    </Chip>
                                  </Table.Cell>
                                );

                              default:
                                return null;
                            }
                          })}

                          {/* Quick Action Buttons */}
                          <Table.Cell className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => setSelectedDossierEnquiry(enq)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                aria-label={`View dossier for ${enq.name}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>

                              <Link
                                to={`/admin/enquiries/${enq.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer inline-flex items-center justify-center shadow-2xs"
                                aria-label={`View full dossier page for ${enq.name}`}
                                title="Open dedicated enquiry dossier"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <Button
                                variant="outline"
                                size="sm"
                                onPress={() => setEnquiryToDelete(enq)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors cursor-pointer"
                                aria-label={`Delete enquiry for ${enq.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>

            {/* Pagination Console */}
            <div className="border-t border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 bg-slate-50/40">
              <div className="font-mono text-[11px]">
                Page{" "}
                <span className="font-bold text-slate-700">{currentPage}</span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">{totalPages}</span> (
                {totalCount} total)
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={currentPage === 1}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => i + 1,
                ).map((pageNum) => {
                  const isActive = currentPage === pageNum;
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "primary" : "outline"}
                      size="sm"
                      onPress={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 min-w-7 p-0 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors font-mono ${
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-400 font-mono">...</span>
                    <Button
                      variant={
                        currentPage === totalPages ? "primary" : "outline"
                      }
                      size="sm"
                      onPress={() => setCurrentPage(totalPages)}
                      className={`w-7 h-7 min-w-7 p-0 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors font-mono ${
                        currentPage === totalPages
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={currentPage === totalPages}
                  onPress={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Interactive Detail Dossier Slide-Over Drawer */}
      <AdminEnquiryDossierDrawer
        enquiry={selectedDossierEnquiry}
        isOpen={!!selectedDossierEnquiry}
        onClose={() => setSelectedDossierEnquiry(null)}
        onStatusChange={async (id, newStatus) => {
          await handleStatusUpdate(
            id,
            newStatus,
            selectedDossierEnquiry?.status,
          );
        }}
        onAssignStaff={handleAssignStaff}
        onEnquiryUpdated={() => {
          fetchEnquiries();
        }}
        staffProfiles={adminProfiles}
      />

      {/* Delete Confirmation Modal */}
      {enquiryToDelete && (
        <Modal.Backdrop
          isOpen={!!enquiryToDelete}
          onOpenChange={(open) => {
            if (!open) {
              setEnquiryToDelete(null);
              setDeleteError(null);
            }
          }}
        >
          <Modal.Container placement="center" className="w-full max-w-md">
            <Modal.Dialog className="p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
              <Modal.CloseTrigger />
              <Modal.Header className="pb-3 border-b border-slate-100 flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5 shrink-0" />
                <Modal.Heading className="text-base font-bold text-slate-900">
                  Delete Customer Enquiry?
                </Modal.Heading>
              </Modal.Header>

              {deleteError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                  {deleteError}
                </div>
              )}

              <Modal.Body className="py-4 text-xs text-slate-600 space-y-2">
                <p>
                  Are you sure you want to permanently delete the enquiry from{" "}
                  <strong className="text-slate-900">{enquiryToDelete.name}</strong>
                  {enquiryToDelete.company ? ` (${enquiryToDelete.company})` : ""}?
                </p>
                <p className="text-slate-500 text-[11px]">
                  This action will permanently delete this record and cannot be undone.
                </p>
              </Modal.Body>

              <Modal.Footer className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setEnquiryToDelete(null);
                    setDeleteError(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isDisabled={isDeleting}
                  onPress={handleDeleteEnquiry}
                  className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Permanently</span>
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </>
  );
};
