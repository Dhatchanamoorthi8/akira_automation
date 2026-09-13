# AKIRA AUTOMATION — Phase 5 Production Audit & Migration Plan
## Follow-up Management + Staff/User Assignment + Supabase Mail Migration

**Audit Date**: September 13, 2026  
**Auditor**: Antigravity Engineering Pair  
**Status**: Production Ready Plan  

---

## 1. Executive Summary

Phase 5 transitions AKIRA AUTOMATION's CRM from a single-tier administrative dashboard into an enterprise **multi-role operations system**. In this phase:
1. An **Assigned Staff Member** role is introduced alongside the existing **Admin** role.
2. Staff members are strictly restricted via **PostgreSQL Row-Level Security (RLS)** and application guards to their assigned enquiries and follow-ups.
3. The legacy client-side email transmission mechanism (`formsubmit.co` browser AJAX) is completely decommissioned in favor of direct Supabase persistence as the primary source of truth, preparing the server-side boundary for Phase 8.
4. Comprehensive follow-up lifecycle workflows (Upcoming, Due Today, Overdue, Completed, Cancelled) and user management are implemented.

---

## 2. Existing Functionality Audit (Phases 1–4)

| Module | Current State | Reusability in Phase 5 |
| :--- | :--- | :--- |
| **Authentication** | Supabase Auth with session persistence, role validation in `AuthProvider.tsx`, `ProtectedRoute.tsx`. | **100% Reusable**. Needs extension to recognize `staff` role and redirect staff to `/staff`. |
| **Products & Storage** | Full CRUD, image upload to `product-images` bucket, specs editor. | **Admin-only**. Must be strictly guarded against staff access via RLS and route guards. |
| **Enquiries Pipeline** | Inbound RFQ table, status tabs, search, detail dossier, staff assignment dropdown. | **Reusable**. Currently accessible only to `is_admin()`. Must be extended with RLS for staff to view/update assigned enquiries. |
| **Follow-up Engine** | Basic schedule/complete/cancel service in `followupService.ts` and UI in `AdminFollowups.tsx`. | **Extensible**. Needs schema fields (`assigned_to`, `title`, `description`, `due_date`, `due_time`, `priority`, `completed_by`, `cancelled_at`), detail view `/admin/followups/:id`, and staff filtering. |
| **Activity Audit** | Immutable logging in `activity_logs`. | **Reusable**. Staff actions (complete/cancel) will write audit logs, but staff cannot browse full system activity logs. |
| **Contact Form** | `EnquiryForm.tsx` & `useEnquiryForm.ts` inserts into Supabase, but still invokes legacy `emailService.sendEnquiry()`. | **Refactor Required**. Remove browser `formsubmit.co` AJAX call. Guarantee Supabase is the sole source of truth. |

---

## 3. Database Schema Audit & Required Migrations

### 3.1 Current Schema Limitations

1. **`profiles.role` Constraint**:
   - Current constraint: `CHECK (role IN ('admin', 'manager', 'sales', 'editor', 'viewer'))`.
   - Missing: Explicit `'staff'` role required by Phase 5 specification.
2. **`followups` Table**:
   - Missing columns:
     - `assigned_to UUID REFERENCES public.profiles(id)`: Crucial for staff-specific assignment and RLS filtering.
     - `title TEXT`: Short descriptive summary of the follow-up task.
     - `description TEXT`: Detailed notes/instructions.
     - `due_date DATE`: Dedicated indexed date field for efficient `due_today` and `overdue` filtering.
     - `due_time TEXT`: Optional time string (e.g. `10:30 AM`).
     - `priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'))`: Operational urgency indicator.
     - `completed_by UUID REFERENCES public.profiles(id)`: Explicit audit identity for who fulfilled the task.
     - `cancelled_at TIMESTAMPTZ`: Timestamp when task was cancelled.
     - `cancellation_reason TEXT`: Documented reason for cancellation.
3. **RLS Policies**:
   - `public.enquiries`: Current policies allow `SELECT` and `UPDATE` only to `public.is_admin()`. Staff users receive empty results or permission errors.
   - `public.followups`: Current policies allow `SELECT`, `INSERT`, `UPDATE` only to `public.is_admin()`.
   - `public.products` & `public.product_images`: Correctly restricted to `public.is_admin()` for mutations and private reads.

### 3.2 Required Migration: `20260913000001_phase5_followup_staff.sql`

1. **Update `profiles.role`**: Expand CHECK constraint to allow `'staff'`.
2. **Alter `followups`**:
   - Add `assigned_to`, `title`, `description`, `due_date`, `due_time`, `priority`, `completed_by`, `cancelled_at`, `cancellation_reason`.
   - Add performance indexes: `idx_followups_assigned_to`, `idx_followups_due_date`, `idx_followups_priority`.
3. **Extend RLS Policies**:
   - **Enquiries**:
     - `SELECT`: `public.is_admin() OR assigned_to = auth.uid()`
     - `UPDATE`: `public.is_admin() OR (assigned_to = auth.uid())` (with check preventing staff from altering `assigned_to`).
   - **Followups**:
     - `SELECT`: `public.is_admin() OR assigned_to = auth.uid()`
     - `INSERT`: `public.is_admin() OR assigned_to = auth.uid()`
     - `UPDATE`: `public.is_admin() OR (assigned_to = auth.uid())` (preventing re-assignment by staff).
4. **Helper Functions**:
   - `public.is_staff()` helper for clarity.

---

## 4. Email Architecture Migration Audit (Parts 15 & 16)

### 4.1 Current Architecture
```
User clicks Submit -> useEnquiryForm -> enquiryService.createEnquiry (Supabase)
                                     -> emailService.sendEnquiry (FormSubmit AJAX API in browser)
```
- **Flaws**:
  - Exposes endpoint dependencies to client network failures.
  - FormSubmit runs in parallel with database writes, causing split-brain states if one fails.
  - Can trigger false alerts or console network warnings.

### 4.2 Target Architecture for Phase 5
```
User clicks Submit -> useEnquiryForm -> enquiryService.createEnquiry (Supabase public.enquiries)
                                     -> Show Confirmation ("Thank you. Your enquiry has been received.")
                                     -> [Server-side boundary prepared for Phase 8]
```
- **Changes in Phase 5**:
  - Remove `emailService.sendEnquiry` call from `useEnquiryForm.ts`.
  - In `emailService.ts`, mark client-side sending as deprecated/decommissioned.
  - Retain `generateMailtoFallback` as an offline user convenience link.
  - Document remaining Phase 8 server-side trigger (PostgreSQL Database Webhook / Edge Function).

---

## 5. Staff Access Control & Workspace Audit (Parts 3, 4, 14, 21)

### 5.1 Access Matrix

| Route / Capability | ADMIN | STAFF | Implementation |
| :--- | :---: | :---: | :--- |
| **`/admin/dashboard`** | YES | NO | Route guard redirects staff to `/staff` |
| **`/staff` (Staff Workspace)** | YES | YES | Default landing for staff after login |
| **`/admin/products`** | YES | NO | Route guard blocks + Supabase RLS blocks non-admin |
| **`/admin/users`** | YES | NO | Route guard blocks + Supabase RLS blocks non-admin |
| **`/admin/enquiries`** | ALL | NO (use `/staff`) | Admin views all; staff views assigned via workspace |
| **`/admin/enquiries/:id`** | ALL | ASSIGNED ONLY | ProtectedRoute + Supabase RLS `assigned_to = auth.uid()` |
| **`/admin/followups`** | ALL | NO (use `/staff`) | Admin views all; staff views assigned via workspace |
| **`/admin/followups/:id`** | ALL | ASSIGNED ONLY | ProtectedRoute + Supabase RLS `assigned_to = auth.uid()` |
| **`/admin/activity`** | YES | NO | Route guard blocks + Supabase RLS `is_admin()` |
| **Reassign Staff** | YES | NO | RLS `WITH CHECK` enforces admin only |

### 5.2 Staff Workspace Layout & Components

- **Route**: `/staff`
- **Design Philosophy**: Operational task queue tailored for high velocity on mobile, tablet, and desktop.
- **Widgets**:
  1. **Operational Summary Chips**:
     - *My New Enquiries*
     - *Due Today*
     - *Overdue*
     - *Upcoming*
     - *Completed*
  2. **My Inquiries Queue**: Cards for customer contact, industry, and quick call/email links.
  3. **My Follow-ups Queue**: Tabbed agenda for *Due Today*, *Overdue*, *Upcoming*, *Completed*.
  4. **Quick Task Actions**: One-click *Complete Follow-up* with outcome notes, and *Reschedule / Add Follow-up*.

---

## 6. Staff User Management Audit (Part 2 & Part 20)

### 6.1 Route: `/admin/users`

- **Purpose**: Allow Admins to manage system users and staff members.
- **Features**:
  - List profiles with columns: Full Name, Email, Role (`admin` / `staff`), Active Status, Created Date, Actions.
  - Search by Name and Email.
  - Filter by Role (`admin`, `staff`, `all`) and Status (`active`, `inactive`, `all`).
  - Toggle Active/Inactive status.
  - Change Role (`admin` &harr; `staff`).
  - **Create Staff User**:
    - Modal accepting: Full Name, Email, Temporary Password, Role (`staff` or `admin`).
    - Handled via `userService.createStaffUser()`.
    - Integrates with Supabase Edge Function `create-staff-user` if deployed, or provides secure administrative provision fallback.
    - Zero exposure of `SUPABASE_SERVICE_ROLE_KEY` in frontend or Vite environment!

---

## 7. Security Audit & Findings (Part 26)

| Secret / Parameter | Audit Result | Status |
| :--- | :--- | :---: |
| `service_role` in Vite `.env` / `src/` | Grepped across codebase: **0 matches found**. Only documentation mentions. | PASS |
| `SUPABASE_SERVICE_ROLE_KEY` | Grepped across codebase: **0 matches found**. | PASS |
| `SMTP_PASSWORD` | Grepped across codebase: **0 matches found**. | PASS |
| `EMAIL_API_KEY` | Grepped across codebase: **0 matches found**. | PASS |
| `PRIVATE_KEY` | Grepped across codebase: **0 matches found**. | PASS |
| Hardcoded credentials in source | Grepped across codebase: **0 matches found**. All test suites utilize dynamic environment variables (`E2E_ADMIN_EMAIL`, etc.). | PASS |

---

## 8. Test Execution Strategy (Vitest & Playwright)

1. **Vitest Unit & Service Tests**:
   - `src/services/followupService.test.ts`: Test `assigned_to`, due date, priority, complete with outcome, cancel with reason.
   - `src/services/userService.test.ts`: Test user listing, role update, active toggle, create staff user.
   - `src/services/enquiryService.test.ts`: Verify staff assignment and RLS filtering.
   - `src/hooks/useEnquiryForm.test.ts`: Verify Supabase is the sole submission target without client email dispatch.
   - `src/auth/ProtectedRoute.test.tsx`: Test admin access, staff pass-through to staff workspace, staff blocked from `/admin/products` and `/admin/users`.
2. **Playwright Multi-Viewport E2E Tests**:
   - **Admin E2E Flow**: Admin login &rarr; Users list &rarr; Create staff user &rarr; Assign enquiry &rarr; Create & assign follow-up &rarr; Complete follow-up.
   - **Staff E2E Flow**: Staff login &rarr; Redirect to `/staff` &rarr; Verify assigned enquiry visible &rarr; Complete assigned follow-up &rarr; Attempt unauthorized access to `/admin/products` and `/admin/users` (verify 403 or redirect).
   - **Contact Form Flow**: Public `/contact` &rarr; Submit &rarr; Verify enquiry recorded in database &rarr; Verify old client-side email is not invoked.
