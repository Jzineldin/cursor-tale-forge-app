
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
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
}

const StorySegmentViewer: React.FC<StorySegmentViewerProps> = ({
  segment,
  chapterNumber,
  audioPlaying,
  onToggleAudio,
  showChoices,
  isGenerating,
  onChoiceSelect,
  skipImage = false,
  onSkipImageChange
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl rounded-2xl p-4 space-y-4">
      {/* Chapter Header */}
      <div className="text-center pb-3 border-b border-amber-500/30">
        <h2 className="fantasy-heading text-xl md:text-2xl font-bold text-amber-400">
          Chapter {chapterNumber}
        </h2>
      </div>

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
          skipImage={skipImage}
          onSkipImageChange={onSkipImageChange}
        />
      )}
    </div>
  );
};

export default StorySegmentViewer;
