import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Invoice } from "../types/database";
import { company } from "../config/company";
import { companyData } from "../data/company";
import { AKIRA_LOGO_BASE64 } from "../config/companyLogoBase64";
import { numberToWordsINR } from "./numberToWords";

export interface GenerateInvoicePdfOptions {
  filename?: string;
  download?: boolean;
}

/**
 * Captures the invoice sheet in its print layout and downloads it as a high-resolution PDF.
 * The capture uses a fixed sheet width so mobile preview styles do not create clipped or
 * excessively tall PDF pages, while retaining the rendered fonts, gradients, cards, and colors.
 */
export async function downloadInvoicePdfFromElement(
  element: HTMLElement,
  filename: string = "invoice.pdf"
): Promise<void> {
  // 1. Normalize sheet width, remove viewer zoom, and reset scroll during capture
  const zoomWrapper = element.parentElement as HTMLElement | null;
  const originalTransform = zoomWrapper?.style.transform;
  const originalTransition = zoomWrapper?.style.transition;
  const originalWidth = zoomWrapper?.style.width;
  const originalMaxWidth = zoomWrapper?.style.maxWidth;
  const originalFlex = zoomWrapper?.style.flex;
  const scrollParent = element.closest(".overflow-auto, .overflow-y-auto") as HTMLElement | null;
  const originalScrollTop = scrollParent ? scrollParent.scrollTop : 0;

  if (zoomWrapper) {
    zoomWrapper.style.transform = "none";
    zoomWrapper.style.transition = "none";
    zoomWrapper.style.width = "850px";
    zoomWrapper.style.maxWidth = "850px";
    zoomWrapper.style.flex = "none";
  }
  if (scrollParent) {
    scrollParent.scrollTop = 0;
  }

  // Allow browser a render tick so computed geometry is unscaled
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  try {
    // 2. High-resolution rasterization of preview DOM element via html-to-image
    let dataUrl: string;
    try {
      dataUrl = await toPng(element, {
        pixelRatio: 2, // 2x (~1700px width) gives crisp 300 DPI print quality without memory bloat
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
    } catch (fontErr) {
      console.warn("[downloadInvoicePdfFromElement] Font embedding issue, retrying with skipFonts:", fontErr);
      dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        skipFonts: true,
      });
    }

    // 3. Load image to get true pixel dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load invoice snapshot image"));
    });

    const imgWidthPx = img.naturalWidth || img.width;
    const imgHeightPx = img.naturalHeight || img.height;
    const imgAspectRatio = imgHeightPx / imgWidthPx;

    // 4. Create standard A4 PDF (210 x 297 mm)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5; // 5mm margin
    const availWidth = pageWidth - margin * 2; // 200mm
    const availHeight = pageHeight - margin * 2; // 287mm

    const calculatedHeight = availWidth * imgAspectRatio;

    if (calculatedHeight <= availHeight) {
      // Single page: center card vertically and horizontally
      const xOffset = margin;
      const yOffset = margin + (availHeight - calculatedHeight) / 2;
      doc.addImage(dataUrl, "PNG", xOffset, yOffset, availWidth, calculatedHeight, undefined, "FAST");
    } else if (calculatedHeight <= pageHeight + 25) {
      // Slightly taller: scale proportionally to fit cleanly on one single A4 page
      const fitHeight = availHeight;
      const fitWidth = fitHeight / imgAspectRatio;
      const xOffset = (pageWidth - fitWidth) / 2;
      const yOffset = margin;
      doc.addImage(dataUrl, "PNG", xOffset, yOffset, fitWidth, fitHeight, undefined, "FAST");
    } else {
      // Multi-page slicing for very long multi-item invoices
      const sliceHeightMm = availHeight;
      const totalPages = Math.ceil(calculatedHeight / sliceHeightMm);

      for (let p = 0; p < totalPages; p++) {
        if (p > 0) {
          doc.addPage("a4", "portrait");
        }
        const yOffset = margin - p * sliceHeightMm;
        doc.addImage(dataUrl, "PNG", margin, yOffset, availWidth, calculatedHeight, undefined, "FAST");
      }
    }

    // 5. Save output file
    doc.save(filename);
  } finally {
    // 6. Restore parent zoom and scroll positions
    if (zoomWrapper && originalTransform !== undefined) {
      zoomWrapper.style.transform = originalTransform;
      zoomWrapper.style.transition = originalTransition || "";
      zoomWrapper.style.width = originalWidth || "";
      zoomWrapper.style.maxWidth = originalMaxWidth || "";
      zoomWrapper.style.flex = originalFlex || "";
    }
    if (scrollParent) {
      scrollParent.scrollTop = originalScrollTop;
    }
  }
}

/**
 * Fallback vector-based PDF (used only if DOM capture fails entirely).
 * Uses jsPDF native drawing; currency shown as "Rs." to avoid encoding issues.
 */
export function generateInvoicePdf(
  invoice: Invoice,
  options: GenerateInvoicePdfOptions = { download: true }
): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pageWidth = 210;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const rightX = pageWidth - marginX;
  let cursorY = 14;

  const isQuotation = invoice.type === "quotation";
  const docTitle = isQuotation
    ? "FORMAL QUOTATION"
    : invoice.type === "proforma"
      ? "PROFORMA INVOICE"
      : "TAX INVOICE";

  const fmt = (val: number) =>
    `Rs. ${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // ── Header ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text("Invoice", marginX, cursorY + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text(docTitle, marginX, cursorY + 12.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Doc Ref: #${invoice.invoice_number}`, marginX + 40, cursorY + 12.5);

  if (AKIRA_LOGO_BASE64) {
    try {
      doc.addImage(AKIRA_LOGO_BASE64, "JPEG", rightX - 28, cursorY - 1, 28, 17);
    } catch {
      /* skip logo silently */
    }
  }

  cursorY += 20;
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.4);
  doc.line(marginX, cursorY, rightX, cursorY);
  cursorY += 5;

  // ── 3-column info grid ──
  const colW = 57;
  const cardH = 30;

  // Col 1 – Invoice Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("INVOICE DETAILS:", marginX, cursorY + 4);

  const writeRow = (label: string, value: string, y: number, bold = true) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(value, marginX + 22, y);
  };
  writeRow("Invoice number:", `No: ${invoice.invoice_number}`, cursorY + 9);
  writeRow("Issued:", invoice.issue_date, cursorY + 13.5);
  if (invoice.due_date) writeRow("Due date:", invoice.due_date, cursorY + 18);

  // Col 2 – Company
  const c2X = marginX + colW + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(company.name.toUpperCase(), c2X, cursorY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(companyData.phones?.[0] || "+91 (44) 2476-8901", c2X, cursorY + 8.5);
  doc.text(doc.splitTextToSize(companyData.address.fullAddress, colW), c2X, cursorY + 12.5);
  doc.text("GSTIN: 33ABCDE1234F1Z5", c2X, cursorY + 22.5);

  // Col 3 – Invoice To
  const c3X = marginX + colW * 2 + 8;
  const c3W = rightX - c3X;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(c3X, cursorY, c3W, cardH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("INVOICE TO:", c3X + 3.5, cursorY + 4.5);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customer_name || "Valued Client", c3X + 3.5, cursorY + 9.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  let cY2 = cursorY + 13.5;
  if (invoice.customer_company) { doc.text(invoice.customer_company, c3X + 3.5, cY2); cY2 += 4; }
  if (invoice.customer_email) { doc.text(invoice.customer_email, c3X + 3.5, cY2); cY2 += 4; }
  if (invoice.customer_gst) { doc.setFont("helvetica", "bold"); doc.text(`GSTIN: ${invoice.customer_gst}`, c3X + 3.5, cY2); }

  cursorY += cardH + 7;

  // ── Line Items ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Description", marginX + 4, cursorY + 4);
  doc.text("Qty", marginX + 105, cursorY + 4, { align: "center" });
  doc.text("Price", marginX + 138, cursorY + 4, { align: "right" });
  doc.text("Total", rightX - 4, cursorY + 4, { align: "right" });
  cursorY += 6;

  (invoice.items || []).forEach((it) => {
    const descLines = doc.splitTextToSize(it.description, 88);
    const rowH = Math.max(10.5, descLines.length * 3.8 + (it.hsn_code ? 5.5 : 3));

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, cursorY, contentWidth, rowH, 1.8, 1.8, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(descLines, marginX + 4, cursorY + 4.5);

    if (it.hsn_code) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text(`HSN: ${it.hsn_code}  |  GST: ${it.tax_rate}%`, marginX + 4, cursorY + rowH - 2.5);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${it.quantity}${it.unit && it.unit !== "NOS" ? " " + it.unit : ""}`, marginX + 105, cursorY + 5.5, { align: "center" });
    doc.text(fmt(it.unit_price), marginX + 138, cursorY + 5.5, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(fmt(it.total_price), rightX - 4, cursorY + 5.5, { align: "right" });

    cursorY += rowH + 2;
  });

  cursorY += 4;

  // ── Totals ──
  const isInterState =
    !!invoice.customer_gst &&
    invoice.customer_gst.length >= 2 &&
    !invoice.customer_gst.startsWith("33");
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.tax_amount || 0;
  const totalAmount = invoice.total_amount || 0;
  const cgst = isInterState ? 0 : taxAmount / 2;
  const sgst = isInterState ? 0 : taxAmount / 2;
  const igst = isInterState ? taxAmount : 0;
  const tX = rightX - 75;

  const writeTotal = (label: string, val: number) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(label, tX, cursorY + 4);
    doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(fmt(val), rightX, cursorY + 4, { align: "right" });
    cursorY += 5;
  };
  writeTotal("Taxable Subtotal:", subtotal);
  if (isInterState) { writeTotal("IGST (18%):", igst); }
  else { writeTotal("CGST (9%):", cgst); writeTotal("SGST (9%):", sgst); }
  if (invoice.discount_amount && invoice.discount_amount > 0) {
    doc.setFont("helvetica", "normal"); doc.setTextColor(225, 29, 72);
    doc.text("Discount:", tX, cursorY + 4);
    doc.setFont("helvetica", "bold");
    doc.text(`-${fmt(invoice.discount_amount)}`, rightX, cursorY + 4, { align: "right" });
    cursorY += 5;
  }

  cursorY += 2;
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
  doc.text("Total amount:", rightX, cursorY + 4, { align: "right" });
  doc.setFontSize(18); doc.setTextColor(2, 132, 199);
  doc.text(fmt(totalAmount), rightX, cursorY + 12, { align: "right" });
  cursorY += 16;
  doc.setFont("helvetica", "italic"); doc.setFontSize(6.5); doc.setTextColor(100, 116, 139);
  doc.text(numberToWordsINR(totalAmount), rightX, cursorY, { align: "right" });
  cursorY += 8;

  // ── Terms ──
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
  doc.text("Terms & Conditions:", marginX, cursorY);
  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(148, 163, 184);
  doc.text(
    doc.splitTextToSize(
      "Prices are ex-works Chennai, freight & insurance extra as actuals. 50% advance along with formal purchase order, balance against dispatch. 12 months warranty against manufacturing defects. Dimensional calibration certificates provided with NABL traceability. All disputes subject to Chennai jurisdiction only.",
      140
    ),
    marginX,
    cursorY + 3.5
  );

  // ── Footer ──
  const fY = 278;
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, fY, contentWidth, 10, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(15, 23, 42);
  doc.text(company.name, marginX + 3, fY + 4.5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(100, 116, 139);
  doc.text(`www.akiraautomation.com  |  ${company.primaryEmail}  |  ${companyData.phones?.[0] || "+91 (44) 2476-8901"}`, marginX + 3, fY + 8);

  ([[59, 130, 246], [99, 102, 241], [14, 165, 233], [244, 63, 94], [245, 158, 11]] as [number, number, number][]).forEach(
    ([r, g, b], i) => { doc.setFillColor(r, g, b); doc.circle(rightX - 18 + i * 3.5, fY + 5, 1.2, "F"); }
  );

  if (options.download !== false) {
    const safe = (invoice.customer_company || invoice.customer_name || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
    doc.save(options.filename || `${invoice.invoice_number}_${safe}.pdf`);
  }

  return doc;
}
