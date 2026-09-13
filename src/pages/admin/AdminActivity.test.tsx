import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminActivity } from './AdminActivity';
import { activityService } from '../../services/activityService';
import { ActivityLogWithActor } from '../../types/database';

const mockActivityLogs: ActivityLogWithActor[] = [
  {
    id: 'act-001',
    entity_type: 'enquiry',
    entity_id: 'enq-001',
    action: 'STATUS_UPDATED',
    old_value: { status: 'new' },
    new_value: { status: 'contacted' },
    description: 'Status changed from new to contacted',
    performed_by: 'user-001',
    created_at: '2026-09-12T11:00:00Z',
    actor_profile: {
      id: 'user-001',
      email: 'admin@akiraautomation.com',
      full_name: 'Lead Admin',
      role: 'admin',
    },
  },
  {
    id: 'act-002',
    entity_type: 'followup',
    entity_id: 'fol-001',
    action: 'FOLLOWUP_COMPLETED',
    old_value: null,
    new_value: { outcome: 'Client requested CAD files' },
    description: 'Follow-up completed. Outcome: Client requested CAD files',
    performed_by: 'user-001',
    created_at: '2026-09-12T11:30:00Z',
    actor_profile: {
      id: 'user-001',
      email: 'admin@akiraautomation.com',
      full_name: 'Lead Admin',
      role: 'admin',
    },
  },
];

describe('AdminActivity Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders system activity log feed with action badges and descriptions', async () => {
    vi.spyOn(activityService, 'getActivityHistory').mockResolvedValue({
      logs: mockActivityLogs,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminActivity />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('System Activity Logs')).toBeDefined();
      expect(screen.getByText('Status changed from new to contacted')).toBeDefined();
      expect(screen.getByText('Follow-up completed. Outcome: Client requested CAD files')).toBeDefined();
      expect(screen.getAllByText('Lead Admin').length).toBeGreaterThan(0);
    });
  });

  it('renders friendly empty state when no activity exists', async () => {
    vi.spyOn(activityService, 'getActivityHistory').mockResolvedValue({
      logs: [],
      total: 0,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminActivity />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No activity recorded')).toBeDefined();
    });
  });
});
