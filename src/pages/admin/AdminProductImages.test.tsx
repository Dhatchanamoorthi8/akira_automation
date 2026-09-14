import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProductImages } from './AdminProductImages';
import { productService } from '../../services/productService';
import { productImageService } from '../../services/productImageService';
import { ProductWithImages } from '../../types/database';

const mockProducts: ProductWithImages[] = [
  {
    id: 'prod-001',
    name: 'Electronic Air Plug Gauge',
    slug: 'electronic-air-plug-gauge',
    category: 'Air Gauging',
    short_description: 'Precision air gauging spindle.',
    description: 'Detailed description.',
    featured: true,
    active: true,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-10T12:00:00Z',
    product_images: [
      {
        id: 'img-001',
        product_id: 'prod-001',
        storage_path: 'prod-001/img1.webp',
        image_url: 'https://example.com/air-plug.webp',
        alt_text: 'Air Plug Gauge',
        sort_order: 0,
        is_primary: true,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
      },
    ],
  },
  {
    id: 'prod-002',
    name: 'Multi-Channel Digital Column',
    slug: 'multi-channel-digital-column',
    category: 'Electronic Gauging',
    short_description: 'Digital column indicator.',
    description: 'Column description.',
    featured: false,
    active: false,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-03-05T14:30:00Z',
    product_images: [],
  },
] as unknown as ProductWithImages[];

describe('AdminProductImages Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(productService, 'getAdminProducts').mockResolvedValue({
      products: mockProducts,
      total: 2,
      error: null,
    });
    vi.spyOn(productImageService, 'list').mockResolvedValue(mockProducts[0].product_images || []);
  });

  it('renders product image library table with media counts and preview strips', async () => {
    render(
      <MemoryRouter>
        <AdminProductImages />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Electronic Air Plug Gauge').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Multi-Channel Digital Column').length).toBeGreaterThan(0);
      expect(screen.getByText('1 Asset')).toBeInTheDocument();
      expect(screen.getByText('Missing Cover')).toBeInTheDocument();
    });

    expect(screen.getByText(/1 Images/i)).toBeInTheDocument();
  });

  it('opens product image manager drawer when Manage Gallery is clicked', async () => {
    render(
      <MemoryRouter>
        <AdminProductImages />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Electronic Air Plug Gauge').length).toBeGreaterThan(0);
    });

    const manageButtons = screen.getAllByRole('button', { name: /Manage Gallery/i });
    expect(manageButtons.length).toBeGreaterThan(0);
    fireEvent.click(manageButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Done Managing')).toBeInTheDocument();
      expect(screen.getByText(/Product Gallery & Visual Assets/i)).toBeInTheDocument();
    });
  });
});
