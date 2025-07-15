
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

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
  if (!choices || choices.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/90 border-2 border-amber-500/30 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-8 space-y-6">
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
            <Button
              key={index}
              onClick={() => onChoiceSelect(choice)}
              disabled={isGenerating}
              variant="outline"
              className="group w-full text-left justify-start border-2 border-amber-500/40 text-amber-100 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-amber-600/20 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-500 min-h-fit py-6 px-8 text-lg font-medium bg-gradient-to-r from-slate-800/80 to-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:-translate-y-1"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-start gap-4">
                  <span className="text-amber-400 font-bold text-xl bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                    {index + 1}.
                  </span>
                  <span className="leading-relaxed text-amber-100 group-hover:text-amber-50 transition-colors duration-300">
                    {choice}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
              </div>
            </Button>
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
