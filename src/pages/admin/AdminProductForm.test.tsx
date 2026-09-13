import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminProductForm } from './AdminProductForm';
import { productService } from '../../services/productService';

describe('AdminProductForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form fields in create mode', () => {
    render(
      <MemoryRouter initialEntries={['/admin/products/new']}>
        <Routes>
          <Route path="/admin/products/new" element={<AdminProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Create New Metrology Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Air Plug Gauge to Check ID Bore/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/air-plug-gauge/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Brief 1-2 sentence engineering overview/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Product/i })).toBeInTheDocument();
  });

  it('automatically suggests URL-safe slug as product name is entered', () => {
    render(
      <MemoryRouter initialEntries={['/admin/products/new']}>
        <Routes>
          <Route path="/admin/products/new" element={<AdminProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText(/e.g. Air Plug Gauge to Check ID Bore/i);
    fireEvent.change(nameInput, { target: { value: 'Ultra Dial Indicator 0.001' } });

    const slugInput = screen.getByPlaceholderText(/air-plug-gauge/i) as HTMLInputElement;
    expect(slugInput.value).toBe('ultra-dial-indicator-0001');
  });

  it('allows adding and removing specification key-value pairs', () => {
    render(
      <MemoryRouter initialEntries={['/admin/products/new']}>
        <Routes>
          <Route path="/admin/products/new" element={<AdminProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    const addSpecBtn = screen.getByRole('button', { name: /Add Parameter/i });
    fireEvent.click(addSpecBtn);

    const specKeyInputs = screen.getAllByPlaceholderText(/Parameter \(e.g. Diameter Range\)/i);
    expect(specKeyInputs.length).toBeGreaterThan(0);
  });

  it('submits form with valid input and calls createProduct', async () => {
    const mockCreate = vi.spyOn(productService, 'createProduct').mockResolvedValueOnce({
      product: {
        id: 'prod-new-1',
        name: 'Precision Height Master',
        slug: 'precision-height-master',
        category: 'Calibration Standards',
        short_description: 'Standard block',
        description: 'Standard block description',
        featured: false,
        active: true,
        created_at: '2026-03-12T00:00:00Z',
        updated_at: '2026-03-12T00:00:00Z',
      } as unknown as import('../../types/database').DbProduct,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/products/new']}>
        <Routes>
          <Route path="/admin/products/new" element={<AdminProductForm />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText(/e.g. Air Plug Gauge to Check ID Bore/i);
    fireEvent.change(nameInput, { target: { value: 'Precision Height Master' } });

    const shortDesc = screen.getByPlaceholderText(/Brief 1-2 sentence engineering overview/i);
    fireEvent.change(shortDesc, { target: { value: 'Standard block for calibration' } });

    const saveBtn = screen.getByRole('button', { name: /Create Product/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
