import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Brain, Image, Volume2, Wifi } from 'lucide-react';
import { performanceMonitor } from '@/lib/performance';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: 'story-generation' | 'image-generation' | 'audio-generation' | 'ui' | 'general';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Record error in performance metrics
    performanceMonitor.recordMetric('error-boundary', 'errorCount', 1);
    
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

  private getErrorContext = () => {
    const { context } = this.props;
    const { error } = this.state;
    
    if (!error) return { icon: AlertTriangle, title: 'Something went wrong', description: 'An unexpected error occurred.' };
    
    const errorMessage = error.message.toLowerCase();
    
    // AI Provider Errors
    if (errorMessage.includes('openai') || errorMessage.includes('gpt')) {
      return {
        icon: Brain,
        title: 'AI Story Generation Error',
        description: 'Our storytelling AI is temporarily unavailable. Please try again in a moment.'
      };
    }
    
    if (errorMessage.includes('image') || errorMessage.includes('dall-e') || errorMessage.includes('ovh')) {
      return {
        icon: Image,
        title: 'Image Generation Error',
        description: 'Unable to create story images right now. You can continue with your story and add images later.'
      };
    }
    
    if (errorMessage.includes('audio') || errorMessage.includes('tts')) {
      return {
        icon: Volume2,
        title: 'Audio Generation Error',
        description: 'Unable to generate voice narration right now. Your story is still available to read.'
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        icon: Wifi,
        title: 'Connection Error',
        description: 'Please check your internet connection and try again.'
      };
    }
    
    // Context-specific errors
    switch (context) {
      case 'story-generation':
        return {
          icon: Brain,
          title: 'Story Generation Failed',
          description: 'Unable to generate story content. Please try again or start a new story.'
        };
      case 'image-generation':
        return {
          icon: Image,
          title: 'Image Creation Failed',
          description: 'Unable to create story images. You can continue reading without images.'
        };
      case 'audio-generation':
        return {
          icon: Volume2,
          title: 'Audio Creation Failed',
          description: 'Unable to generate voice narration. Your story is still available to read.'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Something went wrong',
          description: 'An unexpected error occurred while rendering this component.'
        };
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorContext = this.getErrorContext();
      const IconComponent = errorContext.icon;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-slate-800 border-red-600 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <IconComponent className="h-5 w-5 text-red-400" />
                {errorContext.title}
              </CardTitle>
              <CardDescription className="text-red-200">
                {errorContext.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-4 bg-red-900/50 rounded-lg">
                  <p className="text-red-200 text-sm font-mono">
                    {this.state.error.message}
                  </p>
                  {this.state.retryCount > 0 && (
                    <p className="text-red-300 text-xs mt-2">
                      Retry attempt: {this.state.retryCount}
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-200 hover:bg-red-600 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Reload Page
                </Button>
              </div>
              {this.state.retryCount >= 3 && (
                <div className="text-center">
                  <p className="text-red-300 text-sm">
                    Still having issues? Try refreshing the page or contact support.
                  </p>
                </div>
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