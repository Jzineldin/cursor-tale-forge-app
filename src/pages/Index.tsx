
import React from 'react';

import HomePage from '@/components/HomePage';

const Index = () => {
  console.log('Index component: Rendering unified homepage with kid-focused messaging');

  return (
    <div className="min-h-screen w-full relative">
      <HomePage />
    </div>
  );
};

export default Index;
