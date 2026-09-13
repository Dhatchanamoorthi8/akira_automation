import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminEnquiryDetail } from './AdminEnquiryDetail';
import { enquiryService } from '../../services/enquiryService';
import { EnquiryWithDetails } from '../../types/database';

const mockDetailEnquiry: EnquiryWithDetails = {
  id: 'enq-100',
  name: 'Vikram Mehta',
  company: 'Mahindra Heavy Industries',
  email: 'vikram.m@mahindra.example.com',
  phone: '+91 98220 12345',
  subject: 'Air Gauging Multi-Jet Ring Gauge Calibration',
  message: 'Require master setting rings for multi-station automotive assembly inspection.',
  industry: 'Automotive',
  product_category: 'Air Gauging',
  specific_product: 'Air Ring Gauges',
  requirement: 'Tungsten carbide body with custom air jet configuration.',
  status: 'new',
  source: 'web_form',
  assigned_to: null,
  created_at: '2026-09-12T08:00:00Z',
  updated_at: '2026-09-12T08:00:00Z',
  followups: [
    {
      id: 'fol-1',
      enquiry_id: 'enq-100',
      scheduled_at: '2026-09-15T10:00:00Z',
      completed_at: null,
      type: 'call',
      status: 'upcoming',
      notes: 'Initial technical clarification call with QC lead',
      outcome: null,
      next_followup_at: null,
      created_by: null,
      created_at: '2026-09-12T08:15:00Z',
      updated_at: '2026-09-12T08:15:00Z',
    },
  ],
  activity_logs: [
    {
      id: 'act-1',
      entity_type: 'enquiry',
      entity_id: 'enq-100',
      action: 'ENQUIRY_CREATED',
      old_value: null,
      new_value: { status: 'new' },
      description: 'Enquiry received from web form',
      performed_by: null,
      created_at: '2026-09-12T08:00:00Z',
    },
  ],
};

describe('AdminEnquiryDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(enquiryService, 'getAdminProfiles').mockResolvedValue([]);
  });

  it('renders customer dossier, technical specs, followups, and timeline', async () => {
    vi.spyOn(enquiryService, 'getEnquiryById').mockResolvedValue({
      enquiry: mockDetailEnquiry,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/enquiries/enq-100']}>
        <Routes>
          <Route path="/admin/enquiries/:id" element={<AdminEnquiryDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Vikram Mehta').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Mahindra Heavy Industries').length).toBeGreaterThan(0);
      expect(screen.getByText('vikram.m@mahindra.example.com')).toBeDefined();
      expect(screen.getByText('Initial technical clarification call with QC lead')).toBeDefined();
      expect(screen.getByText('Enquiry received from web form')).toBeDefined();
    });
  });

  it('renders error state when enquiry record does not exist', async () => {
    vi.spyOn(enquiryService, 'getEnquiryById').mockResolvedValue({
      enquiry: null,
      error: 'Enquiry not found.',
    });

    render(
      <MemoryRouter initialEntries={['/admin/enquiries/enq-nonexistent']}>
        <Routes>
          <Route path="/admin/enquiries/:id" element={<AdminEnquiryDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer Enquiry Dossier')).toBeDefined();
    });
  });
});
