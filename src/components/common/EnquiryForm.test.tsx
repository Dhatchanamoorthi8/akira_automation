import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnquiryForm } from './EnquiryForm';
import { emailService } from '../../services/emailService';
import { enquiryService } from '../../services/enquiryService';

describe('EnquiryForm Component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(enquiryService, 'createEnquiry').mockResolvedValue({
      enquiry: { id: 'enquiry-mock-123' } as any,
      error: null,
    });
    vi.spyOn(emailService, 'sendEnquiry').mockResolvedValue({
      success: true,
      message: 'Your technical inquiry has been submitted and delivered to our engineering desk.',
      recipientEmail: 'milestonegauges@gmail.com',
    });
    vi.spyOn(emailService, 'getRecipientEmail').mockReturnValue('milestonegauges@gmail.com');
    vi.spyOn(emailService, 'getCcEmail').mockReturnValue('sales@akiraautomation.com');
    vi.spyOn(emailService, 'generateMailtoFallback').mockReturnValue('mailto:milestonegauges@gmail.com?subject=Test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders all required form fields and labels', () => {
    render(<EnquiryForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manufacturing Sector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product \/ Solution Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Technical Requirement/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Technical Enquiry/i })).toBeInTheDocument();
    expect(screen.getByText(/milestonegauges@gmail\.com/i)).toBeInTheDocument();
  });

  it('prefills product model when preselectedProduct prop is provided', () => {
    render(<EnquiryForm preselectedProduct="Air Plug Gauge to Check ID Bore" />);

    const productInput = screen.getByLabelText(/Specific Gauge Model/i) as HTMLInputElement;
    expect(productInput.value).toBe('Air Plug Gauge to Check ID Bore');
  });

  it('prevents submission and displays validation errors when required fields are empty', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EnquiryForm />);

    const submitBtn = screen.getByRole('button', { name: /Submit Technical Enquiry/i });
    await user.click(submitBtn);

    // Validation error alerts should be visible
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Business email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone \/ Mobile number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Please describe your gauging or fixture requirement/i)).toBeInTheDocument();

    // Success screen should NOT be rendered
    expect(screen.queryByText(/Technical Inquiry Dispatched/i)).not.toBeInTheDocument();
    expect(emailService.sendEnquiry).not.toHaveBeenCalled();
  });

  it('displays specific validation error for an invalid email format', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EnquiryForm />);

    await user.type(screen.getByLabelText(/Full Name/i), 'Rajesh Kumar');
    await user.type(screen.getByLabelText(/Company/i), 'Precision Auto Ltd');
    await user.type(screen.getByLabelText(/Business Email/i), 'invalid-email-address');
    await user.type(screen.getByLabelText(/Contact Number/i), '9876543210');
    await user.type(screen.getByLabelText(/Technical Requirement/i), 'Checking liner bore roundness');

    const submitBtn = screen.getByRole('button', { name: /Submit Technical Enquiry/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.queryByText(/Technical Inquiry Dispatched/i)).not.toBeInTheDocument();
    expect(emailService.sendEnquiry).not.toHaveBeenCalled();
  });

  it('submits successfully with valid data and renders success state with recipient details', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSubmitted = vi.fn();

    render(
      <EnquiryForm 
        preselectedProduct="Multi-Gauging Station" 
        onSubmitted={onSubmitted}
      />
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Rajesh Sharma');
    await user.type(screen.getByLabelText(/Company/i), 'Tata Motors Quality Division');
    await user.type(screen.getByLabelText(/Business Email/i), 'rajesh.sharma@example.com');
    await user.type(screen.getByLabelText(/Contact Number/i), '+91 9876543210');
    await user.type(screen.getByLabelText(/Technical Requirement/i), 'Looking for automated multi-gauging fixtures for engine block liners.');

    const submitBtn = screen.getByRole('button', { name: /Submit Technical Enquiry/i });
    await user.click(submitBtn);

    await act(async () => {
      await Promise.resolve();
    });

    // Success confirmation must be visible
    expect(screen.getByText(/Technical Inquiry (Submitted|Dispatched)/i)).toBeInTheDocument();
    expect(screen.getByText(/Rajesh Sharma/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Send Direct Copy via Email Client/i })).toBeInTheDocument();
    expect(enquiryService.createEnquiry).toHaveBeenCalledTimes(1);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });

  it('handles submission network failure with error alert and direct email fallback button', async () => {
    vi.mocked(enquiryService.createEnquiry).mockResolvedValueOnce({
      enquiry: null,
      error: 'Network connection failed.',
    });
    vi.mocked(emailService.sendEnquiry).mockRejectedValueOnce(new Error('Network connection failed.'));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EnquiryForm />);

    await user.type(screen.getByLabelText(/Full Name/i), 'Ramesh V');
    await user.type(screen.getByLabelText(/Company/i), 'Lucas TVS');
    await user.type(screen.getByLabelText(/Business Email/i), 'ramesh@lucastvs.com');
    await user.type(screen.getByLabelText(/Contact Number/i), '+91 9876543211');
    await user.type(screen.getByLabelText(/Technical Requirement/i), 'Brake caliper bore checking gauge.');

    const submitBtn = screen.getByRole('button', { name: /Submit Technical Enquiry/i });
    await user.click(submitBtn);

    await act(async () => {
      await Promise.resolve();
    });

    // Error banner should show with direct mailto link
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Network connection failed/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Pre-filled Email to milestonegauges@gmail\.com/i })).toBeInTheDocument();
  });

  it('allows sending another inquiry from the success screen to reset the form', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EnquiryForm />);

    await user.type(screen.getByLabelText(/Full Name/i), 'Amit Patel');
    await user.type(screen.getByLabelText(/Company/i), 'Bosch India');
    await user.type(screen.getByLabelText(/Business Email/i), 'amit.patel@bosch.com');
    await user.type(screen.getByLabelText(/Contact Number/i), '9876543210');
    await user.type(screen.getByLabelText(/Technical Requirement/i), 'Air ring gauge calibration masters');

    await user.click(screen.getByRole('button', { name: /Submit Technical Enquiry/i }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/Technical Inquiry Dispatched/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Send Another Inquiry/i });
    await user.click(resetBtn);

    // Form inputs should be visible again and cleared
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/Full Name/i) as HTMLInputElement).value).toBe('');
  });
});
