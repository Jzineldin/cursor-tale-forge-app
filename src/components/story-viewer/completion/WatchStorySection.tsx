import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface WatchStorySectionProps {
  hasAudio: boolean;
  onWatchStory: () => void;
}

const WatchStorySection: React.FC<WatchStorySectionProps> = ({
  hasAudio,
  onWatchStory
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-200 flex items-center gap-2">
          <span className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">4</span>
          Experience Your Story
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-blue-300 mb-6">
          Watch your complete story as an immersive slideshow experience
        </p>
        <Button 
          onClick={onWatchStory}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg"
        >
          <Eye className="mr-2 h-6 w-6" />
          🎬 Watch Your Story
        </Button>
        {hasAudio && (
          <p className="text-blue-400 text-sm mt-2">
            ✨ Complete with voice narration
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchStorySection;