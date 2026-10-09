import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as useAuthModule from './useAuth';

describe('ProtectedRoute Component', () => {
  it('renders child element when user is authenticated as active admin', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', email: 'admin@akira.com' } as any,
      session: {} as any,
      profile: { id: 'admin-1', role: 'admin', active: true } as any,
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
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Admin Portal Active</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Admin Portal Active')).toBeInTheDocument();
  });

  it('redirects unauthorized non-admin user to login and triggers sign out', () => {
    const signOutMock = vi.fn();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'user-2', email: 'user@akira.com' } as any,
      session: {} as any,
      profile: { id: 'user-2', role: 'viewer', active: true } as any,
      isAdmin: false,
      isStaff: false,
      role: 'viewer',
      isAuthenticated: true,
      isLoading: false,
      isProfileLoading: false,
      loading: false,
      isConfigured: true,
      sessionExpired: false,
      signIn: vi.fn(),
      signOut: signOutMock,
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <ProtectedRoute>
          <div>Secret Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Admin Content')).not.toBeInTheDocument();
    expect(signOutMock).toHaveBeenCalled();
  });

  it('displays configuration unavailable banner when Supabase is unconfigured', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      isStaff: false,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      isProfileLoading: false,
      loading: false,
      isConfigured: false,
      sessionExpired: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Database Configuration Unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Content')).not.toBeInTheDocument();
  });

  it('allows staff user to access staff-authorized route', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'staff-1', email: 'staff@akira.com' } as any,
      session: {} as any,
      profile: { id: 'staff-1', role: 'staff', active: true } as any,
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

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['staff', 'admin']}>
          <div data-testid="staff-workspace">Staff Workspace Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('staff-workspace')).toBeInTheDocument();
  });

  it('automatically redirects staff user to /staff when attempting to access admin-only routes', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'staff-1', email: 'staff@akira.com' } as any,
      session: {} as any,
      profile: { id: 'staff-1', role: 'staff', active: true } as any,
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

    render(
      <MemoryRouter initialEntries={['/admin/products']}>
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Only Product Catalog Editor</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Only Product Catalog Editor')).not.toBeInTheDocument();
  });

  it('does not unmount or show PageLoader when profile is refreshing in the background with an existing profile', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', email: 'admin@akira.com' } as any,
      session: {} as any,
      profile: { id: 'admin-1', role: 'admin', active: true } as any,
      isAdmin: true,
      isStaff: false,
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isProfileLoading: true, // background token / profile revalidation
      loading: false,
      isConfigured: true,
      sessionExpired: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="persistent-content">Uninterrupted Admin Workspace</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('persistent-content')).toBeInTheDocument();
    expect(screen.queryByText(/Loading Metrology Data/i)).not.toBeInTheDocument();
  });

  it('shows PageLoader when isProfileLoading is true and profile is not yet loaded', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', email: 'admin@akira.com' } as any,
      session: {} as any,
      profile: null,
      isAdmin: false,
      isStaff: false,
      role: null,
      isAuthenticated: true,
      isLoading: false,
      isProfileLoading: true,
      loading: false,
      isConfigured: true,
      sessionExpired: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      clearSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="persistent-content">Should Not Render Yet</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('persistent-content')).not.toBeInTheDocument();
    expect(screen.getByText(/Loading Metrology Data/i)).toBeInTheDocument();
  });
});
