
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Feather, Scroll, Wand2 } from 'lucide-react';
import StoryDisplayLayout from '@/components/story-display/StoryDisplayLayout';

interface StoryLoadingStateProps {
  apiCallsCount: number;
  onExit: () => void;
}

const StoryLoadingState: React.FC<StoryLoadingStateProps> = ({
  apiCallsCount,
  onExit
}) => {
  return (
    <StoryDisplayLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-3xl bg-slate-900/95 border-amber-500/30 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-amber-200 text-3xl font-serif flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 text-amber-400" />
              The TaleForge is Writing...
            </CardTitle>
            <p className="text-amber-300/80 text-lg">Weaving the threads of your destiny into an enchanted tale</p>
          </CardHeader>
          <CardContent className="text-center space-y-8">
            {/* Magical Animation Container */}
            <div className="relative flex items-center justify-center py-8">
              {/* Central Magical Scroll */}
              <div className="relative">
                <Scroll className="h-16 w-16 text-amber-400 animate-pulse" />
                <div className="absolute inset-0 h-16 w-16 border-2 border-amber-400/30 rounded-full animate-spin"></div>
                
                {/* Floating Magical Elements */}
                <div className="absolute -top-4 -left-4">
                  <div className="h-3 w-3 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '0s' }}></div>
                </div>
                <div className="absolute -top-4 -right-4">
                  <Feather className="h-5 w-5 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="absolute -bottom-4 -left-4">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce shadow-lg shadow-emerald-400/50" style={{ animationDelay: '1s' }}></div>
                </div>
                <div className="absolute -bottom-4 -right-4">
                  <Wand2 className="h-4 w-4 text-pink-400 animate-bounce" style={{ animationDelay: '1.5s' }} />
                </div>
              </div>
              
              {/* Magical Glow Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-amber-400/20 via-transparent to-transparent animate-pulse"></div>
            </div>

            {/* Enchanted Loading Messages */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-amber-300">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="font-serif text-lg">Summoning ancient words from the ether...</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-purple-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="font-serif">Enchanting your narrative with mystical imagery...</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-blue-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="font-serif">Binding the tale with threads of possibility...</span>
              </div>
            </div>

            {/* API Usage Counter - Styled as Mystical Rune */}
            <div className="bg-slate-800/60 border border-amber-500/30 rounded-lg p-4 mx-auto w-fit">
              <div className="flex items-center gap-2 text-amber-400">
                <Wand2 className="h-4 w-4" />
                <span className="text-sm font-mono">Spell Invocations: {apiCallsCount}</span>
              </div>
            </div>

            {/* Exit Button - Magical Style */}
            <Button 
              onClick={onExit} 
              variant="outline" 
              className="mt-6 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 hover:border-amber-400"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Sanctuary
            </Button>
          </CardContent>
        </Card>
      </div>
    </StoryDisplayLayout>
  );
};

export default StoryLoadingState;
