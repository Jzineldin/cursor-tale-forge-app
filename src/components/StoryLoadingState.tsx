
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Image, Volume2 } from 'lucide-react';

interface StoryLoadingStateProps {
  skipImage?: boolean;
  skipAudio?: boolean;
}

export const StoryLoadingState: React.FC<StoryLoadingStateProps> = ({
  skipImage = false,
  skipAudio = false
}) => {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-amber-400 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 border-2 border-amber-400 rounded-full animate-spin opacity-30"></div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            Crafting Your Story...
          </h3>
          
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span>Generating story text...</span>
            </div>
            
            {!skipImage && (
              <div className="flex items-center justify-center gap-2">
                <Image className="h-4 w-4 text-purple-400" />
                <span>Creating visual scene...</span>
              </div>
            )}
            
            {!skipAudio && (
              <div className="flex items-center justify-center gap-2">
                <Volume2 className="h-4 w-4 text-green-400" />
                <span>Generating narration...</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-400 mt-6">
            This usually takes 30-60 seconds. Please wait...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
