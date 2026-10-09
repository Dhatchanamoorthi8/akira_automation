import React from "react";
import {
  Card,
  Chip,
  Button,
  Alert,
  Dropdown,
  Label,
  Description,
} from "@heroui/react";
import {
  Receipt,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import {
  EllipsisVertical,
  Eye,
  FileArrowDown,
  PaperPlane,
  PencilToSquare,
  TrashBin,
} from "@gravity-ui/icons";
import { Invoice } from "../../../types/database";
import { ActionFeedbackState } from "../types";

interface StaffInvoicesTabProps {
  invoices: Invoice[];
  actionFeedback: ActionFeedbackState | null;
  onDismissFeedback: () => void;
  onOpenCreateInvoice: () => void;
  onViewInvoice: (inv: Invoice) => void;
  onDownloadPdf: (inv: Invoice) => void;
  onEditInvoice: (inv: Invoice) => void;
  onSendInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string, invoiceNumber?: string) => void;
  sendingInvoiceId: string | null;
}

export const StaffInvoicesTab: React.FC<StaffInvoicesTabProps> = ({
  invoices,
  actionFeedback,
  onDismissFeedback,
  onOpenCreateInvoice,
  onViewInvoice,
  onDownloadPdf,
  onEditInvoice,
  onSendInvoice,
  onDeleteInvoice,
  sendingInvoiceId,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-industrial-dark font-heading">
          Generated Quotations & Tax Invoices
        </h3>
        <Button
          variant="primary"
          size="sm"
          onPress={onOpenCreateInvoice}
          className="gap-1 text-xs font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          New Quotation / Invoice
        </Button>
      </div>

      {actionFeedback && (
        <div className="mb-4">
          <Alert status={actionFeedback.status} className="shadow-xs">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{actionFeedback.title}</Alert.Title>
              <Alert.Description>{actionFeedback.message}</Alert.Description>
            </Alert.Content>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={onDismissFeedback}
              className="text-slate-400 hover:text-slate-700 h-6 w-6 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </Alert>
        </div>
      )}

      {invoices.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200 shadow-xs">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 font-heading">
            No Invoices or Quotations
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create formal quotations or proforma invoices with tax
            calculations for your assigned leads.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card
              key={inv.id}
              className="p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-industrial-dark">
                      {inv.invoice_number}
                    </span>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="default"
                      className="font-bold uppercase text-[10px]"
                    >
                      {inv.type}
                    </Chip>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {inv.customer_name}{" "}
                    {inv.customer_company ? `(${inv.customer_company})` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      inv.status === "paid"
                        ? "success"
                        : inv.status === "sent"
                          ? "accent"
                          : "default"
                    }
                    className="font-bold uppercase text-[10px]"
                  >
                    {inv.status}
                  </Chip>
                  <span className="text-sm font-bold font-mono text-emerald-700 block mt-1">
                    ₹{inv.total_amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {inv.items && inv.items.length > 0 && (
                <div className="bg-slate-50 p-2 rounded text-xs space-y-1">
                  {inv.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-slate-600"
                    >
                      <span>
                        {it.quantity}x {it.description}
                      </span>
                      <span className="font-mono">
                        ₹{it.total_price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Issued: {inv.issue_date}
                </span>

                <div className="flex items-center gap-2">
                  <Dropdown>
                    <Button
                      isIconOnly
                      aria-label={`Invoice actions for ${inv.invoice_number}`}
                      variant="secondary"
                      className="h-9 w-9 rounded-lg border border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                    <Dropdown.Popover
                      placement="bottom end"
                      className="z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    >
                      <Dropdown.Menu
                        aria-label={`Actions for invoice ${inv.invoice_number}`}
                        onAction={(key) => {
                          switch (key) {
                            case "view":
                              void onViewInvoice(inv);
                              break;
                            case "download":
                              void onDownloadPdf(inv);
                              break;
                            case "edit":
                              onEditInvoice(inv);
                              break;
                            case "delete":
                              void onDeleteInvoice(inv.id, inv.invoice_number);
                              break;
                            case "send":
                              void onSendInvoice(inv.id);
                              break;
                          }
                        }}
                        className="p-1"
                      >
                        <Dropdown.Item
                          id="view"
                          textValue="View PDF"
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <Eye className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <Label className="font-semibold">View PDF</Label>
                            <Description className="text-[11px] text-slate-500">
                              Open invoice preview
                            </Description>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item
                          id="download"
                          textValue="Download PDF"
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <FileArrowDown className="h-4 w-4 text-sky-600" />
                          </div>
                          <Label className="font-semibold">Download PDF</Label>
                        </Dropdown.Item>
                        <Dropdown.Item
                          id="edit"
                          textValue="Edit"
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <PencilToSquare className="h-4 w-4 text-slate-500" />
                          </div>
                          <Label className="font-semibold">Edit</Label>
                        </Dropdown.Item>
                        <Dropdown.Item
                          id="send"
                          textValue="Send to Customer"
                          isDisabled={sendingInvoiceId === inv.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            {sendingInvoiceId === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                            ) : (
                              <PaperPlane className="h-4 w-4 text-sky-600" />
                            )}
                          </div>
                          <Label className="font-semibold">Send to Customer</Label>
                        </Dropdown.Item>
                        <Dropdown.Item
                          id="delete"
                          textValue="Delete invoice"
                          variant="danger"
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-xs"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            <TrashBin className="h-4 w-4" />
                          </div>
                          <Label className="font-semibold">Delete</Label>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
