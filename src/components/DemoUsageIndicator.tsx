import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { getDemoUsage, DemoUsage } from '@/utils/demo-protection';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DemoUsageIndicator: React.FC = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<DemoUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email === 'demo@tale-forge.app') {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const usageData = await getDemoUsage();
      setUsage(usageData);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== 'demo@tale-forge.app' || !usage) return null;

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card className="w-full max-w-md bg-slate-800/90 border-amber-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-300 text-lg">
          🎭 Demo Usage Today
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsage}
            disabled={loading}
            className="p-1 h-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          {/* Voice Usage */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">🎵 Voice Generation</span>
              <span className={`text-sm font-medium ${getUsageTextColor(usage.voice, usage.limits.voice)}`}>
                {usage.voice}/{usage.limits.voice}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usage.voice, usage.limits.voice)} 
              className="h-2"
              indicatorClassName={getUsageColor(usage.voice, usage.limits.voice)}
            />
          </div>

          {/* Story Usage */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">📝 Story Creation</span>
              <span className={`text-sm font-medium ${getUsageTextColor(usage.story, usage.limits.story)}`}>
                {usage.story}/{usage.limits.story}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usage.story, usage.limits.story)} 
              className="h-2"
              indicatorClassName={getUsageColor(usage.story, usage.limits.story)}
            />
          </div>

          {/* Image Usage */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">🎨 Image Generation</span>
              <span className={`text-sm font-medium ${getUsageTextColor(usage.image, usage.limits.image)}`}>
                {usage.image}/{usage.limits.image}
              </span>
            </div>
            <Progress 
              value={getUsagePercentage(usage.image, usage.limits.image)} 
              className="h-2"
              indicatorClassName={getUsageColor(usage.image, usage.limits.image)}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-gray-400 text-center">
            Limits reset daily. Sign up for unlimited access! ✨
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoUsageIndicator; 