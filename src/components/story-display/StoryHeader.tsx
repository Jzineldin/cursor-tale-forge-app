
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

interface StoryHeaderProps {
  onExit: () => void;
  onSave: () => void;
  apiUsageCount: number;
}

const StoryHeader: React.FC<StoryHeaderProps> = ({
  onExit,
  onSave,
  apiUsageCount
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8">
      <Button variant="ghost" onClick={onExit} className="text-white hover:text-amber-400">
        <Home className="mr-2 h-4 w-4" />
        Exit Story
      </Button>
      
      <div className="flex items-center gap-4">
        {/* Only show API usage count for authenticated users */}
        {isAuthenticated && (
          <div className="text-amber-400 text-sm">
            API Calls: {apiUsageCount}
          </div>
        )}
        <Button variant="outline" onClick={onSave} className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default StoryHeader;
