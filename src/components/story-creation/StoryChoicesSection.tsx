
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, Image } from 'lucide-react';

interface StoryChoicesSectionProps {
  choices: string[];
  isGenerating: boolean;
  onChoiceSelect: (choice: string) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
}

const StoryChoicesSection: React.FC<StoryChoicesSectionProps> = ({
  choices,
  isGenerating,
  onChoiceSelect,
  skipImage = false,
  onSkipImageChange
}) => {
  if (!choices || choices.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/90 border-2 border-amber-500/30 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-8 space-y-6">
        {/* Image Generation Toggle */}
        {onSkipImageChange && (
          <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border-2 border-amber-500/50 p-6 rounded-xl backdrop-blur-sm">
            <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Next Chapter Settings
            </h4>
            <p className="text-amber-200 text-sm mb-4 leading-relaxed">
              Choose whether to include AI-generated images with the next chapter
            </p>
            <div className="flex items-center space-x-3 bg-amber-900/30 p-4 rounded-lg">
              <input
                type="checkbox"
                id="skip-image-next"
                checked={skipImage}
                onChange={(e) => onSkipImageChange(e.target.checked)}
                className="w-4 h-4 text-amber-500 bg-slate-700 border-amber-400 rounded focus:ring-amber-500 focus:ring-2"
              />
              <label htmlFor="skip-image-next" className="text-amber-200 cursor-pointer flex-1 text-sm">
                Skip image generation for next chapter (faster generation)
              </label>
            </div>
            {skipImage && (
              <p className="text-amber-300/70 text-xs mt-2">
                💡 You can always enable images for future chapters!
              </p>
            )}
          </div>
        )}

        {/* Magical header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
            <h3 className="text-2xl font-bold text-amber-300 drop-shadow-lg" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              What happens next?
            </h3>
            <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto rounded-full shadow-lg shadow-amber-500/30"></div>
        </div>

        {/* Enhanced choice buttons */}
        <div className="space-y-4">
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoiceSelect(choice)}
              disabled={isGenerating}
              className="
                group w-full text-left
                border-2 border-amber-500/40 rounded-lg
                text-amber-100 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-amber-600/20 
                hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 
                transition-all duration-500 min-h-fit py-6 px-8 
                text-lg font-medium bg-gradient-to-r from-slate-800/80 to-slate-700/80 
                disabled:opacity-50 disabled:cursor-not-allowed 
                transform hover:scale-[1.02] hover:-translate-y-1
                focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-amber-400 focus-visible:ring-offset-2
              "
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              <div className="flex items-start justify-between w-full gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="
                    text-amber-400 font-bold text-xl 
                    bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent 
                    drop-shadow-sm flex-shrink-0
                  ">
                    {index + 1}.
                  </span>
                  <span className="leading-relaxed">{choice}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-400/60 group-hover:text-amber-300 transition-colors duration-300 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {/* Magical particle effect */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-amber-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-2 right-1/3 w-1.5 h-1.5 bg-amber-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1 left-1/2 w-0.5 h-0.5 bg-amber-500 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryChoicesSection;
