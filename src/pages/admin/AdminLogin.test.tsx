import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLogin } from './AdminLogin';
import * as useAuthModule from '../../auth/useAuth';

describe('AdminLogin Component', () => {
  const mockSignIn = vi.fn();
  const mockClearSessionExpired = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
      isConfigured: true,
      sessionExpired: false,
      signIn: mockSignIn,
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
      clearSessionExpired: mockClearSessionExpired,
    });
  });

  it('1. renders all login inputs, password toggle, and branding', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Authorized Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Admin Portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Show password/i)).toBeInTheDocument();
  });

  it('2. validates that fields must not be empty before submitting', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLogin />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Sign In to Admin Portal/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('3. displays loading state during submission', async () => {
    // Delay resolution to capture loading indicator
    mockSignIn.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Authorized Email/i), {
      target: { value: 'admin@akiraautomation.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /Sign In to Admin Portal/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Authenticating Credentials\.\.\./i)).toBeInTheDocument();
  });

  it('4. displays generic authentication error on invalid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({
      user: null,
      error: 'Invalid login credentials. Please check your email and password.',
    });

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <AdminLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Authorized Email/i), {
      target: { value: 'admin@akiraautomation.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Admin Portal/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('5. redirects to dashboard on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({
      user: { id: 'admin-1', email: 'admin@akiraautomation.com' } as any,
      profile: { id: 'admin-1', role: 'admin', active: true } as any,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Authorized Email/i), {
      target: { value: 'admin@akiraautomation.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'correctpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Admin Portal/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('10. displays friendly notification when session has expired', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login?error=session_expired']}>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Your session has expired\. Please sign in again\./i)).toBeInTheDocument();
  });
});
