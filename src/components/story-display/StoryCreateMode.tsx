
import React from 'react';
import StoryContentArea from '@/components/story-display/StoryContentArea';
import EnhancedStoryHistorySidebar from '@/components/story-display/EnhancedStoryHistorySidebar';

import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryCreateModeProps {
  currentStorySegment: StorySegment | null;
  allStorySegments: StorySegment[];
  segmentCount: number;
  maxSegments: number;
  showHistory: boolean;
  audioPlaying: boolean;
  isGenerating: boolean;
  prompt: string;
  currentChapterIndex: number;
  onToggleHistory: () => void;
  onSwitchToPlayer: () => void;
  onToggleAudio: () => void;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  onFinishStory: () => void;
  onChapterNavigate: (index: number) => void;
  onChapterChange: (index: number) => void;
  onAudioGenerated?: (audioUrl: string) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
}

const StoryCreateMode: React.FC<StoryCreateModeProps> = ({
  currentStorySegment,
  allStorySegments,
  segmentCount,
  maxSegments,
  showHistory,
  audioPlaying,
  isGenerating,
  prompt,
  currentChapterIndex,
  onToggleHistory,
  onSwitchToPlayer,
  onToggleAudio,
  onChoiceSelect,
  onFinishStory,
  onChapterChange,
  skipImage = false,
  onSkipImageChange
}) => {
  const storyTitle = prompt.substring(0, 50) + '...';

  const handleSidebarChapterClick = (chapterIndex: number) => {
    console.log('Sidebar clicked chapter:', chapterIndex);
    console.log('Calling onChapterChange with index:', chapterIndex);
    onChapterChange(chapterIndex);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 space-y-4">
          <StoryContentArea
            currentStorySegment={currentStorySegment}
            allStorySegments={allStorySegments}
            segmentCount={segmentCount}
            maxSegments={maxSegments}
            showHistory={showHistory}
            audioPlaying={audioPlaying}
            isGenerating={isGenerating}
            prompt={prompt}
            currentChapterIndex={currentChapterIndex}
            onToggleHistory={onToggleHistory}
            onSwitchToPlayer={onSwitchToPlayer}
            onToggleAudio={onToggleAudio}
            onChoiceSelect={onChoiceSelect}
            onFinishStory={onFinishStory}
            onChapterChange={onChapterChange}
            skipImage={skipImage}
            onSkipImageChange={onSkipImageChange}
          />
        </div>

        {showHistory && allStorySegments.length > 0 && (
          <EnhancedStoryHistorySidebar
            storySegments={allStorySegments}
            currentSegmentId={currentStorySegment?.id || ''}
            storyTitle={storyTitle}
            onSegmentClick={handleSidebarChapterClick}
            currentChapterIndex={currentChapterIndex}
          />
        )}
      </div>
    </div>
  );
};

export default StoryCreateMode;
