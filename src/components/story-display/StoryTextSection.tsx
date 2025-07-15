
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface StoryTextSectionProps {
  segmentText: string;
  segmentCount: number;
  audioUrl?: string;
  audioPlaying: boolean;
  onToggleAudio: () => void;
  isStoryComplete?: boolean;
}

const StoryTextSection: React.FC<StoryTextSectionProps> = React.memo(({
  segmentText,
  segmentCount,
  audioUrl,
  audioPlaying,
  onToggleAudio
}) => {
  return (
    <div className="story-text-section w-full">
      <Card className="bg-slate-800/80 border-amber-500/20 shadow-inner">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-serif text-lg md:text-xl">
              Chapter {segmentCount}
            </CardTitle>
            {/* Show audio controls whenever audio exists, regardless of story completion */}
            {audioUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleAudio}
                className="text-amber-400 hover:text-amber-300 p-2"
              >
                {audioPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-8">
          <div className="prose prose-invert max-w-none">
            <div 
              className="text-gray-100 text-base md:text-lg leading-relaxed font-serif whitespace-pre-wrap"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {segmentText}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Display name for debugging
StoryTextSection.displayName = 'StoryTextSection';

export default StoryTextSection;
