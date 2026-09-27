import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, Button } from '@heroui/react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-industrial-bg">
          <Card
            variant="default"
            className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card text-center space-y-4"
          >
            <Card.Header className="flex flex-col items-center gap-3 p-0">
              <div className="w-14 h-14 rounded-full bg-red-50 text-tolerance-red border border-red-200 flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-7 h-7 text-tolerance-red" aria-hidden="true" />
              </div>

              <div className="space-y-1 text-center">
                <Card.Title className="text-xl font-bold font-heading text-industrial-dark">
                  Something went wrong
                </Card.Title>
                <Card.Description className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  An unexpected display error occurred while rendering this page. Our technical team has been notified.
                </Card.Description>
              </div>
            </Card.Header>

            <Card.Footer className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 p-0">
              <Button
                variant="primary"
                onPress={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-industrial-primary hover:bg-industrial-hover text-white text-xs font-semibold shadow-sm transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white" />
                <span>Try Again</span>
              </Button>
              <Button
                variant="secondary"
                onPress={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-industrial-dark text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 border border-slate-200/80 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-600" />
                <span>Go to Home</span>
              </Button>
            </Card.Footer>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
