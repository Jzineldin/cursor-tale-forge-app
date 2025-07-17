import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Brain, 
  Image, 
  Volume2, 
  Wifi, 
  Database,
  FileText,
  Settings
} from 'lucide-react';
// import { performanceMonitor } from '@/utils/performance';

interface Props {
  children: React.ReactNode;
  context?: string;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      retryCount: 0
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Record error in performance metrics
    // performanceMonitor.recordMetric('error-boundary', 'errorCount', 1);
    
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context
    });

    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      retryCount: prevState.retryCount + 1 
    } as State));
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private getErrorContext = () => {
    const { context } = this.props;
    const { error } = this.state;
    
    if (!error) return { 
      icon: AlertTriangle, 
      title: 'Something went wrong', 
      description: 'An unexpected error occurred.',
      action: 'retry'
    };
    
    const errorMessage = error.message.toLowerCase();
    
    // AI Provider Errors
    if (errorMessage.includes('openai') || errorMessage.includes('gpt') || errorMessage.includes('ai')) {
      return {
        icon: Brain,
        title: 'AI Story Generation Error',
        description: 'Our storytelling AI is temporarily unavailable. Please try again in a moment.',
        action: 'retry'
      };
    }
    
    if (errorMessage.includes('image') || errorMessage.includes('dall-e') || errorMessage.includes('ovh')) {
      return {
        icon: Image,
        title: 'Image Generation Error',
        description: 'Unable to create story images right now. You can continue with your story and add images later.',
        action: 'continue'
      };
    }
    
    if (errorMessage.includes('audio') || errorMessage.includes('tts') || errorMessage.includes('elevenlabs')) {
      return {
        icon: Volume2,
        title: 'Audio Generation Error',
        description: 'Unable to generate voice narration right now. Your story is still available to read.',
        action: 'continue'
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
      return {
        icon: Wifi,
        title: 'Connection Error',
        description: 'Please check your internet connection and try again.',
        action: 'retry'
      };
    }
    
    if (errorMessage.includes('database') || errorMessage.includes('supabase') || errorMessage.includes('storage')) {
      return {
        icon: Database,
        title: 'Data Service Error',
        description: 'Unable to save or load your story data. Please try again.',
        action: 'retry'
      };
    }
    
    if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('permission')) {
      return {
        icon: Settings,
        title: 'Authentication Error',
        description: 'Please sign in again to continue.',
        action: 'home'
      };
    }
    
    // Default error context
    return {
      icon: AlertTriangle,
      title: 'Unexpected Error',
      description: 'Something went wrong. Please try refreshing the page.',
      action: 'retry'
    };
  };

  public override render() {
    if (this.state.hasError) {
      const errorContext = this.getErrorContext();
      const IconComponent = errorContext.icon;
      
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-slate-800 border-red-500/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <IconComponent className="h-12 w-12 text-red-400" />
              </div>
              <CardTitle className="text-red-300 text-xl">
                {errorContext.title}
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                {errorContext.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-mono">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {errorContext.action === 'retry' && (
                  <Button 
                    onClick={this.handleReset}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                {errorContext.action === 'continue' && (
                  <Button 
                    onClick={this.handleReset}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Continue Without Feature
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
                
                <Button 
                  onClick={this.handleRefresh}
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-slate-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
              
              {/* Retry Counter */}
              {this.state.retryCount > 0 && (
                <p className="text-xs text-slate-500 text-center">
                  Retry attempt: {this.state.retryCount}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;