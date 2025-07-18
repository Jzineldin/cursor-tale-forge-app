import React, { useState, useMemo } from 'react';
import { MagicalLibraryLayout } from '@/components/my-stories/MagicalLibraryLayout';
import { DeleteStoryDialog } from '@/components/my-stories/DeleteStoryDialog';
import { useUnifiedStories } from '@/hooks/useUnifiedStories';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Search, Filter, BookOpen, Clock, CheckCircle, Grid, List, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

// Performance and error handling enhancements
import { usePerformanceMonitor, useDebounce as useDebouncePerf, useMemoizedCallback, useMobileOptimization } from '@/utils/performanceOptimizations';
import { useErrorHandler } from '@/utils/enhancedErrorHandler';

type FilterOption = 'all' | 'completed' | 'in-progress' | 'public' | 'private';
type SortOption = 'newest' | 'oldest' | 'title' | 'length' | 'completion';
type ViewMode = 'grid' | 'list';

const MyStories: React.FC = () => {
  // Performance monitoring
  const { renderCount, timeSinceLastRender } = usePerformanceMonitor('MyStories');
  // Mobile optimization
  useMobileOptimization();
  // Enhanced error handling
  const { withErrorHandling } = useErrorHandler('MyStories');

  const {
    stories,
    isLoading,
    handleRefresh,
    deleteStory
  } = useUnifiedStories();

  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [storyToDeleteTitle, setStoryToDeleteTitle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  // Use performance debounce
  const debouncedSearchTermPerf = useDebouncePerf(searchTerm, 500);

  const genres = [
    { value: 'child-adapted', label: 'Child Adapted', emoji: '👶' },
    { value: 'horror-story', label: 'Horror Story', emoji: '👻' },
    { value: 'educational', label: 'Educational', emoji: '📚' },
    { value: 'epic-fantasy', label: 'Epic Fantasy', emoji: '🏰' },
    { value: 'sci-fi-thriller', label: 'Sci-Fi Thriller', emoji: '🚀' },
    { value: 'mystery', label: 'Mystery', emoji: '🕵️' },
    { value: 'romantic-drama', label: 'Romantic Drama', emoji: '💕' },
    { value: 'adventure-quest', label: 'Adventure Quest', emoji: '🗺️' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'length', label: 'Longest First' },
    { value: 'completion', label: 'Completion Status' }
  ];

  // Memoized filtering and sorting for performance
  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories;
    // Apply search filter
    if (debouncedSearchTermPerf) {
      filtered = filtered.filter(story => 
        story.title?.toLowerCase().includes(debouncedSearchTermPerf.toLowerCase()) ||
        story.story_mode?.toLowerCase().includes(debouncedSearchTermPerf.toLowerCase())
      );
    }
    // Apply status filter
    switch (filterBy) {
      case 'completed':
        filtered = filtered.filter(story => story.is_completed);
        break;
      case 'in-progress':
        filtered = filtered.filter(story => !story.is_completed);
        break;
      case 'public':
        filtered = filtered.filter(story => story.is_public);
        break;
      case 'private':
        filtered = filtered.filter(story => !story.is_public);
        break;
    }
    // Apply genre filter
    if (selectedGenre) {
      filtered = filtered.filter(story => story.story_mode === selectedGenre);
    }
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
        case 'length':
          return b.segment_count - a.segment_count;
        case 'completion':
          if (a.is_completed !== b.is_completed) {
            return a.is_completed ? -1 : 1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    return sorted;
  }, [stories, debouncedSearchTermPerf, filterBy, sortBy, selectedGenre]);

  // Memoized stats
  const stats = useMemo(() => {
    const total = stories.length;
    const completed = stories.filter(s => s.is_completed).length;
    const inProgress = stories.filter(s => !s.is_completed).length;
    const publicStories = stories.filter(s => s.is_public).length;
    const totalSegments = stories.reduce((sum, s) => sum + s.segment_count, 0);
    return { total, completed, inProgress, publicStories, totalSegments };
  }, [stories]);

  // Memoized handlers
  const handleSetStoryToDelete = useMemoizedCallback((storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    setStoryToDelete(storyId);
    setStoryToDeleteTitle(story?.title || 'Untitled Story');
  }, [stories]);

  const handleConfirmDelete = useMemoizedCallback(() => {
    if (storyToDelete) {
      withErrorHandling(async () => {
        deleteStory(storyToDelete);
        setStoryToDelete(null);
        setStoryToDeleteTitle('');
      }, { action: 'deleteStory' });
    }
  }, [storyToDelete, deleteStory, withErrorHandling]);

  const handleCancelDelete = useMemoizedCallback(() => {
    setStoryToDelete(null);
    setStoryToDeleteTitle('');
  }, []);

  const handleStoryUpdate = useMemoizedCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Performance log
  React.useEffect(() => {
    // Optionally log renderCount or timeSinceLastRender for debugging
    // console.log('MyStories renders:', renderCount, 'Last render time:', timeSinceLastRender);
  }, [renderCount, timeSinceLastRender, filteredAndSortedStories.length]);

  return (
    <div className="magical-page-container">
      <div className="magical-content">
        <div className="container mx-auto px-4 py-16">
          {/* Enhanced Header - matching Discover style */}
          <div className="text-center mb-12 animate-magical-fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
                <BookOpen className="h-8 w-8 text-amber-400" />
              </div>
              <h1 className="fantasy-heading text-4xl md:text-6xl font-bold text-white">
                My <span className="text-amber-400">Stories</span>
              </h1>
            </div>
            <p className="fantasy-subtitle text-xl text-gray-300 max-w-2xl mx-auto">
              Your personal collection of interactive adventures and tales
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-amber-300/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{stats.total} stories</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>{stats.completed} completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{stats.inProgress} in progress</span>
              </div>
            </div>
            
            {/* Create New Story Button */}
            <div className="mt-8">
              <Link to="/">
                <button className="btn-magical text-lg px-8 py-3">
                  <PenTool className="h-5 w-5 mr-2" />
                  Create New Story
                </button>
              </Link>
            </div>
          </div>

          {/* Enhanced Search and Filters - matching Discover style */}
          <div className="glass-enhanced mb-8">
            <div className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search your stories by title or genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input w-full pl-10"
                  />
                </div>

                {/* Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="glass-card px-4 py-2 text-gray-300 hover:bg-slate-700"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </button>
                    
                    <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                      <SelectTrigger className="w-40 glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stories</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                      <SelectTrigger className="w-40 glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-amber-500 hover:bg-amber-600' : 'glass-card text-gray-300 hover:bg-slate-700'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-amber-500 hover:bg-amber-600' : 'glass-card text-gray-300 hover:bg-slate-700'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Genre Filters */}
                {showFilters && (
                  <div className="border-t border-slate-600 pt-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => setSelectedGenre('')}
                        className={`px-3 py-1 rounded text-sm ${selectedGenre === '' ? 'bg-amber-500 hover:bg-amber-600' : 'glass-card text-gray-300 hover:bg-slate-700'}`}
                      >
                        All Genres
                      </button>
                      {genres.map((genre) => (
                        <button
                          key={genre.value}
                          onClick={() => setSelectedGenre(genre.value)}
                          className={`px-3 py-1 rounded text-sm ${selectedGenre === genre.value 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'glass-card text-gray-300 hover:bg-slate-700'
                          }`}
                        >
                          {genre.emoji} {genre.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {filteredAndSortedStories.length !== stories.length && (
            <div className="mb-6 text-center">
              <Badge variant="outline" className="text-amber-300 border-amber-400/50">
                Showing {filteredAndSortedStories.length} of {stories.length} stories
              </Badge>
            </div>
          )}

          {/* Stories Content */}
          {stories.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-lg mx-auto">
                <div className="glass-enhanced p-8 mb-8">
                  <BookOpen className="h-20 w-20 text-amber-300/60 mx-auto mb-6" />
                  <h3 className="fantasy-title text-3xl font-semibold text-amber-200 mb-4">
                    Your Library Awaits Its First Tale
                  </h3>
                  <p className="text-amber-300/80 text-lg mb-8 leading-relaxed">
                    Every grand library begins with a single story. Let your imagination flourish and create your first magical adventure.
                  </p>
                  <Link to="/">
                    <button className="btn-magical text-lg px-8 py-4">
                      <PenTool className="h-5 w-5 mr-2" />
                      Begin Your First Story
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : filteredAndSortedStories.length === 0 ? (
            <div className="text-center py-20">
              <div className="glass-enhanced max-w-lg mx-auto">
                <div className="p-8">
                  <Search className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                  <h3 className="fantasy-title text-2xl font-bold text-white mb-4">No Stories Found</h3>
                  <p className="text-gray-300 mb-6">
                    Try adjusting your search terms or filters to find your stories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBy('all');
                      setSelectedGenre('');
                    }}
                    className="btn-magical"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MagicalLibraryLayout
              stories={filteredAndSortedStories}
              onSetStoryToDelete={handleSetStoryToDelete}
              onStoryUpdate={handleStoryUpdate}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              showRefresh={false}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>
      
      <DeleteStoryDialog
        isOpen={!!storyToDelete}
        storyTitle={storyToDeleteTitle}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default MyStories;
