# AKIRA AUTOMATION — Phase 4: Customer CRM & Follow-up Management Architecture

## 1. Executive Summary

Phase 4 delivers an enterprise-grade Customer Relationship Management (CRM) and Inquiry Lifecycle system integrated directly into the AKIRA AUTOMATION administrative portal. The system connects public prospective client RFQs with internal metrology engineering review, task tracking, follow-up scheduling, and audit trail compliance.

All operations are backed by **Supabase PostgreSQL** with Row-Level Security (RLS), real-time audit logging, automated email dispatch fallbacks, and mobile-first responsive interfaces tested across desktop, tablet, and mobile viewports.

---

## 2. Relational Database Schema & RLS

### 2.1 Schema Architecture

```
+-------------------------------------------------------------------------------+
|                                  PROFILES                                     |
| id (UUID, PK) | email | full_name | role (admin/manager/sales/staff) | active |
+-------------------------------------------------------------------------------+
                                      |
                         (1:N via assigned_to)
                                      v
+-------------------------------------------------------------------------------+
|                                 ENQUIRIES                                     |
| id (UUID, PK) | name | company | email | phone | subject | message           |
| industry | product_category | specific_product | requirement                  |
| status (new/contacted/quotation_sent/follow_up/converted/closed)              |
| source | assigned_to (FK -> profiles.id) | created_at | updated_at            |
+-------------------------------------------------------------------------------+
           |                                                |
 (1:N via enquiry_id)                             (1:N via entity_id)
           v                                                v
+------------------------------------+   +------------------------------------+
|             FOLLOWUPS              |   |           ACTIVITY_LOGS            |
| id (UUID, PK)                      |   | id (UUID, PK)                      |
| enquiry_id (FK -> enquiries.id)    |   | entity_type ('enquiry'/'followup') |
| scheduled_at (TIMESTAMPTZ)         |   | entity_id (UUID)                   |
| completed_at (TIMESTAMPTZ, null)   |   | action (string enum)               |
| type (call/email/meeting/demo/...) |   | old_value (JSONB)                  |
| status (upcoming/due_today/...)    |   | new_value (JSONB)                  |
| notes (TEXT)                       |   | description (TEXT)                 |
| outcome (TEXT)                     |   | performed_by (FK -> profiles.id)  |
| next_followup_at (TIMESTAMPTZ)     |   | created_at (TIMESTAMPTZ)           |
| created_by (FK -> profiles.id)     |   +------------------------------------+
+------------------------------------+
```

### 2.2 Row-Level Security (RLS) Rules

1. **`public.enquiries`**:
   - `INSERT`: Open to anonymous visitors (`anon`) and authenticated users (`WITH CHECK (true)`).
   - `SELECT`: Restricted to authenticated admins (`USING (public.is_admin())`).
   - `UPDATE`: Restricted to authenticated admins (`USING (public.is_admin())`).
   - `DELETE`: Explicitly disallowed to safeguard industrial customer records and quotation history.
2. **`public.followups`**:
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Restricted to authenticated staff and administrators.
3. **`public.activity_logs`**:
   - `SELECT`, `INSERT`: Restricted to authenticated administrators. Immutable audit trail: `UPDATE` and `DELETE` are disallowed.

---

## 3. Module Breakdown & Workflows

### 3.1 Public Inbound Submission (`src/components/common/EnquiryForm.tsx` & `src/hooks/useEnquiryForm.ts`)
- **Direct Supabase Insertion**: Anonymous visitors submit directly to `public.enquiries`.
- **Zero RLS Leaks**: Insert requests do not request `RETURNING *`, preventing RLS violation errors for unauthenticated users.
- **Fail-Safe Dispatch**: Primary record is safely persisted in the database; secondary email transmission warnings do not block the user from receiving immediate confirmation.
- **Confirmation Screen**: Renders standard notification *"Thank you. Your enquiry has been received."* with options to email engineering or send a follow-up inquiry.

### 3.2 Inquiries Table & Pipeline Workspace (`src/pages/admin/AdminEnquiries.tsx`)
- **Pipeline Stage Tabs**: Quick filters for *All Leads*, *New RFQ*, *Contacted*, *Quotation Sent*, *In Follow-up*, *Converted*, and *Closed*.
- **Live Search**: Multi-field matching across customer name, company, email, phone number, and quotation requirements.
- **Enterprise Data Table (Desktop)**: Columns for Customer/Company, Industry Sector, Requirement Specs, Status Badge, Assigned Staff, Date, and Actions.
- **Card Stack (Mobile / Tablet)**: Touch-optimized stacked cards for viewports under 1024px.
- **Quick Links**: Direct phone calling (`tel:`) and email dispatch (`mailto:`) shortcuts.

### 3.3 Customer Dossier & Lifecycle Management (`src/pages/admin/AdminEnquiryDetail.tsx`)
- **Client Dossier**: Primary contact, company affiliation, email, telephone, industry sector, and acquisition channel.
- **Technical Specs**: Component parameters, tolerance limits, and application requirements.
- **Status Lifecycle Transitions**: Instant status advancement (*New RFQ* -> *Contacted* -> *Quotation Sent* -> *Follow-up* -> *Converted* -> *Closed*) with real-time feedback and automatic audit log generation.
- **Staff Assignment**: Live dropdown allowing assignment to active sales engineers and managers.
- **Follow-up Subsystem**: Embedded calendar scheduler for phone calls, email touchpoints, technical demos, and quotation reviews.
- **Audit Timeline**: Reverse-chronological timeline displaying timestamped history of every stage transition, staff assignment, and follow-up interaction.

### 3.4 Dedicated Follow-ups Work Queue (`src/pages/admin/AdminFollowups.tsx`)
- **Timeframe Tabs**:
  - **Overdue**: Critical tasks requiring urgent resolution, highlighted in crimson badge counters.
  - **Due Today**: Scheduled touchpoints for the current business day.
  - **Upcoming**: Future scheduled calls and client meetings.
  - **Completed**: Historical record of completed follow-ups with recorded client outcomes.
  - **All Scheduled**: Complete overview of CRM agenda.
- **Quick Completion Modal**: Record outcome notes and seamlessly schedule successive follow-up tasks in a single atomic workflow.
- **Cancellation Flow**: Cancel unneeded reminders with administrative confirmation and audit tracking.

### 3.5 System Audit Trail (`src/pages/admin/AdminActivity.tsx`)
- **Immutable Log Feed**: Real-time event tracking across enquiries, follow-ups, and catalogue modifications.
- **Multi-Filter**: Filter by Action (`STATUS_UPDATED`, `FOLLOWUP_CREATED`, `FOLLOWUP_COMPLETED`, `ASSIGNED`, `PRODUCT_CREATED`, etc.) and Entity Type.
- **Payload Diff Inspector**: Expandable JSON viewer comparing `old_value` and `new_value` state objects.

---

## 4. Navigation Architecture & Route Tree

| Path | Component | Protected | Purpose |
| :--- | :--- | :---: | :--- |
| `/contact` | `Contact.tsx` | No | Public technical RFQ submission form |
| `/admin/login` | `AdminLogin.tsx` | No | Administrative authentication portal |
| `/admin/dashboard` | `AdminDashboard.tsx` | Yes | High-level metrics, enquiry influx, and follow-up queue |
| `/admin/enquiries` | `AdminEnquiries.tsx` | Yes | Inbound RFQ table, search, and status filtering |
| `/admin/enquiries/:id` | `AdminEnquiryDetail.tsx`| Yes | Customer dossier, status updates, and timeline |
| `/admin/followups` | `AdminFollowups.tsx` | Yes | CRM follow-up agenda with Overdue/Today/Upcoming tabs |
| `/admin/activity` | `AdminActivity.tsx` | Yes | System-wide audit log and payload diff viewer |
| `/admin/history` | Redirect | Yes | Alias pointing to `/admin/activity` |

---

## 5. Security & Error Handling Guarantees

1. **Guarded API Endpoints**: All administrative queries verify active session via `ProtectedRoute` and Supabase RLS.
2. **Error Sanitization**: Database constraint violations, SQL error codes, and server traces are never leaked to client toast or UI messages.
3. **Double Submission Prevention**: Form submit buttons automatically disable during in-flight network requests and display loading spinners.
4. **Session Expiry Handling**: Expired JWT tokens automatically trigger redirect to `/admin/login?redirect=...`.
