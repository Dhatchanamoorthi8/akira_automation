import React from "react";
import { Card } from "@heroui/react";
import {
  Megaphone,
  Clock,
  CircleExclamation,
  LocationArrow,
  Receipt,
} from "@gravity-ui/icons";
import { StaffStats } from "../types";

interface StaffStatCardsProps {
  stats: StaffStats;
  visitTotal: number;
  invoiceTotal: number;
}

export const StaffStatCards: React.FC<StaffStatCardsProps> = ({
  stats,
  visitTotal,
  invoiceTotal,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 grid-flow-dense">
      {/* 1. New RFQs */}
      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate">
              New RFQs
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            {stats.myNewEnquiries}
          </p>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 block truncate">
            Active pipeline leads
          </span>
        </div>
      </Card>

      {/* 2. Due Today */}
      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-blue-700 truncate">
              Due Today
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-700 font-mono">
            {stats.dueToday}
          </p>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 block truncate">
            Scheduled follow-ups
          </span>
        </div>
      </Card>

      {/* 3. Overdue */}
      <Card
        className={`rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200 flex flex-col justify-between border ${
          stats.overdue > 0
            ? "bg-rose-50/50 border-rose-200/90 hover:border-rose-300"
            : "bg-white border-slate-200/70 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                stats.overdue > 0
                  ? "bg-rose-100 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-600 border-slate-200/70"
              }`}
            >
              <CircleExclamation className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-rose-700 truncate">
              Overdue
            </span>
          </div>
          {stats.overdue > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-700 font-mono">
            {stats.overdue}
          </p>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 block truncate">
            Requires urgent action
          </span>
        </div>
      </Card>

      {/* 4. Site Visits */}
      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <LocationArrow className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate">
              Site Visits
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            {visitTotal}
          </p>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 block truncate">
            Client site inspections
          </span>
        </div>
      </Card>

      {/* 5. Invoices */}
      <Card className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 truncate">
              Invoices
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 font-mono">
            {invoiceTotal}
          </p>
          <span className="text-[11px] text-slate-400 font-normal mt-0.5 block truncate">
            Formal quotes & billing
          </span>
        </div>
      </Card>
    </div>
  );
};
