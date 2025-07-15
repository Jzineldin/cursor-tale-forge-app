
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Flag, Crown } from 'lucide-react';
import VoiceSelectionDialog from './VoiceSelectionDialog';
import EnhancedAudioPlayer from './EnhancedAudioPlayer';
import StorySegmentsDisplay from './StorySegmentsDisplay';
import StoryActionButtons from './StoryActionButtons';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryEndSectionProps {
  isEnd: boolean;
  isGenerating: boolean;
  onFinishStory: () => void;
  storySegments?: Array<{
    id: string;
    segment_text: string;
    image_url?: string;
    triggering_choice_text?: string;
    created_at: string;
  }>;
  storyId?: string;
  storyTitle?: string;
}

const StoryEndSection: React.FC<StoryEndSectionProps> = ({
  isEnd,
  isGenerating,
  onFinishStory,
  storySegments = [],
  storyId = '',
  storyTitle = 'Your Epic Adventure'
}) => {
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleAudioGenerated = (url: string) => {
    setAudioUrl(url);
  };

  // Transform the segments to match StorySegment interface
  const transformedSegments: StorySegment[] = storySegments.map(segment => ({
    ...segment,
    storyId: storyId,
    text: segment.segment_text,
    imageUrl: segment.image_url || '',
    audioUrl: '',
    isEnd: false,
    choices: [],
    story_id: storyId,
    segment_text: segment.segment_text,
    image_url: segment.image_url || '',
    audio_url: '',
    is_end: false,
    image_generation_status: 'completed',
    audio_generation_status: 'not_started',
    created_at: segment.created_at,
    word_count: segment.segment_text?.split(/\s+/).length || 0,
    audio_duration: 0,
    triggering_choice_text: segment.triggering_choice_text || ''
  }));

  if (isEnd) {
    return (
      <div className="space-y-8">
        {/* Story Complete Header */}
        <Card className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/30 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-amber-300 flex items-center justify-center gap-2">
              <Crown className="h-8 w-8" />
              Story Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-gray-300 mb-2">🎉 The End 🎉</p>
            <p className="text-gray-400">Your adventure has reached its conclusion!</p>
            <div className="mt-4 text-sm text-amber-300">
              <span className="font-semibold">{storyTitle}</span> • {storySegments.length} chapters
            </div>
          </CardContent>
        </Card>

        {/* Voice Generation Section - This is where users generate full story narration */}
        {!audioUrl && storySegments.length > 0 && (
          <Card className="bg-slate-800/80 border-amber-500/20 text-center">
            <CardHeader>
              <CardTitle className="text-amber-300 text-xl">🎙️ Generate Voice Narration</CardTitle>
              <p className="text-gray-300 text-sm">Transform your complete story into an immersive audio experience</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-amber-300/80">
                  Create professional narration for your entire {storySegments.length}-chapter story
                </p>
                <VoiceSelectionDialog
                  storyId={storyId}
                  storyTitle={storyTitle}
                  onAudioGenerated={handleAudioGenerated}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <EnhancedAudioPlayer
            audioUrl={audioUrl}
            storyTitle={storyTitle}
          />
        )}

        {/* Story Segments Display */}
        {transformedSegments.length > 0 && (
          <StorySegmentsDisplay
            segments={transformedSegments}
            storyTitle={storyTitle}
          />
        )}

        {/* Action Buttons */}
        <StoryActionButtons
          storyId={storyId}
          storyTitle={storyTitle}
        />
      </div>
    );
  }

  return (
    <div className="end-story-section w-full pt-6 border-t border-amber-500/20">
      <Button
        onClick={onFinishStory}
        disabled={isGenerating}
        variant="outline"
        className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-300 py-3 text-lg font-medium bg-slate-800/60"
      >
        <Flag className="mr-3 h-5 w-5" />
        End Story Here
      </Button>
    </div>
  );
};

export default StoryEndSection;
