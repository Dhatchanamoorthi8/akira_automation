import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RelatedProducts } from './RelatedProducts';
import { EnquiryProvider } from '../../context/EnquiryContext';
import { ProductSummary } from '../../types';

const mockRelated: ProductSummary[] = [
  {
    id: 'rel-1',
    slug: 'air-ring-gauge',
    title: 'Air Ring Gauge for OD Shafts',
    category: 'Air Gauging',
    categorySlug: 'air-gauging',
    tagline: 'High Precision External Diameter Measurement',
    image: '/assets/products/air-ring.webp',
    description: 'Precision air ring gauge for checking outer diameters of automotive shafts.',
    highlights: ['Two-jet or four-jet configurations', 'Hardened steel body'],
  },
  {
    id: 'rel-2',
    slug: 'electronic-display-unit',
    title: 'Tri-Colour Digital Display Unit',
    category: 'Digital Displays',
    categorySlug: 'digital-displays',
    tagline: 'Microprocessor-Based DRO with Tolerancing',
    image: '/assets/products/dro.webp',
    description: 'Tri-colour digital display unit for immediate visual tolerance indication.',
    highlights: ['Bar graph & 7-segment LED', 'RS-232 serial data output'],
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <EnquiryProvider>{ui}</EnquiryProvider>
    </MemoryRouter>
  );
};

describe('RelatedProducts Component', () => {
  it('renders section title, subtitle, and all supplied related product cards', () => {
    renderWithProviders(<RelatedProducts products={mockRelated} />);

    expect(
      screen.getByRole('heading', { name: /Related Precision Gauges & Displays/i })
    ).toBeInTheDocument();

    for (const item of mockRelated) {
      expect(screen.getByRole('heading', { name: item.title })).toBeInTheDocument();
    }
  });

  it('generates links pointing to the correct product detail routes', () => {
    renderWithProviders(<RelatedProducts products={mockRelated} />);

    for (const item of mockRelated) {
      const links = screen.getAllByRole('link');
      const itemLinks = links.filter(
        (link) => link.getAttribute('href') === `/products/${item.slug}`
      );
      expect(itemLinks.length).toBeGreaterThan(0);
    }
  });

  it('handles empty related-products array safely by rendering null without error', () => {
    const { container } = renderWithProviders(<RelatedProducts products={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
