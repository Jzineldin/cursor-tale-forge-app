import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Volume2,
  Database
} from 'lucide-react';
import { 
  testEdgeFunction, 
  testRealtimeConnection, 
  testNetworkConnectivity,
  runFullDiagnostics,
  getDebugInfo,
  logDebugReport,
  downloadDebugReport
} from '@/utils/debugUtils';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: any;
  timestamp?: string;
}

const DebugPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const addTestResult = (name: string, status: TestResult['status'], result?: any, error?: any) => {
    setTestResults(prev => [
      ...prev.filter(t => t.name !== name),
      {
        name,
        status,
        result,
        error,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    addTestResult(testName, 'running');
    
    try {
      const result = await testFn();
      addTestResult(testName, 'success', result);
      return result;
    } catch (error) {
      addTestResult(testName, 'error', undefined, error);
      throw error;
    }
  };

  const testEdgeFunctionHandler = async () => {
    await runTest('Edge Function', () => testEdgeFunction('test-elevenlabs-voices'));
  };

  const testRealtimeHandler = async () => {
    await runTest('Realtime Connection', testRealtimeConnection);
  };

  const testNetworkHandler = async () => {
    await runTest('Network Connectivity', testNetworkConnectivity);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const result = await runFullDiagnostics();
      setDebugInfo(result);
      addTestResult('Full Diagnostics', 'success', result);
    } catch (error) {
      addTestResult('Full Diagnostics', 'error', undefined, error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Tale Forge Debug Panel
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={testEdgeFunctionHandler}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Test Edge Function
          </Button>
          
          <Button
            onClick={testRealtimeHandler}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Test Realtime
          </Button>
          
          <Button
            onClick={testNetworkHandler}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Wifi className="h-4 w-4" />
            Test Network
          </Button>
        </div>

        {/* Run All Tests */}
        <div className="flex items-center gap-4">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          <Button
            onClick={() => {
              logDebugReport();
              setDebugInfo(getDebugInfo());
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            Show Debug Info
          </Button>
          
          <Button
            onClick={downloadDebugReport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                
                {result.timestamp && (
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                )}
                
                {result.result && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600">
                      View Result
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                )}
                
                {result.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-red-600">
                      View Error
                    </summary>
                    <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Environment</h4>
                <div className="text-sm space-y-1">
                  <p>Node Env: {debugInfo.environment?.nodeEnv}</p>
                  <p>Supabase URL: {debugInfo.environment?.supabaseUrl ? 'Set' : 'Not Set'}</p>
                  <p>Anon Key: {debugInfo.environment?.hasAnonKey ? 'Set' : 'Not Set'}</p>
                  <p>Service Key: {debugInfo.environment?.hasServiceKey ? 'Set' : 'Not Set'}</p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Status</h4>
                <div className="text-sm space-y-1">
                  <p>Edge Function: {debugInfo.edgeFunction?.status}</p>
                  <p>Realtime: {debugInfo.realtime?.status}</p>
                  <p>Network: {debugInfo.network?.connectivity ? 'Connected' : 'Disconnected'}</p>
                  <p>Latency: {debugInfo.network?.latency || 'Unknown'}ms</p>
                </div>
              </div>
            </div>
            
            <details>
              <summary className="cursor-pointer text-sm font-medium text-blue-600">
                View Full Debug Info
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => {
                console.log('Supabase Client:', supabase);
                console.log('Environment Variables:', {
                  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
                  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
                });
              }}
              variant="outline"
              size="sm"
            >
              Log Supabase Config
            </Button>
            
            <Button
              onClick={() => {
                const channel = supabase.channel('test-channel');
                channel.subscribe((status, err) => {
                  console.log('Test Channel Status:', status, err);
                });
              }}
              variant="outline"
              size="sm"
            >
              Test Simple Channel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel; 