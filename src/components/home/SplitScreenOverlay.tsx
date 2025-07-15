
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, GraduationCap } from 'lucide-react';

interface SplitScreenOverlayProps {
  creativeStudioImage?: string;
  learningLabImage?: string;
}

const SplitScreenOverlay: React.FC<SplitScreenOverlayProps> = ({
  creativeStudioImage,
  learningLabImage
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Tale Forge Logo - Centered at top */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-serif magical-text text-center">
          <span className="text-amber-400">Tale Forge</span>
        </h1>
      </div>

      {/* Split Screen Container */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Creative Studio - Left Side */}
        <div 
          className="flex-1 relative cursor-pointer group transition-all duration-500 hover:flex-[1.1] min-h-[50vh] md:min-h-full"
          onClick={() => navigate('/adventure')}
          style={{
            backgroundImage: creativeStudioImage ? `url(${creativeStudioImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Default background if no image provided */}
          {!creativeStudioImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          )}
          
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-transparent group-hover:from-slate-900/90 group-hover:via-slate-800/70 transition-all duration-500"></div>
          
          {/* Magical particles overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="magical-particles opacity-30"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center items-center text-center px-8 z-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Palette className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif group-hover:text-amber-300 transition-colors duration-300">
              Creative Studio
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 font-sans max-w-md leading-relaxed">
              Craft immersive stories with AI-powered narrative generation, stunning visuals, and interactive choices
            </p>
            
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 group-hover:scale-105">
              Enter Studio
            </div>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-sans">Click to explore</span>
            </div>
          </div>
        </div>

        {/* Learning Lab - Right Side */}
        <div 
          className="flex-1 relative cursor-pointer group transition-all duration-500 hover:flex-[1.1] min-h-[50vh] md:min-h-full"
          onClick={() => navigate('/learning')}
          style={{
            backgroundImage: learningLabImage ? `url(${learningLabImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Default background if no image provided */}
          {!learningLabImage && (
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-800 via-blue-900 to-slate-900"></div>
          )}
          
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 via-blue-900/60 to-transparent group-hover:from-slate-900/90 group-hover:via-blue-900/70 transition-all duration-500"></div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center items-center text-center px-8 z-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif group-hover:text-blue-300 transition-colors duration-300">
              Learning Lab
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 font-sans max-w-md leading-relaxed">
              Discover educational adventures that make learning engaging through interactive storytelling
            </p>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 group-hover:scale-105">
              Enter Lab
            </div>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-sans">Click to explore</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitScreenOverlay;
