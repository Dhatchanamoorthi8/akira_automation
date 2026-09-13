import React, { useState, useMemo } from 'react';
import { Enquiry, EnquiryStatus } from '../../types/database';
import { formatDate } from '../../utils/date';
import { Inbox, Search, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
  isLoading?: boolean;
}

const statusBadgeStyles: Record<EnquiryStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: 'bg-blue-50 border-blue-200/60', text: 'text-blue-700', dot: 'bg-blue-500' },
  contacted: { bg: 'bg-sky-50 border-sky-200/60', text: 'text-sky-700', dot: 'bg-sky-500' },
  quotation_sent: { bg: 'bg-amber-50 border-amber-200/60', text: 'text-amber-700', dot: 'bg-amber-500' },
  follow_up: { bg: 'bg-indigo-50 border-indigo-200/60', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  converted: { bg: 'bg-emerald-50 border-emerald-200/60', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  closed: { bg: 'bg-slate-100 border-slate-200/60', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const statusLabels: Record<EnquiryStatus, string> = {
  new: 'New RFQ',
  contacted: 'Contacted',
  quotation_sent: 'Quote Sent',
  follow_up: 'Follow-up',
  converted: 'Converted',
  closed: 'Closed',
};

// Avatar color assignment based on name
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
];

export const RecentEnquiries: React.FC<RecentEnquiriesProps> = ({ enquiries, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchesSearch =
        !searchTerm ||
        enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.subject?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || enq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchTerm, statusFilter]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-slate-200 rounded-md" />
          <div className="h-8 w-32 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Header matching visual reference with search and filter controls */}
      <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Inbound Enquiries
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {enquiries.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest customer RFQs and qualification status
          </p>
        </div>

        {/* Search, Filter & View All Link */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 sm:w-52 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quotation_sent">Quote Sent</option>
            <option value="follow_up">Follow-up</option>
            <option value="converted">Converted</option>
          </select>

          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors ml-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {filteredEnquiries.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-600">
            {enquiries.length === 0 ? 'No Enquiries Yet' : 'No Enquiries Found'}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'No records match your active search and filter criteria.'
              : 'Submissions through website contact forms will register here in real time.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Product / Requirement</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredEnquiries.map((enq) => {
                  const style = statusBadgeStyles[enq.status] || statusBadgeStyles.new;
                  const initials = getInitials(enq.name);
                  const avatarColor = getAvatarColor(enq.name);

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* Customer with circular avatar */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {enq.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {enq.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-6 text-slate-600 font-medium whitespace-nowrap">
                        {enq.company || '—'}
                      </td>

                      {/* Product Requirement */}
                      <td className="py-3.5 px-6 text-slate-700 max-w-xs truncate">
                        <span className="font-medium text-slate-800">
                          {enq.specific_product || enq.product_category || enq.subject || enq.message}
                        </span>
                      </td>

                      {/* Status pill with dot indicator */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span>{statusLabels[enq.status] || enq.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-6 text-right text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(enq.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (<= 768px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredEnquiries.map((enq) => {
              const style = statusBadgeStyles[enq.status] || statusBadgeStyles.new;
              const initials = getInitials(enq.name);
              const avatarColor = getAvatarColor(enq.name);

              return (
                <div key={enq.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarColor}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{enq.name}</h4>
                        <div className="text-[11px] text-slate-500">
                          {enq.company || enq.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.bg} ${style.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      <span>{statusLabels[enq.status] || enq.status}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 pl-10">
                    {enq.specific_product || enq.product_category || enq.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono pl-10">
                    <span>{enq.email}</span>
                    <span>{formatDate(enq.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
