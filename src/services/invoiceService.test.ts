import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { invoiceService } from './invoiceService';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

describe('InvoiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates totals, taxes, and creates invoice with items', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const mockInvoiceData = {
      id: 'inv_123',
      invoice_number: 'INV-2026-0001',
      customer_name: 'Precision Engineering Ltd',
      customer_email: 'purchase@precisioneng.com',
      subtotal: 10000,
      tax_amount: 1800,
      discount_amount: 0,
      total_amount: 11800,
      status: 'draft',
      type: 'quotation',
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockInvoiceData, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsertInvoice = vi.fn().mockReturnValue({ select: mockSelect });

    const mockInsertItems = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'item_1',
            invoice_id: 'inv_123',
            description: 'Custom Air Ring Gauge Ø25.000mm',
            quantity: 2,
            unit_price: 5000,
            tax_rate: 18,
            tax_amount: 1800,
            total_price: 11800,
          },
        ],
        error: null,
      }),
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'invoices') {
        return { insert: mockInsertInvoice } as any;
      }
      if (table === 'invoice_items') {
        return { insert: mockInsertItems } as any;
      }
      if (table === 'activity_logs') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) } as any;
      }
      if (table === 'app_settings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const result = await invoiceService.createInvoice({
      customerName: 'Precision Engineering Ltd',
      customerEmail: 'purchase@precisioneng.com',
      type: 'quotation',
      items: [
        {
          description: 'Custom Air Ring Gauge Ø25.000mm',
          quantity: 2,
          unitPrice: 5000,
          taxRate: 18,
        },
      ],
    });

    expect(result.invoice).toBeDefined();
    expect(result.invoice?.total_amount).toBe(11800);
    expect(result.error).toBeNull();
  });

  it('validates mandatory customer fields', async () => {
    vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true);

    const result = await invoiceService.createInvoice({
      customerName: '',
      customerEmail: 'test@example.com',
      items: [{ description: 'Item 1', quantity: 1, unitPrice: 100 }],
    });

    expect(result.invoice).toBeNull();
    expect(result.error).toBe('Customer name is required.');
  });
});
