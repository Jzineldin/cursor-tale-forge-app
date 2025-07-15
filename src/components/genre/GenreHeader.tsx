
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const GenreHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-12 relative">
      {/* Navigation container with flexbox to prevent overlap */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-8 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white hover:text-amber-400 flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
        <div className="flex-1" /> {/* Spacer */}
      </div>
      
      {/* Title content with proper spacing */}
      <div className="pt-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif magical-text">
          Choose Your <span className="text-amber-400">Adventure</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Select the perfect genre for your personalized story adventure
        </p>
      </div>
    </div>
  );
};

export default GenreHeader;
