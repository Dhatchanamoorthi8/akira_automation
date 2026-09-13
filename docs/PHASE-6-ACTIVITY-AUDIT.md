# AKIRA AUTOMATION — PHASE 6: HISTORICAL ACTIVITY AUDIT

## 1. Executive Summary

- **Document**: Historical Activity Architecture Audit
- **Objective**: Audit existing activity recording, evaluate schema completeness, identify missing business events, review Row-Level Security (RLS) policies, and define the migration and implementation strategy for Phase 6 (Historical Activity) and Phase 7 (Dashboard Analytics).
- **Status**: Audit Completed. Ready for implementation.

---

## 2. Existing Activity Schema & Infrastructure

### 2.1 Database Table: `public.activity_logs`
The table was initialized in Phase 1 (`supabase/migrations/20260912000001_initial_schema.sql`):
```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 Existing Indexes
- `idx_activity_logs_entity`: `(entity_type, entity_id)`
- `idx_activity_logs_created_at`: `(created_at)`

### 2.3 Existing RLS Policies
- `activity_logs_admin_select`: `USING (public.is_admin())` — Only administrators can read activity logs.
- `activity_logs_admin_insert`: `WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL)` — Authenticated users can insert logs.
- Append-Only: No `UPDATE` or `DELETE` policies exist, preserving audit trail immutability.

---

## 3. Current Event Inventory vs. Missing Events

An audit of all service-layer write operations reveals the current state of activity logging:

| Domain / Entity | Action / Trigger | Current Status | Standardized Action Code | Metadata Captured |
| :--- | :--- | :---: | :--- | :--- |
| **Authentication** | User signs in | **MISSING** | `AUTH_LOGIN` | `{ email, role }` |
| **Authentication** | User signs out | **MISSING** | `AUTH_LOGOUT` | `{ userId }` |
| **Enquiry** | Inbound RFQ submitted via website | **MISSING** | `ENQUIRY_CREATED` | `{ name, company, email, product }` |
| **Enquiry** | Admin updates status | Recorded as `STATUS_UPDATED` | `ENQUIRY_STATUS_CHANGED` | `{ from, to }` |
| **Enquiry** | Admin assigns/reassigns staff | Recorded as `ASSIGNED` | `ENQUIRY_ASSIGNED` / `ENQUIRY_REASSIGNED` | `{ from_staff, to_staff }` |
| **Enquiry** | Admin edits contact/details | **MISSING** | `ENQUIRY_UPDATED` | `{ fields }` |
| **Follow-up** | Follow-up created / scheduled | Recorded as `FOLLOWUP_CREATED` | `FOLLOWUP_CREATED` | `{ enquiry_id, due_date, type, priority }` |
| **Follow-up** | Follow-up updated / rescheduled | Recorded as `FOLLOWUP_RESCHEDULED` | `FOLLOWUP_RESCHEDULED` / `FOLLOWUP_UPDATED`| `{ old_date, new_date, reason }` |
| **Follow-up** | Follow-up assigned / reassigned | **MISSING** | `FOLLOWUP_ASSIGNED` / `FOLLOWUP_REASSIGNED`| `{ from_staff, to_staff }` |
| **Follow-up** | Follow-up completed with notes | Recorded as `FOLLOWUP_COMPLETED` | `FOLLOWUP_COMPLETED` | `{ outcome, enquiry_id }` |
| **Follow-up** | Follow-up cancelled | Recorded as `FOLLOWUP_CANCELLED` | `FOLLOWUP_CANCELLED` | `{ reason }` |
| **Product** | Product created | Recorded as `PRODUCT_CREATED` | `PRODUCT_CREATED` | `{ name, category, slug }` |
| **Product** | Product details updated | Recorded as `PRODUCT_UPDATED` | `PRODUCT_UPDATED` | `{ changed_fields }` |
| **Product** | Product deleted | Recorded as `PRODUCT_DELETED` | `PRODUCT_DELETED` | `{ name, slug }` |
| **Product** | Active/featured toggled | Recorded as `PRODUCT_ACTIVATED` | `PRODUCT_STATUS_CHANGED` | `{ active, featured }` |
| **Product Image** | Image uploaded / registered | Recorded as `PRODUCT_IMAGE_UPLOADED`| `PRODUCT_IMAGE_UPLOADED` | `{ product_id, image_url }` |
| **Product Image** | Image deleted | Recorded as `PRODUCT_IMAGE_DELETED` | `PRODUCT_IMAGE_DELETED` | `{ product_id, image_id }` |
| **Product Image** | Primary image changed | Recorded as `PRODUCT_IMAGE_PRIMARY_SET`| `PRODUCT_IMAGE_REPLACED` | `{ product_id, image_id }` |
| **Product Image** | Image order changed | Recorded as `PRODUCT_IMAGE_REORDERED`| `PRODUCT_IMAGE_REORDERED` | `{ product_id }` |
| **User** | Staff account created | Recorded as `USER_CREATED` | `USER_CREATED` | `{ email, role }` |
| **User** | Role changed | Recorded as `USER_ROLE_CHANGED` | `USER_ROLE_CHANGED` | `{ from, to }` |
| **User** | Status toggled (active/inactive) | Recorded as `USER_ACTIVATED` / `USER_DEACTIVATED` | `USER_DEACTIVATED` / `USER_ACTIVATED` | `{ active }` |

---

## 4. RLS & Staff Data Boundary Analysis

### 4.1 Vulnerability Identified in Existing Policy
The existing SELECT policy on `activity_logs`:
```sql
CREATE POLICY "activity_logs_admin_select" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());
```
While this correctly blocks staff from viewing global system activity, it completely prevents staff from viewing historical events for their *own assigned enquiries and follow-ups*.

### 4.2 Required Phase 6 RLS Policy
The SELECT policy will be updated so that:
1. **Administrators** (`public.is_admin()`) have unrestricted access to all activity logs.
2. **Staff Members** (`public.is_staff()`) are strictly restricted to:
   - Activities where they were the actor (`performed_by = auth.uid()`), OR
   - Activities belonging to an enquiry assigned to them (`entity_type = 'enquiry' AND EXISTS (SELECT 1 FROM enquiries e WHERE e.id = activity_logs.entity_id AND e.assigned_to = auth.uid())`), OR
   - Activities belonging to a follow-up assigned to them (`entity_type = 'followup' AND EXISTS (SELECT 1 FROM followups f WHERE f.id = activity_logs.entity_id AND f.assigned_to = auth.uid())`).
3. **Staff members are strictly blocked** by RLS from querying:
   - Administrative profiles/user events (`entity_type IN ('profile', 'user')`)
   - Product catalog modifications (`entity_type IN ('product', 'product_image')`)
   - Authentication security logs (`entity_type = 'auth'`)
   - Enquiries/follow-ups assigned to other staff members.

---

## 5. Required Migration (`supabase/migrations/20260913000002_phase6_phase7_activity_analytics.sql`)

1. **Schema Extension**:
   - Add `metadata JSONB` column to `activity_logs` for flexible structured metadata.
2. **Performance Indexes**:
   - `idx_activity_logs_action ON public.activity_logs(action)`
   - `idx_activity_logs_performed_by ON public.activity_logs(performed_by)`
   - `idx_activity_logs_entity_created ON public.activity_logs(entity_type, entity_id, created_at DESC)`
3. **RLS Policy Replacement**:
   - Cleanly drop `activity_logs_admin_select` and install `activity_logs_select_policy` with staff scoping.
4. **Analytics Aggregation RPCs (Phase 7)**:
   - `get_admin_analytics_overview(start_date timestamptz, end_date timestamptz)`
   - `get_staff_workload_analytics(start_date timestamptz, end_date timestamptz)`

---

## 6. Reusable Services & Component Plan

1. **`src/services/activityService.ts`**:
   - Enhance with canonical action constants (`ActivityAction`, `EntityType`).
   - Add multi-parameter filtering: `search`, `action`, `entityType`, `performedBy`, `dateFrom`, `dateTo`, `limit`, `offset`.
   - Add `logActivity` / `recordActivity` with standard metadata formatting.
2. **`src/components/admin/ActivityTimeline.tsx`**:
   - Reusable, compact, accessible timeline component displaying actor, action badge, relative/absolute timestamp, description, and structured metadata diffs.
   - Used inside:
     - Enquiry dossier (`/admin/enquiries/:id`)
     - Follow-up dossier (`/admin/followups/:id`)
     - Global activity page (`/admin/activity`)
     - Admin dashboard (`/admin/dashboard`)
3. **`src/pages/admin/AdminActivity.tsx`**:
   - Upgrade with search bar, action filter, entity filter, user filter, date-range picker, and pagination controls.
4. **`src/services/analyticsService.ts`**:
   - Dedicated analytics service executing real PostgreSQL queries and aggregations.
   - Methods: `getOverviewStats(dateRange)`, `getEnquiryTrend(dateRange)`, `getEnquiryStatusSummary(dateRange)`, `getFollowupStats(dateRange)`, `getStaffPerformance(dateRange)`.
   - Resilience: Full client-side query fallbacks if RPCs are not yet applied on remote database.
5. **`src/pages/admin/AdminDashboard.tsx`**:
   - Upgrade with date-range selector (Today, Last 7 Days, Last 30 Days [Default], Last 90 Days, This Year, Custom).
   - Render 8 KPI cards with conversion and completion rates.
   - Enquiry trend visualization, status distribution, follow-up performance, and Staff Workload table.

---

## 7. Security & Sensitivity Guardrails

- **Zero Credential Exposure**: Never log passwords, reset tokens, session tokens, service-role keys, or API secrets.
- **Fail-Safe Logging**: Activity logging must never fail or block the underlying business transaction.
- **Server Boundary**: Client-side requests respect RLS; staff members cannot view unauthorized logs even if calling the Supabase client directly.
