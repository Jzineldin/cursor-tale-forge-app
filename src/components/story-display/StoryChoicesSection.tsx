
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryChoicesSectionProps {
  choices: string[];
  isGenerating: boolean;
  onChoiceSelect: (choice: string) => void;
}

const StoryChoicesSection: React.FC<StoryChoicesSectionProps> = ({
  choices,
  isGenerating,
  onChoiceSelect
}) => {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/60 border-amber-500/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-amber-300 text-lg md:text-xl font-semibold text-center">
          What happens next?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoiceSelect(choice)}
              disabled={isGenerating}
              className="
                flex items-start gap-3 w-full text-left
                border border-amber-500/40 rounded-lg
                bg-slate-800/60 text-white
                hover:bg-amber-500/20 hover:border-amber-400
                transition-all duration-300
                p-4 min-h-fit
                hover:shadow-lg hover:shadow-amber-500/10
                focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-amber-400 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <span className="
                text-amber-400 font-bold text-sm md:text-base
                flex-shrink-0 mt-0.5
              ">
                {index + 1}.
              </span>
              <span className="
                leading-relaxed text-left text-sm md:text-base
                flex-1 word-wrap break-words
              ">
                {choice}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryChoicesSection;
