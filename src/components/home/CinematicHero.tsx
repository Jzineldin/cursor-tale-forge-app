
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeaderVisibility } from '@/context/HeaderVisibilityContext';
import WhatsNewModal from '@/components/WhatsNewModal';

const CinematicHero: React.FC = () => {
  const navigate = useNavigate();
  const { showHeader } = useHeaderVisibility();

  const handleCreateAdventure = () => {
    showHeader();
    navigate('/adventure');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Transparent Container with mobile-optimized sizing */}
      <div className="backdrop-blur-sm bg-transparent rounded-2xl p-4 md:p-8 lg:p-12 border border-white/20 shadow-2xl w-full">
        {/* Tale Forge Title - Mobile responsive */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="tale-forge-title text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold font-serif text-white mb-4 md:mb-8 leading-tight"
              style={{
                textShadow: '0 0 30px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 0, 0, 0.7), 4px 4px 12px rgba(0, 0, 0, 0.95), -2px -2px 8px rgba(0, 0, 0, 0.8)'
              }}>
            Tale Forge
          </h1>
          
          {/* Simple Tagline - Mobile responsive */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl text-white max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 px-2"
             style={{
               textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.7), 3px 3px 8px rgba(0, 0, 0, 0.95), -1px -1px 6px rgba(0, 0, 0, 0.8)'
             }}>
            Where imagination meets
            <span className="font-cursive text-amber-300 mx-2" style={{fontStyle: 'italic'}}>
              infinite possibilities
            </span>
          </p>
        </div>

        {/* Enhanced Button Layout - Improved alignment and spacing */}
        <div className="flex flex-col items-center gap-8 mt-8 max-w-md mx-auto">
          {/* Primary CTA Button - Consistent width */}
          <Button
            onClick={handleCreateAdventure}
            className="group w-full px-10 py-5 text-xl md:text-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-amber-400/30 hover:border-amber-300/50"
          >
            <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
            Start Here
          </Button>
          
          {/* Secondary Buttons - Matching width and consistent spacing */}
          <div className="flex flex-col w-full gap-4">
            <Button
              onClick={handleLearnMore}
              variant="outline"
              className="w-full px-6 py-3 text-base text-white border-white/40 bg-black/30 hover:bg-white/20 hover:border-white/60 backdrop-blur-sm transition-all duration-300 shadow-lg rounded-lg"
            >
              <Info className="mr-2 h-4 w-4" />
              What is Tale Forge?
            </Button>
            
            <WhatsNewModal 
              trigger={
                <Button
                  variant="outline"
                  className="w-full px-6 py-3 text-base text-white border-white/40 bg-black/30 hover:bg-white/20 hover:border-white/60 backdrop-blur-sm transition-all duration-300 shadow-lg rounded-lg"
                >
                  <Star className="mr-2 h-4 w-4" />
                  What's New?
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicHero;
