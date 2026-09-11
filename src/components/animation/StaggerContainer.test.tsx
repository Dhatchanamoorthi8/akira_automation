import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StaggerContainer } from './StaggerContainer';
import { StaggerItem } from './StaggerItem';

describe('StaggerContainer and StaggerItem Components', () => {
  it('renders nested staggered items correctly', () => {
    render(
      <StaggerContainer className="grid-container">
        <StaggerItem>
          <div>Item 1: Air Plug Gauge</div>
        </StaggerItem>
        <StaggerItem>
          <div>Item 2: Air Ring Gauge</div>
        </StaggerItem>
        <StaggerItem>
          <div>Item 3: Multigauging Station</div>
        </StaggerItem>
      </StaggerContainer>
    );

    expect(screen.getByText('Item 1: Air Plug Gauge')).toBeInTheDocument();
    expect(screen.getByText('Item 2: Air Ring Gauge')).toBeInTheDocument();
    expect(screen.getByText('Item 3: Multigauging Station')).toBeInTheDocument();
  });

  it('renders custom className on StaggerContainer and StaggerItem', () => {
    const { container } = render(
      <StaggerContainer className="custom-parent">
        <StaggerItem className="custom-child">
          <span>Child</span>
        </StaggerItem>
      </StaggerContainer>
    );

    const parent = container.firstChild as HTMLElement;
    expect(parent).toHaveClass('custom-parent');
    expect(parent.firstChild as HTMLElement).toHaveClass('custom-child');
  });
});
