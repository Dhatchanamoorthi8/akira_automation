import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProductImageManager } from './ProductImageManager';
import { productImageService } from '../../services/productImageService';
import { ProductImage } from '../../types/database';

const mockImages: ProductImage[] = [
  {
    id: 'img-1',
    product_id: 'prod-123',
    storage_path: 'prod-123/img1.webp',
    image_url: 'https://example.com/spindle1.webp',
    alt_text: 'Precision Air Spindle Front View',
    sort_order: 0,
    is_primary: true,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'img-2',
    product_id: 'prod-123',
    storage_path: 'prod-123/img2.webp',
    image_url: 'https://example.com/spindle2.webp',
    alt_text: 'Precision Air Spindle Side Profile',
    sort_order: 1,
    is_primary: false,
    created_at: '2026-03-01T10:05:00Z',
    updated_at: '2026-03-01T10:05:00Z',
  },
];

describe('ProductImageManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(productImageService, 'list').mockResolvedValue(mockImages);
  });

  it('renders primary image badge and alt text for registered images', () => {
    render(
      <ProductImageManager
        productId="prod-123"
        images={mockImages}
        onImagesChange={vi.fn()}
      />
    );

    // Primary indicator badge
    expect(screen.getByText('Primary')).toBeInTheDocument();

    // Alt text displays
    expect(screen.getByText('Precision Air Spindle Front View')).toBeInTheDocument();
    expect(screen.getByText('Precision Air Spindle Side Profile')).toBeInTheDocument();

    // Section title
    expect(screen.getByText('Product Gallery & Visual Assets')).toBeInTheDocument();
  });

  it('renders empty image state when product has no images', () => {
    render(
      <ProductImageManager
        productId="prod-123"
        images={[]}
        onImagesChange={vi.fn()}
      />
    );

    expect(screen.getByText(/No product images uploaded yet/i)).toBeInTheDocument();
    expect(screen.getByText(/upload primary and detail gallery images/i)).toBeInTheDocument();
  });

  it('allows editing alt text inline and saves via productImageService', async () => {
    const mockUpdateAltText = vi.spyOn(productImageService, 'updateAltText').mockResolvedValueOnce({
      success: true,
      error: null,
    });
    const handleImagesChange = vi.fn();

    render(
      <ProductImageManager
        productId="prod-123"
        images={mockImages}
        onImagesChange={handleImagesChange}
      />
    );

    // Find and click the Edit Alt Text button
    const editButtons = screen.getAllByTitle('Edit alt text');
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);

    // Input should appear
    const input = screen.getByPlaceholderText(/Image alt description/i);
    fireEvent.change(input, { target: { value: 'Updated Calibration Standard View' } });

    // Click Save Alt Text
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateAltText).toHaveBeenCalledWith('img-1', 'Updated Calibration Standard View');
      expect(handleImagesChange).toHaveBeenCalled();
    });
  });

  it('sets non-primary image as primary when Set Primary button is clicked', async () => {
    const mockSetPrimary = vi.spyOn(productImageService, 'setPrimary').mockResolvedValueOnce({
      success: true,
      error: null,
    });
    const handleImagesChange = vi.fn();

    render(
      <ProductImageManager
        productId="prod-123"
        images={mockImages}
        onImagesChange={handleImagesChange}
      />
    );

    // Click Set Primary on the second image
    const setPrimaryBtn = screen.getByRole('button', { name: /Set Primary/i });
    fireEvent.click(setPrimaryBtn);

    await waitFor(() => {
      expect(mockSetPrimary).toHaveBeenCalledWith('prod-123', 'img-2');
      expect(handleImagesChange).toHaveBeenCalled();
    });
  });
});
