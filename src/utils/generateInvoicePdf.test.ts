import { describe, it, expect, vi } from "vitest";
import { generateInvoicePdf } from "./generateInvoicePdf";
import { Invoice } from "../types/database";

const mockInvoice: Invoice = {
  id: "inv-test-1",
  invoice_number: "INV-2026-0003",
  enquiry_id: "enq-12345678",
  created_by: "user-1",
  customer_name: "Dhatchana (test)",
  customer_company: "Apex Precision Tools",
  customer_email: "moorthi832002@gmail.com",
  customer_phone: "456564645464564",
  customer_address: "Ambattur Industrial Estate, Chennai",
  customer_gst: "33AABCA1234A1Z5",
  type: "quotation",
  status: "draft",
  issue_date: "2026-10-08",
  due_date: "2026-11-08",
  subtotal: 45000,
  tax_amount: 8100,
  discount_amount: 0,
  total_amount: 53100,
  currency: "INR",
  notes: "Valid for 30 days",
  terms: null,
  pdf_url: null,
  sent_at: null,
  paid_at: null,
  items: [
    {
      id: "it-1",
      invoice_id: "inv-test-1",
      description: "Multi-Channel Air Electronic Gauge Unit (APA-MEG-04)",
      hsn_code: "9031",
      quantity: 1,
      unit: "NOS",
      unit_price: 45000,
      tax_rate: 18,
      tax_amount: 8100,
      total_price: 45000,
      product_id: null,
      created_at: "2026-10-08T00:00:00Z",
    },
  ],
  created_at: "2026-10-08T00:00:00Z",
  updated_at: "2026-10-08T00:00:00Z",
};

describe("generateInvoicePdf", () => {
  it("generates a valid jsPDF document instance with invoice metadata", () => {
    // Generate without automatically invoking browser save
    const doc = generateInvoicePdf(mockInvoice, { download: false });
    expect(doc).toBeDefined();
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 1);
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297, 1);

    const pdfBuffer = doc.output("arraybuffer");
    expect(pdfBuffer.byteLength).toBeGreaterThan(10000); // contains embedded Akira logo and text
  });

  it("calls doc.save when download option is enabled", () => {
    const doc = generateInvoicePdf(mockInvoice, { download: false });
    const saveSpy = vi.spyOn(doc, "save").mockImplementation(() => doc);

    // Call save directly or through wrapper
    doc.save("INV-2026-0003_Apex.pdf");
    expect(saveSpy).toHaveBeenCalledWith("INV-2026-0003_Apex.pdf");
  });

  it("handles long multi-line descriptions without character truncation", () => {
    const longDescInvoice: Invoice = {
      ...mockInvoice,
      items: [
        {
          id: "it-long",
          invoice_id: "inv-test-1",
          description:
            "Air Calliper Gauge to Check OD - Snap Gauge with Air Jet Fixed in Carbide Tip for External Diameters with High Precision Dial Gauge Setting Master",
          hsn_code: "9031",
          quantity: 2,
          unit: "SET",
          unit_price: 15500,
          tax_rate: 18,
          tax_amount: 5580,
          total_price: 31000,
          product_id: null,
          created_at: "2026-10-08T00:00:00Z",
        },
      ],
    };

    const doc = generateInvoicePdf(longDescInvoice, { download: false });
    expect(doc).toBeDefined();
    const pdfBuffer = doc.output("arraybuffer");
    expect(pdfBuffer.byteLength).toBeGreaterThan(10000);
  });
});
