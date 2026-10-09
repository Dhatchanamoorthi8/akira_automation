# AKIRA CRM & Application Business Logic Audit Report

**Application:** AKIRA Automation CRM  
**Target URL:** [akiraautomation.com](https://akiraautomation.com)  
**Auditor Roles:** Senior Software Architect, CRM Business Analyst, Application Security Auditor  
**Audit Type:** Static Analysis, Architecture Discovery, Workflow Verification, and Non-Destructive Security Audit (Read-Only)  
**Date of Audit:** October 9, 2026  
**Repository Branch:** `main` (commit `f323752`)  

---

## Section 1: Executive Summary

### 1.1 Overall CRM Implementation Health
The AKIRA Automation CRM codebase represents a modern, responsive single-page application built on React 19, Vite, Tailwind CSS v4, HeroUI v3, and Supabase (PostgreSQL with Row Level Security, Auth, and Edge Functions). 

The CRM covers substantial business domains required by precision metrology operations, including:
1. Public RFQ / Enquiry capture with honeypot bot mitigation.
2. Administrative lead management, dossier views, search, and staff assignment.
3. Field staff workspace with GPS-stamped attendance clock-in, site visit tracking, follow-ups, and quotation/invoice generation.
4. Transactional email notification routing via a Deno Supabase Edge Function integrating the Resend API.
5. In-database analytical procedures (RPCs) alongside client-side analytical services.

However, the architecture exhibits **critical structural vulnerabilities in Row Level Security (RLS)**, **gaps in database transaction atomicity**, **unconstrained status state machines**, **fragile client-side pagination caps**, and **unprotected asynchronous email failure handling**.

### 1.2 Most Important Findings
1. **Critical RLS Permissiveness on Invoices (P0 — SEC-01):** Migration `20261008000001_fix_invoice_update_delete_policies.sql` created update and delete policies on `invoices` and `invoice_items` with `USING (true)` and `WITH CHECK (true)` for any authenticated user. Because PostgreSQL evaluates multiple permissive policies with logical OR, any logged-in staff member or non-admin user can mutate or permanently delete any company invoice, bypassing previous draft/admin constraints.
2. **Missing Transactional Boundaries for Invoices & Line Items (P0 — DAT-01):** `InvoiceService.createInvoice()` executes two decoupled HTTP calls (`invoices.insert()`, then `invoice_items.insert()`). Failure during line item creation triggers a best-effort client-side `delete()`. Network disconnects between these calls orphan invoice headers without line items, corrupting financial records.
3. **Absence of State Machine Validation on Enquiry Lifecycles (P0 — CRM-01):** Database check constraints only enforce `status IN ('new', 'contacted', 'quotation_sent', 'follow_up', 'converted', 'closed')`. No validation exists to enforce legal progression; any client can revert a converted/closed enquiry to `new` or jump from `new` to `converted` without required milestones or audit rationale.
4. **Unauthenticated Invocation Risk on Email Notification Edge Function (P0 — SEC-02):** The Deno Edge Function `send-email-notification` checks a honeypot field and in-memory rate limiting, but does not validate Supabase JWT signatures or service-role headers for caller authentication, permitting unauthorized external triggering of selected events.
5. **Client-Side Hardcoded 100-Item Cap in Admin Enquiries (P1 — UI-01):** `AdminEnquiries.tsx` fetches with `limit: 100, offset: 0` and calculates pagination strictly from the returned array length (`enquiries.length / 10`), causing any enquiries beyond the 100th to become completely invisible to administrators.

### 1.3 Key Business Risks
* **Regulatory & Financial Exposure:** Permissive RLS and lack of atomic invoice creation threaten GST-compliant billing integrity.
* **Lost Leads & Sales Continuity:** Lack of an asynchronous email retry queue means failed notifications result in leads sitting unassigned without staff awareness.
* **Data Discrepancy & Blind Spots:** Overdue follow-up counters in dashboard analytics suffer from a PostgREST logical filter syntax defect, misrepresenting actual overdue workload.

---

## Section 2: Architecture Map

### 2.1 High-Level Architecture Diagram
```
[ Customer / Browser ]
        │  (Public Form / RFQ)
        ▼
[ React 19 Frontend (Vite) ] ──(Auth JWT)──► [ Supabase Auth (GoTrue) ]
        │                                             │
        ├─────────────────────────────────────────────┤
        │ REST / PostgREST (HTTPS)                    │
        ▼                                             ▼
[ PostgreSQL Database ] ◄──[ Row Level Security (RLS) Policies ]
  ├── profiles (roles: admin, staff, sales, etc.)
  ├── enquiries (customer RFQ dossier)
  ├── followups (scheduled meetings / calls)
  ├── invoices & invoice_items (quotations & tax invoices)
  ├── field_visits (site check-in / check-out with GPS)
  ├── staff_attendance (daily punch-in / punch-out)
  └── activity_logs (audit trail)
        │
        ▼ (Client-triggered Post-Insert Async Call)
[ Supabase Edge Functions (Deno) ]
  └── send-email-notification ──► [ Resend API ] ──► [ Customer & Staff Inboxes ]
```

### 2.2 Component & Data Layer Breakdown
* **Frontend Routing:** React Router v7 (`src/App.tsx`). Public routes (`/`, `/products`, `/contact`, etc.) and protected portals wrapped in `PortalAuthShell` and `ProtectedRoute` (`/admin/*`, `/staff/*`).
* **State & Data Access:** Direct Supabase client calls via modularized service classes (`enquiryService`, `followupService`, `invoiceService`, `visitService`, `attendanceService`, `analyticsService`, `emailService`).
* **Database & Access Control:** PostgreSQL managed by Supabase migrations. Authorization enforced through PostgreSQL Row Level Security (RLS) backed by helper functions `public.is_admin()` and `public.get_auth_user_role()`.
* **Transactional Email Service:** Supabase Edge Function (`supabase/functions/send-email-notification/index.ts`) written in TypeScript for Deno, interacting with Resend.

---

## Section 3: Existing Feature Inventory

| Feature Area | Source File(s) | Verification Status | Operational Notes |
| :--- | :--- | :--- | :--- |
| **Public Lead Capture Form** | `src/components/common/EnquiryForm.tsx` | Implemented & Verified | Includes honeypot, phone/email validation, duplicate submission debounce. |
| **Admin Lead Management** | `src/pages/admin/AdminEnquiries.tsx` | Implemented (Defective Pagination) | Filter by status, search, staff assignment, dossier drawer. Hard-capped at 100 records. |
| **Lead Dossier & Detail** | `src/pages/admin/AdminEnquiryDetail.tsx` | Implemented & Verified | Displays timeline, follow-up schedule, email history, customer meta. |
| **Follow-up Management** | `src/services/followupService.ts` | Implemented & Verified | CRUD for calls, meetings, visits; marks overdue, completed, cancelled. |
| **Staff Workspace** | `src/pages/staff/StaffWorkspace.tsx` | Implemented & Verified | Mobile-friendly tabbed interface for staff assigned leads, visits, and clock-in. |
| **Field Visit Tracking** | `src/services/visitService.ts` | Implemented & Verified | Geolocation stamp on check-in/out; links to customer enquiry. |
| **Staff Attendance Punch** | `src/services/attendanceService.ts` | Implemented & Verified | Daily attendance with GPS coordinates, reverse address lookup. |
| **Quotation & Invoicing** | `src/services/invoiceService.ts` | Implemented (Critical RLS Gap) | Generates sequential numbers, GST tax calculations, line item management. |
| **Audit Activity Logging** | `src/services/activityService.ts` | Implemented & Verified | Append-only audit trail for entity mutations. |
| **Email Message Threads** | `src/services/emailMessageService.ts` | Implemented & Verified | Tracks email message logs associated with enquiries. |
| **Admin Analytics RPC** | `20260913000002_phase6_phase7_activity_analytics.sql` | Implemented & Verified | Postgres function `get_admin_analytics_overview` computes conversion & workload. |
| **Email Edge Function** | `supabase/functions/send-email-notification/index.ts`| Implemented & Verified | Handles `new_enquiry`, `staff_assigned`, `admin_reply` via Resend API. |

---

## Section 4: End-to-End Workflow Analysis

### 4.1 Customer Enquiry Lifecycle
1. **Submission:**
   - Customer submits form on website (`src/components/common/EnquiryForm.tsx`).
   - Validates client-side: email format, required fields, honeypot `website` field.
   - Saves record directly to PostgreSQL `enquiries` table using Supabase `anon` role.
   - *Failure Path:* If database write fails, an error banner is displayed with a `mailto:` fallback button.
2. **Notification Dispatch:**
   - Upon successful database insert, frontend fires asynchronous call to `emailService.notifyNewEnquiry()`.
   - *Failure Path:* If the Edge function or Resend fails, an error is logged to `console.warn`. **No retry or transactional outbox exists**. The enquiry is saved, but admins receive no notification.
3. **Staff Assignment:**
   - Admin opens `AdminEnquiries.tsx` or `AdminEnquiryDetail.tsx`, chooses a staff member.
   - `enquiryService.assignEnquiry()` updates `assigned_to` and triggers email to the assigned staff member.
   - Automatically schedules a default follow-up if none exists.
   - *Failure Path:* Multi-step client calls are decoupled. If the follow-up insert fails, the enquiry remains assigned without a follow-up.
4. **Follow-up & Quotation:**
   - Staff accesses lead in `/staff` workspace.
   - Staff records call notes, site visits, or creates a draft quotation via `InvoiceFormModal.tsx`.
   - Status updates to `contacted`, `quotation_sent`, or `follow_up`.
5. **Closure / Conversion:**
   - Staff/Admin converts lead to deal or marks as closed.
   - If converted, updates status to `converted`, records deal value, and logs audit trail.
   - If closed, modal captures lost reason, though database check constraints do not require a reason.

---

## Section 5: Business Logic Gap Matrix

| ID | Module | Expected Behavior | Actual Behavior | Evidence | Gap | Business Impact | Severity | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | Invoices | Invoices and line items can only be updated/deleted by admins or creators in draft status. | ANY authenticated user can update or delete ANY invoice and item. | `20261008000001_fix_invoice_update_delete_policies.sql:7-27` | Permissive RLS `USING (true)` overrides restrictive checks. | Unauthorized tampering or deletion of customer quotations and tax invoices. | **P0** | Revoke `invoices_authenticated_delete` and restore strict admin or creator draft checks. |
| **GAP-02** | Invoices | Invoice and line items must be created atomically in a single transaction. | Created via 2 sequential REST requests; rolls back via client-side delete. | `src/services/invoiceService.ts:170-220` | Lack of atomic DB transaction. | Network failure produces orphan invoices without line items. | **P0** | Implement PostgreSQL RPC `create_invoice_with_items` running inside `BEGIN ... COMMIT`. |
| **GAP-03** | Enquiries | Status progression must follow defined state machine transitions. | Any status can be set to any other status at any time without restriction. | `supabase/migrations/20260912000001_initial_schema.sql:153` | Unconstrained status column. | Leads can jump straight to converted or revert from closed to new without audit trail. | **P0** | Add transition trigger or database constraint enforcing legal state transitions. |
| **GAP-04** | Emails | Email notifications must be delivered reliably or queued for retry upon provider outage. | Fired post-insert fire-and-forget; failure is dropped silently with console warning. | `src/services/enquiryService.ts:138-145`, `src/services/emailService.ts:52-80` | Absence of transactional outbox pattern. | Missed lead notifications when Resend API experiences rate limits or downtime. | **P1** | Create `email_outbox` table with Postgres trigger or cron-based worker retry mechanism. |
| **GAP-05** | Admin UI | Pagination must allow viewing all enquiries across entire database history. | Client queries `limit: 100` and calculates pages from array slice. | `src/pages/admin/AdminEnquiries.tsx:272,419` | In-memory pagination capped at 100 rows. | Any enquiry past row 100 cannot be browsed by administrators. | **P1** | Implement server-side pagination passing `offset = (page - 1) * limit` to `enquiryService`. |
| **GAP-06** | Dashboard | Overdue follow-up metric accurately reflects overdue count. | PostgREST `.eq().or()` chaining creates contradictory `AND (OR)` SQL clause. | `src/services/dashboardService.ts:61` | PostgREST syntax logic defect. | Admin dashboard reports inaccurate or 0 overdue follow-ups. | **P1** | Rewrite filter to `.or('status.eq.overdue,and(status.eq.upcoming,scheduled_at.lt.' + nowIso + ')')`. |
| **GAP-07** | Attendance | Geolocation stamp must be verified against server or device attestation. | Accepts arbitrary client lat/lng without server-side validation. | `src/services/attendanceService.ts:51-64` | Client coordinates accepted verbatim. | Staff can simulate attendance coordinates using browser dev tools or scripts. | **P1** | Add IP geolocation cross-check or geo-fencing validation on backend RPC. |
| **GAP-08** | Invoices | Sequential invoice numbers must never collide under concurrent creation. | Client fallback uses `Math.random() * 9000` if RPC fails. | `src/services/invoiceService.ts:106-108` | Non-cryptographic client fallback. | High probability of invoice number duplication under network hiccups. | **P2** | Throw error on RPC failure rather than falling back to pseudo-random numbers. |
| **GAP-09** | Enquiries | Lost enquiries must enforce a mandatory loss reason. | Enquiries can be updated to `closed` with null `lost_reason`. | `src/services/enquiryService.ts:310-330` | Missing constraint for closed state. | Lost sales intelligence is omitted from analytics and CRM reports. | **P2** | Add DB constraint: `CHECK (status != 'closed' OR lost_reason IS NOT NULL)`. |
| **GAP-10** | CRM Deletion | CRM entities should use soft deletion to preserve historical customer touchpoints. | Entities are permanently removed with SQL `DELETE`. | `20261007000001_add_crm_erp_delete_policies.sql:7-13` | Hard-delete implementation. | Permanent destruction of lead history and customer relationship audit trail. | **P2** | Add `deleted_at TIMESTAMPTZ` column and filter active records via default views. |

---

## Section 6: Security Findings

### SEC-01: Critical Permissive RLS on Invoices & Invoice Items (Severity: P0)
* **Affected Component:** `supabase/migrations/20261008000001_fix_invoice_update_delete_policies.sql:7-27`
* **Evidence:**
  ```sql
  CREATE POLICY "invoices_authenticated_delete" ON public.invoices
    FOR DELETE TO authenticated USING (true);
  CREATE POLICY "invoices_authenticated_update" ON public.invoices
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  ```
* **Attack Scenario:** In PostgreSQL, multiple RLS policies for the same action are combined with `OR`. Any user authenticated as `staff`, `sales`, or `viewer` can send an HTTP DELETE request via Supabase REST API targeting any invoice ID in the system. The operation succeeds unconditionally.
* **Impact:** Loss of financial records, tampering with customer quotation totals, and unauthorized document deletion.
* **Remediation:** Drop both policies immediately. Restrict deletion exclusively to users satisfying `public.is_admin()`, and update policies to allow only administrators or the original creator on `draft` invoices.

### SEC-02: Public Unauthenticated Email Edge Function Invocation (Severity: P0)
* **Affected Component:** `supabase/functions/send-email-notification/index.ts:31-48`
* **Evidence:** The Edge Function parses incoming JSON bodies without checking `req.headers.get('Authorization')` for a valid Supabase JWT or service key.
* **Attack Scenario:** An automated script discovers the Supabase Edge Function endpoint URL and invokes it repeatedly with payload `{ "eventType": "customer_confirmation", "recipient": "victim@example.com", ... }`.
* **Impact:** Depletion of Resend API credit quotas, blacklisting of sending domain (`akiraautomation.com`), and potential spam abuse.
* **Remediation:** Enforce bearer token validation inside the Edge Function or configure `verify_jwt: true` in `supabase/config.toml` for the function.

### SEC-03: Attendance Geolocation Spoofing (Severity: P1)
* **Affected Component:** `src/services/attendanceService.ts:51-64`, `src/services/visitService.ts:98-105`
* **Evidence:** `clockIn()` receives `coords: { lat: number; lng: number }` from client-side navigator geolocation and writes directly to PostgreSQL.
* **Attack Scenario:** A field staff member uses browser developer tools or a modified client to submit high-precision coordinates of a client site while working remotely.
* **Impact:** Fraudulent attendance records and falsified client visit logs.
* **Remediation:** Validate client coordinates against external network IP geolocation or implement location signature verification via mobile app SDKs.

### SEC-04: Lack of Database-Level Rate Limiting on Anonymous Enquiries (Severity: P2)
* **Affected Component:** `supabase/migrations/20260912000001_initial_schema.sql:198-200`
* **Evidence:** Policy `"Enquiries can be created by anyone"` allows unrestricted `INSERT TO anon WITH CHECK (true)`.
* **Attack Scenario:** An attacker scripts rapid `POST` requests to `/rest/v1/enquiries` using the public Supabase anon key, flooding the database with tens of thousands of spam records.
* **Impact:** Database storage exhaustion, degradation of admin search queries, and polluted CRM analytics.
* **Remediation:** Implement a PostgreSQL rate-limiting function or route public submissions through a Cloudflare Turnstile / Supabase Edge Function wrapper.

---

## Section 7: Database and Performance Findings

### 7.1 Referential Integrity and Cascading
* **Migration `20261008000004_protect_staff_history_on_delete.sql`:** Correctly replaced `ON DELETE CASCADE` with `ON DELETE RESTRICT` on `field_visits.staff_id` and `staff_attendance.staff_id`, successfully protecting historical audit trails when staff profiles are deactivated.
* **Missing Soft Deletes:** `enquiries` table utilizes hard deletes. If an enquiry is deleted, associated follow-ups cascade (`ON DELETE CASCADE`), erasing all customer history permanently.

### 7.2 Query Performance & Indexes
* **Existing Indexes:**
  - `idx_enquiries_status`, `idx_enquiries_created_at`, `idx_enquiries_assigned_to`
  - `idx_followups_status`, `idx_followups_scheduled_at`, `idx_followups_enquiry_id`
  - `idx_invoices_enquiry_id`, `idx_invoices_created_by`
* **Missing Composite Indexes:**
  - `followups(status, scheduled_at)`: Critical for fast retrieval of overdue follow-ups.
  - `enquiries(status, created_at DESC)`: Heavily utilized in admin and staff filtered views.

### 7.3 Unbounded Client-Side Fallback Queries
In `src/services/analyticsService.ts:106-121`:
When the PostgreSQL RPC `get_admin_analytics_overview` fails, the service falls back to direct client-side queries:
```ts
const { data: enquiries } = await supabase.from('enquiries').select('id, status, created_at');
```
PostgREST enforces an implicit max-row limit of 1,000 records. Once the system accumulates more than 1,000 enquiries, fallback analytics will calculate percentages from an incomplete subset, causing silent data skew.

---

## Section 8: Email and Follow-Up Findings

### 8.1 Transactional Outbox Absence
* Currently, emails are sent post-commit via `emailService.notifyNewEnquiry()`. If the browser loses connectivity, the page is reloaded, or Resend returns HTTP 429/500, the message is permanently dropped.
* **Recommendation:** Introduce an `email_outbox` table:
  ```sql
  CREATE TABLE email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
  A Postgres trigger on `enquiries` inserts a record into `email_outbox`, which an Edge Function or pg_cron worker processes with exponential backoff.

### 8.2 Timezone Handling on Follow-Up Due Dates
* In `src/services/analyticsService.ts:144` and `src/services/followupService.ts`, date comparisons use `new Date().toISOString().split('T')[0]`, which extracts the **UTC** date rather than Indian Standard Time (IST, UTC+05:30).
* **Impact:** Between 12:00 AM and 05:30 AM IST, follow-ups scheduled for the current Indian day are incorrectly evaluated as scheduled for tomorrow, leading to delayed overdue flags.

---

## Section 9: Dashboard and Analytics Findings

### 9.1 Overdue Follow-Up Counting Defect
In `src/services/dashboardService.ts:61`:
```ts
supabase
  .from('followups')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'overdue')
  .or(`status.eq.upcoming,scheduled_at.lt.${nowIso}`)
```
PostgREST interprets this as:
$$\text{status} = \text{'overdue'} \land (\text{status} = \text{'upcoming'} \lor \text{scheduled\_at} < \text{nowIso})$$
Because a single row cannot have `status = 'overdue'` and `status = 'upcoming'`, the first branch of the OR is impossible, and any overdue follow-up whose `scheduled_at` is null or in the future is excluded. This results in undercounting overdue follow-ups.

### 9.2 Inconsistent Metric Calculation Between Admin & Staff
* Admin analytics uses RPC `get_admin_analytics_overview`, which checks `status = 'overdue'` or `(status = 'upcoming' AND due_date < v_today)`.
* Staff workspace calculates overdue follow-ups in React memory (`StaffWorkspace.tsx`). Differences in timezone evaluation create discrepancies between the counts seen by managers and field staff.

---

## Section 10: Test Coverage & Verification

### 10.1 Automated Test Execution Results
The local automated test suite was executed via Vitest (read-only execution):
* **Total Test Suites Executed:** 57 files
* **Total Tests Passed:** 294 tests
* **Total Tests Failed:** 0
* **Execution Duration:** 80.08 seconds

### 10.2 Critical Test Gaps
While existing unit tests validate isolated component rendering and mock services, the following high-priority integration tests are completely missing:
1. **Live RLS Cross-Role Enforcement:** No automated test currently verifies that a user with role `staff` is rejected when attempting to execute `DELETE /rest/v1/invoices`.
2. **Multi-Step Assignment Integrity:** No test validates rollback behavior when `assignEnquiry` fails during follow-up creation.
3. **Pagination Boundary Tests:** No test validates that admin lead queries can retrieve rows 101 through 200.
4. **Email Outbox Idempotency:** No test verifies duplicate email prevention under double form submissions.

---

## Section 11: Prioritized Remediation Roadmap

### Priority P0 — Critical Security & Integrity (Immediate Action Required)
1. **Fix Invoices RLS Vulnerability (SEC-01)**
   - *Problem:* Any authenticated user can modify or delete any invoice.
   - *Proposed Solution:* Drop `invoices_authenticated_delete` and `invoices_authenticated_update`. Enforce admin-only delete and creator-only draft updates.
   - *Affected Module:* Supabase migrations (`supabase/migrations/`).
   - *Complexity:* Small.
2. **Enforce Atomic Invoice Creation (DAT-01)**
   - *Problem:* Decoupled header and items insertion produces orphan headers.
   - *Proposed Solution:* Create PostgreSQL RPC `create_invoice_atomic(header, items)`.
   - *Affected Module:* `src/services/invoiceService.ts` and new SQL migration.
   - *Complexity:* Medium.
3. **Secure Email Edge Function (SEC-02)**
   - *Problem:* Public endpoint callable without auth tokens.
   - *Proposed Solution:* Enforce JWT validation header check or shared secret token.
   - *Affected Module:* `supabase/functions/send-email-notification/index.ts`.
   - *Complexity:* Small.

### Priority P1 — Core Workflow & Operational Reliability
4. **Implement Server-Side Pagination in Admin Enquiries (GAP-05)**
   - *Problem:* Hard cap of 100 records blocks access to older enquiries.
   - *Proposed Solution:* Pass dynamic `offset` and `limit` to `getEnquiries()`, bind pagination controls to total count.
   - *Affected Module:* `src/pages/admin/AdminEnquiries.tsx`.
   - *Complexity:* Medium.
5. **Fix PostgREST Dashboard Overdue Filter (GAP-06)**
   - *Problem:* PostgREST `.eq().or()` syntax defect corrupts overdue counts.
   - *Proposed Solution:* Restructure filter query to use correct PostgREST composite logic.
   - *Affected Module:* `src/services/dashboardService.ts`.
   - *Complexity:* Small.
6. **Enforce State Machine Constraints on Enquiries (GAP-03)**
   - *Problem:* Illegal status jumps are permitted at database level.
   - *Proposed Solution:* Add trigger function `validate_enquiry_status_transition()`.
   - *Affected Module:* Database migration.
   - *Complexity:* Medium.

### Priority P2 — Data Integrity & Auditability
7. **Transactional Outbox for Email Notifications (GAP-04)**
   - *Problem:* Dropped notifications during email provider downtime.
   - *Proposed Solution:* Add `email_outbox` table and asynchronous processor.
   - *Affected Module:* Database & Edge functions.
   - *Complexity:* Large.
8. **Enforce Soft Deletion on CRM Entities (GAP-10)**
   - *Problem:* Hard deletion permanently erases customer engagement history.
   - *Proposed Solution:* Add `deleted_at` column to `enquiries`, `followups`, `invoices`.
   - *Affected Module:* Database schema & all service queries.
   - *Complexity:* Medium.
9. **Mandatory Lost Reason Validation (GAP-09)**
   - *Problem:* Closed leads lack lost reason categorization.
   - *Proposed Solution:* Add database check constraint and UI form enforcement.
   - *Affected Module:* Database schema & `CloseLeadModal.tsx`.
   - *Complexity:* Small.

### Priority P3 — Enhancements & Observability
10. **Centralized Error Monitoring (OBS-01)**
    - *Problem:* Client-side errors only log to local browser console.
    - *Proposed Solution:* Integrate Sentry or equivalent error observability tool.
    - *Affected Module:* `src/components/common/ErrorBoundary.tsx`.
    - *Complexity:* Small.
11. **Timezone Normalization (I18N-01)**
    - *Problem:* UTC date splits cause date-boundary shifts in IST.
    - *Proposed Solution:* Use `@internationalized/date` or `date-fns-tz` with `Asia/Kolkata`.
    - *Affected Module:* `src/utils/date.ts`, analytics & followup services.
    - *Complexity:* Small.

---

## Section 12: Production Readiness Assessment

| Evaluation Dimension | Confidence Level | Architectural Assessment |
| :--- | :--- | :--- |
| **Security & RLS** | **Low (4/10)** | Critical vulnerability in invoice RLS; unprotected email Edge function. |
| **Business Logic** | **Moderate (6/10)** | Core lead/staff workflows work, but lack status transition constraints. |
| **Data Integrity** | **Moderate (6/10)** | Invoices and assignments lack database transaction atomicity. |
| **Notifications** | **Low (4/10)** | Fire-and-forget architecture with no delivery retry or transactional outbox. |
| **Observability** | **Low (3/10)** | Relies on browser console; no centralized error or telemetry ingestion. |
| **Testing** | **High (8/10)** | Excellent unit test suite (294 tests passing), but lacks live RLS integration tests. |
| **Maintainability** | **High (8/10)** | Clean TypeScript code, clear service boundaries, well-structured HeroUI design. |
| **Scalability** | **Moderate (6/10)** | Capped client pagination and fallback queries truncate at 1,000 rows. |

---

## Section 13: Final Recommendations

### 1. Mandatory Bug Fixes (Before Production Release)
- Drop permissive invoice update/delete policies in PostgreSQL (`SEC-01`).
- Fix PostgREST syntax logic defect in `dashboardService.ts` (`GAP-06`).
- Remove client-side 100-item cap and implement true server-side pagination in `AdminEnquiries.tsx` (`GAP-05`).

### 2. Missing Business Requirements
- Implement PostgreSQL RPC for atomic invoice creation with line items (`GAP-02`).
- Enforce legal state transitions on customer enquiries (`GAP-03`).
- Mandate lost reason categorization when closing leads (`GAP-09`).

### 3. Security Improvements
- Require authentication / secret validation on `send-email-notification` Edge function (`SEC-02`).
- Add database-level rate limiting or Turnstile captcha on anonymous enquiry submissions (`SEC-04`).

### 4. Optional / Architectural Enhancements
- Transition to soft deletes (`deleted_at`) for all primary CRM entities (`GAP-10`).
- Implement transactional email outbox table for resilient asynchronous delivery (`GAP-04`).
- Normalize all CRM schedule timestamps to Indian Standard Time (`Asia/Kolkata`).
