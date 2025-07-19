
import React from 'react';
import { Button } from '@/components/ui/button';

interface StoryModeToggleProps {
  viewMode: 'create' | 'player';
  onSwitchToCreate: () => void;
  onSwitchToPlayer: () => void;
  hasSegments: boolean;
}

const StoryModeToggle: React.FC<StoryModeToggleProps> = ({
  viewMode,
  onSwitchToCreate,
  onSwitchToPlayer,
  hasSegments
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl rounded-2xl p-2">
        <Button
          onClick={onSwitchToCreate}
          variant={viewMode === 'create' ? 'default' : 'ghost'}
          size="sm"
          className={`fantasy-heading px-6 py-2 font-medium transition-all duration-300 ${
            viewMode === 'create' 
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/25' 
              : 'text-amber-300 hover:bg-amber-500/20 hover:text-amber-200'
          }`}
        >
          ✍️ Create Mode
        </Button>
        <Button
          onClick={onSwitchToPlayer}
          variant={viewMode === 'player' ? 'default' : 'ghost'}
          size="sm"
          className={`fantasy-heading px-6 py-2 font-medium transition-all duration-300 ${
            viewMode === 'player' 
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/25' 
              : 'text-amber-300 hover:bg-amber-500/20 hover:text-amber-200'
          }`}
          disabled={!hasSegments}
        >
          🎭 Story Player
        </Button>
      </div>
    </div>
  );
};

export default StoryModeToggle;
