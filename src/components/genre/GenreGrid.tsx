
import React from 'react';
import GenreCard from './GenreCard';
import { genres } from '@/data/genres';

interface GenreGridProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
}

const GenreGrid: React.FC<GenreGridProps> = ({ selectedGenre, onGenreSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {genres.map((genre) => (
        <GenreCard
          key={genre.id}
          genre={genre}
          isSelected={selectedGenre === genre.id}
          onSelect={onGenreSelect}
        />
      ))}
    </div>
  );
};

export default GenreGrid;
