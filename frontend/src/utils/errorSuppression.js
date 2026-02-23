// Global ResizeObserver error suppression utility
// This should be imported and called at the application root level

export const suppressResizeObserverErrors = () => {
  // Store original methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console methods
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('ResizeObserver loop completed') ||
      message.includes('ResizeObserver loop limit exceeded') ||
      message.includes('undelivered notifications')
    ) {
      return; // Silently ignore
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('ResizeObserver loop completed') ||
      message.includes('ResizeObserver loop limit exceeded') ||
      message.includes('undelivered notifications')
    ) {
      return; // Silently ignore
    }
    originalWarn.apply(console, args);
  };

  // Global error event handler
  const handleGlobalError = (event) => {
    if (event.error && event.error.message) {
      const message = event.error.message;
      if (
        message.includes('ResizeObserver loop completed') ||
        message.includes('ResizeObserver loop limit exceeded') ||
        message.includes('undelivered notifications')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
    
    if (event.message) {
      const message = event.message;
      if (
        message.includes('ResizeObserver loop completed') ||
        message.includes('ResizeObserver loop limit exceeded') ||
        message.includes('undelivered notifications')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  };

  // Global unhandled rejection handler
  const handleGlobalRejection = (event) => {
    if (event.reason && event.reason.message) {
      const message = event.reason.message;
      if (
        message.includes('ResizeObserver loop completed') ||
        message.includes('ResizeObserver loop limit exceeded') ||
        message.includes('undelivered notifications')
      ) {
        event.preventDefault();
        return false;
      }
    }
  };

  // Override ResizeObserver constructor
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (error) {
            if (
              error.message &&
              (error.message.includes('ResizeObserver loop completed') ||
                error.message.includes('ResizeObserver loop limit exceeded') ||
                error.message.includes('undelivered notifications'))
            ) {
              // Silently ignore ResizeObserver errors
              return;
            }
            // Re-throw other errors
            throw error;
          }
        });
      });
    }
  };

  // Add event listeners
  window.addEventListener('error', handleGlobalError, true);
  window.addEventListener('unhandledrejection', handleGlobalRejection, true);

  // Return cleanup function
  return () => {
    console.error = originalError;
    console.warn = originalWarn;
    window.removeEventListener('error', handleGlobalError, true);
    window.removeEventListener('unhandledrejection', handleGlobalRejection, true);
    window.ResizeObserver = OriginalResizeObserver;
  };
};

// Auto-suppress on import (for immediate effect)
if (typeof window !== 'undefined') {
  suppressResizeObserverErrors();
}
