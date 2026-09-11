import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Throwing component for testing error states
const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Simulation of catastrophic rendering crash');
  }
  return <div>Normal Content Running Safely</div>;
};

// Stateful parent to verify recovery via handleReset
const ResettableParent = () => {
  const [shouldThrow, setShouldThrow] = useState(true);
  return (
    <div>
      <button onClick={() => setShouldThrow(false)}>Fix Error</button>
      <ErrorBoundary>
        <ProblemChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
};

describe('ErrorBoundary Component', () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Suppress expected React error boundary console noise
    originalConsoleError = console.error;
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children normally when no exception is thrown', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content Running Safely')).toBeInTheDocument();
  });

  it('catches child crash and displays default fallback UI without failing silently', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Default error boundary UI should be visible
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/An unexpected display error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Home/i })).toBeInTheDocument();
  });

  it('renders custom fallback element when provided via fallback prop', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Safe View</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Safe View')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });

  it('allows resetting error state via Try Again button once child is fixed', async () => {
    const user = userEvent.setup();
    render(<ResettableParent />);

    // Initially crashes
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // Fix underlying child state
    await user.click(screen.getByRole('button', { name: 'Fix Error' }));

    // Click "Try Again" to reset error boundary
    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    await user.click(tryAgainBtn);

    // Child should now render safely
    expect(screen.getByText('Normal Content Running Safely')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });
});
