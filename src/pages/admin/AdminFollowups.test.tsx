import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminFollowups } from './AdminFollowups';
import { followupService } from '../../services/followupService';
import { FollowupWithEnquiry } from '../../types/database';

const mockFollowupsList: FollowupWithEnquiry[] = [
  {
    id: 'fol-001',
    enquiry_id: 'enq-001',
    scheduled_at: '2026-09-14T11:00:00Z',
    completed_at: null,
    type: 'call',
    status: 'upcoming',
    notes: 'Follow up on technical proposal submission',
    outcome: null,
    next_followup_at: null,
    created_by: null,
    created_at: '2026-09-12T10:00:00Z',
    updated_at: '2026-09-12T10:00:00Z',
    enquiry: {
      id: 'enq-001',
      name: 'Sunil Rao',
      company: 'L&T Precision Engineering',
      email: 'sunil.rao@lt.example.com',
      phone: '+91 99887 66554',
    },
  },
  {
    id: 'fol-002',
    enquiry_id: 'enq-002',
    scheduled_at: '2026-09-10T15:00:00Z',
    completed_at: null,
    type: 'email',
    status: 'overdue',
    notes: 'Send revised commercial terms with volume discount',
    outcome: null,
    next_followup_at: null,
    created_by: null,
    created_at: '2026-09-08T10:00:00Z',
    updated_at: '2026-09-08T10:00:00Z',
    enquiry: {
      id: 'enq-002',
      name: 'Anjali Verma',
      company: 'BHEL Haridwar',
      email: 'anjali.v@bhel.example.com',
      phone: '+91 94567 12345',
    },
  },
];

describe('AdminFollowups Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CRM follow-ups list with customer links and schedule details', async () => {
    vi.spyOn(followupService, 'getFollowups').mockResolvedValue({
      followups: mockFollowupsList,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminFollowups />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('CRM Follow-ups')).toBeDefined();
      expect(screen.getAllByText('Sunil Rao').length).toBeGreaterThan(0);
      expect(screen.getAllByText('L&T Precision Engineering').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Anjali Verma').length).toBeGreaterThan(0);
      expect(screen.getAllByText('BHEL Haridwar').length).toBeGreaterThan(0);
    });
  });

  it('renders empty state when there are no scheduled follow-ups', async () => {
    vi.spyOn(followupService, 'getFollowups').mockResolvedValue({
      followups: [],
      total: 0,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminFollowups />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No scheduled follow-ups found')).toBeDefined();
    });
  });
});
