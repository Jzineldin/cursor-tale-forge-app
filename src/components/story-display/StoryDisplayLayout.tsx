
import React from 'react';

interface StoryDisplayLayoutProps {
  children: React.ReactNode;
}

const StoryDisplayLayout: React.FC<StoryDisplayLayoutProps> = ({ children }) => {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      style={{
        background: `
          linear-gradient(rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)),
          url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {children}
      </div>
    </div>
  );
};

export default StoryDisplayLayout;
