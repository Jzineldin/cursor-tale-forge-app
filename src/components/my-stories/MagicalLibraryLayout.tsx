
import React, { useState } from 'react';
import { Story } from '@/types/stories';
import MagicalStoryCard from './MagicalStoryCard';
import { RefreshCw, BookOpen, Plus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { batchUpdateStoryThumbnails } from '@/utils/storyCoverUtils';

interface MagicalLibraryLayoutProps {
  stories: Story[];
  onSetStoryToDelete: (storyId: string) => void;
  onStoryUpdate?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  showRefresh?: boolean;
  viewMode?: 'grid' | 'list';
}

export const MagicalLibraryLayout: React.FC<MagicalLibraryLayoutProps> = ({ 
  stories, 
  onSetStoryToDelete, 
  onRefresh,
  isLoading = false,
  showRefresh = false,
  viewMode = 'grid'
}) => {
  const [isUpdatingThumbnails, setIsUpdatingThumbnails] = useState(false);
  
  // Group stories by completion status
  const completedStories = stories.filter(story => story.is_completed);
  const inProgressStories = stories.filter(story => !story.is_completed);

  const handleUpdateThumbnails = async () => {
    setIsUpdatingThumbnails(true);
    try {
      await batchUpdateStoryThumbnails();
      // Refresh the stories list to show updated thumbnails
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsUpdatingThumbnails(false);
    }
  };

  const renderStoryGroup = (groupStories: Story[], title: string, groupClass: string, startIndex: number) => {
    if (groupStories.length === 0) return null;

    const gridClass = viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
      : 'space-y-4';

    return (
      <div className={`mb-12 ${groupClass}`}>
        <div className="story-group-header rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-serif text-amber-100 font-semibold tracking-wide">
            {title}
          </h2>
          <p className="text-amber-300/70 text-sm mt-1">
            {groupStories.length} {groupStories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
        
        <div className={gridClass}>
          {groupStories.map((story, index) => (
            <div
              key={story.id}
              className={`book-entrance-animation opacity-0 book-entrance-delay-${Math.min((startIndex + index) % 6 + 1, 6)}`}
            >
              <MagicalStoryCard
                story={story}
                onSetStoryToDelete={onSetStoryToDelete}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cozy library background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Leonardo_Phoenix_10_A_cozy_wooden_library_at_night_with_floati_2.jpg')"
        }}
      />
      
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 library-background-overlay" />

      {/* Enhanced ambient magical particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/6 left-1/5 w-2 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50 ambient-particle-1"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50 ambient-particle-2"></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50 ambient-particle-3"></div>
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 ambient-particle-1"></div>
        <div className="absolute top-3/4 left-1/6 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-lg shadow-emerald-300/50 ambient-particle-2"></div>
        <div className="absolute top-1/8 right-1/5 w-2 h-2 bg-rose-300 rounded-full shadow-lg shadow-rose-300/50 ambient-particle-3"></div>
        
        {/* Additional floating book pages */}
        <div className="absolute top-1/3 left-1/8 w-4 h-6 bg-amber-100/10 rounded-sm transform rotate-12 ambient-particle-1"></div>
        <div className="absolute top-2/5 right-1/8 w-3 h-5 bg-amber-100/8 rounded-sm transform -rotate-6 ambient-particle-2"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Enhanced Library Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-gradient-to-br from-amber-900/40 to-amber-700/30 border-2 border-amber-400/40 rounded-xl backdrop-blur-sm shadow-xl">
                <BookOpen className="h-10 w-10 text-amber-200" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-amber-100 tracking-wide drop-shadow-2xl"
                    style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                  My Enchanted Library
                </h1>
                <p className="text-amber-300/90 text-xl mt-2 font-serif">
                  Your collection of magical tales awaits
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {showRefresh && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={onRefresh} 
                  disabled={isLoading}
                  className="bg-amber-900/40 border-amber-400/50 text-amber-200 hover:bg-amber-800/50 backdrop-blur-sm shadow-lg"
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Collection
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleUpdateThumbnails} 
                disabled={isUpdatingThumbnails}
                className="bg-purple-900/40 border-purple-400/50 text-purple-200 hover:bg-purple-800/50 backdrop-blur-sm shadow-lg"
              >
                <ImageIcon className={`h-5 w-5 mr-2 ${isUpdatingThumbnails ? 'animate-pulse' : ''}`} />
                {isUpdatingThumbnails ? 'Updating Covers...' : 'Fix Story Covers'}
              </Button>
              
              <Link to="/">
                <Button className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-xl border-2 border-amber-400/60 text-lg px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Craft New Tale
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Enhanced library stats */}
          <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-sm border border-amber-400/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-8 text-amber-300/80 text-base">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>{stories.length} stories in your library</span>
              </div>
              <span className="text-amber-400/50">•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{completedStories.length} completed tales</span>
              </div>
              <span className="text-amber-400/50">•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>{inProgressStories.length} in progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {stories.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto">
              <div className="p-8 bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-2 border-amber-400/30 rounded-3xl backdrop-blur-sm mb-8 shadow-2xl">
                <BookOpen className="h-20 w-20 text-amber-300/60 mx-auto mb-6" />
                <h3 className="text-3xl font-semibold text-amber-200 mb-4 font-serif">
                  Your Library Awaits Its First Tale
                </h3>
                <p className="text-amber-300/80 text-lg mb-8 leading-relaxed">
                  Every grand library begins with a single story. Let your imagination flourish and create your first magical adventure.
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-xl text-lg px-8 py-4">
                    <Plus className="h-5 w-5 mr-2" />
                    Begin Your First Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Story collection grouped by status */}
        {stories.length > 0 && (
          <div className="space-y-8">
            {renderStoryGroup(completedStories, "📚 Completed Tales", "story-group-completed", 0)}
            {renderStoryGroup(inProgressStories, "✍️ Tales in Progress", "story-group-in-progress", completedStories.length)}
          </div>
        )}
      </div>
    </div>
  );
};
