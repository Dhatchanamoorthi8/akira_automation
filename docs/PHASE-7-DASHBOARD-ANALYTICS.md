# AKIRA AUTOMATION — PHASE 7: DASHBOARD ANALYTICS & EXECUTIVE INTELLIGENCE

## 1. Executive Summary

- **Document**: Executive Intelligence & Dashboard Analytics Architecture and Implementation Report
- **Phase**: Phase 7 (Dashboard Analytics)
- **Status**: Completed & Verified End-to-End
- **Stack**: React 19, TypeScript, Tailwind CSS, PostgreSQL, Supabase, Lucide Icons, Playwright

---

## 2. Architecture & Design Principles

### 2.1 Zero Fake Metrics Guarantee
All metrics, percentages, trends, and team matrices rendered across `/admin/dashboard` are derived directly from live PostgreSQL database records. Zero hardcoded mock numbers or dummy graphs are present in production code.

### 2.2 Dual-Layer Metric Computation (RPC + Resilient Fallback)
1. **Primary Layer (PostgreSQL RPC Functions)**:
   - `public.get_admin_analytics_overview(p_start_date, p_end_date)`: Computes 15 consolidated executive metrics in a single atomic database query execution.
   - `public.get_staff_workload_analytics(p_start_date, p_end_date)`: Computes per-staff assignment distribution and task completion rates.
   - Enforces `SECURITY DEFINER` and checks `public.is_admin()`.
2. **Fallback Layer (Client-Side Supabase Direct Queries)**:
   - When RPC functions are unavailable or schema cache is refreshing, `analyticsService` automatically executes resilient direct table queries with identical aggregation logic.
   - Automatically handles optional columns gracefully without interrupting dashboard presentation.

### 2.3 Dynamic Time Windowing
The console supports rapid executive filtering across 6 date presets:
- **Today (`today`)**: Beginning of current calendar day to 23:59:59.
- **Last 7 Days (`7d`)**: Trailing 7 days from now.
- **Last 30 Days (`30d`)**: Default executive window (trailing 30 days).
- **Last 90 Days (`90d`)**: Trailing quarter for quarterly operational reviews.
- **This Year (`year`)**: Trailing 365 days for annual pipeline audits.
- **Custom Range (`custom`)**: Interactive HTML5 start and end date pickers with validation.

---

## 3. Executive KPI Metric Inventory

The dashboard renders 8 executive KPI cards:

| KPI Card | Metric | Source & Computation | Visual Treatment |
| :--- | :--- | :--- | :--- |
| **1. Total Enquiries** | Window Inbound RFQs | Count of `enquiries` within date range (`+ all-time total`) | Blue accent, `Mail` icon |
| **2. New Leads** | Unreviewed Enquiries | Count of enquiries with status = `'new'` | Amber accent, `Clock` icon, Requires Action tag |
| **3. Active Pipeline** | Working RFQs | Count of enquiries with status in `['contacted', 'quotation_sent', 'follow_up']` | Indigo accent, `TrendingUp` icon |
| **4. Converted Deals** | Successfully Won | Count of enquiries with status = `'converted'` | Emerald accent, `CheckCircle2` icon |
| **5. Conversion Rate** | Won / Total % | `(converted / total) * 100` rounded to 1 decimal place | Purple accent, `FileCheck2` icon, Healthy Target badge |
| **6. Total Follow-ups** | Window Actions | Count of scheduled tasks (`+ completed count`) | Sky accent, `CalendarClock` icon |
| **7. Completion Rate** | Task Execution % | `(completed / total_actionable) * 100` | Teal accent, `CheckCircle2` icon, High Velocity badge |
| **8. Attention Required**| Overdue & Due Today | `overdue_followups + due_today_followups` | Rose accent, `AlertTriangle` icon, Overdue Pending tag |

---

## 4. Visual Components & Analytics Features

### 4.1 Continuous Daily Trend Visualization (`EnquiryTrend.tsx`)
- Plots continuous chronological daily RFQ influx and conversion rates.
- Ensures all dates in the range are represented (filling zero-inbound days).
- Interactive hover cards display inquiry count and date labels.
- Clean empty state with industrial iconography when no records exist.

### 4.2 Pipeline Stage Distribution (`EnquiryStatusSummary.tsx`)
- Visual breakdown of customer inquiries across all 6 CRM lifecycle stages:
  - New RFQs (Amber)
  - Initial Contact (Blue)
  - Quotation Sent (Purple)
  - In Follow-up (Cyan)
  - Converted (Emerald)
  - Closed / Archived (Slate)
- Relative percentage distribution bars with micro-animations.

### 4.3 Team Workload & Execution Performance Matrix (`StaffWorkloadTable.tsx`)
- Displays team member names, corporate emails, and roles.
- Real-time assigned inquiries count.
- Real-time assigned follow-ups count.
- Completed tasks counter with visual check badge.
- Overdue tasks counter with alert pill.
- Individual task completion rate with progress bar.
- Empty state: Displays "No Staff Members Found" if no active staff profiles exist.

---

## 5. Security & Multi-Tenant Data Isolation

- **Executive Protection**: Only users with the `'admin'` role can access `/admin/dashboard` and `/admin/activity`.
- **Staff Isolation**: Staff members logging into `/staff` are strictly isolated to their own assigned enquiries and follow-ups. Company-wide executive analytics, global conversion metrics, and workload matrices are not accessible or visible to staff members.
- **RLS & Route Guards**: Protected by `ProtectedRoute` on the frontend and PostgreSQL RLS policies at the database layer.

---

## 6. Verification & Test Evidence

- **Unit Tests**: 35/35 test suites passed (140/140 unit tests).
- **Type Checking**: Passed cleanly with 0 TypeScript errors (`tsc --noEmit`).
- **Production Build**: Built in 19.12s (`tsc && vite build`).
- **Playwright E2E Tests**: 12/12 tests passed across 3 viewports:
  - `desktop-1440x900`
  - `tablet-768x1024`
  - `mobile-390x844`
