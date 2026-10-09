import React from "react";
import { Card, Chip, Button, Spinner } from "@heroui/react";
import { MapPin, Plus, Navigation, X, Check, ExternalLink } from "lucide-react";
import { FieldVisit } from "../../../types/database";
import { formatDate } from "../../../utils/date";

interface StaffVisitsTabProps {
  visits: FieldVisit[];
  isCheckingInId?: string | null;
  onOpenScheduleModal: () => void;
  onCancelVisit: (visitId: string) => void;
  onCheckInVisit: (visitId: string) => void;
  onStartCompleteVisit: (vis: FieldVisit) => void;
}

export const StaffVisitsTab: React.FC<StaffVisitsTabProps> = ({
  visits,
  isCheckingInId,
  onOpenScheduleModal,
  onCancelVisit,
  onCheckInVisit,
  onStartCompleteVisit,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-industrial-dark font-heading">
          Customer Site Visits & Inspections
        </h3>
        <Button
          variant="primary"
          size="sm"
          onPress={onOpenScheduleModal}
          className="gap-1 text-xs font-semibold bg-industrial-blue hover:bg-sky-700 shadow-xs text-white cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Schedule Visit
        </Button>
      </div>

      {visits.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200 shadow-xs">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 font-heading">
            No Field Visits Scheduled
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Schedule customer on-site visits to record GPS check-in/out and
            inspection evidence.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map((vis) => (
            <Card
              key={vis.id}
              className="p-4 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      vis.status === "completed"
                        ? "success"
                        : vis.status === "in_progress"
                          ? "warning"
                          : "accent"
                    }
                    className="font-bold uppercase text-[10px]"
                  >
                    {(vis.status || "").replace("_", " ")}
                  </Chip>
                  <h4 className="text-sm font-bold text-industrial-dark font-heading mt-1">
                    {vis.title}
                  </h4>
                  <p className="text-xs text-slate-500 capitalize">
                    Purpose:{" "}
                    {(
                      vis.visit_purpose ||
                      (vis as any).purpose ||
                      "General"
                    ).replace("_", " ")}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {formatDate(vis.scheduled_at)}
                </span>
              </div>

              {vis.enquiry && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">
                    {vis.enquiry.name} ({vis.enquiry.company || "Client"})
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {vis.enquiry.phone} • {vis.enquiry.email}
                  </p>
                </div>
              )}

              {vis.check_in_at && (
                <div className="text-[11px] text-slate-500 space-y-1 bg-sky-50/60 p-2.5 rounded-lg border border-sky-100">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 text-sky-800 font-semibold">
                      <Navigation className="w-3 h-3 text-sky-600" />
                      Checked In:{" "}
                      {new Date(vis.check_in_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {vis.check_in_lat && vis.check_in_lng && (
                      <a
                        href={`https://www.google.com/maps?q=${vis.check_in_lat},${vis.check_in_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-700 hover:text-sky-900 font-mono inline-flex items-center gap-1 font-semibold text-[10px]"
                      >
                        <MapPin className="w-2.5 h-2.5 text-sky-600" />
                        <span>
                          {vis.check_in_lat.toFixed(4)}, {vis.check_in_lng.toFixed(4)}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {vis.check_in_address && (
                    <p className="text-slate-600 text-[11px]">
                      {vis.check_in_address}
                    </p>
                  )}
                </div>
              )}

              {vis.check_out_at && (
                <div className="text-[11px] text-slate-500 space-y-1 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Checked Out:{" "}
                      {new Date(vis.check_out_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {vis.check_out_lat && vis.check_out_lng && (
                      <a
                        href={`https://www.google.com/maps?q=${vis.check_out_lat},${vis.check_out_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-mono inline-flex items-center gap-1 font-semibold text-[10px]"
                      >
                        <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                        <span>
                          {vis.check_out_lat.toFixed(4)}, {vis.check_out_lng.toFixed(4)}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {vis.check_out_address && (
                    <p className="text-slate-600 text-[11px]">
                      {vis.check_out_address}
                    </p>
                  )}
                </div>
              )}

              {vis.outcome_notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded italic">
                  "{vis.outcome_notes}"
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {vis.duration_minutes
                    ? `Duration: ${vis.duration_minutes} mins`
                    : "Pending Check-out"}
                </span>

                {vis.status === "scheduled" && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => onCancelVisit(vis.id)}
                      isDisabled={isCheckingInId === vis.id}
                      className="gap-1 px-2.5 h-7 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                      aria-label={`Cancel visit ${vis.title}`}
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => onCheckInVisit(vis.id)}
                      isDisabled={isCheckingInId === vis.id}
                      className="gap-1 px-3 h-7 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                    >
                      {isCheckingInId === vis.id ? (
                        <Spinner size="sm" color="current" />
                      ) : (
                        <Navigation className="w-3 h-3" />
                      )}
                      Check In (GPS)
                    </Button>
                  </div>
                )}

                {vis.status === "in_progress" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => onStartCompleteVisit(vis)}
                    className="gap-1 px-3 h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Complete Visit
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
