-- ============================================================
-- AKIRA AUTOMATION — ATOMIC INVOICE & LINE ITEMS TRANSACTION RPCs
-- Migration: 20261009000002_create_atomic_invoice_functions.sql
-- Resolves Vulnerability: DAT-01 (Non-Atomic Multi-Step Creation)
-- ============================================================

-- 1. ATOMIC INVOICE CREATION RPC
CREATE OR REPLACE FUNCTION public.create_invoice_atomic(
  p_invoice JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_subtotal NUMERIC(12,2) := 0;
  v_total_tax NUMERIC(12,2) := 0;
  v_discount NUMERIC(12,2) := 0;
  v_grand_total NUMERIC(12,2) := 0;
  v_item RECORD;
  v_item_subtotal NUMERIC(12,2);
  v_item_tax NUMERIC(12,2);
  v_result JSONB;
BEGIN
  -- Security check: Require authenticated active user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create invoice';
  END IF;

  IF NOT (public.is_admin() OR public.is_staff()) THEN
    RAISE EXCEPTION 'Unauthorized: User does not have staff or admin role';
  END IF;

  -- Input Validation
  IF COALESCE(p_invoice->>'customer_name', '') = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF COALESCE(p_invoice->>'customer_email', '') = '' THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one line item is required';
  END IF;

  -- Calculate totals inside transaction from line items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
    quantity INTEGER,
    unit_price NUMERIC(12,2),
    tax_rate NUMERIC(5,2)
  ) LOOP
    IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Line item quantity must be greater than zero';
    END IF;
    IF v_item.unit_price IS NULL OR v_item.unit_price < 0 THEN
      RAISE EXCEPTION 'Line item unit price cannot be negative';
    END IF;

    v_item_subtotal := v_item.quantity * v_item.unit_price;
    v_item_tax := (v_item_subtotal * COALESCE(v_item.tax_rate, 18.00)) / 100.00;
    
    v_subtotal := v_subtotal + v_item_subtotal;
    v_total_tax := v_total_tax + v_item_tax;
  END LOOP;

  v_discount := COALESCE((p_invoice->>'discount_amount')::NUMERIC(12,2), 0);
  v_grand_total := GREATEST(0, v_subtotal + v_total_tax - v_discount);

  -- Generate atomic sequential invoice number if not explicitly supplied
  v_invoice_number := p_invoice->>'invoice_number';
  IF v_invoice_number IS NULL OR TRIM(v_invoice_number) = '' THEN
    v_invoice_number := public.generate_invoice_number(COALESCE(p_invoice->>'prefix', 'INV'));
  END IF;

  -- Insert invoice header
  INSERT INTO public.invoices (
    enquiry_id,
    invoice_number,
    customer_name,
    customer_company,
    customer_email,
    customer_phone,
    customer_address,
    customer_gst,
    type,
    status,
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    currency,
    issue_date,
    due_date,
    notes,
    terms,
    created_by
  ) VALUES (
    (p_invoice->>'enquiry_id')::UUID,
    v_invoice_number,
    TRIM(p_invoice->>'customer_name'),
    NULLIF(TRIM(p_invoice->>'customer_company'), ''),
    LOWER(TRIM(p_invoice->>'customer_email')),
    NULLIF(TRIM(p_invoice->>'customer_phone'), ''),
    NULLIF(TRIM(p_invoice->>'customer_address'), ''),
    NULLIF(TRIM(p_invoice->>'customer_gst'), ''),
    COALESCE(p_invoice->>'type', 'quotation'),
    'draft',
    v_subtotal,
    v_total_tax,
    v_discount,
    v_grand_total,
    COALESCE(p_invoice->>'currency', 'INR'),
    COALESCE((p_invoice->>'issue_date')::DATE, CURRENT_DATE),
    (p_invoice->>'due_date')::DATE,
    NULLIF(TRIM(p_invoice->>'notes'), ''),
    NULLIF(TRIM(p_invoice->>'terms'), ''),
    v_user_id
  ) RETURNING id INTO v_invoice_id;

  -- Insert line items atomically
  INSERT INTO public.invoice_items (
    invoice_id,
    product_id,
    description,
    hsn_code,
    quantity,
    unit,
    unit_price,
    tax_rate,
    tax_amount,
    total_price
  )
  SELECT
    v_invoice_id,
    (item->>'product_id')::UUID,
    TRIM(item->>'description'),
    NULLIF(TRIM(item->>'hsn_code'), ''),
    (item->>'quantity')::INTEGER,
    COALESCE(item->>'unit', 'NOS'),
    (item->>'unit_price')::NUMERIC(12,2),
    COALESCE((item->>'tax_rate')::NUMERIC(5,2), 18.00),
    ((item->>'quantity')::INTEGER * (item->>'unit_price')::NUMERIC(12,2) * COALESCE((item->>'tax_rate')::NUMERIC(5,2), 18.00)) / 100.00,
    ((item->>'quantity')::INTEGER * (item->>'unit_price')::NUMERIC(12,2)) + 
    (((item->>'quantity')::INTEGER * (item->>'unit_price')::NUMERIC(12,2) * COALESCE((item->>'tax_rate')::NUMERIC(5,2), 18.00)) / 100.00)
  FROM jsonb_array_elements(p_items) AS item;

  -- Record audit log
  INSERT INTO public.activity_logs (
    entity_type,
    entity_id,
    action,
    new_value,
    description,
    performed_by
  ) VALUES (
    'invoice',
    v_invoice_id,
    'INVOICE_CREATED',
    jsonb_build_object(
      'invoice_number', v_invoice_number,
      'total_amount', v_grand_total,
      'customer', p_invoice->>'customer_name'
    ),
    'Created ' || COALESCE(p_invoice->>'type', 'quotation') || ' ' || v_invoice_number,
    v_user_id
  );

  -- Retrieve complete invoice with nested items and return
  SELECT row_to_json(inv_rec)::JSONB INTO v_result
  FROM (
    SELECT
      i.*,
      COALESCE(json_agg(row_to_json(it.*)) FILTER (WHERE it.id IS NOT NULL), '[]'::json) AS items
    FROM public.invoices i
    LEFT JOIN public.invoice_items it ON it.invoice_id = i.id
    WHERE i.id = v_invoice_id
    GROUP BY i.id
  ) inv_rec;

  RETURN v_result;
END;
$$;

-- 2. ATOMIC INVOICE UPDATE RPC
CREATE OR REPLACE FUNCTION public.update_invoice_atomic(
  p_invoice_id UUID,
  p_invoice JSONB,
  p_items JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing RECORD;
  v_subtotal NUMERIC(12,2);
  v_total_tax NUMERIC(12,2);
  v_discount NUMERIC(12,2);
  v_grand_total NUMERIC(12,2);
  v_item RECORD;
  v_item_subtotal NUMERIC(12,2);
  v_item_tax NUMERIC(12,2);
  v_result JSONB;
BEGIN
  -- Security check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to update invoice';
  END IF;

  SELECT * INTO v_existing FROM public.invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  -- Authorization check:
  -- Only admins can edit any invoice; Staff can only edit draft invoices they created
  IF NOT (public.is_admin() OR (v_existing.created_by = v_user_id AND v_existing.status = 'draft' AND public.is_staff())) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify finalized invoices or invoices created by other users';
  END IF;

  -- If line items are supplied, replace atomically and recalculate totals
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    v_subtotal := 0;
    v_total_tax := 0;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
      quantity INTEGER,
      unit_price NUMERIC(12,2),
      tax_rate NUMERIC(5,2)
    ) LOOP
      IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
        RAISE EXCEPTION 'Line item quantity must be greater than zero';
      END IF;
      IF v_item.unit_price IS NULL OR v_item.unit_price < 0 THEN
        RAISE EXCEPTION 'Line item unit price cannot be negative';
      END IF;

      v_item_subtotal := v_item.quantity * v_item.unit_price;
      v_item_tax := (v_item_subtotal * COALESCE(v_item.tax_rate, 18.00)) / 100.00;
      
      v_subtotal := v_subtotal + v_item_subtotal;
      v_total_tax := v_total_tax + v_item_tax;
    END LOOP;

    v_discount := COALESCE(
      (p_invoice->>'discount_amount')::NUMERIC(12,2),
      v_existing.discount_amount,
      0
    );
    v_grand_total := GREATEST(0, v_subtotal + v_total_tax - v_discount);

    -- Delete old items and insert new items inside transaction
    DELETE FROM public.invoice_items WHERE invoice_id = p_invoice_id;

    INSERT INTO public.invoice_items (
      invoice_id,
      product_id,
      description,
      hsn_code,
      quantity,
      unit,
      unit_price,
      tax_rate,
      tax_amount,
      total_price
    )
    SELECT
      p_invoice_id,
      (item->>'product_id')::UUID,
      TRIM(item->>'description'),
      NULLIF(TRIM(item->>'hsn_code'), ''),
      (item->>'quantity')::INTEGER,
      COALESCE(item->>'unit', 'NOS'),
      (item->>'unit_price')::NUMERIC(12,2),
      COALESCE((item->>'tax_rate')::NUMERIC(5,2), 18.00),
      ((item->>'quantity')::INTEGER * (item->>'unit_price')::NUMERIC(12,2) * COALESCE((item->>'tax_rate')::NUMERIC(5,2), 18.00)) / 100.00,
      ((item->>'quantity')::INTEGER * (item->>'unit_price')::NUMERIC(12,2)) + 
      (((item->>'quantity')::INTEGER * (item->>'unit_price')::NUMERIC(12,2) * COALESCE((item->>'tax_rate')::NUMERIC(5,2), 18.00)) / 100.00)
    FROM jsonb_array_elements(p_items) AS item;
  ELSE
    v_subtotal := v_existing.subtotal;
    v_total_tax := v_existing.tax_amount;
    v_discount := COALESCE((p_invoice->>'discount_amount')::NUMERIC(12,2), v_existing.discount_amount);
    v_grand_total := GREATEST(0, v_subtotal + v_total_tax - v_discount);
  END IF;

  -- Update invoice header
  UPDATE public.invoices
  SET
    customer_name = COALESCE(NULLIF(TRIM(p_invoice->>'customer_name'), ''), customer_name),
    customer_company = COALESCE(NULLIF(TRIM(p_invoice->>'customer_company'), ''), customer_company),
    customer_email = COALESCE(NULLIF(LOWER(TRIM(p_invoice->>'customer_email')), ''), customer_email),
    customer_phone = COALESCE(NULLIF(TRIM(p_invoice->>'customer_phone'), ''), customer_phone),
    customer_address = COALESCE(NULLIF(TRIM(p_invoice->>'customer_address'), ''), customer_address),
    customer_gst = COALESCE(NULLIF(TRIM(p_invoice->>'customer_gst'), ''), customer_gst),
    type = COALESCE(p_invoice->>'type', type),
    currency = COALESCE(p_invoice->>'currency', currency),
    issue_date = COALESCE((p_invoice->>'issue_date')::DATE, issue_date),
    due_date = COALESCE((p_invoice->>'due_date')::DATE, due_date),
    notes = COALESCE(NULLIF(TRIM(p_invoice->>'notes'), ''), notes),
    terms = COALESCE(NULLIF(TRIM(p_invoice->>'terms'), ''), terms),
    subtotal = v_subtotal,
    tax_amount = v_total_tax,
    discount_amount = v_discount,
    total_amount = v_grand_total,
    updated_at = now()
  WHERE id = p_invoice_id;

  -- Record audit activity
  INSERT INTO public.activity_logs (
    entity_type,
    entity_id,
    action,
    description,
    performed_by
  ) VALUES (
    'invoice',
    p_invoice_id,
    'INVOICE_UPDATED',
    'Updated invoice ' || v_existing.invoice_number,
    v_user_id
  );

  -- Retrieve updated complete invoice with nested items and return
  SELECT row_to_json(inv_rec)::JSONB INTO v_result
  FROM (
    SELECT
      i.*,
      COALESCE(json_agg(row_to_json(it.*)) FILTER (WHERE it.id IS NOT NULL), '[]'::json) AS items
    FROM public.invoices i
    LEFT JOIN public.invoice_items it ON it.invoice_id = i.id
    WHERE i.id = p_invoice_id
    GROUP BY i.id
  ) inv_rec;

  RETURN v_result;
END;
$$;
