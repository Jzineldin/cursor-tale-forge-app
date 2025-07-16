
import React from 'react';
import StoryTextSection from './StoryTextSection';
import StoryImageSection from './StoryImageSection';
import StoryChoicesSection from './StoryChoicesSection';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface StorySegmentViewerProps {
  segment: StorySegment;
  chapterNumber: number;
  audioPlaying: boolean;
  onToggleAudio: () => void;
  isStoryComplete: boolean;
  showChoices: boolean;
  isGenerating: boolean;
  onChoiceSelect: (choice: string) => void;
}

const StorySegmentViewer: React.FC<StorySegmentViewerProps> = ({
  segment,
  chapterNumber,
  audioPlaying,
  onToggleAudio,
  showChoices,
  isGenerating,
  onChoiceSelect
}) => {
  return (
    <div className="space-y-6 md:space-y-8">
      <StoryTextSection
        segmentText={segment.segment_text}
        segmentCount={chapterNumber}
        audioUrl={segment.audio_url || ''}
        audioPlaying={audioPlaying}
        onToggleAudio={onToggleAudio}
      />

      <StoryImageSection
        imageUrl={segment.image_url || ''}
        imageGenerationStatus={segment.image_generation_status}
        segmentId={segment.id}
      />

      {showChoices && !segment.is_end && (
        <StoryChoicesSection
          choices={segment.choices}
          isGenerating={isGenerating}
          onChoiceSelect={onChoiceSelect}
        />
      )}
    </div>
  );
};

export default StorySegmentViewer;
