import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminUsers } from './AdminUsers';
import { userService } from '../../services/userService';
import { Profile } from '../../types/database';

vi.mock('../../auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@akira.com', role: 'admin' },
  }),
}));

const mockUsers: Profile[] = [
  {
    id: 'user-001',
    email: 'john@example.com',
    full_name: 'John Doe',
    role: 'admin',
    active: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'user-002',
    email: 'jane@example.com',
    full_name: 'Jane Smith',
    role: 'staff',
    active: false,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-02T10:00:00Z',
  },
];

describe('AdminUsers Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user management table and stats with HeroUI components', async () => {
    vi.spyOn(userService, 'getUsers').mockResolvedValue({
      users: mockUsers,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
      expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
    });

    // Check KPI counts
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Staff')).toBeInTheDocument();
  });

  it('renders empty state when no users are returned', async () => {
    vi.spyOn(userService, 'getUsers').mockResolvedValue({
      users: [],
      total: 0,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Users Found')).toBeInTheDocument();
    });
  });
});
