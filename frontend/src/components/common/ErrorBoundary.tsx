import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.generateEventId();
    
    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Event ID:', eventId);
      console.groupEnd();
    }

    // Log to external service in production
    this.logError(error, errorInfo, eventId);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: Error, errorInfo: ErrorInfo, eventId: string) {
    const errorData = {
      eventId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
    };

    // Log to external service (e.g., Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorData });
      console.error('Error logged:', errorData);
    }

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.error('Failed to store error in localStorage:', e);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    const subject = `Bug Report - ${error?.message}`;
    const body = `
Event ID: ${eventId}
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();
    
    const mailtoLink = `mailto:support@assureme.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback, showDetails = false, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Different UI based on error level
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <Card className="max-w-lg w-full text-center">
              <div className="mb-6">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  Critical Error
                </h1>
                <p className="text-neutral-600">
                  The application encountered a critical error and needs to be reloaded.
                </p>
                {eventId && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Error ID: {eventId}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Button onClick={this.handleReload} className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
                
                <Button 
                  onClick={this.handleReportBug} 
                  variant="outline" 
                  className="w-full"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              </div>
            </Card>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-96 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
              <div className="mb-6">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Page Error
                </h2>
                <p className="text-neutral-600">
                  This page encountered an error. Please try again or go back to the home page.
                </p>
                {eventId && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Error ID: {eventId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {showDetails && process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-neutral-100 rounded text-xs">
                    <pre className="whitespace-pre-wrap">
                      {error?.stack}
                    </pre>
                    {errorInfo && (
                      <pre className="whitespace-pre-wrap mt-2 border-t pt-2">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </Card>
          </div>
        );
      }

      // Component level error (default)
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Component Error
            </h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            This component encountered an error and couldn't render properly.
          </p>
          {eventId && (
            <p className="text-xs text-red-600 mt-1">
              Error ID: {eventId}
            </p>
          )}
          <div className="mt-3">
            <Button 
              onClick={this.handleRetry} 
              size="sm" 
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  return (error: Error, context?: string) => {
    const errorBoundary = new ErrorBoundary({});
    errorBoundary.componentDidCatch(error, {
      componentStack: context || 'Manual error report',
    });
  };
};

export default ErrorBoundary;