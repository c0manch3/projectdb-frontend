import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error('=== ErrorBoundary getDerivedStateFromError ===');
    console.error('Error caught:', error);
    console.error('Error message:', error.message);
    console.error('=============================================');
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced logging for debugging
    console.error('=== ErrorBoundary caught an error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error info:', errorInfo);
    console.error('Current URL:', window.location.href);
    console.error('Current pathname:', window.location.pathname);
    console.error('==========================================');
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__content">
              <h2 className="error-boundary__title">Что-то пошло не так</h2>
              <p className="error-boundary__message">
                Произошла ошибка при загрузке компонента. Попробуйте обновить страницу.
              </p>
              <div className="error-boundary__actions">
                <button 
                  className="button button--primary" 
                  onClick={this.handleRetry}
                >
                  Попробовать снова
                </button>
                <button 
                  className="button button--secondary" 
                  onClick={() => window.location.reload()}
                >
                  Обновить страницу
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-boundary__details">
                  <summary>Детали ошибки (только в разработке)</summary>
                  <pre className="error-boundary__stack">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;