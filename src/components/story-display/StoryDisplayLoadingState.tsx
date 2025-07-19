
import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Star, ArrowLeft, BookOpen, Feather, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { heroGrad, spinner } from '@/components/ui/theme';

interface StoryDisplayLoadingStateProps {
  onExit: () => void;
}

const StoryDisplayLoadingState: React.FC<StoryDisplayLoadingStateProps> = ({
  onExit
}) => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const rotatingMessages = [
    "✨ Crafting your magical story...",
    "🎭 Bringing characters to life...",
    "📖 Weaving your adventure...",
    "🌟 Almost ready for story time!",
    "🦄 Summoning magical creatures...",
    "🏰 Building enchanted worlds...",
    "💫 Spinning tales of wonder...",
    "🎪 Preparing your grand adventure..."
  ];

  const loadingSteps = [
    { icon: BookOpen, text: "Opening the storybook...", color: "text-blue-400" },
    { icon: Feather, text: "Writing the first chapter...", color: "text-purple-400" },
    { icon: Wand2, text: "Casting magical spells...", color: "text-amber-400" },
    { icon: Sparkles, text: "Adding sparkles and wonder...", color: "text-pink-400" },
    { icon: Star, text: "Creating starry moments...", color: "text-white" },
    { icon: Sparkle, text: "Finalizing your tale...", color: "text-green-400" }
  ];

  useEffect(() => {
    // Rotate through messages every 2.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % rotatingMessages.length);
    }, 2500);

    // Rotate through loading steps every 2 seconds
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div 
      className="min-h-screen bg-slate-900 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Enhanced floating magical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-magical-float ${
              i % 3 === 0 ? 'w-2 h-2 bg-amber-400' : 
              i % 3 === 1 ? 'w-1 h-1 bg-purple-400' : 
              'w-1.5 h-1.5 bg-pink-400'
            } opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Larger magical orbs */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute w-3 h-3 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 10)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 pt-8 pb-4 relative z-10">
        {/* Simple Loading Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Removed debug API calls counter for production */}
          </div>
        </div>
        
        {/* Centered Tale Forge Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Tale Forge
          </h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center text-white max-w-4xl">
            {/* Main Loading Animation */}
            <div className="relative">
              {/* Central Magical Orb */}
              <div className="relative mx-auto w-32 h-32 mb-8">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 rounded-full animate-spin opacity-30 blur-sm"></div>
                
                {/* Main orb */}
                <div className="absolute inset-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-2 border-amber-400/50 flex items-center justify-center">
                  <div className="text-4xl animate-pulse">📚</div>
                </div>
                
                {/* Floating particles around orb */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                    style={{
                      left: `${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%`,
                      top: `${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>

              {/* Current Step Display */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {loadingSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    
                    return (
                      <div
                        key={index}
                        className={`relative transition-all duration-500 ${
                          isActive ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isActive
                              ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/50'
                              : isCompleted
                              ? 'bg-green-500 border-green-400'
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 transition-all duration-500 ${
                              isActive ? 'text-white animate-pulse' : 'text-slate-400'
                            }`}
                          />
                        </div>
                        {isActive && (
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                            <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {step.text}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-80 h-3 bg-slate-700 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {Math.round(progress)}% Complete
                </p>
              </div>

              {/* Rotating Message */}
              <div className="mb-6">
                <p className="text-xl font-semibold text-amber-300 animate-pulse">
                  {rotatingMessages[currentMessage]}
                </p>
              </div>

              {/* Magical Sparkles */}
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="text-slate-400 text-sm">Creating magic...</span>
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplayLoadingState;
