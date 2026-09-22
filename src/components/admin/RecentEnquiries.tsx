import React, { useState, useMemo } from 'react';
import { Card, Table, Chip, Button } from '@heroui/react';
import { Enquiry, EnquiryStatus } from '../../types/database';
import { formatDate } from '../../utils/date';
import { Inbox, Search, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PersonAvatar, CompanyAvatar } from '../../utils/avatarHelper';
import { AdminEnquiryDossierDrawer } from './AdminEnquiryDossierDrawer';

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
  isLoading?: boolean;
}

const statusBadgeStyles: Record<EnquiryStatus, { bg: string; text: string; dot: string; color: "accent" | "success" | "warning" | "danger" | "default" }> = {
  new: { bg: 'bg-blue-50 border-blue-200/60', text: 'text-blue-700', dot: 'bg-blue-600', color: 'accent' },
  contacted: { bg: 'bg-sky-50 border-sky-200/60', text: 'text-sky-700', dot: 'bg-sky-500', color: 'accent' },
  quotation_sent: { bg: 'bg-amber-50 border-amber-200/60', text: 'text-amber-700', dot: 'bg-amber-500', color: 'warning' },
  follow_up: { bg: 'bg-indigo-50 border-indigo-200/60', text: 'text-indigo-700', dot: 'bg-indigo-500', color: 'accent' },
  converted: { bg: 'bg-emerald-50 border-emerald-200/60', text: 'text-emerald-700', dot: 'bg-emerald-600', color: 'success' },
  closed: { bg: 'bg-slate-100 border-slate-200/60', text: 'text-slate-600', dot: 'bg-slate-400', color: 'default' },
};

const statusLabels: Record<EnquiryStatus, string> = {
  new: 'New RFQ',
  contacted: 'Contacted',
  quotation_sent: 'Quote Sent',
  follow_up: 'Follow-up',
  converted: 'Converted',
  closed: 'Closed',
};

export const RecentEnquiries: React.FC<RecentEnquiriesProps> = ({ enquiries, isLoading }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleRowClick = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-slate-200 rounded-md" />
          <div className="h-8 w-32 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Header matching visual reference with search and filter controls */}
        <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                Recent Inbound Enquiries
              </h3>
              <Chip
                variant="soft"
                color="default"
                size="sm"
                className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono"
              >
                <Chip.Label>{enquiries.length} total</Chip.Label>
              </Chip>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest customer RFQs and qualification status
            </p>
          </div>

          {/* Search, Filter & View All Link */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 sm:w-52 transition-all font-sans"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quotation_sent">Quote Sent</option>
              <option value="follow_up">Follow-up</option>
              <option value="converted">Converted</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onPress={() => navigate('/admin/enquiries')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors ml-1 font-sans cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </Button>
          </div>
        </div>

        {filteredEnquiries.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 font-heading">
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
              <Table className="w-full">
                <Table.ScrollContainer>
                  <Table.Content aria-label="Recent Inbound Enquiries" className="w-full text-left text-xs min-w-[700px]">
                    <Table.Header className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 font-mono">
                      <Table.Column isRowHeader className="py-3 px-6">Customer</Table.Column>
                      <Table.Column className="py-3 px-6">Company</Table.Column>
                      <Table.Column className="py-3 px-6">Product / Requirement</Table.Column>
                      <Table.Column className="py-3 px-6">Status</Table.Column>
                      <Table.Column className="py-3 px-6 text-right">Date</Table.Column>
                    </Table.Header>
                    <Table.Body className="divide-y divide-slate-100">
                      {filteredEnquiries.map((enq) => {
                        const style = statusBadgeStyles[enq.status] || statusBadgeStyles.new;

                        return (
                          <Table.Row
                            key={enq.id}
                            className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                            onClick={() => handleRowClick(enq)}
                          >
                            {/* Customer with dicebear PersonAvatar */}
                            <Table.Cell className="py-3.5 px-6 whitespace-nowrap">
                              <div
                                onClick={() => handleRowClick(enq)}
                                className="flex items-center gap-3 cursor-pointer group/user"
                              >
                                <PersonAvatar name={enq.name} size="sm" />
                                <div>
                                  <div className="font-bold text-slate-900 group-hover/user:text-blue-600 transition-colors">
                                    {enq.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    {enq.email}
                                  </div>
                                </div>
                              </div>
                            </Table.Cell>

                            {/* Company */}
                            <Table.Cell className="py-3.5 px-6 text-slate-700 font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {enq.company && <CompanyAvatar company={enq.company} size="sm" />}
                                <span>{enq.company || '—'}</span>
                              </div>
                            </Table.Cell>

                            {/* Product Requirement */}
                            <Table.Cell className="py-3.5 px-6 text-slate-700 max-w-xs truncate">
                              <span className="font-semibold text-slate-800">
                                {enq.specific_product || enq.product_category || enq.subject || enq.message}
                              </span>
                            </Table.Cell>

                            {/* Status pill with HeroUI Chip */}
                            <Table.Cell className="py-3.5 px-6 whitespace-nowrap">
                              <Chip
                                variant="soft"
                                color={style.color}
                                size="sm"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} font-mono`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                                <Chip.Label>{statusLabels[enq.status] || enq.status}</Chip.Label>
                              </Chip>
                            </Table.Cell>

                            {/* Date */}
                            <Table.Cell className="py-3.5 px-6 text-right text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <span>{formatDate(enq.created_at)}</span>
                                <Button
                                  isIconOnly
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`View dossier for ${enq.name}`}
                                  onPress={() => handleRowClick(enq)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                >
                                  <ChevronRight className="w-4 h-4 shrink-0" />
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
            </div>

            {/* Mobile Card View (<= 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredEnquiries.map((enq) => {
                const style = statusBadgeStyles[enq.status] || statusBadgeStyles.new;

                return (
                  <div
                    key={enq.id}
                    onClick={() => handleRowClick(enq)}
                    className="p-4 space-y-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <PersonAvatar name={enq.name} size="sm" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{enq.name}</h4>
                          <div className="text-[11px] text-slate-500 truncate font-mono">
                            {enq.company || enq.email}
                          </div>
                        </div>
                      </div>
                      <Chip
                        variant="soft"
                        color={style.color}
                        size="sm"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} shrink-0 font-mono`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        <Chip.Label>{statusLabels[enq.status] || enq.status}</Chip.Label>
                      </Chip>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 pl-10">
                      {enq.specific_product || enq.product_category || enq.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono pl-10">
                      <span className="truncate pr-2">{enq.email}</span>
                      <span className="shrink-0">{formatDate(enq.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Detail Dossier Drawer */}
      {selectedEnquiry && (
        <AdminEnquiryDossierDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedEnquiry(null);
          }}
          enquiry={selectedEnquiry as unknown as import('../../types/database').EnquiryWithDetails}
        />
      )}
    </>
  );
};
