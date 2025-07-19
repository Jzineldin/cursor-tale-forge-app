
import React from 'react';
import StoryImage from '@/components/story-viewer/StoryImage';

interface StoryImageSectionProps {
  imageUrl?: string;
  imageGenerationStatus?: string;
  segmentId?: string;
  onRetry?: () => void;
}

const StoryImageSection: React.FC<StoryImageSectionProps> = React.memo(({
  imageUrl,
  imageGenerationStatus,
  segmentId,
  onRetry
}) => {
  console.log('[StoryImageSection] Rendering with:', {
    imageUrl,
    imageGenerationStatus,
    hasImageUrl: !!imageUrl,
    segmentId
  });

  return (
    <div className="story-image-section w-full">
      <StoryImage
        imageUrl={imageUrl || null}
        imageGenerationStatus={imageGenerationStatus || 'pending'}
        altText="AI generated story illustration"
        className="w-full max-w-4xl h-64 md:h-80 rounded-lg shadow-lg mx-auto"
        segmentId={segmentId || ''}
        {...(onRetry && { onRetry })}
      />
    </div>
  );
});

// Display name for debugging
StoryImageSection.displayName = 'StoryImageSection';

export default StoryImageSection;
