import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import LoadingState from '../loading_state/loading_state';
import ErrorBoundary from '../error_boundary/error_boundary';

interface LazyRouteProps {
  Component: LazyExoticComponent<ComponentType<any>>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  preload?: boolean; // Preload component on hover or focus
}

/**
 * LazyRoute component for code splitting and lazy loading
 * Provides loading and error states for dynamically imported components
 */
const LazyRoute: React.FC<LazyRouteProps> = ({ 
  Component, 
  fallback,
  errorFallback,
  preload = false 
}) => {
  // Default loading fallback
  const defaultFallback = (
    <LoadingState 
      message="Загрузка страницы..." 
      size="lg"
      variant="spinner"
    />
  );

  // Default error fallback
  const defaultErrorFallback = (
    <div className="lazy-route-error">
      <h2>Ошибка загрузки страницы</h2>
      <p>Не удалось загрузить содержимое. Попробуйте обновить страницу.</p>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={errorFallback || defaultErrorFallback}
      level="page"
    >
      <Suspense fallback={fallback || defaultFallback}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;

/**
 * Helper function to create lazy-loaded components with error boundaries
 */
export function createLazyRoute<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    preload?: boolean;
  } = {}
): React.FC<T> {
  const LazyComponent = React.lazy(importFn);
  
  return (props: T) => (
    <LazyRoute 
      Component={LazyComponent} 
      {...options}
    />
  );
}

/**
 * Hook for preloading lazy components
 * Useful for preloading on route hover or user interaction
 */
export function useComponentPreloader() {
  const preloadComponent = React.useCallback((
    importFn: () => Promise<{ default: ComponentType<any> }>
  ) => {
    // Preload the component
    importFn();
  }, []);

  return { preloadComponent };
}