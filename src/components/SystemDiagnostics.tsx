
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SystemDiagnostics = () => {
  const healthCheck = useHealthCheck();
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [storyTestResult, setStoryTestResult] = useState<any>(null);
  const [isTestingStory, setIsTestingStory] = useState(false);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = () => {
    setDiagnosticsResult(null);
    healthCheck.mutate(undefined, {
      onSuccess: (data) => {
        setDiagnosticsResult(data);
      },
      onError: (error) => {
        setDiagnosticsResult({ 
          status: 'error', 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  };

  const testStoryGeneration = async () => {
    setIsTestingStory(true);
    setStoryTestResult(null);
    
    try {
      console.log('Starting story generation test...');
      
      // Test 1: Basic function connectivity
      const testPrompt = "A simple test story about a cat.";
      const testPayload = {
        prompt: testPrompt,
        storyMode: "Epic Fantasy"
      };
      
      console.log('Sending test payload:', testPayload);
      
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('generate-story-segment', {
        body: testPayload,
      });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log('Story generation test response:', { data, error, duration });
      
      if (error) {
        console.error('Story generation test failed with error:', error);
        setStoryTestResult({
          status: 'failed',
          error: error.message,
          errorType: error.constructor.name,
          duration,
          testPayload,
          timestamp: new Date().toISOString()
        });
        toast.error(`Story generation test failed: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.error('Story generation test returned no data');
        setStoryTestResult({
          status: 'failed',
          error: 'No data returned from function',
          duration,
          testPayload,
          timestamp: new Date().toISOString()
        });
        toast.error('Story generation test failed: No data returned');
        return;
      }
      
      // Check if it's the new response format
      if (data.success === false) {
        console.error('Story generation function returned error:', data);
        setStoryTestResult({
          status: 'failed',
          error: data.error || 'Unknown error',
          errorCode: data.code,
          duration,
          testPayload,
          timestamp: new Date().toISOString()
        });
        toast.error(`Story generation failed: ${data.error}`);
        return;
      }
      
      // Success case
      console.log('Story generation test successful:', data);
      setStoryTestResult({
        status: 'success',
        data: data.success ? data.data : data,
        duration,
        testPayload,
        timestamp: new Date().toISOString()
      });
      toast.success('Story generation test completed successfully!');
      
    } catch (error: any) {
      console.error('Story generation test caught exception:', error);
      setStoryTestResult({
        status: 'failed',
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      toast.error(`Story generation test failed: ${error.message}`);
    } finally {
      setIsTestingStory(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      // Test basic database connection
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database connection error:', error);
        toast.error(`Database error: ${error.message}`);
      } else {
        console.log('Database connection successful');
        toast.success('Database connection successful');
      }

      // Test auth connection
      const { error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Auth connection error:', authError);
        toast.error(`Auth error: ${authError.message}`);
      } else {
        console.log('Auth connection successful');
        toast.success('Auth connection successful');
      }

    } catch (error) {
      console.error('Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
      case 'error':
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Health Check
          </CardTitle>
          <CardDescription>
            Check the health and status of your application's backend services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics}
            disabled={healthCheck.isPending}
            className="w-full"
          >
            {healthCheck.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Health Check...
              </>
            ) : (
              'Run Health Check'
            )}
          </Button>

          {diagnosticsResult && (
            <Alert className={diagnosticsResult.status === 'healthy' ? 'border-green-200' : 'border-red-200'}>
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnosticsResult.status)}
                <AlertDescription className="flex-1">
                  <div className="space-y-2">
                    <div><strong>Status:</strong> {diagnosticsResult.status}</div>
                    <div><strong>Timestamp:</strong> {new Date(diagnosticsResult.timestamp).toLocaleString()}</div>
                    
                    {diagnosticsResult.database && (
                      <div><strong>Database:</strong> {diagnosticsResult.database}</div>
                    )}
                    
                    {diagnosticsResult.environment && (
                      <div className="mt-2">
                        <strong>Environment Check:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>Supabase URL: {diagnosticsResult.environment.hasSupabaseUrl ? '✓' : '✗'}</li>
                          <li>Service Key: {diagnosticsResult.environment.hasServiceKey ? '✓' : '✗'}</li>
                          <li>OpenAI Key: {diagnosticsResult.environment.hasOpenAIKey ? '✓' : '✗'}</li>
                          <li>Google API Key: {diagnosticsResult.environment.hasGoogleKey ? '✓' : '✗'}</li>
                          <li>Replicate Key: {diagnosticsResult.environment.hasReplicateKey ? '✓' : '✗'}</li>
                        </ul>
                      </div>
                    )}
                    
                    {diagnosticsResult.error && (
                      <div className="mt-2 text-red-600">
                        <strong>Error:</strong> {diagnosticsResult.error}
                      </div>
                    )}
                    
                    {diagnosticsResult.message && (
                      <div className="mt-2 text-green-600">
                        <strong>Message:</strong> {diagnosticsResult.message}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Story Generation Test
          </CardTitle>
          <CardDescription>
            Test the complete story generation pipeline to identify specific issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testStoryGeneration}
            disabled={isTestingStory}
            className="w-full"
            variant="outline"
          >
            {isTestingStory ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Testing Story Generation...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Test Story Generation
              </>
            )}
          </Button>

          {storyTestResult && (
            <Alert className={storyTestResult.status === 'success' ? 'border-green-200' : 'border-red-200'}>
              <div className="flex items-center gap-2">
                {getStatusIcon(storyTestResult.status)}
                <AlertDescription className="flex-1">
                  <div className="space-y-2">
                    <div><strong>Status:</strong> {storyTestResult.status}</div>
                    <div><strong>Duration:</strong> {storyTestResult.duration}ms</div>
                    <div><strong>Timestamp:</strong> {new Date(storyTestResult.timestamp).toLocaleString()}</div>
                    
                    {storyTestResult.error && (
                      <div className="mt-2">
                        <div className="text-red-600"><strong>Error:</strong> {storyTestResult.error}</div>
                        {storyTestResult.errorCode && (
                          <div className="text-red-600"><strong>Error Code:</strong> {storyTestResult.errorCode}</div>
                        )}
                        {storyTestResult.errorType && (
                          <div className="text-red-600"><strong>Error Type:</strong> {storyTestResult.errorType}</div>
                        )}
                      </div>
                    )}
                    
                    {storyTestResult.data && (
                      <div className="mt-2">
                        <div className="text-green-600"><strong>Success:</strong> Story segment generated</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>Story ID:</strong> {storyTestResult.data.story_id}<br/>
                          <strong>Segment ID:</strong> {storyTestResult.data.id}<br/>
                          <strong>Text Length:</strong> {storyTestResult.data.segment_text?.length || 0} characters<br/>
                          <strong>Choices:</strong> {storyTestResult.data.choices?.length || 0}
                        </div>
                      </div>
                    )}
                    
                    {storyTestResult.testPayload && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">Test Payload</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded">
                          {JSON.stringify(storyTestResult.testPayload, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {storyTestResult.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-red-600">Stack Trace</summary>
                        <pre className="text-xs mt-1 p-2 bg-red-50 rounded text-red-800">
                          {storyTestResult.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This test creates a minimal story segment to verify the complete pipeline including database operations, AI generation, and response formatting.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Database Connection Test
          </CardTitle>
          <CardDescription>
            Test the connection to your Supabase database and authentication service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testDatabaseConnection}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
