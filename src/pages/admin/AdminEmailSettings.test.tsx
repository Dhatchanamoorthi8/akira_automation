import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminEmailSettings } from './AdminEmailSettings';
import { emailMessageService } from '../../services/emailMessageService';

vi.mock('../../services/emailMessageService', () => ({
  emailMessageService: {
    checkDomainStatus: vi.fn(),
    sendTestEmail: vi.fn(),
  },
}));

vi.mock('../../auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@akiraautomation.com', role: 'admin' },
  }),
}));

describe('AdminEmailSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(emailMessageService.checkDomainStatus).mockResolvedValue({
      success: true,
      isVerified: true,
      domainName: 'akiraautomation.com',
      status: 'verified',
      dnsRecords: [
        { record: 'CNAME', type: 'CNAME', value: 'send.forge.rmta.net', status: 'verified' },
        { record: 'TXT', type: 'TXT', value: 'p=...', status: 'verified' },
      ],
    });
  });

  it('1. renders page header, domain status, and send test email form', async () => {
    render(
      <MemoryRouter>
        <AdminEmailSettings />
      </MemoryRouter>
    );

    expect(screen.getByText('Email System & Domain Settings')).toBeInTheDocument();
    expect(screen.getByText('Resend Domain Status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Send Test Email/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Domain Verified')).toBeInTheDocument();
    });

    expect(screen.getAllByText('notifications@akiraautomation.com').length).toBeGreaterThan(0);
  });

  it('2. submits test email and displays provider success confirmation', async () => {
    vi.mocked(emailMessageService.sendTestEmail).mockResolvedValue({
      success: true,
      status: 'SENT',
      messageId: 'resend-msg-999',
      provider: 'resend',
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminEmailSettings />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Send Test Email/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(emailMessageService.sendTestEmail).toHaveBeenCalledWith('admin@akiraautomation.com');
      expect(screen.getByText('Email Dispatched Successfully')).toBeInTheDocument();
      expect(screen.getByText('resend-msg-999')).toBeInTheDocument();
    });
  });

  it('3. displays provider error when test email fails', async () => {
    vi.mocked(emailMessageService.sendTestEmail).mockResolvedValue({
      success: false,
      status: 'FAILED',
      error: 'Domain not verified. Visit https://resend.com/domains',
      code: 'DOMAIN_NOT_VERIFIED',
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminEmailSettings />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Send Test Email/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Delivery Dispatched Failed')).toBeInTheDocument();
      expect(screen.getByText(/Domain not verified/i)).toBeInTheDocument();
      expect(screen.getByText(/DOMAIN_NOT_VERIFIED/i)).toBeInTheDocument();
    });
  });
});
