import React from 'react';
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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle animate-pulse space-y-4">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Upcoming Follow-ups
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled client appointments and technical calls
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
          {followups.length}
        </span>
      </div>

      {followups.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <CalendarCheck2 className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No upcoming follow-ups.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Customer follow-ups and reminder dates will list here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {followups.map((item) => {
            const Icon = typeIcons[item.type] || Phone;
            const enquiryDetails = (item as any).enquiries;
            const customerName = enquiryDetails?.name || 'Customer Inquiry';
            const companyName = enquiryDetails?.company;

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200/80 hover:border-industrial-primary/30 transition-colors flex items-start gap-3 bg-slate-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-industrial-primary flex items-center justify-center shrink-0 shadow-subtle mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4 className="text-xs font-bold text-industrial-dark truncate">
                      {customerName}
                    </h4>
                    <span className="text-[10px] font-mono text-industrial-primary shrink-0">
                      {formatDateTime(item.scheduled_at)}
                    </span>
                  </div>

                  {companyName && (
                    <p className="text-[11px] text-slate-500 truncate">
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
    </div>
  );
};
