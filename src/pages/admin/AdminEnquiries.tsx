import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  RotateCw,
  Phone,
  Mail,
  ExternalLink,
  SlidersHorizontal,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Archive,
  Inbox,
} from 'lucide-react';
import {
  EnquiryWithDetails,
  EnquiryStatus,
  EnquiryFilters,
  StaffProfile,
} from '../../types/database';
import { enquiryService, StatusCounts } from '../../services/enquiryService';
import { formatDate } from '../../utils/date';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';

const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  new: {
    label: 'New RFQ',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: Inbox,
  },
  contacted: {
    label: 'Contacted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Mail,
  },
  quotation_sent: {
    label: 'Quotation Sent',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Send,
  },
  follow_up: {
    label: 'In Follow-up',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Clock,
  },
  converted: {
    label: 'Converted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed / Inactive',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: Archive,
  },
};

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
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus | 'all'>(initialStatus);
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'name' | 'company'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch staff list once
  useEffect(() => {
    enquiryService.getAdminProfiles().then(setStaffProfiles).catch(() => {});
  }, []);

  // Fetch enquiries & counts
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: EnquiryFilters = {
      search: search.trim() || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      assignedTo: assignedFilter !== 'all' ? assignedFilter : undefined,
      source: sourceFilter !== 'all' ? sourceFilter : undefined,
      sortBy,
      sortOrder,
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
  }, [search, selectedStatus, assignedFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Sync tab change with URL params
  const handleStatusChange = (status: EnquiryStatus | 'all') => {
    setSelectedStatus(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <SEOHead
        title="Inbound Enquiries & Technical RFQs | AKIRA AUTOMATION Admin"
        description="Enterprise CRM management for inbound precision gauging inquiries, quotes, and customer follow-ups."
      />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading tracking-tight">
                Customer Enquiries & RFQs
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 text-industrial-primary border border-sky-200">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage inbound measurement requirements, customer requests for quotations, and active sales leads.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchEnquiries}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-industrial-dark hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 shadow-subtle min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
              title="Refresh enquiry list"
              aria-label="Refresh enquiry list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-industrial-primary' : ''}`} />
            </button>
            <Link
              to="/admin/followups"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-industrial-primary hover:bg-slate-50 shadow-subtle transition-all min-h-[38px]"
            >
              <Clock className="w-4 h-4 text-industrial-primary" />
              <span>View Follow-up Schedule</span>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
          <button
            type="button"
            onClick={() => handleStatusChange('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
              selectedStatus === 'all'
                ? 'bg-industrial-primary text-white shadow-subtle'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Leads</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedStatus === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {statusCounts.all}
            </span>
          </button>

          {(Object.keys(STATUS_CONFIG) as EnquiryStatus[]).map((st) => {
            const config = STATUS_CONFIG[st];
            const Icon = config.icon;
            const count = statusCounts[st] || 0;
            const isSelected = selectedStatus === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-industrial-primary text-white shadow-subtle'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{config.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Secondary Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, company, email, phone, or subject..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary transition-colors text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Assigned Staff Filter */}
            <div>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-700"
                aria-label="Filter by assigned staff"
              >
                <option value="all">All Assigned Staff</option>
                <option value="unassigned">Unassigned Inquiries</option>
                {staffProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-700"
                aria-label="Filter by source"
              >
                <option value="all">All Acquisition Sources</option>
                <option value="website">Website Form</option>
                <option value="product_detail">Product Detail Modal</option>
                <option value="direct">Direct Inbound</option>
              </select>
            </div>
          </div>

          {/* Quick Sort & Reset Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'created_at') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else {
                    setSortBy('created_at');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium ${
                  sortBy === 'created_at' ? 'bg-sky-50 text-industrial-primary font-semibold' : 'hover:text-slate-800'
                }`}
              >
                Date Received {sortBy === 'created_at' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else {
                    setSortBy('name');
                    setSortOrder('asc');
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium ${
                  sortBy === 'name' ? 'bg-sky-50 text-industrial-primary font-semibold' : 'hover:text-slate-800'
                }`}
              >
                Customer Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'company') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else {
                    setSortBy('company');
                    setSortOrder('asc');
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium ${
                  sortBy === 'company' ? 'bg-sky-50 text-industrial-primary font-semibold' : 'hover:text-slate-800'
                }`}
              >
                Company {sortBy === 'company' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </div>

            {(search || selectedStatus !== 'all' || assignedFilter !== 'all' || sourceFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('all');
                  setAssignedFilter('all');
                  setSourceFilter('all');
                  searchParams.delete('status');
                  setSearchParams(searchParams);
                }}
                className="text-xs text-industrial-primary hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <AdminErrorState
            title="Database Connection Issue"
            message={`Unable to load enquiries: ${error}`}
            onRetry={fetchEnquiries}
          />
        ) : isLoading ? (
          <AdminTableSkeleton rows={8} />
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-industrial-dark">No enquiries found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || selectedStatus !== 'all' || assignedFilter !== 'all'
                ? 'No items match your active search filters. Try adjusting query parameters or reset filters.'
                : 'No customer enquiries or technical RFQs have been received yet. All new inbound leads will appear here automatically.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (lg+) */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer & Company</th>
                      <th className="py-3 px-4">Subject & Requirement</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Assigned</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {enquiries.map((enq) => {
                      const statusConf = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
                      const StatusIcon = statusConf.icon;

                      return (
                        <tr key={enq.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Date */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {formatDate(enq.created_at)}
                          </td>

                          {/* Customer & Company */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-industrial-dark">
                              <Link
                                to={`/admin/enquiries/${enq.id}`}
                                className="hover:text-industrial-primary transition-colors"
                              >
                                {enq.name}
                              </Link>
                            </div>
                            {enq.company && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                <span>{enq.company}</span>
                              </div>
                            )}
                          </td>

                          {/* Subject & Requirement */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-medium text-slate-800 line-clamp-1">
                              {enq.subject || 'Gauging Requirement'}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {enq.specific_product ? (
                                <span className="text-industrial-primary font-semibold mr-1">
                                  [{enq.specific_product}]
                                </span>
                              ) : null}
                              {enq.message}
                            </div>
                          </td>

                          {/* Direct Contact Actions */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {enq.email && (
                                <a
                                  href={`mailto:${enq.email}?subject=RE: ${encodeURIComponent(enq.subject || 'AKIRA AUTOMATION Gauging Inquiry')}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 text-slate-600 hover:text-industrial-primary hover:bg-sky-50 border border-slate-200 text-[11px] transition-colors"
                                  title={`Email ${enq.email}`}
                                >
                                  <Mail className="w-3 h-3" />
                                  <span className="font-mono">{enq.email}</span>
                                </a>
                              )}
                              {enq.phone && (
                                <a
                                  href={`tel:${enq.phone}`}
                                  className="inline-flex items-center gap-1 p-1 rounded bg-slate-50 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 text-[11px] transition-colors"
                                  title={`Call ${enq.phone}`}
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              <span>{statusConf.label}</span>
                            </span>
                          </td>

                          {/* Assigned Staff */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                            {enq.assigned_profile ? (
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-industrial-primary" />
                                <span>{enq.assigned_profile.full_name || enq.assigned_profile.email}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link
                              to={`/admin/enquiries/${enq.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-industrial-primary hover:bg-industrial-primary hover:text-white transition-colors"
                            >
                              <span>View Dossier</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Card View (<lg) */}
            <div className="lg:hidden space-y-3">
              {enquiries.map((enq) => {
                const statusConf = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
                const StatusIcon = statusConf.icon;

                return (
                  <div
                    key={enq.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-3"
                  >
                    {/* Top Row: Name, Company, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/admin/enquiries/${enq.id}`}
                          className="font-bold text-industrial-dark text-sm hover:text-industrial-primary transition-colors line-clamp-1"
                        >
                          {enq.name}
                        </Link>
                        {enq.company && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{enq.company}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConf.label}</span>
                      </span>
                    </div>

                    {/* Subject & Brief Message */}
                    <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-industrial-dark line-clamp-1">
                        {enq.subject || 'Technical Requirement'}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {enq.message}
                      </p>
                    </div>

                    {/* Meta: Date & Assigned */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(enq.created_at)}</span>
                      </div>
                      <div>
                        {enq.assigned_profile ? (
                          <span className="text-slate-700 font-sans font-medium">
                            Assigned: {enq.assigned_profile.full_name || enq.assigned_profile.email}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-sans">Unassigned</span>
                        )}
                      </div>
                    </div>

                    {/* Direct Touch Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {enq.phone && (
                        <a
                          href={`tel:${enq.phone}`}
                          className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </a>
                      )}
                      {enq.email && (
                        <a
                          href={`mailto:${enq.email}?subject=RE: ${encodeURIComponent(enq.subject || 'AKIRA AUTOMATION Inquiry')}`}
                          className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-industrial-primary hover:bg-sky-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                        >
                          <Mail className="w-3.5 h-3.5 text-industrial-primary" />
                          <span>Email</span>
                        </a>
                      )}
                      <Link
                        to={`/admin/enquiries/${enq.id}`}
                        className="py-2 px-4 rounded-lg bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover flex items-center justify-center gap-1.5 transition-colors shadow-subtle min-h-[40px]"
                      >
                        <span>Dossier</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};
