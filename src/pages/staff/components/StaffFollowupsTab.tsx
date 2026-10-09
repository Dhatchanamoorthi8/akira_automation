import React from "react";
import { Card, Chip, Button, Spinner } from "@heroui/react";
import { CheckCircle2, ExternalLink, Check } from "lucide-react";
import {
  FollowupWithEnquiry,
  FollowupTimeframe,
} from "../../../types/database";
import { formatDate } from "../../../utils/date";
import { PRIORITY_STYLES } from "../constants";

interface StaffFollowupsTabProps {
  timeframe: FollowupTimeframe;
  onTimeframeChange: (tf: FollowupTimeframe) => void;
  followups: FollowupWithEnquiry[];
  isLoading: boolean;
  onOpenDossier: (enquiryId: string) => void;
  onStartCompleteTask: (item: FollowupWithEnquiry) => void;
}

export const StaffFollowupsTab: React.FC<StaffFollowupsTabProps> = ({
  timeframe,
  onTimeframeChange,
  followups,
  isLoading,
  onOpenDossier,
  onStartCompleteTask,
}) => {
  const timeframeFilters: Array<{ id: FollowupTimeframe; label: string }> = [
    { id: "today", label: "Due Today" },
    { id: "overdue", label: "Overdue Tasks" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "all", label: "All Follow-ups" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {timeframeFilters.map((tf) => {
          const isActive = timeframe === tf.id;
          return (
            <Button
              key={tf.id}
              size="sm"
              variant={isActive ? "primary" : "outline"}
              onPress={() => onTimeframeChange(tf.id)}
              className={`text-xs font-semibold whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-industrial-dark text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tf.label}
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center border border-slate-200">
          <Spinner size="md" className="mx-auto mb-2 text-sky-600" />
          <p className="text-xs text-slate-500">Loading follow-ups...</p>
        </Card>
      ) : followups.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 font-heading">
            No Tasks in this Timeframe
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            You have no scheduled follow-ups matching this filter. Schedule a
            new touchpoint or review other tabs.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followups.map((item) => {
            const priorityStyle =
              PRIORITY_STYLES[item.priority || "medium"] ||
              PRIORITY_STYLES.medium;
            const isOverdue =
              new Date(item.scheduled_at).getTime() < Date.now() &&
              item.status !== "completed" &&
              item.status !== "cancelled";

            return (
              <Card
                key={item.id}
                className={`p-4 border shadow-xs hover:shadow-md transition-shadow space-y-3 ${
                  isOverdue
                    ? "border-rose-300 ring-1 ring-rose-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          item.priority === "urgent"
                            ? "danger"
                            : item.priority === "high"
                              ? "warning"
                              : "accent"
                        }
                        className="font-bold uppercase text-[10px]"
                      >
                        {priorityStyle.label}
                      </Chip>
                      <span className="text-[11px] font-semibold text-slate-500 capitalize">
                        {item.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-industrial-dark mt-1 font-heading">
                      {item.title || "Follow-up Call"}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 block">
                      {formatDate(item.scheduled_at)}
                    </span>
                    {item.due_time && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.due_time}
                      </span>
                    )}
                  </div>
                </div>

                {item.enquiry && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {item.enquiry.name}
                      </span>
                      {item.enquiry.company && (
                        <span className="text-slate-500 text-[11px]">
                          {item.enquiry.company}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-sky-700 font-mono pt-0.5">
                      {item.enquiry.phone && <span>{item.enquiry.phone}</span>}
                      <span>{item.enquiry.email}</span>
                    </div>
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-slate-600 italic line-clamp-2">
                    "{item.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => handleOpenDossierDirect(item.enquiry_id)}
                    className="gap-1 text-slate-600 hover:text-industrial-blue font-semibold text-xs h-7 px-2"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>

                  {item.status !== "completed" &&
                    item.status !== "cancelled" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => onStartCompleteTask(item)}
                        className="gap-1 text-xs font-semibold h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Complete Follow-up
                      </Button>
                    )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  function handleOpenDossierDirect(enquiryId: string) {
    onOpenDossier(enquiryId);
  }
};
