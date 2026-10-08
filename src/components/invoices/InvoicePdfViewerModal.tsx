import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Chip, Spinner } from "@heroui/react";
import {
  Download,
  Printer,
  Edit3,
  Send,
  Trash2,
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  Check,
} from "lucide-react";
import { Invoice } from "../../types/database";
import { company } from "../../config/company";
import { companyData } from "../../data/company";
import { invoiceService } from "../../services/invoiceService";
import { numberToWordsINR } from "../../utils/numberToWords";
import {
  generateInvoicePdf,
  downloadInvoicePdfFromElement,
} from "../../utils/generateInvoicePdf";
import { AKIRA_LOGO_BASE64 } from "../../config/companyLogoBase64";

interface InvoicePdfViewerModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoiceId: string) => void;
  onSendEmail?: (invoiceId: string) => void;
  isSendingEmail?: boolean;
}

export const InvoicePdfViewerModal: React.FC<InvoicePdfViewerModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onEdit,
  onDelete,
  onSendEmail,
  isSendingEmail = false,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const isDownloadingRef = useRef(false);
  const [zoom, setZoom] = useState(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(invoice);

  // Synchronize and auto-fetch complete line items if missing
  useEffect(() => {
    setActiveInvoice(invoice);
    if (invoice?.id && (!invoice.items || invoice.items.length === 0)) {
      invoiceService
        .getInvoiceById(invoice.id)
        .then((res) => {
          if (res.invoice && res.invoice.items && res.invoice.items.length > 0) {
            setActiveInvoice(res.invoice);
          }
        })
        .catch(() => {});
    }
  }, [invoice]);

  if (!isOpen || !activeInvoice) return null;

  const currentInvoice = activeInvoice;
  const isQuotation = currentInvoice.type === "quotation";
  const docTitle = isQuotation
    ? "FORMAL QUOTATION"
    : currentInvoice.type === "proforma"
      ? "PROFORMA INVOICE"
      : "TAX INVOICE";

  // Calculate tax breakdown
  const subtotal = currentInvoice.subtotal || 0;
  const taxAmount = currentInvoice.tax_amount || 0;
  const totalAmount = currentInvoice.total_amount || 0;
  const isInterState =
    currentInvoice.customer_gst &&
    currentInvoice.customer_gst.length >= 2 &&
    !currentInvoice.customer_gst.startsWith("33"); // 33 is Tamil Nadu

  const cgst = isInterState ? 0 : taxAmount / 2;
  const sgst = isInterState ? 0 : taxAmount / 2;
  const igst = isInterState ? taxAmount : 0;

  // Print Handler
  const handlePrint = () => {
    if (!printAreaRef.current) return;

    const printWindow = window.open("", "_blank", "width=900,height=1100");
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = printAreaRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${currentInvoice.invoice_number} - ${docTitle} | Akira Precision Automation</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 11px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-container {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              background: #fff;
            }
            .floating-card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 16px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .font-mono {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .font-bold {
              font-weight: 700;
            }
            img {
              max-height: 48px;
              width: auto;
              object-fit: contain;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Direct PDF Download Handler — DOM-to-Image-to-PDF capture for 100% preview fidelity
  const handleDownloadPdf = async () => {
    // Guard against rapid duplicate clicks
    if (isDownloadingRef.current) {
      console.warn("[InvoicePdfViewer] Download already in progress. Ignoring duplicate click.");
      return;
    }

    isDownloadingRef.current = true;
    setIsDownloading(true);

    try {
      const cleanCustomer = (
        currentInvoice.customer_company ||
        currentInvoice.customer_name ||
        "Client"
      ).replace(/[^a-zA-Z0-9_-]/g, "_");

      const filename = `${currentInvoice.invoice_number}_${cleanCustomer}.pdf`;

      if (printAreaRef.current) {
        // High-res DOM capture -> Image -> PDF (100% exact match with preview)
        await downloadInvoicePdfFromElement(printAreaRef.current, filename);
      } else {
        generateInvoicePdf(currentInvoice, { filename, download: true });
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("[InvoicePdfViewer] PDF download error:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      isDownloadingRef.current = false;
      setIsDownloading(false);
    }
  };

  const handleSendAction = async () => {
    if (!onSendEmail) return;
    try {
      await onSendEmail(currentInvoice.id);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      console.error("[InvoicePdfViewer] Send error:", err);
    }
  };

  const handleDeleteAction = () => {
    if (!onDelete) return;
    onDelete(currentInvoice.id);
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
      data-react-aria-top-layer="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/85 p-1 backdrop-blur-md sm:p-3 md:p-6"
    >
      <Modal.Container
        size="cover"
        scroll="inside"
        className="m-auto flex h-[calc(100dvh-0.5rem)] w-[calc(100vw-0.5rem)] max-w-6xl flex-col items-center justify-center p-0 sm:h-[95vh] sm:w-[96vw]"
      >
        <Modal.Dialog
          data-react-aria-top-layer="true"
          className="flex h-full w-full max-w-full flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl !p-0 focus:outline-none sm:rounded-2xl"
        >
          {/* Top PDF Reader Toolbar */}
          <Modal.Header className="flex !flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-800 bg-slate-950/95 px-3 py-2.5 text-white shadow-sm !mb-0 sm:px-5 sm:py-3.5">
            {/* Left: Document Info */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10 text-sky-400 sm:h-9 sm:w-9 sm:rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <Modal.Heading className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs font-bold leading-tight text-white sm:text-sm">
                    <span>{docTitle}</span>
                    <span className="font-mono font-semibold text-sky-300">
                      #{currentInvoice.invoice_number}
                    </span>
                  </Modal.Heading>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      currentInvoice.status === "paid"
                        ? "success"
                        : currentInvoice.status === "sent"
                          ? "accent"
                          : "default"
                    }
                    className="font-mono uppercase font-bold text-[10px]"
                  >
                    {currentInvoice.status}
                  </Chip>
                </div>
                <p className="truncate text-[10px] text-slate-400 sm:text-xs">
                  {currentInvoice.customer_name}{" "}
                  {currentInvoice.customer_company
                    ? `(${currentInvoice.customer_company})`
                    : ""}{" "}
                  • Issued: {currentInvoice.issue_date}
                </p>
              </div>
            </div>

            {/* Center: Zoom Controls */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 shadow-inner">
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={() =>
                  setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))
                }
                className="w-7 h-7 text-slate-400 hover:text-white"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs font-mono font-medium text-slate-300 min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={() =>
                  setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))
                }
                className="w-7 h-7 text-slate-400 hover:text-white"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => setZoom(1.0)}
                className="text-[11px] font-medium text-slate-400 hover:text-white px-2 h-7"
                aria-label="Reset zoom to 100%"
              >
                Reset
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2 md:w-auto">
              <Button
                size="sm"
                variant="primary"
                onPress={handleDownloadPdf}
                isDisabled={isDownloading}
                className="h-8 w-8 shrink-0 gap-1.5 bg-emerald-600 p-0 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 sm:w-auto sm:px-3.5"
                aria-label="Download PDF document"
              >
                {isDownloading ? (
                  <Spinner size="sm" />
                ) : downloadSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline">
                  {isDownloading
                    ? "Generating PDF..."
                    : downloadSuccess
                    ? "Downloaded!"
                    : "Download PDF"}
                </span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onPress={handlePrint}
                className="h-8 w-8 shrink-0 gap-1.5 border-slate-700 bg-slate-900 p-0 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white md:w-auto md:px-3"
                aria-label="Print document"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden lg:inline">Print</span>
              </Button>

              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    onClose();
                    onEdit(currentInvoice);
                  }}
                  className="h-8 w-8 shrink-0 gap-1.5 border-slate-700 bg-slate-900 p-0 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white md:w-auto md:px-3"
                  aria-label="Edit invoice"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">Edit</span>
                </Button>
              )}

              {onSendEmail && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleSendAction}
                  isDisabled={isSendingEmail}
                  className="h-8 w-8 shrink-0 gap-1.5 border-sky-700/60 bg-sky-950/60 p-0 text-xs font-semibold text-sky-300 hover:bg-sky-900 md:w-auto md:px-3"
                  aria-label="Send invoice via email"
                >
                  {isSendingEmail ? (
                    <Spinner size="sm" />
                  ) : sendSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden lg:inline">
                    {sendSuccess ? "Sent!" : "Send"}
                  </span>
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleDeleteAction}
                  className="h-8 w-8 shrink-0 gap-1.5 border-rose-800/60 bg-rose-950/40 p-0 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 hover:text-white md:w-auto md:px-3"
                  aria-label="Delete invoice"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden lg:inline">Delete</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={onClose}
                className="ml-1 h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Modal.Header>

          {/* Modal Body: High-Fidelity Modern Invoice Canvas inspired by Invoice 12.png */}
          <Modal.Body className="!p-2 sm:!p-4 md:!p-8 flex min-h-0 flex-1 items-start justify-center overflow-auto bg-slate-900/80">
            {/* Zoom Wrapper */}
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
              className="invoice-sheet-frame relative flex w-full min-w-0 max-w-[850px] justify-center pb-8 @container"
            >
              {/* Modern Card-Style Invoice Sheet — Exact Invoice 12.png Layout */}
              <div
                id="printable-invoice-sheet"
                ref={printAreaRef}
                className="relative flex w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white font-sans text-xs text-slate-900 shadow-2xl sm:rounded-[2rem]"
                style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
              >
                {/* === HEADER SECTION === */}
                <div className="relative rounded-t-2xl bg-white px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-10 md:px-10 sm:rounded-t-[2rem]">
                  {/* Top-right blue gradient aura — exactly like Invoice 12.png */}
                  <div
                    className="absolute top-0 right-0 w-64 h-44 pointer-events-none rounded-tr-[2rem]"
                    style={{
                      background: "radial-gradient(ellipse at 90% 10%, rgba(147,197,253,0.55) 0%, rgba(191,219,254,0.3) 40%, transparent 75%)",
                    }}
                  />

                  {/* Row 1: "Invoice" title (left) + Logo+Brand (right) */}
                  <div className="relative z-10 mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
                    <div>
                      <h1 className="text-4xl font-black leading-none tracking-tight text-slate-900 sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
                        Invoice
                      </h1>
                    </div>
                    {/* Logo + Brand name */}
                    <div className="flex max-w-full items-center gap-2.5">
                      <img
                        src={AKIRA_LOGO_BASE64 || company.logo}
                        alt={company.name}
                        className="h-9 w-auto max-w-[110px] object-contain shrink-0"
                        crossOrigin="anonymous"
                      />
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-xl font-black text-slate-900 tracking-tight uppercase">
                          akira
                        </span>
                        <span className="text-[9px] font-bold text-sky-600 uppercase tracking-[0.18em] mt-0.5">
                          automation
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 3-column info grid */}
                  <div className="relative z-10 grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-6 @xl:grid-cols-2 @3xl:grid-cols-3 @3xl:gap-8">
                    {/* Col 1 — Invoice Details */}
                    <div className="min-w-0 [overflow-wrap:anywhere]">
                      <p className="text-[11px] font-bold text-slate-900 mb-3">Invoice Details:</p>
                      <div className="space-y-1.5 text-[11.5px] text-slate-600">
                        <p>
                          Invoice number:{" "}
                          <strong className="text-slate-900 font-bold font-mono">
                            N&#186;: {currentInvoice.invoice_number}
                          </strong>
                        </p>
                        <p>
                          Issued:{" "}
                          <strong className="text-slate-800 font-semibold">
                            {currentInvoice.issue_date}
                          </strong>
                        </p>
                        {currentInvoice.due_date && (
                          <p>
                            Due date:{" "}
                            <strong className="text-slate-800 font-semibold">
                              {currentInvoice.due_date}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Col 2 — Akira Company Info */}
                    <div className="min-w-0 [overflow-wrap:anywhere]">
                      <p className="text-[11px] font-bold text-slate-900 mb-3">{company.name}</p>
                      <div className="space-y-1.5 text-[11.5px] text-slate-600">
                        <p className="font-medium text-slate-700">
                          {companyData.phones?.[0] || "+91 (44) 2476-8901"}
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                          {companyData.address.fullAddress}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          GSTIN: 33ABCDE1234F1Z5
                        </p>
                      </div>
                    </div>

                    {/* Col 3 — Invoice To card */}
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm [overflow-wrap:anywhere] sm:p-4 @xl:[&:last-child]:col-span-2 @3xl:[&:last-child]:col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                        Invoice To:
                      </p>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-sm">
                          {currentInvoice.customer_name
                            ? currentInvoice.customer_name.charAt(0).toUpperCase()
                            : "C"}
                        </div>
                        <p className="min-w-0 text-sm font-extrabold leading-tight text-slate-900 [overflow-wrap:anywhere]">
                          {currentInvoice.customer_name}
                        </p>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-0.5 pl-0.5">
                        {currentInvoice.customer_company && (
                          <p className="font-semibold text-slate-600">{currentInvoice.customer_company}</p>
                        )}
                        {currentInvoice.customer_address && (
                          <p className="leading-snug">{currentInvoice.customer_address}</p>
                        )}
                        {currentInvoice.customer_email && (
                          <p>{currentInvoice.customer_email}</p>
                        )}
                        {currentInvoice.customer_phone && (
                          <p className="font-mono">{currentInvoice.customer_phone}</p>
                        )}
                        {currentInvoice.customer_gst && (
                          <p className="font-mono font-bold text-slate-700 mt-1">
                            GSTIN: {currentInvoice.customer_gst}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* === LINE ITEMS SECTION === */}
                <div className="bg-white px-4 py-5 sm:px-8 sm:py-6 md:px-10">
                  {/* Table Header */}
                  <div className="hidden grid-cols-12 px-4 pb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 @2xl:grid">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>

                  {/* Floating Card Item Rows */}
                  <div className="space-y-2 mt-3">
                    {currentInvoice.items && currentInvoice.items.length > 0 ? (
                      currentInvoice.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          className="grid grid-cols-3 items-center gap-x-2 gap-y-3 rounded-xl border border-slate-200 bg-white px-3 py-3.5 sm:px-4 @2xl:grid-cols-12"
                        >
                          <div className="col-span-3 min-w-0 pr-1 @2xl:col-span-6 @2xl:pr-4">
                            <p className="text-[13px] font-bold leading-snug text-slate-900 [overflow-wrap:anywhere]">
                              {it.description}
                            </p>
                            {it.hsn_code && (
                              <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                                HSN: {it.hsn_code} &bull; GST: {it.tax_rate}%
                              </p>
                            )}
                          </div>
                          <div className="col-span-1 min-w-0 text-left text-[13px] font-medium text-slate-600 @2xl:col-span-2 @2xl:text-center">
                            <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400 @2xl:hidden">Qty</span>
                            <span>{it.quantity}{it.unit && it.unit !== "NOS" ? ` ${it.unit}` : ""}</span>
                          </div>
                          <div className="col-span-1 min-w-0 text-left font-mono text-[11px] text-slate-500 [overflow-wrap:anywhere] @2xl:col-span-2 @2xl:text-right @2xl:text-[13px]">
                            <span className="mb-1 block font-sans text-[9px] font-semibold uppercase tracking-wide text-slate-400 @2xl:hidden">Price</span>
                            <span>&#8377;&nbsp;{it.unit_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="col-span-1 min-w-0 text-right font-mono text-[11px] font-bold text-slate-900 [overflow-wrap:anywhere] @2xl:col-span-2 @2xl:text-[13px]">
                            <span className="mb-1 block font-sans text-[9px] font-semibold uppercase tracking-wide text-slate-400 @2xl:hidden">Total</span>
                            <span>&#8377;&nbsp;{it.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
                        No items specified on this document.
                      </div>
                    )}
                  </div>

                  {/* === TOTALS — right-aligned === */}
                  <div className="flex justify-end mt-6">
                    <div className="w-full max-w-72 space-y-2">
                      <div className="flex justify-between text-[11.5px] text-slate-500">
                        <span>Taxable Subtotal</span>
                        <span className="font-mono font-medium text-slate-700">
                          &#8377;&nbsp;{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {isInterState ? (
                        <div className="flex justify-between text-[11.5px] text-slate-500">
                          <span>IGST (18%)</span>
                          <span className="font-mono text-slate-700">
                            &#8377;&nbsp;{igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between text-[11.5px] text-slate-500">
                            <span>CGST (9%)</span>
                            <span className="font-mono text-slate-700">
                              &#8377;&nbsp;{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11.5px] text-slate-500">
                            <span>SGST (9%)</span>
                            <span className="font-mono text-slate-700">
                              &#8377;&nbsp;{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </>
                      )}
                      {currentInvoice.discount_amount && currentInvoice.discount_amount > 0 ? (
                        <div className="flex justify-between text-[11.5px] text-rose-500">
                          <span>Special Discount</span>
                          <span className="font-mono">
                            -&#8377;&nbsp;{currentInvoice.discount_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : null}
                      {/* Grand Total */}
                      <div className="pt-3 border-t border-slate-200 text-right">
                        <p className="text-[11px] text-slate-400 font-medium mb-0.5">Total amount:</p>
                        <p className="text-3xl font-extrabold leading-none text-sky-600 font-mono sm:text-4xl" style={{ letterSpacing: "-0.02em" }}>
                          &#8377;&nbsp;{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10.5px] text-slate-400 italic mt-1">
                          {numberToWordsINR(totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* === TERMS & CONDITIONS === */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-[10.5px] font-bold text-sky-700 uppercase tracking-wider mb-1.5">
                      Terms &amp; Conditions:
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
                      Prices are ex-works Chennai, freight &amp; insurance extra as actuals. 50% advance
                      with formal purchase order, balance against dispatch. 12 months warranty against
                      manufacturing defects. Dimensional calibration certificates provided with NABL
                      traceability. All disputes subject to Chennai jurisdiction only.
                    </p>
                  </div>
                </div>

                {/* === FOOTER BANNER — exactly like Invoice 12.png === */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-4 py-5 sm:px-8 sm:py-6 md:px-10 @2xl:flex-row @2xl:items-center sm:rounded-b-[2rem]">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-[13px]">{company.name}</p>
                    <p className="text-[11px] text-slate-500">www.akiraautomation.com</p>
                    <p className="text-[10.5px] text-slate-400 [overflow-wrap:anywhere]">
                      {company.primaryEmail} &nbsp;/&nbsp; {companyData.phones?.[0] || "+91 (44) 2476-8901"}
                    </p>
                  </div>
                  {/* Decorative dots cluster (3x2 grid like Invoice 12.png) */}
                  <div className="grid grid-cols-3 gap-1.5 items-center">
                    <span className="col-start-3 w-3 h-3 rounded-full bg-rose-500 block" />
                    <span className="w-3 h-3 rounded-full bg-rose-300 block" />
                    <span className="w-3 h-3 rounded-full bg-blue-500 block" />
                    <span className="w-3 h-3 rounded-full bg-indigo-500 block" />
                    <span className="w-3 h-3 rounded-full bg-blue-400 block" />
                    <span className="w-3 h-3 rounded-full bg-violet-500 block" />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          {/* Bottom Footer with Document Reference & Quick Actions */}
          <Modal.Footer className="flex !flex-col !items-stretch gap-2 border-t border-slate-800 bg-slate-950/95 px-3 py-2.5 text-xs !mt-0 sm:px-4 md:!flex-row md:!items-center md:justify-between md:gap-3 md:px-5 md:py-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-mono sm:text-[11px]">
              <span>
                Ref:{" "}
                <strong className="text-slate-200">
                  #{currentInvoice.invoice_number}
                </strong>
              </span>
              <span className="hidden lg:inline">•</span>
              <span className="hidden lg:inline">
                Currency:{" "}
                <strong className="text-slate-200">
                  {currentInvoice.currency || "INR (₹)"}
                </strong>
              </span>
              <span className="hidden lg:inline">•</span>
              <span className="hidden lg:inline">
                Issued: <span className="text-slate-300">{currentInvoice.issue_date}</span>
              </span>
            </div>

            <div className="grid w-full grid-cols-3 items-center gap-1.5 sm:gap-2 md:w-auto">
              <Button
                size="sm"
                variant="outline"
                onPress={onClose}
                className="h-9 min-w-0 gap-1 border-slate-700 bg-slate-900 px-1.5 text-[10px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white sm:px-3 sm:text-xs md:h-8"
                aria-label="Close Preview"
              >
                <X className="h-3.5 w-3.5 shrink-0 sm:hidden" />
                <span className="truncate sm:hidden">Close</span>
                <span className="hidden truncate sm:inline">Close Preview</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={handlePrint}
                className="h-9 min-w-0 gap-1 border-slate-700 bg-slate-900 px-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-800 hover:text-white sm:px-3 sm:text-xs md:h-8"
                aria-label="Print or Save PDF via print dialog"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate sm:hidden">Print</span>
                <span className="hidden truncate sm:inline">Print Document</span>
              </Button>
              <Button
                size="sm"
                variant="primary"
                onPress={handleDownloadPdf}
                isDisabled={isDownloading}
                className="h-9 min-w-0 gap-1 bg-emerald-600 px-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 sm:px-3 sm:text-xs md:h-8 md:px-4"
                aria-label="Download PDF"
              >
                {isDownloading ? (
                  <Spinner size="sm" />
                ) : downloadSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="truncate">
                  {isDownloading
                    ? "Generating PDF..."
                    : downloadSuccess
                    ? "Downloaded!"
                    : "Download"}
                  {isDownloading || downloadSuccess ? null : <span className="hidden sm:inline"> PDF</span>}
                </span>
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
