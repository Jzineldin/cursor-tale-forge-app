
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Gamepad2 } from 'lucide-react';

const RouteSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('https://cdn.midjourney.com/11bac597-89f4-4f16-99f0-4b114af4473f/0_2.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Magical particles overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="magical-particles"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif magical-text">
          Welcome to <span className="text-amber-400">Tale Forge</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 font-sans">
          Choose your path to adventure
        </p>

        {/* Route Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Interactive Adventures */}
          <div 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/adventure')}
          >
            <div className="bg-slate-800/70 backdrop-blur-sm border border-amber-500/30 rounded-xl p-8 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-serif">Interactive Adventures</h3>
              <p className="text-gray-300 mb-6 font-sans">
                Embark on immersive storytelling experiences where your choices shape the narrative
              </p>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 font-medium"
              >
                Start Adventure
              </Button>
            </div>
          </div>

          {/* Learning Journeys */}
          <div 
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/learning')}
          >
            <div className="bg-slate-800/70 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-serif">Learning Journeys</h3>
              <p className="text-gray-300 mb-6 font-sans">
                Educational adventures that make learning engaging and interactive
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 font-medium"
              >
                Start Learning
              </Button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-gray-400 text-sm mt-8 font-sans">
          Each path offers unique experiences tailored to your interests
        </p>
      </div>
    </div>
  );
};

export default RouteSelector;
