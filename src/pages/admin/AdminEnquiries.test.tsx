import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminEnquiries } from './AdminEnquiries';
import { enquiryService } from '../../services/enquiryService';
import { EnquiryWithDetails } from '../../types/database';

const mockEnquiries: EnquiryWithDetails[] = [
  {
    id: 'enq-001',
    name: 'Rajesh Kumar',
    company: 'Tata Motors Pune',
    email: 'rajesh.k@tatamotors.example.com',
    phone: '+91 98765 43210',
    subject: 'Air Electronic Gauging Spindles Inquiry',
    message: 'Need 12 custom spindles for engine block bore diameter inspection.',
    industry: 'Automotive',
    product_category: 'Air Gauging',
    specific_product: 'Multi-Jet Air Plug Spindle',
    requirement: 'Direct supply to Pune powertrain line',
    status: 'new',
    source: 'web_form',
    assigned_to: null,
    created_at: '2026-09-12T10:00:00Z',
    updated_at: '2026-09-12T10:00:00Z',
  },
  {
    id: 'enq-002',
    name: 'Priya Sharma',
    company: 'Bharat Forge Ltd',
    email: 'priya.s@bharatforge.example.com',
    phone: '+91 91234 56789',
    subject: 'Digital Column Gauging System',
    message: 'Looking for 4-channel digital column units with RS-232 SPC output.',
    industry: 'Aerospace & Defence',
    product_category: 'Electronic Gauging',
    specific_product: 'Multi-Channel Digital Column',
    requirement: 'Urgent RFQ',
    status: 'quotation_sent',
    source: 'modal_enquiry',
    assigned_to: 'staff-1',
    created_at: '2026-09-11T14:30:00Z',
    updated_at: '2026-09-12T09:00:00Z',
    assigned_profile: {
      id: 'staff-1',
      email: 'sales@akiraautomation.com',
      full_name: 'Amit Patel',
      role: 'sales',
    },
  },
];

const mockStatusCounts = {
  all: 2,
  new: 1,
  contacted: 0,
  quotation_sent: 1,
  follow_up: 0,
  converted: 0,
  closed: 0,
};

describe('AdminEnquiries Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(enquiryService, 'getStatusCounts').mockResolvedValue(mockStatusCounts);
    vi.spyOn(enquiryService, 'getAdminProfiles').mockResolvedValue([]);
  });

  it('renders enterprise enquiries list with customer records and metadata', async () => {
    vi.spyOn(enquiryService, 'getEnquiries').mockResolvedValue({
      enquiries: mockEnquiries,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminEnquiries />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Rajesh Kumar').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tata Motors Pune').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Priya Sharma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bharat Forge Ltd').length).toBeGreaterThan(0);
      expect(screen.getByText('Requirement')).toBeDefined();
      expect(screen.getByText('Date & Time')).toBeDefined();
      expect(screen.getByText('Assigned')).toBeDefined();
      expect(screen.getByText('Amit Patel')).toBeDefined();
      expect(screen.getByText('Unassigned')).toBeDefined();
    });
  });

  it('renders status tabs with accurate counts', async () => {
    vi.spyOn(enquiryService, 'getEnquiries').mockResolvedValue({
      enquiries: mockEnquiries,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminEnquiries />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer Enquiries & RFQs')).toBeDefined();
      expect(screen.getByText('All Leads')).toBeDefined();
      expect(screen.getByText('New RFQ')).toBeDefined();
    });
  });

  it('renders friendly empty state when no records match filter', async () => {
    vi.spyOn(enquiryService, 'getEnquiries').mockResolvedValue({
      enquiries: [],
      total: 0,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminEnquiries />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No enquiries found')).toBeDefined();
    });
  });
});
