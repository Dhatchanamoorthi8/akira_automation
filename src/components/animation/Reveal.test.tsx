import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Reveal } from './Reveal';

describe('Reveal Component', () => {
  it('renders children with provided text correctly', () => {
    render(
      <Reveal>
        <h1>Precision Metrology Heading</h1>
      </Reveal>
    );

    expect(
      screen.getByRole('heading', { name: 'Precision Metrology Heading' })
    ).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <Reveal className="custom-reveal-class">
        <p>Test content</p>
      </Reveal>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-reveal-class');
  });

  it('supports different direction configurations without crashing', () => {
    const { rerender } = render(
      <Reveal direction="down">
        <span>Down content</span>
      </Reveal>
    );
    expect(screen.getByText('Down content')).toBeInTheDocument();

    rerender(
      <Reveal direction="left">
        <span>Left content</span>
      </Reveal>
    );
    expect(screen.getByText('Left content')).toBeInTheDocument();

    rerender(
      <Reveal direction="right">
        <span>Right content</span>
      </Reveal>
    );
    expect(screen.getByText('Right content')).toBeInTheDocument();

    rerender(
      <Reveal direction="none">
        <span>None content</span>
      </Reveal>
    );
    expect(screen.getByText('None content')).toBeInTheDocument();
  });
});
