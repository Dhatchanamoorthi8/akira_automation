import React from 'react';
import { Card, Chip } from '@heroui/react';
import { Followup } from '../../types/database';
import { formatDateTime } from '../../utils/date';
import { CalendarCheck2, Phone, Mail, Users, Monitor, FileText, Clock } from 'lucide-react';

interface UpcomingFollowupsProps {
  followups: Followup[];
  isLoading?: boolean;
}

const typeIcons: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  demo: Monitor,
  quotation: FileText,
  other: Clock,
};

export const UpcomingFollowups: React.FC<UpcomingFollowupsProps> = ({ followups, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs animate-pulse space-y-4 h-full flex flex-col">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="space-y-3 flex-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col h-full flex-1 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
            Upcoming Follow-ups
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled client appointments and technical calls
          </p>
        </div>
        <Chip
          variant="soft"
          color="default"
          size="sm"
          className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60"
        >
          <Chip.Label>{followups.length}</Chip.Label>
        </Chip>
      </div>

      {followups.length === 0 ? (
        <div className="flex-1 min-h-[180px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <CalendarCheck2 className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-700 font-heading">No upcoming follow-ups.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Customer follow-ups and reminder dates will list here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {followups.map((item) => {
            const Icon = typeIcons[item.type] || Phone;
            const enquiryDetails = (item as any).enquiries;
            const customerName = enquiryDetails?.name || 'Customer Inquiry';
            const companyName = enquiryDetails?.company;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-sky-500/40 transition-colors flex items-start gap-3 bg-slate-50/50 hover:bg-slate-50 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {customerName}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold text-blue-600 shrink-0 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                      {formatDateTime(item.scheduled_at)}
                    </span>
                  </div>

                  {companyName && (
                    <p className="text-[11px] text-slate-500 truncate font-medium">
                      {companyName}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
