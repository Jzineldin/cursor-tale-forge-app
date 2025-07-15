
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flag } from 'lucide-react';

interface StoryChoicesProps {
  choices: string[];
  isEnd: boolean;
  onSelectChoice: (choice: string) => void;
  onFinishStory: () => void;
  onRestart: () => void;
  isLoading: boolean;
  isFinishingStory: boolean;
}

const StoryChoices: React.FC<StoryChoicesProps> = React.memo(({
  choices,
  isEnd,
  onSelectChoice,
  onFinishStory,
  onRestart,
  isLoading,
  isFinishingStory
}) => {
  // Memoize choice handlers to prevent unnecessary re-renders
  const handleChoiceClick = useCallback((choice: string) => {
    onSelectChoice(choice);
  }, [onSelectChoice]);

  // Memoize the choice buttons to prevent recreation on every render
  const choiceButtons = useMemo(() => {
    return choices.map((choice, index) => (
      <Button
        key={`choice-${index}-${choice}`}
        onClick={() => handleChoiceClick(choice)}
        disabled={isLoading}
        variant="outline"
        className="border-purple-600 text-purple-300 hover:bg-purple-700 text-left justify-start p-4 h-auto w-full transition-all duration-200 group"
      >
        <div className="flex items-center w-full">
          <span className="flex-1 text-left">{choice}</span>
          <ArrowRight className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </Button>
    ));
  }, [choices, isLoading, handleChoiceClick]);
  if (isEnd) {
    return (
      <div className="space-y-4 w-full max-w-full">
        <div className="text-center">
          <p className="text-purple-300 text-xl font-serif mb-6">The End</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <Button
              onClick={onRestart}
              variant="outline"
              className="border-purple-600 text-purple-300 hover:bg-purple-700 w-full sm:w-auto"
            >
              Start New Story
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      <h3 className="text-purple-300 text-lg font-semibold mb-4">What happens next?</h3>
      <div className="space-y-3 w-full">
        {choiceButtons}
      </div>
      
      <div className="pt-4 border-t border-purple-600/30">
        <Button
          onClick={onFinishStory}
          disabled={isFinishingStory}
          variant="outline"
          className="w-full border-amber-600/50 text-amber-300 hover:bg-amber-700/20 hover:border-amber-500 transition-colors duration-200"
        >
          <Flag className="mr-2 h-4 w-4" />
          {isFinishingStory ? 'Finishing Story...' : 'End Story Here'}
        </Button>
      </div>
    </div>
  );
});

// Display name for debugging
StoryChoices.displayName = 'StoryChoices';

export default StoryChoices;
