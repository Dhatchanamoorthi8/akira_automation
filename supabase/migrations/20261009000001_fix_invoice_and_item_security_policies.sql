-- ============================================================
-- AKIRA AUTOMATION — SECURE INVOICE & INVOICE ITEMS RLS POLICIES
-- Migration: 20261009000001_fix_invoice_and_item_security_policies.sql
-- Resolves Vulnerability: SEC-01 (Overly Permissive Invoices & Items RLS)
-- ============================================================

-- 1. DROP UNRESTRICTED PERMISSIVE POLICIES
DROP POLICY IF EXISTS "invoices_authenticated_delete" ON public.invoices;
DROP POLICY IF EXISTS "invoices_authenticated_update" ON public.invoices;
DROP POLICY IF EXISTS "invoice_items_authenticated_delete" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_authenticated_update" ON public.invoice_items;

-- 2. DROP OVERLAPPING / REDUNDANT POLICIES (Ensures clean evaluation)
DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoice_items_delete_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_select_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_policy" ON public.invoice_items;

-- 3. RECREATE RESTRICTIVE & PURPOSE-SCOPED INVOICES POLICIES

-- SELECT:
-- - Admins and Managers can view all invoices
-- - Staff/Sales can view invoices they created or for leads assigned to them
CREATE POLICY "invoices_select_policy" ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'manager' AND p.active = true
    ) OR
    (
      public.is_staff() AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.enquiries e
          WHERE e.id = invoices.enquiry_id AND e.assigned_to = auth.uid()
        )
      )
    )
  );

-- INSERT:
-- - Admins can create any invoice
-- - Staff/Sales can create invoices when authenticated as the creator
CREATE POLICY "invoices_insert_policy" ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR
    (created_by = auth.uid() AND public.is_staff())
  );

-- UPDATE:
-- - Admins can update any invoice
-- - Staff can ONLY update their own DRAFT invoices (finalized/sent/paid cannot be altered by staff)
CREATE POLICY "invoices_update_policy" ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    (created_by = auth.uid() AND status = 'draft' AND public.is_staff())
  )
  WITH CHECK (
    public.is_admin() OR
    (created_by = auth.uid() AND status IN ('draft', 'sent') AND public.is_staff())
  );

-- DELETE:
-- - Admins can delete any invoice
-- - Staff can ONLY delete their own DRAFT invoices
CREATE POLICY "invoices_delete_policy" ON public.invoices
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR
    (created_by = auth.uid() AND status = 'draft' AND public.is_staff())
  );

-- 4. RECREATE RESTRICTIVE INVOICE ITEMS POLICIES
-- Tied directly to parent invoice permissions to prevent orphaned modifications

-- SELECT:
CREATE POLICY "invoice_items_select_policy" ON public.invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
    )
  );

-- INSERT:
CREATE POLICY "invoice_items_insert_policy" ON public.invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft' AND public.is_staff()))
    )
  );

-- UPDATE:
CREATE POLICY "invoice_items_update_policy" ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft' AND public.is_staff()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft' AND public.is_staff()))
    )
  );

-- DELETE:
CREATE POLICY "invoice_items_delete_policy" ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft' AND public.is_staff()))
    )
  );
