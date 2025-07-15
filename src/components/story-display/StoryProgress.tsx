
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StoryProgressProps {
  segmentCount: number;
  maxSegments: number;
}

const StoryProgress: React.FC<StoryProgressProps> = ({
  segmentCount,
  maxSegments
}) => {
  const progressPercentage = (segmentCount / maxSegments) * 100;

  return (
    <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Story Progress</span>
          <span className="text-amber-400 text-sm">{segmentCount}/{maxSegments}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardContent>
    </Card>
  );
};

export default StoryProgress;
