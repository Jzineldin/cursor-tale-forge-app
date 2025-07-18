
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import GenreHeader from '@/components/genre/GenreHeader';
import GenreGrid from '@/components/genre/GenreGrid';

const CreateGenre: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [backgroundLoaded, setBackgroundLoaded] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedAge = searchParams.get('age');

  // Set body data attribute for route isolation
  useEffect(() => {
    document.body.setAttribute('data-route', '/create/genre');
    
    // Preload background image
    const bgImage = new Image();
    bgImage.onload = () => {
      setBackgroundLoaded(true);
      document.body.classList.add('loaded');
    };
    bgImage.src = '/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg';
    
    // Cleanup on unmount
    return () => {
      document.body.removeAttribute('data-route');
      document.body.classList.remove('loaded');
    };
  }, []);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  const handleNext = () => {
    if (selectedGenre && selectedAge) {
      navigate(`/create/prompt?genre=${selectedGenre}&age=${selectedAge}`);
    } else if (selectedGenre) {
      // Fallback if no age selected (shouldn't happen with new flow)
      navigate(`/create/prompt?genre=${selectedGenre}`);
    }
  };

  return (
    <div 
      className={`genre-page-container ${backgroundLoaded ? 'loaded' : ''}`}
    >
      {/* Content wrapper with proper spacing - Layout provides pt-16 sm:pt-20 */}
      <div className="genre-content relative z-10 min-h-full">
        <div className="container mx-auto px-4 pb-16">
          <GenreHeader />
          <GenreGrid 
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
          />
          
          {/* Next Button */}
          <div className="text-center mt-12">
            <Button
              onClick={handleNext}
              disabled={!selectedGenre || !selectedAge}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {selectedAge && (
              <p className="text-amber-300 text-sm mt-4 font-medium">
                Creating stories perfect for {selectedAge} year olds
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGenre;
