
import React from 'react';
import { toast } from 'sonner';
import StoryModeToggle from './StoryModeToggle';
import StoryCreateMode from './StoryCreateMode';
import StoryPlayerMode from './StoryPlayerMode';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StoryMainContentProps {
  viewMode: 'create' | 'player';
  allStorySegments: StorySegment[];
  currentStorySegment: StorySegment | null;
  currentChapterIndex: number;
  segmentCount: number;
  maxSegments: number;
  showHistory: boolean;
  audioPlaying: boolean;
  isGenerating: boolean;
  prompt: string;
  storyId?: string;
  storyTitle: string;
  narrationAudioUrl?: string | null;
  isStoryCompleted: boolean;
  onSwitchToCreate: () => Promise<void>;
  onSwitchToPlayer: () => Promise<void>;
  onChapterChange: (index: number) => void;
  onToggleHistory: () => void;
  onToggleAudio: () => void;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  onFinishStory: () => Promise<void>;
  onChapterNavigate: (index: number) => void;
  onAudioGenerated: (audioUrl: string) => Promise<void>;
  skipImage?: boolean;
  onSkipImageChange?: (skipImage: boolean) => void;
}

const StoryMainContent: React.FC<StoryMainContentProps> = ({
  viewMode,
  allStorySegments,
  currentStorySegment,
  currentChapterIndex,
  segmentCount,
  maxSegments,
  showHistory,
  audioPlaying,
  isGenerating,
  prompt,
  onSwitchToCreate,
  onSwitchToPlayer,
  onChapterChange,
  onToggleHistory,
  onToggleAudio,
  onChoiceSelect,
  onFinishStory,
  onChapterNavigate,
  onAudioGenerated,
  skipImage = false,
  onSkipImageChange
}) => {
  const handleSwitchToPlayer = async () => {
    if (allStorySegments.length > 0) {
      console.log('🎬 Switching to player mode...');
      await onSwitchToPlayer();
    } else {
      toast.error('No story segments available for playback');
    }
  };

  return (
    <>
      <StoryModeToggle
        viewMode={viewMode}
        onSwitchToCreate={onSwitchToCreate}
        onSwitchToPlayer={handleSwitchToPlayer}
        hasSegments={allStorySegments.length > 0}
      />

      {/* Main content area that changes based on mode */}
      <div className="main-content-area">
        {viewMode === 'player' && allStorySegments.length > 0 ? (
          <StoryPlayerMode
            allStorySegments={allStorySegments}
            currentStorySegment={currentStorySegment}
            currentChapterIndex={currentChapterIndex}
            onChapterChange={onChapterChange}
          />
        ) : (
          <StoryCreateMode
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
            onSwitchToPlayer={handleSwitchToPlayer}
            onToggleAudio={onToggleAudio}
            onChoiceSelect={onChoiceSelect}
            onFinishStory={onFinishStory}
            onChapterNavigate={onChapterNavigate}
            onChapterChange={onChapterChange}
            onAudioGenerated={onAudioGenerated}
            skipImage={skipImage}
            onSkipImageChange={onSkipImageChange}
          />
        )}
      </div>
    </>
  );
};

export default StoryMainContent;
