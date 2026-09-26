-- ============================================================
-- AKIRA AUTOMATION — PHASE 11 DATABASE MIGRATION
-- Enterprise CRM: Invoicing, Field Visits, Staff Attendance & Lead Conversion
-- Migration: 20260921000001_phase11_crm_invoices_visits_attendance.sql
-- ============================================================

-- 1. EXTEND ENQUIRIES TABLE FOR CRM CONVERSION & LOST REASONS
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS deal_title TEXT,
  ADD COLUMN IF NOT EXISTS deal_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS expected_close_date DATE,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS converted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lost_reason TEXT,
  ADD COLUMN IF NOT EXISTS lost_notes TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. TABLE: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_company TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  customer_gst TEXT,
  type TEXT NOT NULL DEFAULT 'quotation' CHECK (type IN ('quotation', 'proforma', 'tax_invoice')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'paid', 'cancelled')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLE: invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  hsn_code TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'NOS',
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLE: field_visits
CREATE TABLE IF NOT EXISTS public.field_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  visit_purpose TEXT NOT NULL DEFAULT 'consultation' CHECK (visit_purpose IN ('consultation', 'demo', 'site_inspection', 'installation', 'troubleshooting', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  check_in_at TIMESTAMPTZ,
  check_in_lat DOUBLE PRECISION,
  check_in_lng DOUBLE PRECISION,
  check_in_address TEXT,
  check_out_at TIMESTAMPTZ,
  check_out_lat DOUBLE PRECISION,
  check_out_lng DOUBLE PRECISION,
  check_out_address TEXT,
  duration_minutes INTEGER,
  outcome_notes TEXT,
  customer_contact_person TEXT,
  customer_signature_url TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLE: staff_attendance
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_in_lat DOUBLE PRECISION,
  clock_in_lng DOUBLE PRECISION,
  clock_in_address TEXT,
  clock_out_at TIMESTAMPTZ,
  clock_out_lat DOUBLE PRECISION,
  clock_out_lng DOUBLE PRECISION,
  clock_out_address TEXT,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'half_day', 'on_field', 'leave')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_staff_attendance_date UNIQUE (staff_id, work_date)
);

-- 6. SEQUENTIAL INVOICE NUMBER GENERATION RPC
-- Generates an atomic sequential invoice number with configurable prefix and year
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_prefix TEXT DEFAULT 'INV')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_year TEXT;
  v_next_seq INTEGER;
  v_formatted_num TEXT;
  v_pattern TEXT;
BEGIN
  v_current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_pattern := p_prefix || '-' || v_current_year || '-%';

  -- Find highest sequence for current prefix and year
  SELECT COALESCE(MAX(
    NULLIF(SUBSTRING(invoice_number FROM LENGTH(p_prefix || '-' || v_current_year || '-') + 1), '')::INTEGER
  ), 0) + 1
  INTO v_next_seq
  FROM public.invoices
  WHERE invoice_number LIKE v_pattern;

  v_formatted_num := p_prefix || '-' || v_current_year || '-' || LPAD(v_next_seq::TEXT, 4, '0');
  RETURN v_formatted_num;
END;
$$;

-- 7. SEED DEFAULT INVOICE SETTINGS IN app_settings
INSERT INTO public.app_settings (key, value)
VALUES (
  'invoice_settings',
  '{
    "prefix": "INV",
    "yearFormat": "YYYY",
    "defaultTaxRate": 18,
    "currency": "INR",
    "companyName": "Akira Precision Automation",
    "companyAddress": "No. 12, Industrial Area, Bangalore - 560058",
    "companyGst": "29ABCDE1234F1Z5",
    "paymentTerms": "Payment due within 15 days of invoice date."
  }'::JSONB
)
ON CONFLICT (key) DO NOTHING;

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_invoices_enquiry_id ON public.invoices(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_field_visits_enquiry_id ON public.field_visits(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_field_visits_staff_id ON public.field_visits(staff_id);
CREATE INDEX IF NOT EXISTS idx_field_visits_status ON public.field_visits(status);
CREATE INDEX IF NOT EXISTS idx_field_visits_scheduled_at ON public.field_visits(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_id ON public.staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_work_date ON public.staff_attendance(work_date);

-- 9. TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_field_visits_updated_at ON public.field_visits;
CREATE TRIGGER trg_field_visits_updated_at
  BEFORE UPDATE ON public.field_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_staff_attendance_updated_at ON public.staff_attendance;
CREATE TRIGGER trg_staff_attendance_updated_at
  BEFORE UPDATE ON public.staff_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

-- INVOICES POLICIES:
-- Admins can view all invoices; Staff can view invoices for their assigned enquiries or created by them
CREATE POLICY "invoices_select_policy" ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.enquiries e 
      WHERE e.id = invoices.enquiry_id AND e.assigned_to = auth.uid()
    )
  );

-- Admins and staff can create invoices
CREATE POLICY "invoices_insert_policy" ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    created_by = auth.uid()
  );

-- Admins can update any invoice; Staff can only update draft invoices they created
CREATE POLICY "invoices_update_policy" ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR 
    (created_by = auth.uid() AND status = 'draft')
  )
  WITH CHECK (
    public.is_admin() OR 
    (created_by = auth.uid() AND status IN ('draft', 'sent'))
  );

-- INVOICE ITEMS POLICIES:
CREATE POLICY "invoice_items_select_policy" ON public.invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
    )
  );

CREATE POLICY "invoice_items_insert_policy" ON public.invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id AND (public.is_admin() OR inv.created_by = auth.uid())
    )
  );

CREATE POLICY "invoice_items_update_policy" ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id AND (public.is_admin() OR inv.created_by = auth.uid())
    )
  );

CREATE POLICY "invoice_items_delete_policy" ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id AND (public.is_admin() OR inv.created_by = auth.uid())
    )
  );

-- FIELD VISITS POLICIES:
-- Admins can view all visits; Staff can view their own visits
CREATE POLICY "field_visits_select_policy" ON public.field_visits
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    staff_id = auth.uid()
  );

CREATE POLICY "field_visits_insert_policy" ON public.field_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    staff_id = auth.uid()
  );

CREATE POLICY "field_visits_update_policy" ON public.field_visits
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR 
    staff_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin() OR 
    staff_id = auth.uid()
  );

-- STAFF ATTENDANCE POLICIES:
-- Admins can view all attendance; Staff can view their own attendance
CREATE POLICY "staff_attendance_select_policy" ON public.staff_attendance
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    staff_id = auth.uid()
  );

CREATE POLICY "staff_attendance_insert_policy" ON public.staff_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    staff_id = auth.uid()
  );

CREATE POLICY "staff_attendance_update_policy" ON public.staff_attendance
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR 
    staff_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin() OR 
    staff_id = auth.uid()
  );

-- 11. ROLE GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_visits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.staff_attendance TO authenticated;
