
import React from 'react';
import StoryHeader from './StoryHeader';

interface StoryDisplayLoadingStateProps {
  apiUsageCount: number;
  skipImage: boolean;
  onExit: () => void;
}

const StoryDisplayLoadingState: React.FC<StoryDisplayLoadingStateProps> = ({
  apiUsageCount,
  skipImage,
  onExit
}) => {
  return (
    <div 
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <StoryHeader 
          onExit={onExit}
          onSave={() => {
            console.log('⚠️ Story not loaded yet, cannot save');
          }}
          apiUsageCount={apiUsageCount}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-white max-w-md">
            <div className="flex justify-center mb-6 space-x-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
            </div>
            <h2 className="text-2xl font-serif mb-2">Crafting Your Story...</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <span>Generating story text...</span>
              </div>
              {!skipImage && (
                <div className="flex items-center justify-center gap-2">
                  <span>Creating visual scene...</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-6">
              This usually takes 30-60 seconds. Please wait...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplayLoadingState;
