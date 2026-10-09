import React from "react";
import { Card, Chip, Button, Spinner } from "@heroui/react";
import {
  Inbox,
  UserPlus,
  Building2,
  Phone,
  Mail,
  Clock,
  MapPin,
  Receipt,
  TrendingUp,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { EnquiryWithDetails } from "../../../types/database";
import { formatDate } from "../../../utils/date";

interface StaffEnquiriesTabProps {
  enquiries: EnquiryWithDetails[];
  isLoading: boolean;
  onOpenAddLeadModal: () => void;
  onScheduleFollowup: (enq: EnquiryWithDetails) => void;
  onScheduleVisit: (enq: EnquiryWithDetails) => void;
  onCreateQuote: (enq: EnquiryWithDetails) => void;
  onConvertLead: (enq: EnquiryWithDetails) => void;
  onCloseLead: (enq: EnquiryWithDetails) => void;
  onOpenDossier: (enquiryId: string) => void;
}

export const StaffEnquiriesTab: React.FC<StaffEnquiriesTabProps> = ({
  enquiries,
  isLoading,
  onOpenAddLeadModal,
  onScheduleFollowup,
  onScheduleVisit,
  onCreateQuote,
  onConvertLead,
  onCloseLead,
  onOpenDossier,
}) => {
  return (
    <div className="space-y-4">
      {/* Inquiries Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800 font-heading flex items-center gap-2">
            <span>Assigned Inquiries & Customer Pipeline</span>
            <Chip size="sm" variant="soft" color="accent" className="font-mono text-[10px]">
              {enquiries.length} Total
            </Chip>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prospective client leads from website inquiries and staff offline entries (walk-ins, phone calls, expos).
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onPress={onOpenAddLeadModal}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold text-xs shrink-0 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Add Offline Customer / Lead</span>
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center border border-slate-200">
          <Spinner size="md" className="mx-auto mb-2 text-sky-600" />
          <p className="text-xs text-slate-500">Loading assigned inquiries...</p>
        </Card>
      ) : enquiries.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200 shadow-xs">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 font-heading">
            No Assigned Inquiries
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            You do not currently have any prospective inquiries delegated to your account.
          </p>
          <Button
            variant="primary"
            size="sm"
            onPress={onOpenAddLeadModal}
            className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs font-semibold text-xs mx-auto cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add First Offline Customer</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq) => (
            <Card
              key={enq.id}
              className="p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-industrial-dark">
                      {enq.name}
                    </span>
                    {enq.company && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {enq.company}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Product Interest:{" "}
                    <strong className="text-slate-700">
                      {enq.specific_product ||
                        enq.product_category ||
                        "General Metrology Inquiry"}
                    </strong>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {enq.source && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                          enq.source === "offline_walkin"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : enq.source === "phone_call"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : enq.source === "trade_expo"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : enq.source === "referral"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : enq.source === "existing_client"
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {enq.source === "offline_walkin"
                          ? "Walk-in"
                          : enq.source === "phone_call"
                            ? "Phone / WhatsApp"
                            : enq.source === "trade_expo"
                              ? "Trade Expo"
                              : enq.source === "referral"
                                ? "Referral"
                                : enq.source === "existing_client"
                                  ? "Existing Client"
                                  : enq.source === "website"
                                    ? "Website RFQ"
                                    : enq.source}
                      </span>
                    )}
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        enq.status === "converted"
                          ? "success"
                          : enq.status === "closed"
                            ? "default"
                            : "accent"
                      }
                      className="font-bold uppercase text-[10px]"
                    >
                      {enq.status.replace("_", " ")}
                    </Chip>
                  </div>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {formatDate(enq.created_at)}
                  </span>
                </div>
              </div>

              {enq.deal_title && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>Deal: {enq.deal_title}</span>
                    {enq.deal_value && (
                      <span>
                        ₹{enq.deal_value.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {enq.expected_close_date && (
                    <div className="text-[11px] text-emerald-700">
                      Target Close: {enq.expected_close_date}
                    </div>
                  )}
                </div>
              )}

              {enq.lost_reason && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <strong>Closed Reason:</strong> {enq.lost_reason}
                  {enq.lost_notes && (
                    <p className="italic mt-0.5">"{enq.lost_notes}"</p>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded">
                "{enq.message}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs">
                  {enq.phone && (
                    <a
                      href={`tel:${enq.phone}`}
                      className="inline-flex items-center gap-1 text-sky-700 hover:underline font-mono"
                    >
                      <Phone className="w-3 h-3" />
                      {enq.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${enq.email}`}
                    className="inline-flex items-center gap-1 text-sky-700 hover:underline font-mono truncate max-w-[180px]"
                  >
                    <Mail className="w-3 h-3" />
                    {enq.email}
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onScheduleFollowup(enq)}
                    className="gap-1 px-2.5 h-7 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 cursor-pointer"
                    aria-label="Schedule Follow-up"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Follow-up</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onScheduleVisit(enq)}
                    className="gap-1 px-2.5 h-7 text-xs font-semibold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer"
                    aria-label="Schedule Customer Site Visit"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Visit</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onCreateQuote(enq)}
                    className="gap-1 px-2.5 h-7 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    aria-label="Create Quotation"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Quote</span>
                  </Button>

                  {enq.status !== "converted" &&
                    enq.status !== "closed" && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onPress={() => onConvertLead(enq)}
                          className="gap-1 px-2.5 h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          <TrendingUp className="w-3 h-3" />
                          Convert to Deal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => onCloseLead(enq)}
                          className="gap-1 px-2.5 h-7 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          Close Lead
                        </Button>
                      </>
                    )}

                  <Button
                    size="sm"
                    onPress={() => onOpenDossier(enq.id)}
                    className="gap-1 px-3 h-7 text-xs font-semibold bg-industrial-dark text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
