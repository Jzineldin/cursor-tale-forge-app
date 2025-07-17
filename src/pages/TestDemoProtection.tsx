import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { checkDemoLimits, incrementDemoUsage, getDemoUsage } from '@/utils/demo-protection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const TestDemoProtection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<any>(null);

  const testDemoLimit = async (featureType: 'voice' | 'story' | 'image') => {
    setLoading(true);
    try {
      const result = await checkDemoLimits(featureType);
      console.log(`Demo limit check for ${featureType}:`, result);
      
      if (result.allowed) {
        toast.success(`${featureType} usage allowed! Current: ${result.currentUsage}/${result.limit}`);
      } else {
        toast.error(result.message || 'Usage limit reached');
      }
    } catch (error) {
      console.error('Demo limit check error:', error);
      toast.error('Failed to check demo limits');
    } finally {
      setLoading(false);
    }
  };

  const testIncrementUsage = async (featureType: 'voice' | 'story' | 'image') => {
    setLoading(true);
    try {
      await incrementDemoUsage(featureType);
      toast.success(`${featureType} usage incremented!`);
      
      // Refresh usage data
      const usageData = await getDemoUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Demo usage increment error:', error);
      toast.error('Failed to increment demo usage');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const usageData = await getDemoUsage();
      setUsage(usageData);
      console.log('Demo usage data:', usageData);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
      toast.error('Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Demo Protection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to test demo protection.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demo Protection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p><strong>Current User:</strong> {user.email}</p>
              <p><strong>Is Demo Account:</strong> {user.email === 'demo@tale-forge.app' ? 'Yes' : 'No'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Voice Generation</h3>
                <div className="space-x-2">
                  <Button 
                    onClick={() => testDemoLimit('voice')} 
                    disabled={loading}
                    size="sm"
                  >
                    Check Limit
                  </Button>
                  <Button 
                    onClick={() => testIncrementUsage('voice')} 
                    disabled={loading}
                    size="sm"
                    variant="outline"
                  >
                    Increment
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Story Creation</h3>
                <div className="space-x-2">
                  <Button 
                    onClick={() => testDemoLimit('story')} 
                    disabled={loading}
                    size="sm"
                  >
                    Check Limit
                  </Button>
                  <Button 
                    onClick={() => testIncrementUsage('story')} 
                    disabled={loading}
                    size="sm"
                    variant="outline"
                  >
                    Increment
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Image Generation</h3>
                <div className="space-x-2">
                  <Button 
                    onClick={() => testDemoLimit('image')} 
                    disabled={loading}
                    size="sm"
                  >
                    Check Limit
                  </Button>
                  <Button 
                    onClick={() => testIncrementUsage('image')} 
                    disabled={loading}
                    size="sm"
                    variant="outline"
                  >
                    Increment
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={fetchUsage} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Current Usage'}
              </Button>
            </div>

            {usage && (
              <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                <h3 className="font-semibold mb-2">Current Usage:</h3>
                <pre className="text-sm">{JSON.stringify(usage, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDemoProtection; 