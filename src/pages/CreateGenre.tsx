
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import GenreHeader from '@/components/genre/GenreHeader';
import GenreGrid from '@/components/genre/GenreGrid';

const CreateGenre: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const navigate = useNavigate();

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  const handleNext = () => {
    if (selectedGenre) {
      navigate(`/create/prompt?genre=${selectedGenre}`);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: `url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-4 py-16">
        <GenreHeader />
        <GenreGrid 
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
        />
        
        {/* Next Button */}
        <div className="text-center">
          <Button
            onClick={handleNext}
            disabled={!selectedGenre}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGenre;
