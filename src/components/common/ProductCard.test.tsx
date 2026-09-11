import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { EnquiryProvider, useEnquiry } from '../../context/EnquiryContext';
import { ProductSummary } from '../../types';

const mockProduct: ProductSummary = {
  id: 'test-gauge',
  slug: 'test-air-plug-gauge',
  title: 'Test Air Plug Gauge System',
  category: 'Air Gauging',
  categorySlug: 'air-gauging',
  tagline: 'High Precision ID Bore Measurement',
  image: '/assets/products/air-plug.webp',
  description: 'Precision air plug gauge engineered for testing tight automotive bore tolerances.',
  highlights: [
    'Tungsten Carbide wear sleeves',
    'Self-cleaning jet nozzles',
    'Compatible with electronic DROs'
  ],
  isFeatured: true,
};

// Helper component to verify openEnquiry triggers
const TestHarness: React.FC<{ product: ProductSummary; variant?: 'default' | 'featured' }> = ({
  product,
  variant,
}) => {
  const { selectedProduct, isOpen } = useEnquiry();
  return (
    <div>
      <div data-testid="enquiry-state">{isOpen ? selectedProduct : 'NO_ENQUIRY'}</div>
      <ProductCard product={product} variant={variant} />
    </div>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <EnquiryProvider>{ui}</EnquiryProvider>
    </MemoryRouter>
  );
};

describe('ProductCard Component', () => {
  it('renders product title, category badge, and description correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByRole('heading', { name: mockProduct.title })).toBeInTheDocument();
    expect(screen.getByText(mockProduct.category)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
  });

  it('renders product image with accessible alt attribute', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const img = screen.getByRole('img', { name: mockProduct.title });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockProduct.image);
  });

  it('generates correct link destination to product detail route', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const links = screen.getAllByRole('link');
    const detailLinks = links.filter(
      (link) => link.getAttribute('href') === `/products/${mockProduct.slug}`
    );
    expect(detailLinks.length).toBeGreaterThan(0);
  });

  it('renders highlights accurately', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    for (const highlight of mockProduct.highlights) {
      expect(screen.getByText(highlight)).toBeInTheDocument();
    }
  });

  it('triggers enquiry context when Enquire button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestHarness product={mockProduct} />);

    expect(screen.getByTestId('enquiry-state')).toHaveTextContent('NO_ENQUIRY');

    const enquireButton = screen.getByRole('button', { name: /Enquire/i });
    await user.click(enquireButton);

    expect(screen.getByTestId('enquiry-state')).toHaveTextContent(mockProduct.title);
  });

  it('renders safely when optional properties or empty highlights are provided', () => {
    const minimalProduct: ProductSummary = {
      id: 'min-1',
      slug: 'minimal-slug',
      title: 'Minimal Gauge',
      category: 'Special Gauges',
      categorySlug: 'special-gauges',
      tagline: 'Simple Tagline',
      image: '/assets/placeholder.webp',
      description: 'Minimal description.',
      highlights: [],
    };

    renderWithProviders(<ProductCard product={minimalProduct} />);

    expect(screen.getByRole('heading', { name: 'Minimal Gauge' })).toBeInTheDocument();
    expect(screen.getByText('Special Gauges')).toBeInTheDocument();
  });
});
