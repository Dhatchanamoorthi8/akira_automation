import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProducts } from './AdminProducts';
import { productService } from '../../services/productService';
import { ProductWithImages } from '../../types/database';

const mockProducts: ProductWithImages[] = [
  {
    id: 'prod-001',
    name: 'Electronic Air Plug Gauge',
    slug: 'electronic-air-plug-gauge',
    category: 'Air Gauging',
    short_description: 'Precision air gauging spindle with tungsten carbide inserts.',
    description: 'Detailed description of air plug gauge.',
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
    short_description: 'High-speed bar-graph digital column indicator.',
    description: 'Column specs description.',
    featured: false,
    active: false,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-03-05T14:30:00Z',
    product_images: [],
  },
] as unknown as ProductWithImages[];

describe('AdminProducts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product management table with real product records and metadata', async () => {
    vi.spyOn(productService, 'getAdminProducts').mockResolvedValue({
      products: mockProducts,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminProducts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Electronic Air Plug Gauge').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Multi-Channel Digital Column').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Air Gauging').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\/electronic-air-plug-gauge/i).length).toBeGreaterThan(0);
    });

    // Check count badge
    expect(screen.getByText(/2 Total/i)).toBeInTheDocument();
  });

  it('renders empty state when no products exist', async () => {
    vi.spyOn(productService, 'getAdminProducts').mockResolvedValue({
      products: [],
      total: 0,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminProducts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No products found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Create New Product/i })).toBeInTheDocument();
    });
  });

  it('displays error state when database query fails', async () => {
    vi.spyOn(productService, 'getAdminProducts').mockResolvedValue({
      products: [],
      total: 0,
      error: 'Simulated connection failure',
    });

    render(
      <MemoryRouter>
        <AdminProducts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Database Connection Issue/i)).toBeInTheDocument();
      expect(screen.getByText(/Simulated connection failure/i)).toBeInTheDocument();
    });
  });

  it('opens confirmation modal when delete button is clicked', async () => {
    vi.spyOn(productService, 'getAdminProducts').mockResolvedValue({
      products: mockProducts,
      total: 2,
      error: null,
    });

    render(
      <MemoryRouter>
        <AdminProducts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Electronic Air Plug Gauge').length).toBeGreaterThan(0);
    });

    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByTitle('Delete product');
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Delete Product Permanently\?/i)).toBeInTheDocument();
      expect(screen.getByText(/This action will permanently purge/i)).toBeInTheDocument();
    });
  });
});
