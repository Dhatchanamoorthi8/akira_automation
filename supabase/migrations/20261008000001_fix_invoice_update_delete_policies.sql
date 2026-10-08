-- ============================================================
-- AKIRA AUTOMATION — INVOICE & INVOICE ITEMS UPDATE & DELETE POLICIES
-- Migration: 20261008000001_fix_invoice_update_delete_policies.sql
-- Enables reliable editing and deletion of invoices and line items
-- ============================================================

CREATE POLICY "invoices_authenticated_delete" ON public.invoices
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "invoices_authenticated_update" ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "invoice_items_authenticated_delete" ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "invoice_items_authenticated_update" ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
