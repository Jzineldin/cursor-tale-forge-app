import { toast } from 'sonner';

/**
 * Enhanced Error Handling System for TaleForge
 * Provides centralized error handling, logging, and user feedback
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  storyId?: string;
  segmentId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userMessage: string;
}

export class EnhancedErrorHandler {
  private static readonly MAX_ERRORS_PER_MINUTE = 10;
  private static readonly ERROR_WINDOW_MS = 60000;
  private static errorTimestamps: number[] = [];

  /**
   * Handle errors with proper categorization and user feedback
   */
  static handleError(
    error: Error,
    context: Partial<ErrorContext> = {},
    options: {
      showToast?: boolean;
      logToConsole?: boolean;
      reportToAnalytics?: boolean;
    } = {}
  ): ErrorReport {
    const {
      showToast = true,
      logToConsole = true,
      reportToAnalytics = true
    } = options;

    // Rate limiting
    if (!this.shouldProcessError()) {
      console.warn('Error rate limit exceeded, skipping error processing');
      const fullContext: ErrorContext = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        component: context.component || '',
        action: context.action || '',
        userId: context.userId || '',
        storyId: context.storyId || '',
        segmentId: context.segmentId || '',
        ...context
      };
      return this.createErrorReport(error, fullContext, 'low', false, 'Service temporarily unavailable');
    }

    // Create full context
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      component: context.component || '',
      action: context.action || '',
      userId: context.userId || '',
      storyId: context.storyId || '',
      segmentId: context.segmentId || '',
      ...context
    };

    // Analyze error and create report
    const report = this.analyzeError(error, fullContext);

    // Log error
    if (logToConsole) {
      this.logError(report);
    }

    // Show user feedback
    if (showToast) {
      this.showUserFeedback(report);
    }

    // Report to analytics (if enabled)
    if (reportToAnalytics) {
      this.reportToAnalytics(report);
    }

    return report;
  }

  /**
   * Analyze error and determine severity and user message
   */
  private static analyzeError(error: Error, context: ErrorContext): ErrorReport {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack || '';

    // Network/Connection Errors
    if (this.isNetworkError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'Connection issue detected. Please check your internet connection and try again.'
      );
    }

    // Authentication Errors
    if (this.isAuthError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'high',
        false,
        'Authentication required. Please sign in to continue.'
      );
    }

    // Rate Limiting Errors
    if (this.isRateLimitError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'Too many requests. Please wait a moment before trying again.'
      );
    }

    // AI Service Errors
    if (this.isAIServiceError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'AI service temporarily unavailable. Please try again in a moment.'
      );
    }

    // Database Errors
    if (this.isDatabaseError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'high',
        true,
        'Data service issue. Please try again or contact support if the problem persists.'
      );
    }

    // File/Storage Errors
    if (this.isStorageError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'File service issue. Please try again or skip file generation.'
      );
    }

    // Unknown Errors
    return this.createErrorReport(
      error,
      context,
      'high',
      false,
      'An unexpected error occurred. Please try again or contact support.'
    );
  }

  /**
   * Create error report with consistent structure
   */
  private static createErrorReport(
    error: Error,
    context: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical',
    retryable: boolean,
    userMessage: string
  ): ErrorReport {
    return {
      error,
      context,
      severity,
      retryable,
      userMessage
    };
  }

  /**
   * Error type detection methods
   */
  private static isNetworkError(message: string, stack: string): boolean {
    const networkKeywords = [
      'network', 'connection', 'fetch', 'timeout', 'offline',
      'failed to fetch', 'network error', 'connection refused'
    ];
    return networkKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  private static isAuthError(message: string, stack: string): boolean {
    const authKeywords = [
      'unauthorized', '401', '403', 'authentication', 'auth',
      'token', 'session', 'login', 'signin'
    ];
    return authKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  private static isRateLimitError(message: string, stack: string): boolean {
    const rateLimitKeywords = [
      'rate limit', '429', 'too many requests', 'quota exceeded',
      'throttle', 'limit exceeded'
    ];
    return rateLimitKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  private static isAIServiceError(message: string, stack: string): boolean {
    const aiKeywords = [
      'openai', 'gpt', 'dall-e', 'elevenlabs', 'ai service',
      'model', 'generation', 'completion'
    ];
    return aiKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  private static isDatabaseError(message: string, stack: string): boolean {
    const dbKeywords = [
      'database', 'sql', 'postgres', 'supabase', 'db',
      'constraint', 'foreign key', 'unique'
    ];
    return dbKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  private static isStorageError(message: string, stack: string): boolean {
    const storageKeywords = [
      'storage', 'bucket', 'file', 'upload', 'download',
      's3', 'cloud storage', 'bucket'
    ];
    return storageKeywords.some(keyword => 
      message.includes(keyword) || stack.includes(keyword)
    );
  }

  /**
   * Rate limiting for error processing
   */
  private static shouldProcessError(): boolean {
    const now = Date.now();
    this.errorTimestamps = this.errorTimestamps.filter(
      timestamp => now - timestamp < this.ERROR_WINDOW_MS
    );
    
    if (this.errorTimestamps.length >= this.MAX_ERRORS_PER_MINUTE) {
      return false;
    }
    
    this.errorTimestamps.push(now);
    return true;
  }

  /**
   * Log error with structured format
   */
  private static logError(report: ErrorReport): void {
    const { error, context, severity, retryable } = report;
    
    console.group(`🚨 Error (${severity.toUpperCase()}) - ${context.component || 'Unknown'}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Context:', context);
    console.error('Retryable:', retryable);
    console.error('Timestamp:', context.timestamp);
    console.groupEnd();
  }

  /**
   * Show user-friendly error message
   */
  private static showUserFeedback(report: ErrorReport): void {
    const { userMessage, severity, retryable } = report;
    
    const toastOptions = {
      duration: severity === 'critical' ? 8000 : 5000,
      action: retryable ? {
        label: 'Retry',
        onClick: () => window.location.reload()
      } : undefined
    };

    switch (severity) {
      case 'critical':
        toast.error(userMessage, toastOptions);
        break;
      case 'high':
        toast.error(userMessage, toastOptions);
        break;
      case 'medium':
        toast.warning(userMessage, toastOptions);
        break;
      case 'low':
        toast.info(userMessage, toastOptions);
        break;
    }
  }

  /**
   * Report error to analytics (placeholder for future implementation)
   */
  private static reportToAnalytics(report: ErrorReport): void {
    // TODO: Implement analytics reporting
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.log('📊 Error reported to analytics:', report);
    }
  }

  /**
   * Retry mechanism for retryable errors
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: Partial<ErrorContext> = {}
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.handleError(lastError, {
            ...context,
            action: `retry_operation_attempt_${attempt}`
          });
          throw lastError;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }

    throw lastError!;
  }

  /**
   * Handle async operations with automatic error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext> = {},
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallback;
    }
  }

  /**
   * Create error boundary fallback component
   */
  static createErrorFallback(error: Error, context: Partial<ErrorContext> = {}) {
    this.handleError(error, context);
    
    return {
      title: 'Something went wrong',
      message: 'We encountered an unexpected error. Please try refreshing the page.',
      action: 'Refresh Page',
      onAction: () => window.location.reload()
    };
  }
}

/**
 * Hook for using enhanced error handling
 */
export const useErrorHandler = (componentName: string) => {
  const handleError = (error: Error, context: Partial<ErrorContext> = {}) => {
    return EnhancedErrorHandler.handleError(error, {
      component: componentName,
      ...context
    });
  };

  const retryOperation = <T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    delay?: number,
    context?: Partial<ErrorContext>
  ) => {
    return EnhancedErrorHandler.retryOperation(operation, maxRetries, delay, {
      component: componentName,
      ...context
    });
  };

  const withErrorHandling = <T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>,
    fallback?: T
  ) => {
    return EnhancedErrorHandler.withErrorHandling(operation, {
      component: componentName,
      ...context
    }, fallback);
  };

  return {
    handleError,
    retryOperation,
    withErrorHandling
  };
}; 