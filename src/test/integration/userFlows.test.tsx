import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Products } from '../../pages/Products';
import { ProductDetail } from '../../pages/ProductDetail';
import { NotFound } from '../../pages/NotFound';
import { EnquiryModal } from '../../components/common/EnquiryModal';
import { EnquiryProvider } from '../../context/EnquiryContext';
import { emailService } from '../../services/emailService';

const renderFlowApp = (initialEntries: string[] = ['/products']) => {
  return render(
    <EnquiryProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <EnquiryModal />
      </MemoryRouter>
    </EnquiryProvider>
  );
};

describe('Core User Routing & Conversion Flows (Integration)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(emailService, 'sendEnquiry').mockResolvedValue({
      success: true,
      message: 'Your technical inquiry has been submitted and delivered to our engineering desk.',
      recipientEmail: 'milestonegauges@gmail.com',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('Flow 1: Products catalogue -> search -> filtered cards -> click product -> loads Product Detail', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFlowApp(['/products']);

    // 1. Initial catalogue view
    expect(screen.getByRole('heading', { name: /Precision Product Catalogue/i })).toBeInTheDocument();

    // 2. Search for "digital"
    const searchInput = screen.getByPlaceholderText(/Search products, specs, ranges/i);
    await user.type(searchInput, 'digital');

    // 3. Filtered products should be visible
    const productHeading = await screen.findByRole('heading', {
      name: 'Tri-Colour Digital Display Unit',
    });
    expect(productHeading).toBeInTheDocument();

    // 4. Click specifications link on the filtered card
    const detailLink = screen.getByRole('link', { name: 'Tri-Colour Digital Display Unit' });
    await user.click(detailLink);

    // 5. Verify transition to ProductDetail with lazy-loaded specs
    await waitFor(() => {
      expect(screen.getByText(/Engineering Specifications/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Authentic PPT Data/i)).toBeInTheDocument();
  });

  it('Flow 2: Product detail -> click related product card -> navigates to new Product Detail', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFlowApp(['/products/air-plug-gauge']);

    // 1. Initial product detail loads
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Air Plug Gauge to Check ID Bore/i })
      ).toBeInTheDocument();
    });

    // 2. Locate related products section
    const relatedHeading = screen.getByRole('heading', {
      name: /Related Precision Gauges & Displays/i,
    });
    expect(relatedHeading).toBeInTheDocument();

    // 3. Find and click on a related product link (Air Ring Gauge)
    const relatedLinks = screen.getAllByRole('link', { name: /Air Ring Gauge/i });
    expect(relatedLinks.length).toBeGreaterThan(0);
    await user.click(relatedLinks[0]);

    // 4. Verify that new product detail page renders for Air Ring Gauge
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Air Ring Gauge to Check OD' })
      ).toBeInTheDocument();
    });
  });

  it('Flow 3: Product detail -> Enquire Now modal -> product prefilled -> submit -> success state', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFlowApp(['/products/air-plug-gauge']);

    // 1. Wait for product details to resolve
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Air Plug Gauge to Check ID Bore/i })
      ).toBeInTheDocument();
    });

    // 2. Click "Enquire About This Model"
    const enquireBtn = screen.getByRole('button', { name: /Enquire About This Model/i });
    await user.click(enquireBtn);

    // 3. Modal opens with prefilled product
    const specificInput = screen.getByLabelText(/Specific Gauge Model/i) as HTMLInputElement;
    expect(specificInput.value).toContain('Air Plug Gauge');

    // 4. Fill in required fields
    await user.type(screen.getByLabelText(/Full Name/i), 'Suresh Patil');
    await user.type(screen.getByLabelText(/Company/i), 'Mahindra Quality Dept');
    await user.type(screen.getByLabelText(/Business Email/i), 'suresh.patil@mahindra.com');
    await user.type(screen.getByLabelText(/Contact Number/i), '+91 9988776655');
    await user.type(
      screen.getByLabelText(/Technical Requirement/i),
      'Require air plug gauge with setting ring masters for engine cylinders.'
    );

    // 5. Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Technical Enquiry/i });
    await user.click(submitBtn);

    // 6. Fast-forward timer for submission
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 7. Verify success screen inside modal
    expect(screen.getByText(/Technical Inquiry Dispatched/i)).toBeInTheDocument();
    expect(screen.getByText(/Suresh Patil/i)).toBeInTheDocument();

    // 8. Close modal
    const closeBtn = screen.getByRole('button', { name: /Close Window/i });
    await user.click(closeBtn);

    // Modal should close
    expect(screen.queryByText(/Technical Inquiry Dispatched/i)).not.toBeInTheDocument();
  });

  it('Flow 4: Invalid product route -> displays not-found state with recovery button', async () => {
    renderFlowApp(['/products/unknown-non-existent-system']);

    // Should display Product Not Found view
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Product Not Found/i })).toBeInTheDocument();
    });

    expect(
      screen.getByText(/The requested gauging system or product specification page does not exist/i)
    ).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /Back to Products Catalogue/i });
    expect(backLink).toHaveAttribute('href', '/products');
  });
});
