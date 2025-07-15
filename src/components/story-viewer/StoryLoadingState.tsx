
import React from 'react';
import { Loader2 } from 'lucide-react';

const StoryLoadingState: React.FC = () => {
  return (
    <div className="text-center">
      <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-400" />
      <p className="text-purple-200 mt-2">Loading next part...</p>
    </div>
  );
};

export default StoryLoadingState;
