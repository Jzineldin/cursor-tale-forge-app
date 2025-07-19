import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { CostConfirmationDialog } from '@/components/CostConfirmationDialog';
import StoryDisplayLayout from '@/components/story-display/StoryDisplayLayout';
import CompleteStoryViewer from './CompleteStoryViewer';
import StoryErrorState from './StoryErrorState';
import StoryLoadingState from './StoryLoadingState';
import StoryImageSection from './StoryImageSection';
import StoryTextSection from './StoryTextSection';
import StoryChoicesSection from './StoryChoicesSection';
import StoryEndSection from './StoryEndSection';
import VoiceGenerationSection from './VoiceGenerationSection';
import StoryImageSettings from './StoryImageSettings';
import SaveIndicator from '@/components/ui/SaveIndicator';
import { useInlineStoryGeneration } from '@/hooks/story-creation/useInlineStoryGeneration';
import { useSaveStatus } from '@/hooks/useSaveStatus';

interface InlineStoryCreationProps {
  onExit: () => void;
  resumeStoryId?: string;
  resumeStoryTitle?: string;
}

const InlineStoryCreation: React.FC<InlineStoryCreationProps> = ({ onExit, resumeStoryId, resumeStoryTitle }) => {
  const navigate = useNavigate();
  const { saveStatus, saveMessage } = useSaveStatus();
  const {
    currentSegment,
    storyHistory,
    showCostDialog,
    pendingAction,
    skipImage,
    apiCallsCount,
    error,
    selectedVoice,
    fullStoryAudioUrl,
    isCurrentlyGenerating,
    generateAudioMutation,
    showImageSettings,
    setShowCostDialog,
    setSkipImage,
    setSelectedVoice,
    handleFinishStory,
    showConfirmation,
    confirmGeneration,
    resetStory
  } = useInlineStoryGeneration();

  const handleStoryFinish = () => {
    handleFinishStory(false, (storyId: string) => {
      console.log('🎯 Story completed, redirecting to story view:', storyId);
      navigate(`/story/${storyId}`, { replace: true });
    });
  };

  // Show error state
  if (error && !isCurrentlyGenerating) {
    return (
      <StoryErrorState
        error={error}
        onRetry={resetStory}
        onExit={onExit}
      />
    );
  }

  // Show loading state during initial generation
  if (isCurrentlyGenerating && !currentSegment) {
    return (
      <StoryLoadingState
        apiCallsCount={apiCallsCount}
        onExit={onExit}
      />
    );
  }

  // Show complete story viewer when story is finished and has audio
  if (currentSegment?.isEnd && fullStoryAudioUrl) {
    return (
      <StoryDisplayLayout>
        <CompleteStoryViewer
          storyHistory={storyHistory}
          fullStoryAudioUrl={fullStoryAudioUrl}
          onExit={onExit}
        />
      </StoryDisplayLayout>
    );
  }

  // Show image settings before story starts
  if (showImageSettings && !currentSegment) {
    return (
      <StoryDisplayLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
            <StoryImageSettings
              skipImage={skipImage}
              onSkipImageChange={setSkipImage}
            />
            <div className="text-center">
              <p className="text-gray-300 text-base sm:text-lg mb-3 sm:mb-4">Your story is ready to begin!</p>
              <p className="text-gray-400 text-sm">Story generation will start automatically...</p>
            </div>
          </div>
        </div>
      </StoryDisplayLayout>
    );
  }

  // Show story display once we have content
  if (currentSegment) {
    return (
      <>
        <SaveIndicator status={saveStatus} message={saveMessage} />
        <StoryDisplayLayout>
          {/* Resume Banner */}
          {resumeStoryId && (
            <div className="w-full max-w-4xl mx-auto mb-4 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 text-blue-300">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Continuing your story</p>
                  <p className="text-sm text-blue-200/80">{resumeStoryTitle || 'Untitled Story'}</p>
                </div>
              </div>
            </div>
          )}
          
          <Card className="w-full max-w-4xl mx-auto bg-slate-900/95 border-amber-500/30 backdrop-blur-sm shadow-2xl m-2 sm:m-4 overflow-hidden">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 overflow-hidden">
            <CardTitle className="text-white text-xl sm:text-2xl font-serif flex items-center justify-center gap-2 overflow-hidden">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 flex-shrink-0" />
              <span className="truncate">{currentSegment.isEnd ? "Story Complete!" : "Your Story Continues"}</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6 overflow-hidden">
            <StoryImageSection
              imageUrl={currentSegment.imageUrl}
              imageGenerationStatus={currentSegment.imageGenerationStatus}
            />

            <StoryTextSection text={currentSegment.text} />

            {!currentSegment.isEnd && (
              <StoryChoicesSection
                choices={currentSegment.choices}
                isGenerating={isCurrentlyGenerating}
                onChoiceSelect={(choice) => showConfirmation('choice', choice)}
                skipImage={skipImage}
                onSkipImageChange={setSkipImage}
              />
            )}

            <StoryEndSection
              isEnd={currentSegment.isEnd}
              isGenerating={isCurrentlyGenerating}
              onFinishStory={handleStoryFinish}
              onExit={onExit}
            />

            {currentSegment.isEnd && !fullStoryAudioUrl && (
              <VoiceGenerationSection
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                onGenerateAudio={() => showConfirmation('audio')}
                isGenerating={generateAudioMutation.isPending}
              />
            )}
          </CardContent>
        </Card>

        <CostConfirmationDialog
          open={showCostDialog}
          onOpenChange={setShowCostDialog}
          onConfirm={confirmGeneration}
          pendingAction={pendingAction}
          skipImage={skipImage}
          skipAudio={true}
          onSkipImageChange={setSkipImage}
          onSkipAudioChange={() => {}}
          apiUsageCount={apiCallsCount}
          showAudioOption={false}
        />
      </StoryDisplayLayout>
      </>
    );
  }

  return null;
};

export default InlineStoryCreation;
