
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryChoicesSectionProps {
  choices: string[];
  isGenerating: boolean;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
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
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4">
      <div className="text-center mb-3">
        <h3 className="fantasy-heading text-lg font-bold text-white mb-1 flex items-center justify-center gap-2">
          <span className="text-xl">✨</span>
          What happens next? ✨
        </h3>
        <p className="fantasy-subtitle text-amber-200 text-xs">
          Choose your path and continue the adventure
        </p>
      </div>
      
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <div key={index} className="space-y-2">
            <button
              onClick={() => onChoiceSelect(choice, skipImage)}
              disabled={isGenerating}
              className="
                block w-full text-left p-2 rounded-lg 
                bg-white/10 hover:bg-white/20 
                border border-white/20 hover:border-amber-400/50 
                transition-all duration-300 text-white text-xs
                disabled:opacity-50 disabled:cursor-not-allowed
                group
                fantasy-subtitle
              "
            >
              <div className="flex items-start gap-3">
                <span className="
                  text-amber-400 font-bold text-base
                  flex-shrink-0 mt-0.5 group-hover:text-amber-300
                  transition-colors duration-300
                ">
                  {index + 1}.
                </span>
                <span className="
                  leading-relaxed text-left flex-1 
                  word-wrap break-words group-hover:text-amber-100
                  transition-colors duration-300
                ">
                  {choice}
                </span>
              </div>
            </button>
            

          </div>
        ))}
        
        {/* Single image generation toggle for all choices */}
        {onSkipImageChange && (
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/10">
            <label className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={skipImage}
                onChange={(e) => onSkipImageChange(e.target.checked)}
                className="w-3 h-3 text-amber-500 bg-slate-700 border-amber-400 rounded focus:ring-amber-500 focus:ring-1"
              />
              <span className="fantasy-subtitle">Skip image generation for next segment</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryChoicesSection;
