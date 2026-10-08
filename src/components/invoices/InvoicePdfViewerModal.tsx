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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6"
    >
      <Modal.Container
        size="cover"
        scroll="inside"
        className="w-[96vw] max-w-6xl h-[95vh] p-0 m-auto flex flex-col justify-center items-center"
      >
        <Modal.Dialog
          data-react-aria-top-layer="true"
          className="w-full h-full max-w-full flex flex-col bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden !p-0 focus:outline-none"
        >
          {/* Top PDF Reader Toolbar */}
          <Modal.Header className="px-5 py-3.5 bg-slate-950/95 text-white flex !flex-row items-center justify-between gap-4 border-b border-slate-800 shrink-0 shadow-sm !mb-0">
            {/* Left: Document Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Modal.Heading className="text-sm font-bold text-white flex items-center gap-2 truncate">
                    <span>{docTitle}</span>
                    <span className="font-mono text-sky-300 font-semibold">
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
                <p className="text-xs text-slate-400 truncate">
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
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onPress={handleDownloadPdf}
                isDisabled={isDownloading}
                className="gap-1.5 h-8 px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm disabled:opacity-60"
                aria-label="Download PDF document"
              >
                {isDownloading ? (
                  <Spinner size="sm" />
                ) : downloadSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>
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
                className="gap-1.5 h-8 px-3 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                aria-label="Print document"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    onClose();
                    onEdit(currentInvoice);
                  }}
                  className="gap-1.5 h-8 px-3 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                  aria-label="Edit invoice"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              {onSendEmail && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleSendAction}
                  isDisabled={isSendingEmail}
                  className="gap-1.5 h-8 px-3 text-xs font-semibold bg-sky-950/60 border-sky-700/60 text-sky-300 hover:bg-sky-900"
                  aria-label="Send invoice via email"
                >
                  {isSendingEmail ? (
                    <Spinner size="sm" />
                  ) : sendSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {sendSuccess ? "Sent!" : "Send"}
                  </span>
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleDeleteAction}
                  className="gap-1.5 h-8 px-3 text-xs font-semibold bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60 hover:text-white"
                  aria-label="Delete invoice"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 rounded-lg ml-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Modal.Header>

          {/* Modal Body: High-Fidelity Modern Invoice Canvas inspired by Invoice 12.png */}
          <Modal.Body className="!p-4 sm:!p-8 bg-slate-900/80 overflow-y-auto flex justify-center items-start flex-1 min-h-0">
            {/* Zoom Wrapper */}
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
              className="w-full flex justify-center pb-8"
            >
              {/* Modern Card-Style Invoice Sheet — Exact Invoice 12.png Layout */}
              <div
                id="printable-invoice-sheet"
                ref={printAreaRef}
                className="w-full max-w-[850px] bg-white text-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col text-xs font-sans relative overflow-hidden"
                style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
              >
                {/* === HEADER SECTION === */}
                <div className="relative px-10 pt-10 pb-8 bg-white rounded-t-[2rem]">
                  {/* Top-right blue gradient aura — exactly like Invoice 12.png */}
                  <div
                    className="absolute top-0 right-0 w-64 h-44 pointer-events-none rounded-tr-[2rem]"
                    style={{
                      background: "radial-gradient(ellipse at 90% 10%, rgba(147,197,253,0.55) 0%, rgba(191,219,254,0.3) 40%, transparent 75%)",
                    }}
                  />

                  {/* Row 1: "Invoice" title (left) + Logo+Brand (right) */}
                  <div className="relative z-10 flex items-start justify-between mb-8">
                    <div>
                      <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none" style={{ letterSpacing: "-0.02em" }}>
                        Invoice
                      </h1>
                    </div>
                    {/* Logo + Brand name */}
                    <div className="flex items-center gap-2.5">
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
                  <div className="relative z-10 grid grid-cols-3 gap-8 items-start">
                    {/* Col 1 — Invoice Details */}
                    <div>
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
                    <div>
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
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                        Invoice To:
                      </p>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow-sm">
                          {currentInvoice.customer_name
                            ? currentInvoice.customer_name.charAt(0).toUpperCase()
                            : "C"}
                        </div>
                        <p className="text-sm font-extrabold text-slate-900 leading-tight">
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
                <div className="px-10 py-6 bg-white">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 px-4 pb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">
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
                          className="grid grid-cols-12 items-center px-4 py-3.5 rounded-xl border border-slate-200 bg-white"
                        >
                          <div className="col-span-6 pr-4">
                            <p className="font-bold text-slate-900 text-[13px] leading-snug">
                              {it.description}
                            </p>
                            {it.hsn_code && (
                              <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                                HSN: {it.hsn_code} &bull; GST: {it.tax_rate}%
                              </p>
                            )}
                          </div>
                          <div className="col-span-2 text-center font-medium text-slate-600 text-[13px]">
                            {it.quantity}
                            {it.unit && it.unit !== "NOS" ? (
                              <span className="ml-1 text-[10px] text-slate-400">{it.unit}</span>
                            ) : null}
                          </div>
                          <div className="col-span-2 text-right text-slate-500 font-mono text-[13px]">
                            &#8377;&nbsp;
                            {it.unit_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="col-span-2 text-right font-bold text-slate-900 font-mono text-[13px]">
                            &#8377;&nbsp;
                            {it.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                    <div className="w-72 space-y-2">
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
                        <p className="text-4xl font-extrabold text-sky-600 font-mono leading-none" style={{ letterSpacing: "-0.02em" }}>
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
                <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 rounded-b-[2rem] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-[13px]">{company.name}</p>
                    <p className="text-[11px] text-slate-500">www.akiraautomation.com</p>
                    <p className="text-[10.5px] text-slate-400">
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
          <Modal.Footer className="px-5 py-3 bg-slate-950/95 border-t border-slate-800 flex !flex-row items-center justify-between gap-3 text-xs shrink-0 !mt-0">
            <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2 truncate">
              <span>
                Document Ref:{" "}
                <strong className="text-slate-200">
                  #{currentInvoice.invoice_number}
                </strong>
              </span>
              <span>•</span>
              <span>
                Currency:{" "}
                <strong className="text-slate-200">
                  {currentInvoice.currency || "INR (₹)"}
                </strong>
              </span>
              <span>•</span>
              <span>
                Issued: <span className="text-slate-300">{currentInvoice.issue_date}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onPress={onClose}
                className="h-8 px-3 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                aria-label="Close Preview"
              >
                Close Preview
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={handlePrint}
                className="gap-1.5 h-8 px-3 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                aria-label="Print or Save PDF via print dialog"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>Print Document</span>
              </Button>
              <Button
                size="sm"
                variant="primary"
                onPress={handleDownloadPdf}
                isDisabled={isDownloading}
                className="gap-1.5 h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm disabled:opacity-60"
                aria-label="Download PDF"
              >
                {isDownloading ? (
                  <Spinner size="sm" />
                ) : downloadSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>
                  {isDownloading
                    ? "Generating PDF..."
                    : downloadSuccess
                    ? "Downloaded!"
                    : "Download PDF"}
                </span>
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
