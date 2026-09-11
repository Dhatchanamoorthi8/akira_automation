import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrecisionText } from './PrecisionText';

describe('PrecisionText Component', () => {
  it('renders base text correctly in the document', () => {
    render(<PrecisionText text="Precision Gauging Solutions" />);

    expect(screen.getByLabelText('Precision Gauging Solutions')).toBeInTheDocument();
  });

  it('renders highlighted text suffix and preserves complete accessible label', () => {
    render(
      <PrecisionText
        text="Precision Gauging Solutions for"
        highlightText="Modern Manufacturing"
      />
    );

    expect(
      screen.getByLabelText('Precision Gauging Solutions for Modern Manufacturing')
    ).toBeInTheDocument();
    expect(screen.getByText('Modern Manufacturing')).toBeInTheDocument();
  });

  it('applies custom classNames to container and highlight element', () => {
    const { container } = render(
      <PrecisionText
        text="Custom Class Text"
        highlightText="Highlighted"
        className="custom-precision-container"
        highlightClassName="custom-highlight-color"
      />
    );

    const mainSpan = container.firstChild as HTMLElement;
    expect(mainSpan).toHaveClass('custom-precision-container');

    const highlightedSpan = screen.getByText('Highlighted');
    expect(highlightedSpan).toHaveClass('custom-highlight-color');
  });
});
