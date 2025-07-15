
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
            <Button
              key={index}
              onClick={() => onChoiceSelect(choice)}
              disabled={isGenerating}
              variant="outline"
              className="w-full text-left justify-start border-amber-500/40 text-white hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-300 min-h-fit py-3 md:py-4 px-4 md:px-6 text-sm md:text-base font-medium bg-slate-800/60 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <span className="text-amber-400 font-bold mr-3 md:mr-4 text-sm md:text-base">
                {index + 1}.
              </span>
              <span className="leading-relaxed text-left">{choice}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryChoicesSection;
