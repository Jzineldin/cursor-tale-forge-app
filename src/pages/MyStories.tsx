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
    <div className="min-h-screen relative overflow-hidden">
      {/* Cozy library background - keeping original */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Leonardo_Phoenix_10_A_cozy_wooden_library_at_night_with_floati_2.jpg')"
        }}
      />
      
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70" />

      {/* Enhanced ambient magical particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/6 left-1/5 w-2 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50 animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg shadow-blue-300/50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-3/4 left-1/6 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-lg shadow-emerald-300/50 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/8 right-1/5 w-2 h-2 bg-rose-300 rounded-full shadow-lg shadow-rose-300/50 animate-pulse" style={{ animationDelay: '5s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Enhanced Header - matching Discover style */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
              <BookOpen className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-serif">
              My <span className="text-amber-400">Stories</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl border border-amber-400/30 text-lg px-8 py-3">
                <PenTool className="h-5 w-5 mr-2" />
                Create New Story
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Search and Filters - matching Discover style */}
        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search your stories by title or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                    <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
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
                    <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
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
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-amber-500 hover:bg-amber-600' : 'border-slate-600 text-gray-300 hover:bg-slate-700'}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-amber-500 hover:bg-amber-600' : 'border-slate-600 text-gray-300 hover:bg-slate-700'}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Genre Filters */}
              {showFilters && (
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant={selectedGenre === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGenre('')}
                      className={selectedGenre === '' ? 'bg-amber-500 hover:bg-amber-600' : 'border-slate-600 text-gray-300 hover:bg-slate-700'}
                    >
                      All Genres
                    </Button>
                    {genres.map((genre) => (
                      <Button
                        key={genre.value}
                        variant={selectedGenre === genre.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGenre(genre.value)}
                        className={selectedGenre === genre.value 
                          ? 'bg-amber-500 hover:bg-amber-600' 
                          : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                        }
                      >
                        {genre.emoji} {genre.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                    <PenTool className="h-5 w-5 mr-2" />
                    Begin Your First Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : filteredAndSortedStories.length === 0 ? (
          <div className="text-center py-20">
            <Card className="max-w-lg mx-auto bg-gradient-to-br from-slate-900/40 to-slate-800/30 border border-slate-600 backdrop-blur-sm">
              <CardContent className="p-8">
                <Search className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Stories Found</h3>
                <p className="text-gray-300 mb-6">
                  Try adjusting your search terms or filters to find your stories.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setSelectedGenre('');
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
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
      
      <DeleteStoryDialog
        isOpen={!!storyToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        storyTitle={storyToDeleteTitle}
      />
    </div>
  );
};

export default MyStories;
