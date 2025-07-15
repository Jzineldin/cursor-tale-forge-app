
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaitlistSignup from '@/components/WaitlistSignup';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateStory = () => {
    navigate('/create/genre');
  };

  const handleDiscoverStories = () => {
    navigate('/discover');
  };

  return (
    <div className="relative min-h-[90vh] hero-section">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8 space-y-12 min-h-[85vh] flex flex-col justify-center">
          {/* Glassmorphism Container */}
          <div className="backdrop-blur-sm bg-black/15 rounded-2xl p-6 md:p-10 border border-white/10 shadow-xl mx-auto max-w-4xl">
            {/* Tale Forge title */}
            <div className="relative">
              <h1 className="tale-forge-title text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-serif text-white mb-8 leading-normal relative">
                Tale Forge
                <div className="tale-forge-glow absolute inset-0 tale-forge-title -z-10">
                  Tale Forge
                </div>
              </h1>
            </div>

            {/* Tagline */}
            <div className="space-y-8">
              <p className="text-2xl md:text-3xl lg:text-4xl text-white max-w-4xl mx-auto leading-relaxed text-shadow-strong">
                What if your next adventure began with just{' '}
                <span className="font-bold text-amber-300 whitespace-nowrap">
                  one sentence?
                </span>
              </p>
              
              {/* Primary CTAs - Improved alignment and spacing */}
              <div className="space-y-8">
                {/* Button container with consistent width */}
                <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                  <Button
                    onClick={handleCreateStory}
                    className="cta-btn w-full px-12 py-4 text-xl text-white font-semibold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all duration-200 shadow-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Your Story Now
                  </Button>
                  
                  <Button
                    onClick={handleDiscoverStories}
                    variant="outline"
                    className="w-full px-8 py-4 text-xl text-white border-white/30 bg-black/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-200 shadow-lg"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Discover Stories
                  </Button>
                </div>
                
                {/* Waitlist signup - Consistent width and spacing */}
                <div className="max-w-sm mx-auto">
                  <WaitlistSignup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
