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

  it('displays administrator privileges required notice when authenticated user is non-admin', () => {
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

    expect(screen.getByText(/Administrator Privileges Required/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Content')).not.toBeInTheDocument();
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

  it('blocks staff user from accessing admin-only routes and shows staff redirection banner', () => {
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
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Only Product Catalog Editor</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Administrative Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Only Product Catalog Editor')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Staff Workspace/i })).toBeInTheDocument();
  });
});
