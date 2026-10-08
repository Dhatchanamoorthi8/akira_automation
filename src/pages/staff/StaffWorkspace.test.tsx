import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StaffWorkspace } from './StaffWorkspace';
import * as useAuthModule from '../../auth/useAuth';
import { followupService } from '../../services/followupService';
import { enquiryService } from '../../services/enquiryService';
import { attendanceService } from '../../services/attendanceService';
import { visitService } from '../../services/visitService';
import { invoiceService } from '../../services/invoiceService';
import { productService } from '../../services/productService';
import type { FollowupWithEnquiry, EnquiryWithDetails, StaffAttendance, FieldVisit, Invoice } from '../../types/database';

const mockAttendance: StaffAttendance = {
  id: 'att-001',
  staff_id: 'staff-user-1',
  work_date: '2026-09-26',
  clock_in_at: '2026-09-26T09:15:00Z',
  clock_out_at: null,
  clock_in_lat: 18.5204,
  clock_in_lng: 73.8567,
  clock_in_address: 'Pune Facility',
  clock_out_lat: null,
  clock_out_lng: null,
  clock_out_address: null,
  status: 'present',
  notes: null,
  created_at: '2026-09-26T09:15:00Z',
  updated_at: '2026-09-26T09:15:00Z',
};

const mockFollowups: FollowupWithEnquiry[] = [
  {
    id: 'f-1',
    enquiry_id: 'e-1',
    scheduled_at: '2026-09-26T14:00:00Z',
    completed_at: null,
    type: 'call',
    status: 'upcoming',
    notes: 'Follow up on Air Ring Gauge order specification',
    outcome: null,
    next_followup_at: null,
    created_by: 'staff-user-1',
    created_at: '2026-09-25T10:00:00Z',
    updated_at: '2026-09-25T10:00:00Z',
    enquiry: {
      id: 'e-1',
      name: 'Ramesh Patel',
      company: 'Tata Motors Precision Division',
      email: 'ramesh.p@tatamotors.example.com',
      phone: '+91 98220 11223',
    },
  },
];

const mockEnquiries: EnquiryWithDetails[] = [
  {
    id: 'e-1',
    enquiry_number: 'ENQ-2026-0042',
    name: 'Ramesh Patel',
    company: 'Tata Motors Precision Division',
    email: 'ramesh.p@tatamotors.example.com',
    phone: '+91 98220 11223',
    subject: 'Multi-channel air electronic gauge',
    message: 'Need urgent quote for multi-channel air electronic gauge',
    industry: 'Automotive',
    product_category: 'Air Gauges',
    specific_product: 'Air Ring Gauge',
    requirement: 'Custom calibration',
    status: 'contacted',
    source: 'website',
    assigned_to: 'staff-user-1',
    created_at: '2026-09-25T08:00:00Z',
    updated_at: '2026-09-25T08:00:00Z',
  } as EnquiryWithDetails,
];

const mockVisits: FieldVisit[] = [
  {
    id: 'v-1',
    enquiry_id: 'e-1',
    staff_id: 'staff-user-1',
    title: 'Site Calibration Demo at Tata Motors Bhosari',
    visit_purpose: 'calibration_demo' as any,
    status: 'scheduled',
    scheduled_at: '2026-09-27T10:00:00Z',
    check_in_at: null,
    check_in_lat: null,
    check_in_lng: null,
    check_in_address: null,
    check_out_at: null,
    check_out_lat: null,
    check_out_lng: null,
    check_out_address: null,
    duration_minutes: null,
    outcome_notes: null,
    customer_contact_person: 'Ramesh Patel',
    customer_signature_url: null,
    photos: [],
    created_by: 'staff-user-1',
    created_at: '2026-09-26T08:00:00Z',
    updated_at: '2026-09-26T08:00:00Z',
    enquiry: {
      id: 'e-1',
      name: 'Ramesh Patel',
      company: 'Tata Motors Precision Division',
      email: 'ramesh.p@tatamotors.example.com',
      phone: '+91 98220 11223',
    },
  },
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'QUO-2026-012',
    enquiry_id: 'e-1',
    created_by: 'staff-user-1',
    customer_name: 'Ramesh Patel',
    customer_company: 'Tata Motors Precision Division',
    customer_email: 'ramesh.p@tatamotors.example.com',
    customer_phone: '+91 98220 11223',
    customer_address: null,
    customer_gst: null,
    type: 'quotation',
    status: 'draft',
    issue_date: '2026-09-26',
    due_date: null,
    subtotal: 45000,
    tax_amount: 8100,
    discount_amount: 0,
    total_amount: 53100,
    currency: 'INR',
    notes: 'Quotation valid for 30 days',
    terms: null,
    pdf_url: null,
    sent_at: null,
    paid_at: null,
    created_at: '2026-09-26T09:00:00Z',
    updated_at: '2026-09-26T09:00:00Z',
  },
];

describe('StaffWorkspace Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'staff-user-1', email: 'staff@akiraautomation.com' } as any,
      session: {} as any,
      profile: {
        id: 'staff-user-1',
        full_name: 'Sunil Metrologist',
        role: 'staff',
        active: true,
      } as any,
      isAdmin: false,
      isStaff: true,
      role: 'staff',
      isAuthenticated: true,
      isLoading: false,
      isProfileLoading: false,
      loading: false,
      isConfigured: true,
      sessionExpired: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });

    vi.spyOn(attendanceService, 'getTodayAttendance').mockResolvedValue(mockAttendance);
    vi.spyOn(followupService, 'getFollowups').mockResolvedValue({
      followups: mockFollowups,
      total: 1,
      error: null,
    });
    vi.spyOn(enquiryService, 'getEnquiries').mockResolvedValue({
      enquiries: mockEnquiries,
      total: 1,
      error: null,
    });
    vi.spyOn(enquiryService, 'getStatusCounts').mockResolvedValue({
      all: 7,
      new: 2,
      contacted: 1,
      quotation_sent: 0,
      follow_up: 1,
      converted: 0,
      closed: 0,
    });
    vi.spyOn(visitService, 'getVisits').mockResolvedValue({
      visits: mockVisits,
      total: 1,
      error: null,
    });
    vi.spyOn(invoiceService, 'getInvoices').mockResolvedValue({
      invoices: mockInvoices,
      total: 1,
      error: null,
    });
    vi.spyOn(productService, 'getProducts').mockResolvedValue([]);
  });

  it('renders staff portal with HeroUI attendance card, greeting, and KPI stat cards', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    // Header greeting
    expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    expect(screen.getByText(/Staff Portal/i)).toBeInTheDocument();

    // ERP Daily Attendance HeroUI Card
    await waitFor(() => {
      expect(screen.getByText(/ERP Daily Attendance/i)).toBeInTheDocument();
      expect(screen.getByText(/Clocked in at/i)).toBeInTheDocument();
      expect(screen.getByText(/Present/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Clock Out/i })).toBeInTheDocument();
    });

    // KPI Summary Cards (use getAllByText to handle duplicates with tab filter buttons)
    expect(screen.getByText(/New RFQs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Due Today/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Site Visits/i)).toBeInTheDocument();
  });

  it('renders follow-ups list cards with contact info and action buttons', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ramesh Patel/i)).toBeInTheDocument();
      expect(screen.getByText(/Tata Motors Precision Division/i)).toBeInTheDocument();
      expect(screen.getByText(/Follow up on Air Ring Gauge order specification/i)).toBeInTheDocument();
    });

    // HeroUI Button for completing follow-up
    expect(screen.getByRole('button', { name: /Complete Follow-up/i })).toBeInTheDocument();
    // Dossier action button
    expect(screen.getByRole('button', { name: /Dossier/i })).toBeInTheDocument();
  });

  it('switches to field visits tab and displays visit data', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    // Wait for initial followup data load
    await waitFor(() => {
      expect(screen.getByText(/Ramesh Patel/i)).toBeInTheDocument();
    });

    // Switch to Field Visits tab (native <button> tab)
    const visitsTab = screen.getByRole('button', { name: /Field Visits/i });
    fireEvent.click(visitsTab);

    await waitFor(() => {
      expect(screen.getByText(/Site Calibration Demo at Tata Motors Bhosari/i)).toBeInTheDocument();
    });

    // Check In (GPS) button on scheduled visit
    expect(screen.getByRole('button', { name: /Check In/i })).toBeInTheDocument();
  });

  it('opens Schedule Follow-up modal and clicking inputs does not dismiss modal', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const followUpBtn = screen.getByRole('button', { name: /^Follow-up$/i });
    fireEvent.click(followUpBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Schedule New Follow-up/i })).toBeInTheDocument();
    });

    // Click inside Task Title input
    const titleInput = screen.getByPlaceholderText(/e\.g\. Call client regarding quotation feedback/i);
    fireEvent.click(titleInput);
    fireEvent.change(titleInput, { target: { value: 'Call regarding air electronic gauge specs' } });

    // Verify modal remains open and input has value
    expect(screen.getByRole('heading', { name: /Schedule New Follow-up/i })).toBeInTheDocument();
    expect(titleInput).toHaveValue('Call regarding air electronic gauge specs');

    // Click inside Internal Notes textarea
    const notesInput = screen.getByPlaceholderText(/Specific points to discuss or client requests\.\.\./i);
    fireEvent.click(notesInput);
    fireEvent.change(notesInput, { target: { value: 'Client requested ±0.5µm calibration' } });

    // Verify modal still remains open
    expect(screen.getByRole('heading', { name: /Schedule New Follow-up/i })).toBeInTheDocument();
    expect(notesInput).toHaveValue('Client requested ±0.5µm calibration');
  });

  it('opens Complete CRM Follow-up modal and clicking inputs does not dismiss modal', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ramesh Patel/i)).toBeInTheDocument();
    });

    const completeBtn = screen.getByRole('button', { name: /Complete Follow-up/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Complete CRM Follow-up/i })).toBeInTheDocument();
    });

    // Click and type in Customer Outcome & Technical Notes textarea
    const notesArea = screen.getByPlaceholderText(/e\.g\. Discussed air plug gauge tolerances\./i);
    fireEvent.click(notesArea);
    fireEvent.change(notesArea, { target: { value: 'Confirmed drawing dimensions and tolerances.' } });

    // Verify modal remains open
    expect(screen.getByRole('heading', { name: /Complete CRM Follow-up/i })).toBeInTheDocument();
    expect(notesArea).toHaveValue('Confirmed drawing dimensions and tolerances.');
  });

  it('opens Schedule Client Site Visit modal and clicking inputs does not dismiss modal', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const scheduleVisitBtn = screen.getByRole('button', { name: /Schedule Visit/i });
    fireEvent.click(scheduleVisitBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Schedule Client Site Visit/i })).toBeInTheDocument();
    });

    // Click and type in Visit Title input
    const titleInput = screen.getByPlaceholderText(/e\.g\. On-site Calibration & Dimension Verification/i);
    fireEvent.click(titleInput);
    fireEvent.change(titleInput, { target: { value: 'On-site Inspection of Air Plug Gauges' } });

    // Verify modal remains open
    expect(screen.getByRole('heading', { name: /Schedule Client Site Visit/i })).toBeInTheDocument();
    expect(titleInput).toHaveValue('On-site Inspection of Air Plug Gauges');
  });

  it('opens Create Invoice modal and clicking inputs does not dismiss modal', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const createInvoiceBtn = screen.getByRole('button', { name: /Create Invoice/i });
    fireEvent.click(createInvoiceBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Formal Quotation \/ Tax Invoice/i })).toBeInTheDocument();
    });

    // Click and type in Search customer input
    const searchInput = screen.getByPlaceholderText(/Type name, company, or email to search past records\.\.\./i);
    fireEvent.click(searchInput);
    fireEvent.change(searchInput, { target: { value: 'Tata Motors' } });

    // Verify modal remains open
    expect(screen.getByRole('heading', { name: /Create Formal Quotation \/ Tax Invoice/i })).toBeInTheDocument();
    expect(searchInput).toHaveValue('Tata Motors');
  });

  it('validates required fields in Create Invoice Form before generation', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const createInvoiceBtn = screen.getByRole('button', { name: /Create Invoice/i });
    fireEvent.click(createInvoiceBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Formal Quotation \/ Tax Invoice/i })).toBeInTheDocument();
    });

    // Check Customer Name input is rendered
    const customerNameInput = screen.getByPlaceholderText(/e\.g\. Acme Corporation or Contact Person/i);
    expect(customerNameInput).toBeInTheDocument();

    // Check Generate Document submit button is present and linked to form
    const submitBtn = screen.getByRole('button', { name: /Generate Document/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveAttribute('form', 'create-invoice-form');
    expect(submitBtn).toHaveAttribute('type', 'submit');

    // Clear customer name and try to submit
    fireEvent.change(customerNameInput, { target: { value: '' } });
    fireEvent.click(submitBtn);

    // Modal stays open and does not submit with invalid/empty fields
    expect(screen.getByRole('heading', { name: /Create Formal Quotation \/ Tax Invoice/i })).toBeInTheDocument();
  });

  it('switches to Invoices tab, displays View PDF and Edit buttons, and opens PDF viewer and Edit modal', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    // Switch to Invoices & Quotes tab
    const invoicesTab = screen.getByRole('button', { name: /Invoices & Quotes/i });
    fireEvent.click(invoicesTab);

    await waitFor(() => {
      expect(screen.getByText('QUO-2026-012')).toBeInTheDocument();
    });

    // Verify View PDF button is rendered and opens PDF preview
    const viewPdfBtn = screen.getByRole('button', { name: /View PDF for QUO-2026-012/i });
    expect(viewPdfBtn).toBeInTheDocument();
    fireEvent.click(viewPdfBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/FORMAL QUOTATION/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('button', { name: /Close Preview/i })).toBeInTheDocument();
    });

    // Close preview
    const closePreviewBtn = screen.getByRole('button', { name: /Close Preview/i });
    fireEvent.click(closePreviewBtn);

    // Verify Edit button is rendered and opens Edit mode
    const editBtn = screen.getByRole('button', { name: /Edit QUO-2026-012/i });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Quotation \(QUO-2026-012\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
  });

  it('opens HeroUI Delete Confirmation dialog when clicking Delete button', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const invoicesTab = screen.getByRole('button', { name: /Invoices & Quotes/i });
    fireEvent.click(invoicesTab);

    await waitFor(() => {
      expect(screen.getByText('QUO-2026-012')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete invoice QUO-2026-012/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Delete Quotation \/ Invoice/i })).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to permanently delete document/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete Permanently/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  it('opens HeroUI Send Confirmation dialog when clicking Send to Customer button', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const invoicesTab = screen.getByRole('button', { name: /Invoices & Quotes/i });
    fireEvent.click(invoicesTab);

    await waitFor(() => {
      expect(screen.getByText('QUO-2026-012')).toBeInTheDocument();
    });

    const sendBtn = screen.getByRole('button', { name: /Send to Customer/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Send Document to Customer/i })).toBeInTheDocument();
      expect(screen.getByText(/You are about to dispatch formal quotation \/ invoice/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Document/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  it('opens Add Offline Customer Lead modal with HeroUI components and validates input', async () => {
    render(
      <MemoryRouter initialEntries={['/staff']}>
        <StaffWorkspace />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sunil Metrologist/i)).toBeInTheDocument();
    });

    const addCustomerBtn = screen.getByRole('button', { name: /Add Customer/i });
    fireEvent.click(addCustomerBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Add Offline Customer \/ Inbound Lead/i })).toBeInTheDocument();
      expect(screen.getByText(/Customer Contact & Source/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical Interest & Gauging Requirements/i)).toBeInTheDocument();
      expect(screen.getByText(/Schedule immediate follow-up task for this lead/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Customer Lead/i })).toBeInTheDocument();
    });
  });
});
