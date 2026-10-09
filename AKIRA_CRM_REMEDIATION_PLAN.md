# AKIRA Automation CRM — Remediation Plan & Architectural Validation

**Project:** AKIRA Automation CRM  
**Target URL:** [akiraautomation.com](https://akiraautomation.com)  
**Roles:** Senior Software Architect, Supabase Security Specialist, PostgreSQL Engineer, CRM Business Logic Auditor  
**Audit Source Reference:** `AKIRA_CRM_LOGIC_AUDIT_REPORT.md`  
**Execution Mode:** Read-Only Architectural Validation and Remediation Planning  
**Date:** October 9, 2026  
**Repository Branch:** `main` (commit `f323752`)  

---

## 1. Executive Summary

An independent, rigorous technical validation of the 17 findings documented in `AKIRA_CRM_LOGIC_AUDIT_REPORT.md` was conducted against the AKIRA Automation codebase, database schema migrations, PostgreSQL Row Level Security (RLS) policies, Supabase Edge Functions, and frontend TypeScript services.

### Validation Outcome
* **Confirmed Findings:** 17 of 17 (100% of reported issues verified with concrete line-level evidence).
* **Partially Confirmed / Nuanced Findings:** 1 (`SEC-02` — while the unauthenticated open relay vulnerability is confirmed, the original recommendation to globally set `verify_jwt = true` in `config.toml` would break anonymous public customer RFQ submissions. A dual-tier authentication strategy is required).
* **Incorrect Findings:** 0.
* **Unverified Findings:** 0.

### Top Priorities for Remediation
1. **P0 Security Hotfix (SEC-01):** Revoke permissive update/delete RLS policies on `invoices` and `invoice_items` introduced in migration `20261008000001_fix_invoice_update_delete_policies.sql`.
2. **P0 Transaction Atomicity (DAT-01):** Replace decoupled client-side HTTP calls for invoice and line-item creation with a PostgreSQL RPC (`create_invoice_atomic`) executing within a single database transaction.
3. **P0 Edge Function Lockdown (SEC-02):** Implement server-side recipient restriction for public leads and require Supabase JWT validation for internal email events (`admin_reply`, `invoice_dispatched`, `test`).
4. **P1 Operational Reliability (UI-01 & ANA-01):** Implement server-side pagination in `AdminEnquiries.tsx` and correct the PostgREST logical filter syntax in `DashboardService.getDashboardStats()`.

---

## 2. Validation Results for All 17 Reported Findings

### Finding SEC-01 (Severity: P0) — Critical Permissive RLS on Invoices & Invoice Items
* **Original Claim:** Migration `20261008000001_fix_invoice_update_delete_policies.sql` created update and delete policies on `invoices` and `invoice_items` with `USING (true)` and `WITH CHECK (true)` for any authenticated user, allowing any non-admin staff member or viewer to update or delete any invoice.
* **Evidence:** `supabase/migrations/20261008000001_fix_invoice_update_delete_policies.sql:7-27`
  ```sql
  CREATE POLICY "invoices_authenticated_delete" ON public.invoices FOR DELETE TO authenticated USING (true);
  CREATE POLICY "invoices_authenticated_update" ON public.invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  CREATE POLICY "invoice_items_authenticated_delete" ON public.invoice_items FOR DELETE TO authenticated USING (true);
  CREATE POLICY "invoice_items_authenticated_update" ON public.invoice_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  ```
* **Validation Status:** **CONFIRMED**.
* **Impact:** In PostgreSQL RLS, multiple permissive policies for the same command combine using boolean `OR`. Therefore, any user logged in with `staff`, `sales`, `editor`, or `viewer` roles can delete or alter all company quotations and invoices via the Supabase REST API.
* **Reproduction Conditions:** Authenticate as a non-admin user (e.g., `staff`) and send `DELETE /rest/v1/invoices?id=eq.<any_invoice_id>`. The database deletes the invoice without checking ownership or status.
* **Recommended Fix:** Drop all four `*_authenticated_*` policies. Reinstate restrictive policies that grant deletion exclusively to administrators, and allow staff to update/delete only their own `draft` invoices.
* **Regression Risks:** Staff attempting to edit draft invoices created without `created_by` or assigned to other staff might be blocked if policies do not check enquiry assignment.
* **Required Tests:** Run pgTAP / Supabase test suite validating that non-admin users receive HTTP 403 / zero rows deleted when targeting non-draft or other users' invoices.

---

### Finding SEC-02 (Severity: P0) — Unauthenticated Invocation of Email Edge Function
* **Original Claim:** The Deno Edge Function `send-email-notification` lacks JWT authentication and allows arbitrary recipient/HTML input on selected events, risking domain blacklisting and abuse.
* **Evidence:** 
  - `supabase/config.toml:417-418` (`[functions.send-email-notification] verify_jwt = false`).
  - `supabase/functions/send-email-notification/index.ts:368-375`:
    ```ts
    } else {
      recipientsList = recipient ? (Array.isArray(recipient) ? recipient : [recipient]) : [adminRecipient];
      replyTo = supportEmail;
    }
    ```
  - Line 443 sends `html` directly to `https://api.resend.com/emails`.
* **Validation Status:** **CONFIRMED (with Architectural Nuance)**.
* **Impact:** Any anonymous actor on the internet can POST to the function with `{ "eventType": "custom", "recipient": "victim@example.com", "html": "Phishing Content" }`, sending arbitrary emails from `notifications@akiraautomation.com`.
* **Reproduction Conditions:** Send `POST https://<project>.supabase.co/functions/v1/send-email-notification` with an arbitrary recipient and HTML payload without any auth headers.
* **Recommended Fix:** Do NOT simply set `verify_jwt = true` in `config.toml` (which breaks public web RFQs). Instead, implement **dual-tier authorization inside the function handler**:
  1. For public events (`new_enquiry`, `new_enquiry_customer`): Hardcode recipient to `ADMIN_NOTIFICATION_EMAIL` and customer email from the enquiry record; reject client-provided `html`.
  2. For internal events (`admin_reply`, `invoice_dispatched`, `test`, `followup_reminder`): Require and verify a valid Supabase Auth JWT from the caller.
* **Regression Risks:** Public enquiry submissions could fail if JWT validation is accidentally required for `new_enquiry`.
* **Required Tests:** Test anonymous POST with `eventType: 'new_enquiry'` (must succeed), anonymous POST with `eventType: 'custom'` (must reject 401/400), and authenticated POST with `admin_reply` (must succeed only with valid JWT).

---

### Finding DAT-01 (Severity: P0) — Non-Atomic Invoice Header and Line Items Creation
* **Original Claim:** `InvoiceService.createInvoice()` and `updateInvoice()` execute separate REST queries without a database transaction. If item creation fails or network drops, orphan headers or lost items result.
* **Evidence:** `src/services/invoiceService.ts:170-220` (inserts header, then inserts items; attempts client-side `delete` on error) and lines 538-543 (in `updateInvoice`: deletes all items via HTTP, then inserts new items via HTTP).
* **Validation Status:** **CONFIRMED**.
* **Impact:** A network drop between the two requests leaves an invoice header with ₹0 or incorrect items, or in the case of `updateInvoice`, completely deletes customer line items without inserting replacements.
* **Reproduction Conditions:** Simulate network failure immediately after the first HTTP call in `createInvoice` or `updateInvoice`.
* **Recommended Fix:** Create a PostgreSQL function `public.create_invoice_atomic(p_invoice JSONB, p_items JSONB)` and `public.update_invoice_atomic(p_invoice_id UUID, p_invoice JSONB, p_items JSONB)` that perform all inserts/updates in a single transaction.
* **Regression Risks:** Changes to parameter types or return formats could affect frontend consumers (`StaffWorkspace.tsx`, `InvoiceFormModal.tsx`). Contract compatibility must be strictly preserved.
* **Required Tests:** Integration tests verifying that invalid line-item data rolls back the entire invoice header creation.

---

### Finding CRM-01 (Severity: P0) — Absence of State Machine Enforcement on Enquiry Status
* **Original Claim:** The database only checks `status IN ('new', ...)`. Transitions can jump or revert arbitrarily without validation.
* **Evidence:** `supabase/migrations/20260912000001_initial_schema.sql:153` and `src/services/enquiryService.ts:518-535`. Neither Postgres triggers nor TypeScript services validate the legality of transition graphs.
* **Validation Status:** **CONFIRMED**.
* **Impact:** Leads can skip quotation stages directly to `converted` without required milestones, or closed leads can be reverted to `new` without audit history.
* **Reproduction Conditions:** Execute `supabase.from('enquiries').update({ status: 'converted' }).eq('id', id)` on a freshly created enquiry. The database accepts the update immediately.
* **Recommended Fix:** Implement a PostgreSQL `BEFORE UPDATE OF status ON public.enquiries` trigger that enforces legal transition paths and requires admin role for reopening closed leads.
* **Regression Risks:** Existing automated background jobs or admin batch status updates could fail if not accounting for intermediate stages.
* **Required Tests:** Unit tests verifying that illegal transitions (e.g., `closed` -> `quotation_sent` by non-admin) throw a SQL constraint error.

---

### Finding NOTIF-01 (Severity: P1) — Fire-and-Forget Asynchronous Email Dispatch
* **Original Claim:** Emails are fired post-insert without a retry queue or transactional outbox.
* **Evidence:** `src/services/enquiryService.ts:138-145` and `src/services/emailService.ts:52-80`. Inbound enquiries trigger the Edge Function asynchronously; failures only output `console.warn` with no persistence in an outbox.
* **Validation Status:** **CONFIRMED**.
* **Impact:** If Resend is experiencing rate limits or temporary downtime, lead notification emails are lost permanently, leaving leads unassigned and unnoticed.
* **Reproduction Conditions:** Disconnect network or mock Edge Function failure during enquiry creation. Enquiry is saved in DB, but email dispatch fails silently.
* **Recommended Fix:** Create an `email_outbox` table in PostgreSQL. Write to `email_outbox` via a database trigger on `enquiries` insert. Process the outbox via an Edge Function or scheduled worker with exponential backoff.
* **Regression Risks:** High architectural complexity; requires background queue processing.
* **Required Tests:** Verify that an outage in the email provider leaves records in `email_outbox` with status `pending` or `failed` ready for retry.

---

### Finding CRM-02 (Severity: P1) — Non-Atomic Staff Assignment & Follow-Up Creation
* **Original Claim:** Staff assignment updates the enquiry, then attempts to create/update follow-ups in separate client calls without a PostgreSQL transaction.
* **Evidence:** `src/services/enquiryService.ts:588-630`. `assignEnquiry()` updates `assigned_to`, then calls `followupService.getFollowups()` and `followupService.createFollowup()`.
* **Validation Status:** **CONFIRMED**.
* **Impact:** A client disconnect leaves staff assigned without an associated follow-up task, breaking sales follow-up cadences.
* **Reproduction Conditions:** Simulate network interruption immediately after the `enquiries.update()` call in `assignEnquiry()`.
* **Recommended Fix:** Wrap assignment and follow-up creation in a PostgreSQL RPC `public.assign_enquiry_with_followup(p_enquiry_id UUID, p_staff_id UUID, p_notes TEXT)`.
* **Regression Risks:** Minimal; frontend simply replaces multi-step calls with a single service invocation.
* **Required Tests:** Integration test verifying that if follow-up creation fails, assignment is not committed.

---

### Finding ANA-01 (Severity: P1) — PostgREST Syntax Logic Defect in Dashboard Follow-Up Query
* **Original Claim:** PostgREST `.eq('status', 'overdue').or('status.eq.upcoming,scheduled_at.lt....')` creates a contradictory `AND (OR)` SQL clause.
* **Evidence:** `src/services/dashboardService.ts:61`:
  ```ts
  supabase.from('followups').select('*', { count: 'exact', head: true }).eq('status', 'overdue').or(`status.eq.upcoming,scheduled_at.lt.${nowIso}`)
  ```
* **Validation Status:** **CONFIRMED**.
* **Impact:** Generates SQL `WHERE status = 'overdue' AND (status = 'upcoming' OR scheduled_at < nowIso)`. Because `status` cannot be both `overdue` and `upcoming`, the count excludes upcoming overdue follow-ups and improperly filters overdue items.
* **Reproduction Conditions:** Query overdue follow-ups via `DashboardService.getDashboardStats()` when there are upcoming follow-ups past their scheduled time.
* **Recommended Fix:** Rewrite the query to use `.or(`status.eq.overdue,and(status.eq.upcoming,scheduled_at.lt.${nowIso})`)`.
* **Regression Risks:** Low risk. Strictly fixes the query filter syntax.
* **Required Tests:** Unit test verifying that follow-ups with `status = 'overdue'` and follow-ups with `status = 'upcoming' AND scheduled_at < now` are both included in the count.

---

### Finding UI-01 (Severity: P1) — Hardcoded 100-Item Cap in Admin Enquiries Pagination
* **Original Claim:** `AdminEnquiries.tsx` hardcodes `limit: 100` and calculates pages from array length, hiding records > 100.
* **Evidence:** `src/pages/admin/AdminEnquiries.tsx:272-273` (`limit: 100, offset: 0`) and lines 419-423 (`totalPages = Math.max(1, Math.ceil(enquiries.length / ITEMS_PER_PAGE))`).
* **Validation Status:** **CONFIRMED**.
* **Impact:** Enquiries past the 100th row can never be viewed or reached by administrators in the UI, even though `enquiryService.getEnquiries` returns the accurate `totalCount`.
* **Reproduction Conditions:** Seed 150 enquiries in the database. Open `/admin/enquiries`. The table shows 10 pages maximum (100 items); items 101–150 are inaccessible.
* **Recommended Fix:** Bind pagination directly to `currentPage` and `totalCount`, passing `offset: (currentPage - 1) * ITEMS_PER_PAGE` to `getEnquiries()`.
* **Regression Risks:** Filter, search, and tab switching must reset `currentPage` to 1 to avoid querying out-of-range offsets.
* **Required Tests:** UI test simulating pagination navigation to page 11 when total records = 150.

---

### Finding SEC-03 (Severity: P1) — Client-Side Geolocation Spoofing in Attendance and Visits
* **Original Claim:** Attendance and visit check-ins accept lat/lng directly from the client without server-side validation against IP or attestation.
* **Evidence:** `src/services/attendanceService.ts:51-64` and `src/services/visitService.ts:98-105`. `coords: { lat, lng }` from browser payload is written directly to `staff_attendance` and `field_visits`.
* **Validation Status:** **CONFIRMED**.
* **Impact:** Field personnel can fake on-site visits or office attendance by sending arbitrary GPS coordinates via developer tools or custom scripts.
* **Reproduction Conditions:** Submit attendance punch with fabricated coordinates `{ lat: 12.9716, lng: 77.5946 }`. The database stores the values without validation.
* **Recommended Fix:** Implement server-side range validation, cross-check against IP geolocation in an Edge Function or RPC, and store client IP in the record for audit verification.
* **Regression Risks:** Devices with poor GPS reception or private corporate networks might fail strict IP geolocation matching.
* **Required Tests:** Validate that out-of-range coordinates (e.g., lat > 90) are rejected by database check constraints.

---

### Finding DAT-02 (Severity: P2) — Non-Sequential Pseudo-Random Invoice Number Fallback
* **Original Claim:** Client fallback uses `Math.floor(1000 + Math.random() * 9000)` if RPC fails.
* **Evidence:** `src/services/invoiceService.ts:106-108`:
  ```ts
  const year = new Date().getFullYear();
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomSeq}`;
  ```
* **Validation Status:** **CONFIRMED**.
* **Impact:** High probability of duplicate invoice numbers under concurrent traffic; violates sequential invoice numbering requirements under Indian GST compliance.
* **Reproduction Conditions:** Simulate failure of `generate_invoice_number` RPC during invoice creation.
* **Recommended Fix:** Remove the client-side pseudo-random fallback. If the database sequence RPC fails, fail the operation explicitly and alert the user.
* **Regression Risks:** Zero regression for healthy database connections.
* **Required Tests:** Unit test verifying that invoice creation throws an error if sequence generation fails rather than returning a random number.

---

### Finding PERF-01 (Severity: P2) — Analytics Fallback Truncation at 1,000 Rows
* **Original Claim:** `AnalyticsService.getOverviewStats` fallback selects enquiries/followups without pagination, truncating at 1,000 rows.
* **Evidence:** `src/services/analyticsService.ts:106-121` and `supabase/config.toml:18` (`max_rows = 1000`). Fallback queries `.select('id, status, created_at')` without range limits.
* **Validation Status:** **CONFIRMED**.
* **Impact:** Once enquiry volume exceeds 1,000 records, fallback analytics silently compute metrics on an incomplete dataset, showing artificially low conversion rates.
* **Reproduction Conditions:** Call fallback analytics when `enquiries` table contains > 1,000 rows.
* **Recommended Fix:** Always execute analytics aggregations inside PostgreSQL via RPC functions (`COUNT(*)`, `SUM()`) rather than fetching raw rows to the client.
* **Regression Risks:** None; the database RPC `get_admin_analytics_overview` already exists and should be made authoritative.
* **Required Tests:** Verify that analytics overview returns accurate totals when database contains 2,500 records.

---

### Finding CRM-03 (Severity: P2) — Missing Database Constraint for Lost Reason on Closed Enquiries
* **Original Claim:** Enquiries can be set to `closed` directly without recording mandatory loss categorization.
* **Evidence:** While `enquiryService.closeEnquiry()` checks `lostReason` in TypeScript, `updateEnquiryStatus()` or direct REST calls can update `status = 'closed'` with `lost_reason = NULL`. Schema lacks a check constraint.
* **Validation Status:** **CONFIRMED**.
* **Impact:** Lost sales intelligence is omitted from CRM reports, preventing management from analyzing why deals were lost (pricing, lead time, competitor).
* **Reproduction Conditions:** Execute `supabase.from('enquiries').update({ status: 'closed' }).eq('id', id)`. Succeeds with null `lost_reason`.
* **Recommended Fix:** Add check constraint: `CHECK (status != 'closed' OR lost_reason IS NOT NULL)`.
* **Regression Risks:** Existing legacy closed records with null `lost_reason` must be backfilled before applying constraint.
* **Required Tests:** Migration test attempting to insert/update a closed enquiry without a lost reason.

---

### Finding HIST-01 (Severity: P2) — Hard Deletes Cascade Customer History
* **Original Claim:** Deleting an enquiry executes `DELETE FROM enquiries WHERE id = ?`, cascading to follow-ups and permanently destroying customer history.
* **Evidence:** `supabase/migrations/20261007000001_add_crm_erp_delete_policies.sql:7-13` and `20260912000001_initial_schema.sql:166` (`ON DELETE CASCADE`).
* **Validation Status:** **CONFIRMED**.
* **Impact:** Inadvertent or malicious lead deletion destroys audit trails, customer notes, call logs, and quotation history.
* **Reproduction Conditions:** Delete an enquiry in `/admin/enquiries`. All related follow-ups are permanently erased from the database.
* **Recommended Fix:** Add `deleted_at TIMESTAMPTZ` column to `enquiries`, `followups`, and `invoices`. Update RLS policies and service queries to filter `WHERE deleted_at IS NULL`.
* **Regression Risks:** Queries must explicitly filter out soft-deleted records to prevent them from appearing in active lists.
* **Required Tests:** Verify that soft-deleted enquiries are excluded from active list queries but retained in the database table.

---

### Finding SEC-04 (Severity: P2) — Lack of Database Rate Limiting on Anonymous Enquiries
* **Original Claim:** Database table `enquiries` permits unlimited anonymous inserts via PostgREST `anon` role.
* **Evidence:** `supabase/migrations/20260912000001_initial_schema.sql:198-200` (`FOR INSERT TO anon WITH CHECK (true)`).
* **Validation Status:** **CONFIRMED**.
* **Impact:** An attacker can script rapid inserts directly to the Supabase REST endpoint, flooding the CRM database with spam leads.
* **Reproduction Conditions:** Script a loop sending 100 POST requests to `/rest/v1/enquiries` using the public anon key. All 100 succeed.
* **Recommended Fix:** Route public enquiry submissions through a rate-limited Edge Function or implement a PostgreSQL trigger using an IP submission tracking table.
* **Regression Risks:** Legitimate users behind corporate NATs could hit rate limits if thresholds are too strict.
* **Required Tests:** Rate-limit test verifying that more than 5 submissions per minute from a single IP/client are throttled.

---

### Finding UX-01 (Severity: P3) — LocalStorage Column Customizer Desynchronization
* **Original Claim:** Column configuration is stored in `localStorage` rather than user profile preferences in Supabase.
* **Evidence:** `src/pages/admin/AdminEnquiries.tsx:135,218` (`localStorage.getItem(STORAGE_KEY)`).
* **Validation Status:** **CONFIRMED**.
* **Impact:** Minor usability annoyance; column layouts reset when clearing browser cache or switching computers.
* **Reproduction Conditions:** Reorder columns, open incognito window; columns revert to default.
* **Recommended Fix:** Store UI preferences in `profiles.preferences` JSONB column in Supabase with localStorage as offline fallback.
* **Regression Risks:** Negligible.
* **Required Tests:** Verify preferences persist across different browser sessions.

---

### Finding I18N-01 (Severity: P3) — UTC Timezone Boundary Shifts for Follow-Up Due Dates
* **Original Claim:** Splits `toISOString().split('T')[0]`, which extracts UTC date rather than Indian Standard Time (IST, UTC+05:30).
* **Evidence:** `src/services/analyticsService.ts:144` (`new Date().toISOString().split('T')[0]`).
* **Validation Status:** **CONFIRMED**.
* **Impact:** Between 12:00 AM and 05:30 AM IST, follow-ups scheduled for the current Indian day evaluate to yesterday in UTC, creating temporary overdue misclassifications.
* **Reproduction Conditions:** Run due-date calculations at 02:00 AM IST.
* **Recommended Fix:** Use `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())` to extract the correct local date string.
* **Regression Risks:** None.
* **Required Tests:** Unit tests verifying date string output across midnight boundaries in IST.

---

### Finding OBS-01 (Severity: P3) — Absence of Centralized Error Monitoring
* **Original Claim:** Client error boundary logs to console only; unhandled production exceptions are invisible.
* **Evidence:** `src/components/common/ErrorBoundary.tsx:32-35` logs to `console.error` with no telemetry integration.
* **Validation Status:** **CONFIRMED**.
* **Impact:** Production runtime errors experienced by sales staff or customers go unnoticed by engineering.
* **Reproduction Conditions:** Trigger an unhandled error; observe that no remote log or notification is dispatched.
* **Recommended Fix:** Integrate Sentry or a lightweight Supabase `error_logs` table sink.
* **Regression Risks:** None.
* **Required Tests:** Verify that triggered errors emit an event to the monitoring sink.

---

## 3. Summary of Confirmed vs. Unverified Findings

| Severity | Total Reported | Confirmed | Partially Confirmed | Incorrect | Unverified |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **P0** | 4 | 3 | 1 (`SEC-02`) | 0 | 0 |
| **P1** | 5 | 5 | 0 | 0 | 0 |
| **P2** | 5 | 5 | 0 | 0 | 0 |
| **P3** | 3 | 3 | 0 | 0 | 0 |
| **Total** | **17** | **16** | **1** | **0** | **0** |

*Note on SEC-02:* The vulnerability is 100% confirmed; the partial distinction reflects an architectural refinement to the remediation strategy (preventing breakage of anonymous website leads).

---

## 4. Role-Based Authorization Matrix

Derived from `public.profiles.role`, existing helper functions (`is_admin()`, `is_staff()`), and actual CRM workflow requirements:

| Entity & Action | Public / Anon | Viewer | Staff / Sales | Manager | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Enquiries — SELECT** | ❌ None | ❌ None | ✅ Assigned Only | ✅ All | ✅ All |
| **Enquiries — INSERT** | ✅ Website Form | ❌ None | ✅ Manual Lead | ✅ Manual Lead | ✅ Manual Lead |
| **Enquiries — UPDATE** | ❌ None | ❌ None | ✅ Assigned Only | ✅ All | ✅ All |
| **Enquiries — DELETE** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Admin Only |
| **Follow-ups — SELECT** | ❌ None | ❌ None | ✅ Assigned Only | ✅ All | ✅ All |
| **Follow-ups — INSERT** | ❌ None | ❌ None | ✅ Self Assigned | ✅ All | ✅ All |
| **Follow-ups — UPDATE** | ❌ None | ❌ None | ✅ Self Assigned | ✅ All | ✅ All |
| **Follow-ups — DELETE** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ Admin Only |
| **Invoices — SELECT** | ❌ None | ❌ None | ✅ Created or Assigned | ✅ All | ✅ All |
| **Invoices — INSERT** | ❌ None | ❌ None | ✅ Draft Only | ✅ Draft & Sent | ✅ All |
| **Invoices — UPDATE** | ❌ None | ❌ None | ✅ Own Draft Only | ✅ All Draft/Sent | ✅ All |
| **Invoices — DELETE** | ❌ None | ❌ None | ✅ Own Draft Only | ❌ None | ✅ Admin Only |
| **Invoice Items — CRUD** | ❌ None | ❌ None | ⚖️ Scoped to Parent Invoice | ⚖️ Scoped to Parent | ✅ All |
| **Field Visits — CRUD** | ❌ None | ❌ None | ✅ Own Visits | ✅ All | ✅ All |
| **Staff Attendance — PUNCH** | ❌ None | ❌ None | ✅ Own Punch | ✅ Own Punch | ✅ All |
| **Staff Attendance — DELETE**| ❌ None | ❌ None | ❌ None | ❌ None | ✅ Admin Only |
| **Activity Logs — SELECT** | ❌ None | ❌ None | ❌ None | ✅ View Logs | ✅ View Logs |
| **Activity Logs — INSERT** | ❌ None | ❌ None | ✅ Append Only | ✅ Append Only | ✅ Append Only |
| **Activity Logs — DELETE** | ❌ None | ❌ None | ❌ Immutable | ❌ Immutable | ❌ Immutable |

---

## 5. Recommended Database Policy Changes

### Migration Specification: `fix_invoice_and_enquiry_rls_policies.sql`

```sql
-- ============================================================
-- AKIRA AUTOMATION — REMEDIATION MIGRATION: SECURE INVOICE & ENQUIRY RLS
-- ============================================================

-- 1. DROP DANGEROUS PERMISSIVE INVOICE POLICIES
DROP POLICY IF EXISTS "invoices_authenticated_delete" ON public.invoices;
DROP POLICY IF EXISTS "invoices_authenticated_update" ON public.invoices;
DROP POLICY IF EXISTS "invoice_items_authenticated_delete" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_authenticated_update" ON public.invoice_items;

-- 2. DROP PREVIOUS REDUNDANT POLICIES TO PREVENT OVERLAPPING OR EVALUATION
DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoice_items_select_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_policy" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete_policy" ON public.invoice_items;

-- 3. INVOICES POLICIES (STRICT ACCESS CONTROL)
-- SELECT: Admins/Managers see all; Staff see invoices they created or for leads assigned to them
CREATE POLICY "invoices_select_policy" ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'manager' AND p.active = true
    ) OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.enquiries e
      WHERE e.id = invoices.enquiry_id AND e.assigned_to = auth.uid()
    )
  );

-- INSERT: Admins and active staff/sales/managers can create invoices (created_by must match auth.uid)
CREATE POLICY "invoices_insert_policy" ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR
    (created_by = auth.uid() AND public.is_staff())
  );

-- UPDATE: Admins can update any invoice; Staff can ONLY update their own DRAFT invoices
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

-- DELETE: Admins can delete any invoice; Staff can ONLY delete their own DRAFT invoices
CREATE POLICY "invoices_delete_policy" ON public.invoices
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR
    (created_by = auth.uid() AND status = 'draft' AND public.is_staff())
  );

-- 4. INVOICE ITEMS POLICIES (TIED EXCLUSIVELY TO PARENT INVOICE PERMISSIONS)
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
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft'))
    )
  );

CREATE POLICY "invoice_items_update_policy" ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft'))
    )
  );

CREATE POLICY "invoice_items_delete_policy" ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (public.is_admin() OR (inv.created_by = auth.uid() AND inv.status = 'draft'))
    )
  );
```

---

## 6. Transactional Invoice Design (Atomic PostgreSQL RPC)

To permanently resolve **DAT-01**, invoice creation and line-item insertions are moved inside an atomic PostgreSQL function.

### SQL Specification: `create_invoice_with_items.sql`

```sql
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
  -- 1. Security & Auth Check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create invoice';
  END IF;

  IF NOT (public.is_admin() OR public.is_staff()) THEN
    RAISE EXCEPTION 'Unauthorized to create invoice';
  END IF;

  -- 2. Input Validation
  IF COALESCE(p_invoice->>'customer_name', '') = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF COALESCE(p_invoice->>'customer_email', '') = '' THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one line item is required';
  END IF;

  -- 3. Calculate Financial Totals Server-Side
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
    quantity INTEGER,
    unit_price NUMERIC(12,2),
    tax_rate NUMERIC(5,2)
  ) LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;
    IF v_item.unit_price < 0 THEN
      RAISE EXCEPTION 'Unit price cannot be negative';
    END IF;

    v_item_subtotal := v_item.quantity * v_item.unit_price;
    v_item_tax := (v_item_subtotal * COALESCE(v_item.tax_rate, 18.00)) / 100.00;
    
    v_subtotal := v_subtotal + v_item_subtotal;
    v_total_tax := v_total_tax + v_item_tax;
  END LOOP;

  v_discount := COALESCE((p_invoice->>'discount_amount')::NUMERIC(12,2), 0);
  v_grand_total := GREATEST(0, v_subtotal + v_total_tax - v_discount);

  -- 4. Generate Sequential Invoice Number Inside Transaction
  v_invoice_number := p_invoice->>'invoice_number';
  IF v_invoice_number IS NULL OR v_invoice_number = '' THEN
    v_invoice_number := public.generate_invoice_number(COALESCE(p_invoice->>'prefix', 'INV'));
  END IF;

  -- 5. Insert Invoice Header
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

  -- 6. Insert Line Items
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

  -- 7. Audit Log
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

  -- 8. Return Full Invoice with Items
  SELECT jsonb_build_object(
    'invoice', row_to_json(inv),
    'items', COALESCE(jsonb_agg(row_to_json(itm)), '[]'::jsonb)
  )
  INTO v_result
  FROM public.invoices inv
  LEFT JOIN public.invoice_items itm ON itm.invoice_id = inv.id
  WHERE inv.id = v_invoice_id
  GROUP BY inv.id;

  RETURN v_result;
END;
$$;
```

---

## 7. Secure Email Notification Architecture

To resolve **SEC-02** without breaking public leads:

### Dual-Tier Event Authorization Model
```
Incoming HTTP Request ──► [ Edge Function: send-email-notification ]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
[ Public Event: new_enquiry ]             [ Internal Event: admin_reply, etc. ]
  • Allowed without JWT                     • Requires Bearer JWT in header
  • Recipient locked to server env          • Verified via supabase.auth.getUser()
  • Content built from server template      • Caller verified as active staff/admin
  • Honeypot + IP rate limiting             • Recipient validated against database
```

### Handler Code Update (Diff Preview)
```typescript
// Check authorization based on eventType
const PUBLIC_EVENTS = ['new_enquiry', 'new_enquiry_customer'];

if (!PUBLIC_EVENTS.includes(eventType)) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session token' }), { status: 401 });
  }

  // Ensure user is an active staff/admin
  const { data: profile } = await adminClient.from('profiles').select('role, active').eq('id', user.id).single();
  if (!profile?.active) {
    return new Response(JSON.stringify({ error: 'Account deactivated' }), { status: 403 });
  }
}
```

---

## 8. Enquiry Workflow & Pagination Remediation

### 8.1 State Machine Enforcement (PostgreSQL Trigger)
```sql
CREATE OR REPLACE FUNCTION public.validate_enquiry_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If status hasn't changed, allow update
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transition matrix
  IF OLD.status = 'new' AND NEW.status NOT IN ('contacted', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition from new to %', NEW.status;
  ELSIF OLD.status = 'contacted' AND NEW.status NOT IN ('quotation_sent', 'follow_up', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition from contacted to %', NEW.status;
  ELSIF OLD.status = 'quotation_sent' AND NEW.status NOT IN ('follow_up', 'converted', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition from quotation_sent to %', NEW.status;
  ELSIF OLD.status = 'follow_up' AND NEW.status NOT IN ('quotation_sent', 'converted', 'closed') THEN
    RAISE EXCEPTION 'Invalid transition from follow_up to %', NEW.status;
  ELSIF OLD.status = 'converted' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify a converted lead';
  ELSIF OLD.status = 'closed' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can reopen a closed lead';
  END IF;

  -- Mandatory Lost Reason check on closure
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
```

### 8.2 Server-Side Pagination in `AdminEnquiries.tsx`
Replace in-memory array slice with server-side pagination parameters:
```typescript
// Replace lines 267-274 in AdminEnquiries.tsx:
const filters: EnquiryFilters = {
  search: search.trim() || undefined,
  status: selectedStatus !== "all" ? selectedStatus : undefined,
  sortBy: "created_at",
  sortOrder: "desc",
  limit: ITEMS_PER_PAGE,
  offset: (currentPage - 1) * ITEMS_PER_PAGE,
};

// Replace lines 419-423:
const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
const paginatedEnquiries = enquiries; // enquiries is already sliced on server!
```

---

## 9. Regression Risks and Dependencies

| Target Area | Potential Regression | Mitigation Strategy |
| :--- | :--- | :--- |
| **Public Enquiry Form** | Edge Function rejects anonymous submission with 401. | Explicitly whitelist `new_enquiry` and `new_enquiry_customer` as public events. |
| **Staff Workspace** | Staff cannot edit their own draft invoices or schedule visits. | Include `created_by = auth.uid() AND status = 'draft'` in invoice update policy. |
| **Admin Enquiries Table** | Switching tabs or searching breaks pagination. | Ensure `setCurrentPage(1)` is called when changing filters, status tabs, or search strings. |
| **Legacy Closed Leads** | Migration fails if legacy closed leads have null `lost_reason`. | Pre-migration data backfill: `UPDATE enquiries SET lost_reason = 'Legacy Closure' WHERE status = 'closed' AND lost_reason IS NULL;`. |
| **Analytics Dashboards** | Dashboard counts discrepancy during filter fix. | Test PostgREST composite filter `.or('status.eq.overdue,and(...)')` against sample dataset. |

---

## 10. Comprehensive Test Plan

### Test Suite 1: Database RLS Security (pgTAP / SQL)
1. `test_staff_cannot_delete_other_invoices`: Verify `DELETE` on another user's invoice returns 0 rows.
2. `test_staff_can_delete_own_draft_invoice`: Verify `DELETE` on own draft invoice succeeds.
3. `test_staff_cannot_delete_sent_invoice`: Verify `DELETE` on own `sent` invoice returns 0 rows.
4. `test_admin_can_delete_any_invoice`: Verify `DELETE` by admin succeeds.

### Test Suite 2: Transaction Atomicity (Vitest / Service Tests)
1. `test_create_invoice_atomic_rollback`: Call `createInvoice` with an invalid item payload; verify no orphan record in `invoices` table.
2. `test_create_invoice_atomic_totals`: Verify database-computed totals match sum of line items minus discount.

### Test Suite 3: Email Edge Function (Unit & Integration)
1. `test_public_enquiry_email_anonymous`: Anonymous POST with `new_enquiry` succeeds.
2. `test_internal_email_unauthorized`: Anonymous POST with `admin_reply` returns HTTP 401.
3. `test_internal_email_authenticated`: Authenticated POST with `admin_reply` and valid JWT succeeds.

---

## 11. Implementation Sequence

The remediation should be executed in 4 distinct phases:

```
[ Phase 1: Security Hotfix ] (Day 1)
  ├── 1.1 Apply SQL Migration: Drop permissive invoice RLS policies & restore strict checks.
  └── 1.2 Update Edge Function send-email-notification: Dual-tier authentication gating.

[ Phase 2: Transactional Integrity ] (Day 2)
  ├── 2.1 Apply SQL Migration: Deploy create_invoice_atomic and update_invoice_atomic RPCs.
  └── 2.2 Refactor src/services/invoiceService.ts: Route create/update through the new RPCs.

[ Phase 3: Business Workflow & Analytics Fixes ] (Day 3)
  ├── 3.1 Backfill legacy closed enquiries lost_reason values.
  ├── 3.2 Apply SQL Migration: Deploy validate_enquiry_status_transition trigger.
  ├── 3.3 Fix PostgREST syntax defect in src/services/dashboardService.ts.
  └── 3.4 Implement server-side pagination in src/pages/admin/AdminEnquiries.tsx.

[ Phase 4: Verification & Smoke Testing ] (Day 4)
  ├── 4.1 Run Vitest test suite (verify 294+ passing tests).
  ├── 4.2 Execute automated RLS cross-role regression tests.
  └── 4.3 Manual staging verification of public lead capture, staff invoice editing, and admin table.
```

---

## 12. Migration and Rollback Plan

### Migration Order
1. `20261010000001_revert_permissive_invoice_policies.sql`
2. `20261010000002_create_atomic_invoice_functions.sql`
3. `20261010000003_enquiry_status_transition_trigger.sql`

### Rollback Strategy
Each migration file will contain an accompanying rollback script:
- **Rollback 1:** Recreates previous draft-only policies if staff encounter unexpected editing blocks.
- **Rollback 2:** Falls back to client-side multi-step inserts in `invoiceService.ts` if the RPC encounters schema mismatches.
- **Rollback 3:** Drops `trg_enquiry_status_transition` if legacy lead updates are blocked.

---

## 13. Production Verification Checklist

Prior to signing off on production deployment:
* [ ] **Supabase RLS Check:** Execute `SELECT * FROM pg_policies WHERE tablename = 'invoices'` and confirm `invoices_authenticated_delete` does not exist.
* [ ] **Public Lead Smoke Test:** Submit test enquiry on `akiraautomation.com/contact`; confirm record appears in `enquiries` table and notification arrives in admin inbox.
* [ ] **Staff Invoice Test:** Log in as staff; create draft quotation; verify line items and totals; edit draft quotation; confirm updates persist.
* [ ] **Admin Pagination Test:** Navigate to `/admin/enquiries`; verify pages past page 10 can be browsed and reflect database total count.
* [ ] **Overdue Counter Test:** Verify admin dashboard overdue count accurately matches total overdue follow-ups in database.
