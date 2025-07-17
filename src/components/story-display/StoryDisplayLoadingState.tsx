
import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StoryDisplayLoadingStateProps {
  onExit: () => void;
}

const StoryDisplayLoadingState: React.FC<StoryDisplayLoadingStateProps> = ({
  onExit
}) => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);

  const rotatingMessages = [
    "✨ Crafting your magical story...",
    "🎭 Bringing characters to life...",
    "📖 Weaving your adventure...",
    "🌟 Almost ready for story time!"
  ];

  useEffect(() => {
    // Rotate through messages every 3 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % rotatingMessages.length);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
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
      {/* Floating magical particles - reduced for less distraction */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-40 animate-magical-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 pt-24 pb-4 relative z-10">
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
          <div className="text-center text-white max-w-2xl">
            {/* Magical Progress Indicator */}
            <div className="relative flex justify-center mb-8">
              {/* Main circular loading spinner */}
              <div className="relative z-10 bg-slate-800/80 rounded-full p-6 border-2 border-amber-400/50 shadow-lg">
                <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              </div>
              
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-amber-400/10 rounded-full animate-ping"></div>
            </div>

            {/* Single Rotating Message */}
            <div className="mb-8">
              <h2 
                className="text-4xl md:text-5xl font-bold mb-4 animate-magical-fade-in"
                style={{
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.5)'
                }}
              >
                ✨ Crafting Your Tale ✨
              </h2>
              
              {/* Rotating magical message */}
              <p 
                className="text-xl md:text-2xl text-amber-200 font-medium animate-magical-fade-in"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
              >
                {rotatingMessages[currentMessage]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDisplayLoadingState;
