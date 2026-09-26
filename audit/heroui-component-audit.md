# HeroUI v3 Component Audit & Migration Specification
**Target Surface:** Akira Precision Automation — Administrative Console & Staff Workspace  
**Framework:** React 19 + Vite + TypeScript + Tailwind CSS v4 + HeroUI v3 (`@heroui/react` & `@heroui/styles` v3.2.6)  
**Audit Scope:**
1. Layout, Header & Navigation (`AdminLayout`, `AdminHeader`, `AdminSidebar`, `AdminProfileMenu`)
2. Dashboard (`/admin/dashboard` & widgets)
3. Enquiries & RFQ Dossier (`/admin/enquiries`, `/admin/enquiries/:id`, `AdminEnquiryDossierDrawer`)
4. Follow-ups Management (`/admin/followups`, `/admin/followups/:id`)
5. Product Catalogue (`/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`, `AdminProductDossierDrawer`)
6. Product Image Manager (`/admin/product-images`, `ProductImageManager`)
7. Staff & User Access (`/admin/users`)
8. Attendance & Field Tracking (`/admin/attendance`)
9. Staff Mobile/Desktop Workspace (`/staff`)

---

## 1. Executive Summary

### 1.1 Current Architecture State
The admin and staff portals currently rely heavily on **native HTML elements** (`<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<dialog>` / custom modal backdrop `<div>`s, custom sliding drawer `<div>`s) wrapped in bespoke Tailwind CSS utilities. While visually styled with industrial palettes, this bespoke approach presents notable UX and accessibility deficits:
- **No unified keyboard focus management**: Native modals and drawers lack true focus trapping, restoring focus on close, and consistent `Escape` key handling.
- **Inaccessible custom dropdowns & popovers**: Menus (such as `AdminProfileMenu`, status dropdowns, and column pickers) use manual DOM `mousedown` listeners without standard ARIA roving focus (`ArrowDown`, `ArrowUp`, `Enter`, `Space`).
- **Inconsistent form validation states**: Raw inputs use arbitrary borders and alert divs rather than standard HeroUI `FieldError`, `Description`, and accessible invalid states (`aria-invalid`).
- **Duplicate layout primitives**: Tables, card containers, and filters are reimplemented across individual pages with minor styling discrepancies.

### 1.2 Target HeroUI v3 Standard
Under HeroUI v3 (built on React Aria Components and Tailwind CSS v4):
- **Provider-free**: No `<HeroUIProvider>` required.
- **Compound component pattern**: Strict usage of dot-notation subcomponents (e.g. `Card.Header`, `Card.Content`, `Table.Content`, `Modal.Dialog`).
- **Semantic variants & tokens**: `primary`, `secondary`, `tertiary`, `danger`, `outline`, `ghost` mapped to Akira's industrial color system (`#0055A5`).
- **Event standardization**: `onPress` instead of `onClick` on buttons for cross-device touch/pointer normalization.

---

## 2. Component-by-Component Audit & Tag Inventory

### A. Layout & Navigation Shell

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminLayout.tsx` | Plain `<div>` layout shell | `Surface` / layout container | `Surface` | Standardized background token mapping |
| `AdminHeader.tsx` (Breadcrumb) | Native `<nav>`, `<div>`, `<Link>` | `Breadcrumbs` | `Breadcrumbs`, `Breadcrumbs.Item` | Proper `aria-current="page"` and separator semantics |
| `AdminHeader.tsx` (Mobile Trigger) | Native `<button>` | `Button` | `Button` (`variant="ghost"`, `isIconOnly`) | Accessible touch target (44x44px minimum) and focus ring |
| `AdminSidebar.tsx` (Collapse & Nav) | Native `<button>` toggle & nav links | `Button`, `Tooltip` | `Button` (`variant="ghost"`), `Tooltip` | Keyboard navigation and tooltips for collapsed icons |
| `AdminSidebar.tsx` (Mobile Drawer) | Custom `<div>` fixed backdrop & sliding panel | `Drawer` | `Drawer.Backdrop`, `Drawer.Container`, `Drawer.Dialog`, `Drawer.Header`, `Drawer.Body` | Focus trap, swipe-to-dismiss, Esc close, automatic body scroll lock |
| `AdminProfileMenu.tsx` (User Menu) | Native `<button>` + absolute `<div>` popover with manual click-outside listener | `Dropdown` | `Dropdown.Trigger`, `Dropdown.Popover`, `Dropdown.Menu`, `Dropdown.Item`, `Dropdown.Separator` | Full keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`), ARIA menu attributes |

---

### B. Dashboard (`http://localhost:3000/admin/dashboard`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminDashboard.tsx` (Preset Pills) | Raw `<button>` row in inline `<div>` | `ButtonGroup` or `ToggleButtonGroup` | `ButtonGroup`, `Button` (`variant="outline" / "primary"`) | Accessible segmented control semantics (`role="radiogroup"` or toggle group) |
| `AdminDashboard.tsx` (Custom Date Form) | Native `<input type="date">` | `DateField` or `DatePicker` | `DatePicker`, `DatePicker.InputGroup`, `DatePicker.Trigger` | Accessible calendar picker, localized date formatting, no raw input quirks |
| `AdminDashboard.tsx` (Refresh Trigger) | Styled `<Button>` with manual spin icon | `Button` with loading state | `Button` (`isLoading`, `variant="outline"`) | Built-in accessible loading indicator and aria-disabled state |
| `AdminStatCard.tsx` (Card Container) | `<Card>` without compound subcomponents | `Card` (Compound) | `Card.Header`, `Card.Content`, `Card.Footer` | Semantic layout separation and unified hover elevation tokens |
| `AdminStatCard.tsx` (More Options) | Native `<button type="button">` | `Button` | `Button` (`variant="ghost"`, `size="sm"`, `isIconOnly`) | Consistent focus outline and touch target |
| `StaffWorkloadTable.tsx` | Partial `<Table>` | `Table` (Full Compound) | `Table.ScrollContainer`, `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | Sortable columns, accessible table headers (`isRowHeader`), keyboard navigation |
| `RecentEnquiries.tsx` (Filters) | Native `<input type="text">` search, `<select>` dropdown | `SearchField`, `Select` | `SearchField.Input`, `Select.Trigger`, `Select.Value`, `Select.Popover`, `ListBox.Item` | Clearable search button, custom styled accessible dropdown popup |
| `RecentEnquiries.tsx` (Table) | Native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` | `Table` (Compound) | `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | Responsive scroll container, hover states, semantic grid navigation |
| `UpcomingFollowups.tsx` (List) | Raw `<Card>` with `<div>` items | `Card` + `ListBox` / `Surface` | `Card.Header`, `Card.Content`, `Chip` | Uniform list item focus and status badges |
| `RecentActivity.tsx` (Audit Feed) | Raw `<Card>` with `<div>` items | `Card` + `Surface` | `Card.Header`, `Card.Content`, `Chip` | Timeline styling consistency |

---

### C. Enquiries (`http://localhost:3000/admin/enquiries`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminEnquiries.tsx` (Search) | Raw `<input type="text">` inside container | `SearchField` | `SearchField`, `SearchField.Input`, `SearchField.ClearButton` | Escape to clear, integrated search icon and aria-label |
| `AdminEnquiries.tsx` (Status Tabs) | Row of raw `<button>` elements with badge spans | `Tabs` or `TagGroup` | `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` | Arrow key tab switching, accessible selected state (`aria-selected`) |
| `AdminEnquiries.tsx` (Column Picker) | Custom absolute `<div>` + native `<input type="checkbox">` + reorder `<button>` | `Popover` / `Dropdown` + `Checkbox` | `Popover`, `Popover.Trigger`, `Popover.Content`, `Checkbox`, `Button` | Accessible popover dismissal, standardized checkbox styling |
| `AdminEnquiries.tsx` (Data Table) | Native `<table>` with inline Tailwind classes | `Table` (Compound) | `Table.ScrollContainer`, `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | High performance table rendering, sticky header support |
| `AdminEnquiries.tsx` (Pagination) | Native `<button>` Previous / Next with page numbers | `Pagination` | `Pagination`, `Pagination.Content`, `Pagination.Item`, `Pagination.Prev`, `Pagination.Next` | Standard accessible pagination controls with ellipsis and jump-to |
| `AdminEnquiryDossierDrawer.tsx` | Custom `fixed inset-0` modal div with backdrop | `Drawer` | `Drawer.Backdrop`, `Drawer.Container`, `Drawer.Dialog`, `Drawer.Header`, `Drawer.Body`, `Drawer.Footer` | Trapped focus, responsive off-canvas transitions, background scroll locking |
| `AdminEnquiryDossierDrawer.tsx` (Forms) | Raw `<input>`, `<select>`, `<textarea>` | `TextField`, `Select`, `TextArea` | `TextField.Input`, `TextField.Label`, `Select.Trigger`, `Select.Popover`, `TextArea.Input` | Floating or stacked labels, built-in validation display |
| `AdminEnquiryDetail.tsx` (Full Page) | Multiple native `<button>`, `<select>`, custom modal `<div>`s | `Tabs`, `Button`, `Modal`, `Select`, `TextArea` | `Tabs.List`, `Modal.Dialog`, `Select.Popover`, `TextArea.Input` | Modular, accessible dossier sub-panes |

---

### D. Follow-ups (`http://localhost:3000/admin/followups`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminFollowups.tsx` (Timeframe Tabs) | Native `<button>` pills | `Tabs` | `Tabs.List`, `Tabs.Tab` | Keyboard navigation and clear active indicator |
| `AdminFollowups.tsx` (Search & Filters) | Native `<input>`, `<select>` | `SearchField`, `Select` | `SearchField.Input`, `Select.Trigger`, `Select.Popover`, `ListBox` | Accessible select menus with keyboard lookup |
| `AdminFollowups.tsx` (Completion Modal) | Custom `fixed inset-0` backdrop + Card div | `Modal` | `Modal.Backdrop`, `Modal.Container`, `Modal.Dialog`, `Modal.Header`, `Modal.Body`, `Modal.Footer`, `Modal.CloseTrigger` | Focus lock inside dialog, `Escape` key close, prevents background interaction |
| `AdminFollowups.tsx` (New Follow-up Modal) | Custom `fixed inset-0` backdrop + Card div | `Modal` | `Modal.Backdrop`, `Modal.Container`, `Modal.Dialog`, `Modal.Header`, `Modal.Body`, `Modal.Footer` | Full form accessibility, Enter key submission handling |
| `AdminFollowupDetail.tsx` (Page) | Raw `<button>`, `<textarea>`, `<select>` in custom modals | `Card`, `Button`, `Modal`, `TextArea`, `Select` | `Modal.Dialog`, `TextArea.Input`, `Select.Trigger` | Consistent modal dialogues and actionable buttons |

---

### E. Product Catalogue (`http://localhost:3000/admin/products`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminProducts.tsx` (Action Bar) | Native `<button>` for Add, Refresh, Column customizer | `Button` | `Button` (`variant="primary" / "outline"`) | Standardized button sizes, touch targets, and hover feedback |
| `AdminProducts.tsx` (Search & Category) | Native `<input>`, `<select>` | `SearchField`, `Select` | `SearchField.Input`, `Select.Trigger`, `Select.Popover`, `ListBox` | Instant search filtering with clearable action |
| `AdminProducts.tsx` (Data Table) | Native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` | `Table` (Compound) | `Table.ScrollContainer`, `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | Sortable columns, select all checkbox, row selection |
| `AdminProducts.tsx` (Delete Modal) | Custom `fixed inset-0` confirmation dialog | `AlertDialog` or `Modal` | `AlertDialog`, `AlertDialog.Backdrop`, `AlertDialog.Dialog`, `AlertDialog.Header`, `AlertDialog.Footer` | Danger variant confirmation, auto-focuses cancel for safety |
| `AdminProductDossierDrawer.tsx` | Custom sliding `<div>` with backdrop | `Drawer` | `Drawer.Backdrop`, `Drawer.Container`, `Drawer.Dialog`, `Drawer.Header`, `Drawer.Body` | Smooth mobile/desktop drawer animation |
| `AdminProductForm.tsx` (Create/Edit) | 30+ native `<input>`, `<textarea>`, `<select>`, `<button>` tags | `Form`, `TextField`, `TextArea`, `Select`, `Checkbox`, `Button` | `TextField.Input`, `TextField.Label`, `TextField.Description`, `TextArea.Input`, `Select.Trigger`, `Checkbox` | Native form validation integration, standard error messaging, character counts |

---

### F. Product Images (`http://localhost:3000/admin/product-images`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminProductImages.tsx` (Table) | Native `<table>` | `Table` (Compound) | `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | Clean image asset preview rows, sticky columns |
| `AdminProductImages.tsx` (Filters) | Native `<input>`, `<select>` | `SearchField`, `Select` | `SearchField.Input`, `Select.Trigger`, `Select.Popover` | Consistent filter controls |
| `ProductImageManager.tsx` (Upload & Grid) | Native `<button>` for primary star, delete, move left/right | `Button`, `Card`, `Tooltip` | `Button` (`variant="ghost"`, `isIconOnly`), `Tooltip`, `Card` | Tooltips on icon actions (Make Primary, Move, Delete) |
| `ProductImageManager.tsx` (Alt Text Edit) | Inline `<input type="text">` with tick/cross buttons | `InputGroup` or `TextField` | `InputGroup`, `InputGroup.Input`, `InputGroup.Suffix`, `Button` | Accessible inline form editing with keyboard `Enter` save and `Escape` cancel |
| `ProductImageManager.tsx` (Delete Modal) | Custom confirmation overlay | `AlertDialog` | `AlertDialog.Dialog`, `AlertDialog.Header`, `AlertDialog.Footer` | Accessible destructive confirmation modal |

---

### G. Staff & User Access (`http://localhost:3000/admin/users`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminUsers.tsx` (Search & Role Filters) | Native `<input>`, `<select>` | `SearchField`, `Select` | `SearchField.Input`, `Select.Trigger`, `Select.Popover`, `ListBox` | Accessible select filter with search capabilities |
| `AdminUsers.tsx` (User Table) | Native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` | `Table` (Compound) | `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | Standard zebra/hover styling, keyboard row focus |
| `AdminUsers.tsx` (Create User Modal) | Custom `fixed inset-0` modal div with `<input>`, `<select>`, `<button>` | `Modal` + `Form` | `Modal.Dialog`, `Modal.Header`, `Modal.Body`, `Modal.Footer`, `TextField`, `Select` | Full form trapping, Tab navigation, Escape close |
| `AdminUsers.tsx` (Edit / Reset Password / Delete Modals) | Custom `fixed inset-0` modal divs | `Modal` / `AlertDialog` | `Modal.Dialog`, `AlertDialog.Dialog`, `Button` (`variant="danger"`) | Clear destructive vs constructive action styling |

---

### H. Attendance & Field Tracking (`http://localhost:3000/admin/attendance`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `AdminAttendance.tsx` (Date & Status) | Native `<input type="date">`, `<select>` | `DatePicker`, `Select` | `DatePicker.Trigger`, `Select.Trigger`, `Select.Popover` | Calibrated date selection and accessible status dropdown |
| `AdminAttendance.tsx` (Attendance Table) | Native `<table>` | `Table` (Compound) | `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell` | Status chips (`Chip`), GPS location action links |
| `AdminAttendance.tsx` (Override Modal) | Custom `fixed inset-0` overlay | `Modal` | `Modal.Dialog`, `Modal.Header`, `Modal.Body`, `Modal.Footer`, `Select`, `TextArea` | Clean administrative audit logging modal |

---

### I. Staff Workspace (`http://localhost:3000/staff`)

| File & Section | Current Default HTML Tag | Target HeroUI v3 Component | Subcomponents Required | UX & Accessibility Benefit |
|---|---|---|---|---|
| `StaffWorkspace.tsx` (Module Tabs) | Native `<button>` tab bar | `Tabs` | `Tabs.List`, `Tabs.Tab` | Keyboard navigation (`Left`/`Right` arrow keys), responsive tab scroll |
| `StaffWorkspace.tsx` (Attendance Card) | Native `<button>` Clock In / Clock Out | `Button` | `Button` (`variant="primary"` for Clock In, `variant="danger"` for Clock Out) | Touch-optimized, prominent action states |
| `StaffWorkspace.tsx` (Field Visit Modal) | Custom modal `<div>` with 10+ inputs | `Modal` + `Form` | `Modal.Dialog`, `TextField`, `Select`, `TextArea`, `Button` | Accessible modal flow for logging customer visits |
| `StaffWorkspace.tsx` (Invoice Generator Modal) | Custom full-width modal with itemized `<table>`, `<input>`, `<select>` | `Modal` (size="full" or "5xl") | `Modal.Dialog`, `Table`, `NumberField`, `TextField`, `Select` | Strict alignment, decimal formatting, keyboard tab traversal across item rows |
| `StaffWorkspace.tsx` (Follow-up Cards & List) | Raw `<div>` cards with native `<button>`s | `Card`, `Button`, `Chip` | `Card.Header`, `Card.Content`, `Card.Footer` | Unified card elevations and semantic priority badges |

---

## 3. Prioritized Implementation Plan

To execute this migration without breaking database connections, CRM state, or passing tests:

1. **Phase 1: Foundation & Shared Layout Components**
   - Refactor `AdminHeader.tsx` (HeroUI `Breadcrumbs`, `Button`)
   - Refactor `AdminProfileMenu.tsx` (HeroUI `Dropdown`)
   - Refactor `AdminSidebar.tsx` (HeroUI `Drawer` for mobile, `Button` for controls)
2. **Phase 2: Core Admin Tables & Modals (Products, Images & Users)**
   - Replace native `<table>` with HeroUI `<Table>` in `AdminProducts.tsx`, `AdminProductImages.tsx`, and `AdminUsers.tsx`
   - Replace custom confirmation/create dialogs with HeroUI `<Modal>` and `<AlertDialog>`
   - Replace native inputs/selects with HeroUI `<SearchField>`, `<Select>`, `<TextField>`
3. **Phase 3: CRM & Pipeline Engines (Dashboard, Enquiries & Follow-ups)**
   - Replace custom drawers with HeroUI `<Drawer>` in `AdminEnquiryDossierDrawer.tsx` and `AdminProductDossierDrawer.tsx`
   - Migrate filter tabs in `AdminEnquiries.tsx` and `AdminFollowups.tsx` to HeroUI `<Tabs>`
   - Replace custom completion/schedule modals with HeroUI `<Modal>`
4. **Phase 4: Operational Services (Attendance & Staff Workspace)**
   - Refactor `AdminAttendance.tsx` with HeroUI `<DatePicker>`, `<Select>`, and `<Table>`
   - Refactor `StaffWorkspace.tsx` tabs, action cards, field visit modals, and invoice itemization tables with HeroUI components.
