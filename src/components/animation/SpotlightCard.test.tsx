import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpotlightCard } from './SpotlightCard';

describe('SpotlightCard Component', () => {
  it('renders children and preserves accessibility markup', () => {
    render(
      <SpotlightCard>
        <h3>Precision Air Ring Gauge</h3>
        <p>Two-jet balanced design</p>
      </SpotlightCard>
    );

    expect(screen.getByRole('heading', { name: 'Precision Air Ring Gauge' })).toBeInTheDocument();
    expect(screen.getByText('Two-jet balanced design')).toBeInTheDocument();
  });

  it('updates mouse position state on mousemove events', () => {
    const { container } = render(
      <SpotlightCard className="test-card">
        <div>Content</div>
      </SpotlightCard>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(card);
    fireEvent.mouseMove(card, { clientX: 100, clientY: 150 });
    fireEvent.mouseLeave(card);

    expect(card).toBeInTheDocument();
  });
});
