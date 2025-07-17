import { toast } from 'sonner';

export interface ErrorContext {
  timestamp: string;
  userAgent: string;
  url: string;
  component: string;
  action: string;
  userId: string;
  storyId: string;
  segmentId: string;
  additionalData?: any;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userMessage: string;
  suggestedAction: string | undefined;
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
        'Connection issue detected. Please check your internet connection and try again.',
        'Check your internet connection and refresh the page'
      );
    }

    // Authentication Errors
    if (this.isAuthError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'high',
        false,
        'Authentication required. Please sign in to continue.',
        'Sign in to your account'
      );
    }

    // Rate Limiting Errors
    if (this.isRateLimitError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'Too many requests. Please wait a moment before trying again.',
        'Wait 30 seconds and try again'
      );
    }

    // AI Service Errors
    if (this.isAIServiceError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'AI service temporarily unavailable. Please try again in a moment.',
        'Try again in 1-2 minutes'
      );
    }

    // Database Errors
    if (this.isDatabaseError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'high',
        true,
        'Data service issue. Please try again or contact support if the problem persists.',
        'Refresh the page and try again'
      );
    }

    // File/Storage Errors
    if (this.isStorageError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'medium',
        true,
        'File service issue. Please try again or skip file generation.',
        'Continue without file generation'
      );
    }

    // Voice/Audio Errors
    if (this.isAudioError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'low',
        true,
        'Audio generation issue. Your story is still available to read.',
        'Continue without audio narration'
      );
    }

    // Image Generation Errors
    if (this.isImageError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'low',
        true,
        'Image generation issue. You can continue with your story and add images later.',
        'Continue without images'
      );
    }

    // Story Generation Errors
    if (this.isStoryGenerationError(errorMessage, errorStack)) {
      return this.createErrorReport(
        error,
        context,
        'high',
        true,
        'Story generation failed. Please try again with a different prompt.',
        'Try a different story idea'
      );
    }

    // Default error
    return this.createErrorReport(
      error,
      context,
      'medium',
      true,
      'Something went wrong. Please try again.',
      'Refresh the page and try again'
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
    userMessage: string,
    suggestedAction?: string
  ): ErrorReport {
    return {
      error,
      context,
      severity,
      retryable,
      userMessage,
      suggestedAction
    };
  }

  /**
   * Check if error should be processed (rate limiting)
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
   * Error type detection methods
   */
  private static isNetworkError(message: string, stack: string): boolean {
    return message.includes('network') || 
           message.includes('connection') || 
           message.includes('fetch') ||
           message.includes('timeout') ||
           stack.includes('fetch') ||
           stack.includes('XMLHttpRequest');
  }

  private static isAuthError(message: string, stack: string): boolean {
    return message.includes('auth') || 
           message.includes('login') || 
           message.includes('permission') ||
           message.includes('unauthorized') ||
           message.includes('forbidden');
  }

  private static isRateLimitError(message: string, stack: string): boolean {
    return message.includes('rate limit') || 
           message.includes('too many requests') ||
           message.includes('429') ||
           message.includes('quota exceeded');
  }

  private static isAIServiceError(message: string, stack: string): boolean {
    return message.includes('openai') || 
           message.includes('gpt') || 
           message.includes('ai') ||
           message.includes('model') ||
           message.includes('generation');
  }

  private static isDatabaseError(message: string, stack: string): boolean {
    return message.includes('database') || 
           message.includes('supabase') || 
           message.includes('storage') ||
           message.includes('sql') ||
           message.includes('postgres');
  }

  private static isStorageError(message: string, stack: string): boolean {
    return message.includes('storage') || 
           message.includes('file') || 
           message.includes('upload') ||
           message.includes('download') ||
           message.includes('bucket');
  }

  private static isAudioError(message: string, stack: string): boolean {
    return message.includes('audio') || 
           message.includes('tts') || 
           message.includes('elevenlabs') ||
           message.includes('voice') ||
           message.includes('narration');
  }

  private static isImageError(message: string, stack: string): boolean {
    return message.includes('image') || 
           message.includes('dall-e') || 
           message.includes('ovh') ||
           message.includes('generation') ||
           message.includes('picture');
  }

  private static isStoryGenerationError(message: string, stack: string): boolean {
    return message.includes('story') || 
           message.includes('text') || 
           message.includes('content') ||
           message.includes('narrative') ||
           message.includes('writing');
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
    const { userMessage, severity, retryable, suggestedAction } = report;
    
    const toastOptions = {
      duration: severity === 'critical' ? 8000 : 5000,
      action: retryable ? {
        label: suggestedAction || 'Retry',
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
    // This could send to Sentry, LogRocket, or other error tracking services
    console.log('📊 Error reported to analytics:', report);
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context: Partial<ErrorContext> = {}
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1}, waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
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
   * Utility function for sleeping
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear error timestamps (useful for testing)
   */
  static clearErrorTimestamps(): void {
    this.errorTimestamps = [];
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