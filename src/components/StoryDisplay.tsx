
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ImageIcon, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoryLoadingState from '@/components/story-viewer/StoryLoadingState';

interface StoryDisplayProps {
  storySegment: {
    storyId: string;
    text: string;
    imageUrl: string;
    choices: string[];
    isEnd: boolean;
    imageGenerationStatus?: string;
    segmentId?: string;
  };
  onSelectChoice: (choice: string) => void;
  onFinishStory: () => void;
  onRestart: () => void;
  isLoading: boolean;
  isFinishingStory: boolean;
  isEmbedded?: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  storySegment,
  onSelectChoice,
  onFinishStory,
  onRestart,
  isLoading,
  isFinishingStory,
  isEmbedded = false
}) => {
  const actualSegmentId = storySegment.segmentId || 'fallback';
  
  console.log('[StoryDisplay] Rendering with segment:', {
    segmentId: actualSegmentId,
    imageUrl: storySegment.imageUrl,
    imageGenerationStatus: storySegment.imageGenerationStatus,
    text_preview: storySegment.text?.substring(0, 50) + '...',
    isEnd: storySegment.isEnd
  });

  const containerClass = isEmbedded 
    ? "w-full bg-transparent" 
    : "min-h-screen bg-[#0c0f18] flex items-center justify-center p-4";

  const cardClass = isEmbedded 
    ? "w-full" 
    : "w-full max-w-4xl";

  const hasRealImage = storySegment.imageUrl && 
                      storySegment.imageUrl !== '/placeholder.svg' && 
                      storySegment.imageGenerationStatus === 'completed';

  if (isLoading) {
    return (
      <div className={containerClass}>
        <StoryLoadingState />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Card className={`${cardClass} bg-slate-900/95 border-amber-500/30 backdrop-blur-sm shadow-2xl`}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-white text-2xl font-serif flex items-center justify-center gap-2">
            <Wand2 className="h-6 w-6 text-amber-400" />
            {storySegment.isEnd ? "Story Complete!" : "Your Story Continues"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* SECTION 1: Large Story Image - Full width at top */}
          <div className="story-image-section w-full">
            {hasRealImage ? (
              <img
                src={storySegment.imageUrl}
                alt="AI generated story illustration"
                className="w-full max-w-4xl h-80 md:h-96 rounded-lg border border-amber-500/20 object-cover shadow-lg mx-auto"
              />
            ) : (
              <div className="w-full max-w-4xl h-80 md:h-96 rounded-lg border-2 border-dashed border-amber-500/30 bg-slate-800/50 flex flex-col items-center justify-center mx-auto">
                {storySegment.imageGenerationStatus === 'pending' ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
                    <p className="text-amber-300 text-lg">Creating your story image...</p>
                    <p className="text-amber-300/70 text-sm mt-2">This may take 30-60 seconds</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-16 w-16 text-amber-400/50 mb-4" />
                    <p className="text-amber-300/70 text-lg">Story Image</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Story Text Content */}
          <div className="story-text-section w-full">
            <Card className="bg-slate-800/80 border-amber-500/20 shadow-inner">
              <CardContent className="p-8">
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-100 text-lg leading-relaxed font-serif whitespace-pre-wrap"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {storySegment.text}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 3: Choice Buttons */}
          {!storySegment.isEnd && storySegment.choices && storySegment.choices.length > 0 && (
            <div className="choices-section w-full space-y-4">
              <h3 className="text-amber-300 text-xl font-semibold text-center mb-6">What happens next?</h3>
              <div className="space-y-3">
                {storySegment.choices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => onSelectChoice(choice)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full text-left justify-start border-amber-500/40 text-white hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-300 min-h-fit py-4 px-6 text-base font-medium bg-slate-800/60 hover:shadow-lg hover:shadow-amber-500/10"
                  >
                    <span className="text-amber-400 font-bold mr-4">{index + 1}.</span>
                    <span className="leading-relaxed">{choice}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: End Story Button */}
          {!storySegment.isEnd && (
            <div className="end-story-section w-full pt-6 border-t border-amber-500/20">
              <Button
                onClick={onFinishStory}
                disabled={isFinishingStory}
                variant="outline"
                className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-300 py-3 text-lg font-medium bg-slate-800/60"
              >
                <Flag className="mr-3 h-5 w-5" />
                {isFinishingStory ? 'Ending Story...' : 'End Story Here'}
              </Button>
            </div>
          )}

          {/* Story End State */}
          {storySegment.isEnd && (
            <div className="story-end-section text-center space-y-6 py-8">
              <div className="text-center">
                <p className="text-amber-300 text-2xl font-serif mb-6">🎉 The End 🎉</p>
                <p className="text-gray-300 text-lg mb-8">Your adventure has reached its conclusion!</p>
                <Button
                  onClick={onRestart}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start New Adventure
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryDisplay;
