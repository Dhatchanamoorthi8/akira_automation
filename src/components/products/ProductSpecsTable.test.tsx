import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductSpecsTable } from './ProductSpecsTable';

describe('ProductSpecsTable Component', () => {
  const mockSpecs: Record<string, string> = {
    'Operating Pressure': '2.5 to 3.5 bar (regulated shop air)',
    'Measuring Clearance': '0.020 mm to 0.050 mm radial',
    'Body Construction': 'Hardened Tool Steel (OHNS) / Optional Tungsten Carbide',
    'Accuracy': 'Repeatability within 0.001 mm (1 µm)',
  };

  it('renders specification table heading and rows', () => {
    render(<ProductSpecsTable specifications={mockSpecs} />);

    expect(screen.getByRole('heading', { name: /Engineering Specifications/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders all parameter keys and their corresponding specification values', () => {
    render(<ProductSpecsTable specifications={mockSpecs} />);

    for (const [key, val] of Object.entries(mockSpecs)) {
      expect(screen.getByText(key)).toBeInTheDocument();
      expect(screen.getByText(val)).toBeInTheDocument();
    }
  });

  it('handles empty specifications dictionary safely without crashing', () => {
    const { container } = render(<ProductSpecsTable specifications={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
