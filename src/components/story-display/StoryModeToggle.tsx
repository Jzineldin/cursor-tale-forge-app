
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
    <div className="flex justify-center mb-6">
      <div className="bg-slate-800/80 rounded-lg p-1 border border-amber-500/20">
        <Button
          onClick={onSwitchToCreate}
          variant={viewMode === 'create' ? 'default' : 'ghost'}
          size="sm"
          className={viewMode === 'create' ? 'bg-amber-500 text-slate-900' : 'text-amber-400'}
        >
          ✍️ Create Mode
        </Button>
        <Button
          onClick={onSwitchToPlayer}
          variant={viewMode === 'player' ? 'default' : 'ghost'}
          size="sm"
          className={viewMode === 'player' ? 'bg-amber-500 text-slate-900' : 'text-amber-400'}
          disabled={!hasSegments}
        >
          🎭 Story Player
        </Button>
      </div>
    </div>
  );
};

export default StoryModeToggle;
