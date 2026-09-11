import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductFeatures } from './ProductFeatures';

describe('ProductFeatures Component', () => {
  const mockFeatures = [
    'Non-contact pneumatic measurement prevents scoring of finely finished surfaces',
    'Self-cleaning continuous exhaust clears micro-chips and residual cutting fluids',
    'Hardened sub-zero treated alloy body ensures long-term dimensional stability',
    'Compatible with analogue columns, dial units, and tri-colour electronic DROs',
  ];

  it('renders section title and all provided technical feature bullets', () => {
    render(<ProductFeatures features={mockFeatures} />);

    expect(screen.getByRole('heading', { name: /Key Technical Features/i })).toBeInTheDocument();
    for (const feature of mockFeatures) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }
  });

  it('handles empty features array safely without rendering broken container', () => {
    const { container } = render(<ProductFeatures features={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
