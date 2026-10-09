import React from "react";
import { Link } from "react-router-dom";
import { Card, Chip, Button, Spinner } from "@heroui/react";
import {
  Calendar,
  CircleCheck,
  LocationArrow,
  Power,
  Pin,
  ArrowRight,
} from "@gravity-ui/icons";
import { StaffAttendance } from "../../../types/database";

interface StaffAttendanceCardProps {
  isAdmin: boolean;
  todayAttendance: StaffAttendance | null;
  isClocking: boolean;
  attendanceMsg: string | null;
  onClockIn: (status: "present" | "on_field") => void;
  onClockOut: () => void;
}

export const StaffAttendanceCard: React.FC<StaffAttendanceCardProps> = ({
  isAdmin,
  todayAttendance,
  isClocking,
  attendanceMsg,
  onClockIn,
  onClockOut,
}) => {
  if (isAdmin) {
    return (
      <Card className="bg-slate-50/90 p-4 border border-slate-200/70 rounded-2xl flex flex-row items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Chip
            size="sm"
            color="accent"
            variant="soft"
            className="font-mono uppercase text-[10px] font-bold px-2 py-0.5"
          >
            Administrator
          </Chip>
          <span className="text-slate-600 font-medium">
            Logged in with full supervisory access. ERP daily attendance punch is exempt for administrators.
          </span>
        </div>
        <Link
          to="/admin/attendance"
          className="text-sky-700 hover:text-sky-800 font-semibold inline-flex items-center gap-1.5 text-xs shrink-0"
        >
          <span>Team Attendance Roster</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5 bg-white border border-slate-200/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
            todayAttendance && !todayAttendance.clock_out_at
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              ERP Daily Attendance
            </h2>
            {todayAttendance ? (
              todayAttendance.clock_out_at ? (
                <Chip
                  size="sm"
                  color="default"
                  variant="soft"
                  className="font-bold uppercase text-[10px]"
                >
                  Clocked Out
                </Chip>
              ) : todayAttendance.status === "on_field" ? (
                <Chip
                  size="sm"
                  color="warning"
                  variant="soft"
                  className="font-bold uppercase text-[10px]"
                >
                  On Field
                </Chip>
              ) : (
                <Chip
                  size="sm"
                  color="success"
                  variant="soft"
                  className="font-bold uppercase text-[10px]"
                >
                  Present
                </Chip>
              )
            ) : (
              <Chip
                size="sm"
                color="danger"
                variant="soft"
                className="font-bold uppercase text-[10px]"
              >
                Not Clocked In
              </Chip>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {todayAttendance
              ? `Clocked in at ${new Date(todayAttendance.clock_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${
                  todayAttendance.clock_out_at
                    ? ` • Clocked out at ${new Date(todayAttendance.clock_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""
                }`
              : "Record your daily punch to activate your availability for lead assignment."}
          </p>

          {/* Location Verification & Address */}
          {todayAttendance && (
            <div className="space-y-1 mt-1.5 text-[11px] text-slate-600">
              {(todayAttendance.clock_in_address ||
                (todayAttendance.clock_in_lat && todayAttendance.clock_in_lng)) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Pin className="w-3 h-3 text-emerald-600 shrink-0" />
                    In:
                  </span>
                  {todayAttendance.clock_in_address && (
                    <span className="truncate max-w-xs text-slate-600">
                      {todayAttendance.clock_in_address}
                    </span>
                  )}
                  {todayAttendance.clock_in_lat && todayAttendance.clock_in_lng && (
                    <a
                      href={`https://www.google.com/maps?q=${todayAttendance.clock_in_lat},${todayAttendance.clock_in_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-800 font-mono inline-flex items-center gap-1 font-semibold ml-1"
                    >
                      <span>
                        ({todayAttendance.clock_in_lat.toFixed(4)},{" "}
                        {todayAttendance.clock_in_lng.toFixed(4)})
                      </span>
                    </a>
                  )}
                </div>
              )}

              {todayAttendance.clock_out_at &&
                (todayAttendance.clock_out_address ||
                  (todayAttendance.clock_out_lat && todayAttendance.clock_out_lng)) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Pin className="w-3 h-3 text-slate-500 shrink-0" />
                      Out:
                    </span>
                    {todayAttendance.clock_out_address && (
                      <span className="truncate max-w-xs text-slate-600">
                        {todayAttendance.clock_out_address}
                      </span>
                    )}
                    {todayAttendance.clock_out_lat && todayAttendance.clock_out_lng && (
                      <a
                        href={`https://www.google.com/maps?q=${todayAttendance.clock_out_lat},${todayAttendance.clock_out_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-800 font-mono inline-flex items-center gap-1 font-semibold ml-1"
                      >
                        <span>
                          ({todayAttendance.clock_out_lat.toFixed(4)},{" "}
                          {todayAttendance.clock_out_lng.toFixed(4)})
                        </span>
                      </a>
                    )}
                  </div>
                )}
            </div>
          )}

          {attendanceMsg && (
            <p className="text-xs font-semibold text-sky-700 mt-1.5">
              {attendanceMsg}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!todayAttendance && (
          <>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onClockIn("present")}
              isDisabled={isClocking}
              className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs"
            >
              {isClocking ? (
                <Spinner size="sm" color="current" />
              ) : (
                <CircleCheck className="w-3.5 h-3.5" />
              )}
              <span>Clock In (Office)</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onClockIn("on_field")}
              isDisabled={isClocking}
              className="gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-2xs"
            >
              {isClocking ? (
                <Spinner size="sm" color="current" />
              ) : (
                <LocationArrow className="w-3.5 h-3.5" />
              )}
              <span>Clock In (Field)</span>
            </Button>
          </>
        )}

        {todayAttendance && !todayAttendance.clock_out_at && (
          <Button
            variant="danger"
            size="sm"
            onPress={onClockOut}
            isDisabled={isClocking}
            className="gap-1.5 text-xs font-semibold rounded-xl shadow-2xs"
          >
            {isClocking ? (
              <Spinner size="sm" color="current" />
            ) : (
              <Power className="w-3.5 h-3.5" />
            )}
            <span>Clock Out</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
