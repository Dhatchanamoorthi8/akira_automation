-- ============================================================
-- AKIRA AUTOMATION — ENQUIRY STATUS TRANSITION VALIDATION TRIGGER
-- Migration: 20261009000003_enquiry_status_transition_validation.sql
-- Resolves Vulnerability: CRM-01 (Absence of Status State Machine Validation)
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_enquiry_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status is not changing, allow update unconditionally
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Administrators and managers possess governance rights to override or reopen
  IF public.is_admin() THEN
    -- Ensure closed status requires a lost reason if being transitioned to closed
    IF NEW.status = 'closed' AND (NEW.lost_reason IS NULL OR TRIM(NEW.lost_reason) = '') THEN
      RAISE EXCEPTION 'A lost reason is mandatory when closing an enquiry';
    END IF;
    RETURN NEW;
  END IF;

  -- 1. Legal state transition graph for operational staff
  IF OLD.status = 'new' AND NEW.status NOT IN ('contacted', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition: A new enquiry can only move to "contacted" or "closed", not "%"', NEW.status;

  ELSIF OLD.status = 'contacted' AND NEW.status NOT IN ('quotation_sent', 'follow_up', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition: A contacted enquiry can only move to "quotation_sent", "follow_up", or "closed", not "%"', NEW.status;

  ELSIF OLD.status = 'quotation_sent' AND NEW.status NOT IN ('follow_up', 'converted', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition: An enquiry with quotation sent can only move to "follow_up", "converted", or "closed", not "%"', NEW.status;

  ELSIF OLD.status = 'follow_up' AND NEW.status NOT IN ('quotation_sent', 'converted', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition: An enquiry in follow-up can only move to "quotation_sent", "converted", or "closed", not "%"', NEW.status;

  ELSIF OLD.status = 'converted' THEN
    RAISE EXCEPTION 'Invalid transition: A converted deal is finalized and cannot be modified by non-admin staff';

  ELSIF OLD.status = 'closed' THEN
    RAISE EXCEPTION 'Invalid transition: Reopening a closed enquiry requires administrator approval';
  END IF;

  -- 2. Mandatory Lost Reason enforcement for closed status
  IF NEW.status = 'closed' AND (NEW.lost_reason IS NULL OR TRIM(NEW.lost_reason) = '') THEN
    RAISE EXCEPTION 'A lost reason is mandatory when closing an enquiry';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enquiry_status_transition ON public.enquiries;
CREATE TRIGGER trg_enquiry_status_transition
  BEFORE UPDATE OF status ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_enquiry_status_transition();
