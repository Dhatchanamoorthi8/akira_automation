import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import * as useAuthModule from '../../auth/useAuth';

describe('AdminLayout Component', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', email: 'moorthi@akiraautomation.com' } as any,
      session: {} as any,
      profile: { id: 'admin-1', full_name: 'Moorthi', role: 'admin', active: true } as any,
      isAdmin: true,
      isStaff: false,
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isProfileLoading: false,
      loading: false,
      isConfigured: true,
      sessionExpired: false,
      signIn: vi.fn(),
      signOut: mockSignOut,
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });
  });

  it('18. opens mobile sidebar drawer when hamburger menu button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout />
      </MemoryRouter>
    );

    const hamburgerBtn = screen.getByLabelText(/Open navigation sidebar/i);
    expect(hamburgerBtn).toBeInTheDocument();

    // Drawer should initially not be present in mobile overlay role dialog
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(hamburgerBtn);

    // Drawer should open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/Close navigation sidebar/i)).toBeInTheDocument();
  });

  it('19. closes mobile sidebar drawer when Escape key is pressed', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout />
      </MemoryRouter>
    );

    // Open drawer
    fireEvent.click(screen.getByLabelText(/Open navigation sidebar/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Drawer should be dismissed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('20. toggles profile dropdown menu and provides sign out action', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout />
      </MemoryRouter>
    );

    const profileTrigger = screen.getByLabelText(/Admin Profile Menu/i);
    expect(profileTrigger).toBeInTheDocument();

    // Open menu
    fireEvent.click(profileTrigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('moorthi@akiraautomation.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Sign Out/i })).toBeInTheDocument();

    // Click Sign Out
    fireEvent.click(screen.getByRole('menuitem', { name: /Sign Out/i }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('21. toggles sidebar collapse mode with collapse/expand button', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout />
      </MemoryRouter>
    );

    const collapseBtn = screen.getByLabelText(/Collapse sidebar/i);
    expect(collapseBtn).toBeInTheDocument();

    fireEvent.click(collapseBtn);

    const expandBtn = screen.getByLabelText(/Expand sidebar/i);
    expect(expandBtn).toBeInTheDocument();

    fireEvent.click(expandBtn);
    expect(screen.getByLabelText(/Collapse sidebar/i)).toBeInTheDocument();
  });
});

