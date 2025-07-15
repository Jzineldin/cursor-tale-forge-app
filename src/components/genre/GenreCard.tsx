
import React, { useState } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

interface Genre {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  image: string;
}

interface GenreCardProps {
  genre: Genre;
  isSelected: boolean;
  onSelect: (genreId: string) => void;
}

const GenreCard: React.FC<GenreCardProps> = ({ genre, isSelected, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl
        aspect-[3/2] overflow-hidden
        ${isSelected 
          ? 'border-2 border-amber-400 shadow-2xl shadow-amber-400/20' 
          : 'border border-slate-600 hover:border-amber-400/60'
        }
        backdrop-blur-sm
      `}
      onClick={() => onSelect(genre.id)}
    >
      {/* Background Image */}
      {!imageError && (
        <img
          src={genre.image}
          alt={genre.title}
          className={`
            absolute inset-0 w-full h-full object-cover transition-all duration-700
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            group-hover:scale-110
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Fallback gradient background */}
      {imageError && (
        <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient}`} />
      )}

      {/* Content with strong text shadows - NO blur or background */}
      <div className="absolute inset-0 p-4 sm:p-6 text-left z-10 flex flex-col justify-end">
        <CardTitle className="font-serif mb-2 text-base sm:text-lg text-white break-words overflow-hidden" style={{
          textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.8), 4px 4px 10px rgba(0, 0, 0, 0.95), -2px -2px 8px rgba(0, 0, 0, 0.9)'
        }}>
          {genre.title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-2 text-white break-words overflow-hidden" style={{
          textShadow: '0 0 15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.8), 3px 3px 8px rgba(0, 0, 0, 0.95), -1px -1px 6px rgba(0, 0, 0, 0.9)',
          opacity: '0.95'
        }}>
          {genre.description}
        </CardDescription>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-amber-400/10 border-2 border-amber-400 animate-pulse" />
      )}
    </Card>
  );
};

export default GenreCard;
