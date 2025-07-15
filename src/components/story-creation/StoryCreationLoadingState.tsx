
import React from 'react';
import { Sparkles, Scroll, Feather, BookOpen } from 'lucide-react';

interface StoryCreationLoadingStateProps {
  message: string;
  submessage?: string;
}

const StoryCreationLoadingState: React.FC<StoryCreationLoadingStateProps> = () => {
  return (
    <div 
      className="flex items-center justify-center min-h-[60vh]"
      style={{
        background: `
          linear-gradient(rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)),
          url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="text-center text-white max-w-lg backdrop-blur-sm bg-slate-900/50 p-8 rounded-2xl border border-amber-500/30 shadow-2xl">
        {/* Magical Animation Container */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Central Magical Scroll */}
          <div className="relative">
            <Scroll className="h-16 w-16 text-amber-400 animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 border-2 border-amber-400/30 rounded-full animate-spin"></div>
            
            {/* Floating Magical Elements */}
            <div className="absolute -top-4 -left-4">
              <Sparkles className="h-6 w-6 text-amber-300 animate-bounce" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute -top-4 -right-4">
              <Feather className="h-5 w-5 text-amber-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute -bottom-4 -left-4">
              <Sparkles className="h-4 w-4 text-amber-400 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute -bottom-4 -right-4">
              <BookOpen className="h-5 w-5 text-amber-300 animate-bounce" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
          
          {/* Magical Glow Effect */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-400/20 via-transparent to-transparent animate-pulse"></div>
        </div>
        
        {/* Enhanced Messages */}
        <h2 className="text-3xl font-serif mb-4 text-amber-100 drop-shadow-lg">
          The TaleForge is Writing...
        </h2>
        <p className="text-amber-200/90 text-lg mb-8 font-medium drop-shadow-sm">
          Weaving the threads of your destiny into an enchanted tale
        </p>
        
        {/* Enchanted Progress Indicators */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-amber-300">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="font-serif text-base drop-shadow-sm">Summoning ancient words from the ether...</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-amber-200">
            <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="font-serif drop-shadow-sm">Enchanting your narrative with mystical imagery...</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-amber-100">
            <div className="w-2 h-2 bg-amber-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="font-serif drop-shadow-sm">Binding the tale with threads of possibility...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCreationLoadingState;
