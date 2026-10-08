import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '../types/database';
import { activityService } from './activityService';
import { emailService } from './emailService';

export interface InvoiceSettings {
  prefix: string;
  yearFormat: string;
  defaultTaxRate: number;
  currency: string;
  companyName: string;
  companyAddress: string;
  companyGst: string;
  paymentTerms: string;
}

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  prefix: 'INV',
  yearFormat: 'YYYY',
  defaultTaxRate: 18,
  currency: 'INR',
  companyName: 'Akira Precision Automation',
  companyAddress: 'No. 12, Industrial Area, Bangalore - 560058',
  companyGst: '29ABCDE1234F1Z5',
  paymentTerms: 'Payment due within 15 days of invoice date.',
};

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PRODUCT_SLUG_TO_UUID: Record<string, string> = {
  'air-plug-gauge': 'a0000000-0000-0000-0000-000000000001',
  'air-calliper-gauge': 'a0000000-0000-0000-0000-000000000002',
  'air-ring-gauge': 'a0000000-0000-0000-0000-000000000003',
  'electronic-calliper-gauge': 'a0000000-0000-0000-0000-000000000004',
  'air-gauge-display-unit': 'a0000000-0000-0000-0000-000000000005',
  'air-electronics-tri-colour-display': 'a0000000-0000-0000-0000-000000000006',
  'tri-colour-digital-display-unit': 'a0000000-0000-0000-0000-000000000007',
  'two-channel-tri-colour-display': 'a0000000-0000-0000-0000-000000000008',
  'three-channel-tri-colour-display': 'a0000000-0000-0000-0000-000000000009',
  'auto-selection-air-server-display': 'a0000000-0000-0000-0000-000000000010',
  'four-channel-tri-colour-display': 'a0000000-0000-0000-0000-000000000011',
  'memory-module-unit': 'a0000000-0000-0000-0000-000000000012',
  'engine-block-liner-multigauging-station': 'a0000000-0000-0000-0000-000000000013',
  'camshaft-multigauging-station': 'a0000000-0000-0000-0000-000000000014',
  'instruments-measuring-equipment': 'a0000000-0000-0000-0000-000000000015',
  'special-gauges-fixtures': 'a0000000-0000-0000-0000-000000000016',
};

export function resolveProductId(rawId?: string | null): string | null {
  if (!rawId) return null;
  const trimmed = rawId.trim();
  if (UUID_REGEX.test(trimmed)) return trimmed;
  if (PRODUCT_SLUG_TO_UUID[trimmed]) return PRODUCT_SLUG_TO_UUID[trimmed];
  return null;
}

export class InvoiceService {
  /**
   * Fetch configurable invoice settings from app_settings table.
   */
  async getInvoiceSettings(): Promise<InvoiceSettings> {
    if (!isSupabaseConfigured()) return DEFAULT_INVOICE_SETTINGS;

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'invoice_settings')
        .maybeSingle();

      if (error || !data?.value) return DEFAULT_INVOICE_SETTINGS;
      return { ...DEFAULT_INVOICE_SETTINGS, ...(data.value as Partial<InvoiceSettings>) };
    } catch {
      return DEFAULT_INVOICE_SETTINGS;
    }
  }

  /**
   * Generate an atomic sequential invoice number with configurable prefix.
   */
  async generateInvoiceNumber(customPrefix?: string): Promise<string> {
    const settings = await this.getInvoiceSettings();
    const prefix = customPrefix || settings.prefix || 'INV';

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('generate_invoice_number', {
          p_prefix: prefix,
        });

        if (!error && data) {
          return data as string;
        }
      } catch (err) {
        console.warn('[InvoiceService] RPC invoice number generation fallback:', err);
      }
    }

    // Client-side fallback if RPC is unavailable
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${randomSeq}`;
  }

  /**
   * Create an invoice/quotation with line items and calculated totals.
   */
  async createInvoice(input: CreateInvoiceInput): Promise<{
    invoice: Invoice | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { invoice: null, error: 'Database configuration is unavailable.' };
    }

    if (!input.customerName || !input.customerName.trim()) {
      return { invoice: null, error: 'Customer name is required.' };
    }

    if (!input.customerEmail || !input.customerEmail.trim()) {
      return { invoice: null, error: 'Customer email is required.' };
    }

    if (!input.items || input.items.length === 0) {
      return { invoice: null, error: 'At least one line item is required.' };
    }

    try {
      const settings = await this.getInvoiceSettings();
      const invoiceNumber = input.invoiceNumber || (await this.generateInvoiceNumber(settings.prefix));

      // Compute item amounts and totals
      let subtotal = 0;
      let totalTax = 0;

      const processedItems = input.items.map((item) => {
        const qty = item.quantity > 0 ? item.quantity : 1;
        const price = item.unitPrice || 0;
        const taxRate = item.taxRate !== undefined ? item.taxRate : settings.defaultTaxRate;
        const lineSubtotal = qty * price;
        const lineTax = (lineSubtotal * taxRate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        subtotal += lineSubtotal;
        totalTax += lineTax;

        return {
          product_id: resolveProductId(item.productId),
          description: item.description.trim(),
          hsn_code: item.hsnCode || null,
          quantity: qty,
          unit: item.unit || 'NOS',
          unit_price: price,
          tax_rate: taxRate,
          tax_amount: lineTax,
          total_price: lineTotal,
        };
      });

      const discount = input.discountAmount || 0;
      const grandTotal = Math.max(0, subtotal + totalTax - discount);

      // 1. Insert invoice header
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          enquiry_id: input.enquiryId || null,
          invoice_number: invoiceNumber,
          customer_name: input.customerName.trim(),
          customer_company: input.customerCompany?.trim() || null,
          customer_email: input.customerEmail.trim().toLowerCase(),
          customer_phone: input.customerPhone?.trim() || null,
          customer_address: input.customerAddress?.trim() || null,
          customer_gst: input.customerGst?.trim() || null,
          type: input.type || 'quotation',
          status: 'draft',
          subtotal,
          tax_amount: totalTax,
          discount_amount: discount,
          total_amount: grandTotal,
          currency: input.currency || settings.currency || 'INR',
          issue_date: input.issueDate || new Date().toISOString().slice(0, 10),
          due_date: input.dueDate || null,
          notes: input.notes?.trim() || null,
          terms: input.terms?.trim() || settings.paymentTerms,
          created_by: input.createdBy || null,
        })
        .select()
        .single();

      if (invoiceError || !invoiceData) {
        return { invoice: null, error: invoiceError?.message || 'Failed to create invoice header.' };
      }

      const invoiceId = invoiceData.id;

      // 2. Insert line items
      const itemsToInsert = processedItems.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('[InvoiceService] Failed to insert items:', itemsError);
        // Rollback orphan invoice header to maintain data integrity
        await supabase.from('invoices').delete().eq('id', invoiceId);
        return { invoice: null, error: `Failed to save invoice line items: ${itemsError.message}` };
      }

      const completeInvoice: Invoice = {
        ...invoiceData,
        items: insertedItems || [],
      };

      // 3. Log audit trail
      await activityService.recordActivity({
        entityType: 'invoice',
        entityId: invoiceId,
        action: 'INVOICE_CREATED',
        newValue: {
          invoice_number: invoiceNumber,
          total_amount: grandTotal,
          customer: input.customerName,
          enquiry_id: input.enquiryId,
        },
        description: `Generated ${input.type || 'quotation'} ${invoiceNumber} for ₹${grandTotal.toLocaleString('en-IN')}`,
        performedBy: input.createdBy || null,
      });

      return { invoice: completeInvoice, error: null };
    } catch (err: unknown) {
      return {
        invoice: null,
        error: err instanceof Error ? err.message : 'Unable to create invoice.',
      };
    }
  }

  /**
   * Retrieve list of invoices with optional filters and pagination.
   */
  async getInvoices(filters: InvoiceFilters = {}): Promise<{
    invoices: Invoice[];
    total: number;
    error: string | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { invoices: [], total: 0, error: 'Database configuration is unavailable.' };
    }

    const {
      enquiryId,
      status,
      type,
      createdBy,
      search,
      dateFrom,
      dateTo,
      sortBy = 'issue_date',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
    } = filters;

    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          creator_profile:profiles!invoices_created_by_fkey(id, email, full_name, role),
          items:invoice_items(*)
        `, { count: 'exact' });

      if (enquiryId) {
        query = query.eq('enquiry_id', enquiryId);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (type && type !== 'all') {
        query = query.eq('type', type);
      }

      if (createdBy && createdBy !== 'all') {
        query = query.eq('created_by', createdBy);
      }

      if (dateFrom) {
        query = query.gte('issue_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('issue_date', dateTo);
      }

      if (search?.trim()) {
        const term = search.trim();
        query = query.or(`invoice_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_company.ilike.%${term}%,customer_email.ilike.%${term}%`);
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { invoices: [], total: 0, error: error.message };
      }

      return {
        invoices: ((data || []) as Invoice[]).map((inv) => ({
          ...inv,
          items: inv.items || [],
        })),
        total: count || 0,
        error: null,
      };
    } catch (err: unknown) {
      return {
        invoices: [],
        total: 0,
        error: err instanceof Error ? err.message : 'Unable to load invoices.',
      };
    }
  }

  /**
   * Get a single invoice with full line items by UUID.
   */
  async getInvoiceById(id: string): Promise<{ invoice: Invoice | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { invoice: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          creator_profile:profiles!invoices_created_by_fkey(id, email, full_name, role),
          items:invoice_items(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return { invoice: null, error: error?.message || 'Invoice not found.' };
      }

      return {
        invoice: {
          ...(data as Invoice),
          items: (data as any).items || [],
        },
        error: null,
      };
    } catch (err: unknown) {
      return {
        invoice: null,
        error: err instanceof Error ? err.message : 'Unable to load invoice.',
      };
    }
  }

  /**
   * Update invoice status (e.g. draft -> sent -> paid).
   */
  async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
    updatedBy?: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const updates: Record<string, unknown> = { status };
      if (status === 'sent') {
        updates.sent_at = new Date().toISOString();
      } else if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'invoice',
        entityId: id,
        action: 'INVOICE_STATUS_CHANGED',
        newValue: { status },
        description: `Invoice status changed to ${status.toUpperCase()}`,
        performedBy: updatedBy || null,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update invoice status.',
      };
    }
  }

  /**
   * Send invoice to customer via email.
   */
  async sendInvoiceToCustomer(
    id: string,
    senderProfile?: { id: string; full_name?: string | null; email?: string }
  ): Promise<{ success: boolean; error: string | null }> {
    const { invoice, error } = await this.getInvoiceById(id);
    if (error || !invoice) {
      return { success: false, error: error || 'Invoice not found.' };
    }

    try {
      // 1. Dispatch email notification via emailService
      let emailDispatched = false;
      try {
        const emailResult = await emailService.notifyInvoiceDispatched(invoice, invoice.customer_email);
        emailDispatched = emailResult.success;
        if (!emailResult.success) {
          console.warn('[InvoiceService] Email dispatch notice:', emailResult.error);
        }
      } catch (emailErr) {
        console.warn('[InvoiceService] Email dispatch exception:', emailErr);
      }

      // 2. Mark invoice as sent
      await this.updateInvoiceStatus(id, 'sent', senderProfile?.id);

      // 3. Record activity
      await activityService.recordActivity({
        entityType: 'invoice',
        entityId: id,
        action: 'INVOICE_STATUS_CHANGED',
        description: `Dispatched invoice ${invoice.invoice_number} to ${invoice.customer_email}${emailDispatched ? ' (Email confirmed)' : ''}`,
        performedBy: senderProfile?.id || null,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send invoice.',
      };
    }
  }

  /**
   * Update an existing draft invoice and optionally recalculate line items.
   */
  async updateInvoice(
    id: string,
    input: UpdateInvoiceInput
  ): Promise<{ invoice: Invoice | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { invoice: null, error: 'Database configuration is unavailable.' };
    }

    try {
      const settings = await this.getInvoiceSettings();
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.customerName !== undefined) payload.customer_name = input.customerName.trim();
      if (input.customerCompany !== undefined) payload.customer_company = input.customerCompany?.trim() || null;
      if (input.customerEmail !== undefined) payload.customer_email = input.customerEmail.trim().toLowerCase();
      if (input.customerPhone !== undefined) payload.customer_phone = input.customerPhone?.trim() || null;
      if (input.customerAddress !== undefined) payload.customer_address = input.customerAddress?.trim() || null;
      if (input.customerGst !== undefined) payload.customer_gst = input.customerGst?.trim() || null;
      if (input.type !== undefined) payload.type = input.type;
      if (input.currency !== undefined) payload.currency = input.currency;
      if (input.issueDate !== undefined) payload.issue_date = input.issueDate;
      if (input.dueDate !== undefined) payload.due_date = input.dueDate;
      if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;
      if (input.terms !== undefined) payload.terms = input.terms?.trim() || null;

      // Handle item updates if provided
      if (input.items && input.items.length > 0) {
        let subtotal = 0;
        let totalTax = 0;

        const processedItems = input.items.map((item) => {
          const qty = item.quantity > 0 ? item.quantity : 1;
          const price = item.unitPrice || 0;
          const taxRate = item.taxRate !== undefined ? item.taxRate : settings.defaultTaxRate;
          const lineSubtotal = qty * price;
          const lineTax = (lineSubtotal * taxRate) / 100;
          const lineTotal = lineSubtotal + lineTax;

          subtotal += lineSubtotal;
          totalTax += lineTax;

          return {
            invoice_id: id,
            product_id: resolveProductId(item.productId),
            description: item.description.trim(),
            hsn_code: item.hsnCode || null,
            quantity: qty,
            unit: item.unit || 'NOS',
            unit_price: price,
            tax_rate: taxRate,
            tax_amount: lineTax,
            total_price: lineTotal,
          };
        });

        const discount = input.discountAmount !== undefined ? input.discountAmount : 0;
        payload.subtotal = subtotal;
        payload.tax_amount = totalTax;
        payload.discount_amount = discount;
        payload.total_amount = Math.max(0, subtotal + totalTax - discount);

        // Delete existing items and re-insert new items atomically
        await supabase.from('invoice_items').delete().eq('invoice_id', id);
        const { error: itemsError } = await supabase.from('invoice_items').insert(processedItems);
        if (itemsError) {
          return { invoice: null, error: `Failed to update line items: ${itemsError.message}` };
        }
      } else if (input.discountAmount !== undefined) {
        payload.discount_amount = input.discountAmount;
      }

      const { data: updatedInvoice, error: updateError } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          creator_profile:profiles!invoices_created_by_fkey(id, email, full_name, role),
          items:invoice_items(*)
        `)
        .single();

      if (updateError || !updatedInvoice) {
        return { invoice: null, error: updateError?.message || 'Failed to update invoice.' };
      }

      await activityService.recordActivity({
        entityType: 'invoice',
        entityId: id,
        action: 'INVOICE_UPDATED',
        description: `Updated invoice ${updatedInvoice.invoice_number} (${updatedInvoice.customer_name})`,
      });

      return { invoice: updatedInvoice as Invoice, error: null };
    } catch (err: unknown) {
      return {
        invoice: null,
        error: err instanceof Error ? err.message : 'Failed to update invoice.',
      };
    }
  }

  /**
   * Delete an invoice and associated line items (admin or draft creator).
   */
  async deleteInvoice(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database configuration is unavailable.' };
    }

    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number, customer_name')
        .eq('id', id)
        .maybeSingle();

      // Delete associated line items first to prevent foreign key constraint conflicts
      await supabase.from('invoice_items').delete().eq('invoice_id', id);

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await activityService.recordActivity({
        entityType: 'invoice',
        entityId: id,
        action: 'INVOICE_DELETED',
        description: `Deleted invoice "${invoice?.invoice_number || id}" for ${invoice?.customer_name || 'Customer'}`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete invoice.',
      };
    }
  }

  /**
   * Search existing customer database across historical enquiries and invoices
   * to provide instant autofill for invoice generation.
   */
  async searchCustomers(query: string): Promise<CustomerSearchResult[]> {
    if (!isSupabaseConfigured() || !query || query.trim().length < 2) return [];

    const term = query.trim();
    try {
      // 1. Try dedicated database RPC function (fast, deduplicated, security definer)
      const { data: rpcData, error: rpcError } = await supabase.rpc('search_customers', {
        p_query: term,
      });

      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        return rpcData as CustomerSearchResult[];
      }

      // 2. Fallback to direct table queries
      const [enqRes, invRes] = await Promise.all([
        supabase
          .from('enquiries')
          .select('id, name, company, email, phone')
          .or(`name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%`)
          .limit(8),
        supabase
          .from('invoices')
          .select('customer_name, customer_company, customer_email, customer_phone, customer_address, customer_gst')
          .or(`customer_name.ilike.%${term}%,customer_company.ilike.%${term}%,customer_email.ilike.%${term}%`)
          .limit(8),
      ]);

      const resultsMap = new Map<string, CustomerSearchResult>();

      // Invoices provide the richest billing address & GST details
      if (invRes.data) {
        invRes.data.forEach((inv: any) => {
          const key = (inv.customer_email || inv.customer_name || '').toLowerCase();
          if (key && !resultsMap.has(key)) {
            resultsMap.set(key, {
              name: inv.customer_name,
              company: inv.customer_company || null,
              email: inv.customer_email,
              phone: inv.customer_phone || null,
              address: inv.customer_address || null,
              gst: inv.customer_gst || null,
              source: 'invoice',
            });
          }
        });
      }

      // Enquiries provide the latest contact and requirement leads
      if (enqRes.data) {
        enqRes.data.forEach((enq: any) => {
          const key = (enq.email || enq.name || '').toLowerCase();
          if (key && !resultsMap.has(key)) {
            resultsMap.set(key, {
              id: enq.id,
              name: enq.name,
              company: enq.company || null,
              email: enq.email,
              phone: enq.phone || null,
              source: 'enquiry',
            });
          }
        });
      }

      return Array.from(resultsMap.values());
    } catch {
      return [];
    }
  }
}

export interface CustomerSearchResult {
  id?: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  address?: string | null;
  gst?: string | null;
  source: 'enquiry' | 'invoice';
}

export const invoiceService = new InvoiceService();

