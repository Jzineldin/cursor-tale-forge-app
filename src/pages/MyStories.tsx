import React, { useState, useMemo } from 'react';
import { MagicalLibraryLayout } from '@/components/my-stories/MagicalLibraryLayout';
import { DeleteStoryDialog } from '@/components/my-stories/DeleteStoryDialog';
import { useUnifiedStories } from '@/hooks/useUnifiedStories';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Search, Filter, BookOpen, Clock, CheckCircle, Grid, List, PenTool, Eye, Edit, Check, X, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  const navigate = useNavigate();

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

  // Group stories by progress status
  const storyGroups = useMemo(() => {
    const completedStories = filteredAndSortedStories.filter(story => story.is_completed);
    const inProgressStories = filteredAndSortedStories.filter(story => !story.is_completed && story.segment_count > 0);
    const newStories = filteredAndSortedStories.filter(story => !story.is_completed && story.segment_count === 0);
    
    return {
      completed: { stories: completedStories, title: "📚 Completed Stories", description: "Stories that have been finished" },
      inProgress: { stories: inProgressStories, title: "✍️ Stories in Progress", description: "Stories you're currently working on" },
      new: { stories: newStories, title: "🆕 New Stories", description: "Stories ready to begin" }
    };
  }, [filteredAndSortedStories]);

  // Debug: Log stories data to see what's available
  // console.log('All stories data:', stories);
  // console.log('Filtered stories:', filteredAndSortedStories);
  // console.log('Story groups:', storyGroups);

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

  // Title editing functions
  const handleStartEdit = useMemoizedCallback((storyId: string, currentTitle: string) => {
    setEditingStoryId(storyId);
    setEditTitle(currentTitle ?? '');
  }, []);

  const handleSaveTitle = useMemoizedCallback(async (storyId: string) => {
    if (!editTitle.trim()) return;
    
    withErrorHandling(async () => {
      // Update the story title in the database
      const { error } = await supabase
        .from('stories')
        .update({ title: editTitle.trim() })
        .eq('id', storyId);
      
      if (error) throw error;
      
      // Refresh stories to get updated data
      handleRefresh();
      setEditingStoryId(null);
      setEditTitle('');
    }, { action: 'updateStoryTitle' });
  }, [editTitle, handleRefresh, withErrorHandling]);

  const handleCancelEdit = useMemoizedCallback(() => {
    setEditingStoryId(null);
    setEditTitle('');
  }, []);

  // Helper function to render story cards
  const renderStoryCard = (story: any) => {
    const isEditing = editingStoryId === story.id;
    
    // Get genre image based on story mode - using actual available images
    const getGenreImage = (storyMode: string) => {
      const genreImages: { [key: string]: string } = {
        'fantasy-magic': '/images/AlbedoBase_XL_Fantasy_book_cover_design_glowing_rune_symbols_m_1.jpg',
        'adventure-exploration': '/images/adventure-and-exploration.png',
        'mystery-detective': '/images/mystery-and-detective.png',
        'values-lessons': '/images/values-and-life-lessons.png',
        'science-space': '/images/astronaut-background-genre.jpg',
        'educational-stories': '/images/educational-adventure.png',
        'bedtime-stories': '/images/child-adapted-story.png',
        'silly-humor': '/images/silly-and-humorous.png'
      };
      return genreImages[storyMode] || '/images/AlbedoBase_XL_Fantasy_book_cover_design_glowing_rune_symbols_m_1.jpg'; // default fallback
    };

    const getGenreEmoji = (storyMode: string) => {
      const genreEmojis: { [key: string]: string } = {
        'fantasy-magic': '🧙‍♂️',
        'adventure-exploration': '🗺️',
        'mystery-detective': '🔍',
        'values-lessons': '💎',
        'science-space': '🚀',
        'educational-stories': '📚',
        'bedtime-stories': '🌙',
        'silly-humor': '😄'
      };
      return genreEmojis[storyMode] || '📖';
    };

    const getGenreColor = (storyMode: string) => {
      const genreColors: { [key: string]: string } = {
        'fantasy-magic': 'from-purple-500/20 to-pink-500/20',
        'adventure-exploration': 'from-blue-500/20 to-cyan-500/20',
        'mystery-detective': 'from-green-500/20 to-emerald-500/20',
        'values-lessons': 'from-amber-500/20 to-orange-500/20',
        'science-space': 'from-indigo-500/20 to-purple-500/20',
        'educational-stories': 'from-teal-500/20 to-blue-500/20',
        'bedtime-stories': 'from-blue-500/20 to-indigo-500/20',
        'silly-humor': 'from-yellow-500/20 to-orange-500/20'
      };
      return genreColors[storyMode] || 'from-gray-500/20 to-gray-600/20';
    };

    const getGenreDisplayName = (storyMode: string) => {
      const genreNames: { [key: string]: string } = {
        'fantasy-magic': 'Fantasy & Magic',
        'adventure-exploration': 'Adventure & Exploration',
        'mystery-detective': 'Mystery & Detective',
        'values-lessons': 'Values & Life Lessons',
        'science-space': 'Science & Space',
        'educational-stories': 'Educational Stories',
        'bedtime-stories': 'Bedtime Stories',
        'silly-humor': 'Silly & Humorous'
      };
      return genreNames[storyMode] || 'Unknown Genre';
    };
    
    return (
      <div key={story.id} className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-gray-600/50 hover:border-amber-400/50 hover:scale-105 transition-all duration-300">
        {/* Genre Image Header */}
        <div className="relative h-48 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${getGenreColor(story.story_mode)}`} />
          <img 
            src={getGenreImage(story.story_mode)}
            alt={`${getGenreDisplayName(story.story_mode)} genre`}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          
          {/* Genre Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
              <span className="text-lg">{getGenreEmoji(story.story_mode)}</span>
              <span className="text-white text-sm font-medium">
                {getGenreDisplayName(story.story_mode)}
              </span>
            </div>
          </div>

          {/* Completion Status */}
          {story.is_completed && (
            <div className="absolute top-4 right-4">
              <div className="bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">✓ Complete</span>
              </div>
            </div>
          )}

          {/* Chapter Count */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="text-white text-sm font-medium">
                {story.segment_count || 0} {story.segment_count === 1 ? 'chapter' : 'chapters'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Title with edit functionality */}
          <div className="mb-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-amber-500/30 rounded px-2 py-1 text-amber-200 focus:outline-none focus:border-amber-400 text-lg font-bold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle(story.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
                <button
                  onClick={() => handleSaveTitle(story.id)}
                  className="p-1 text-green-400 hover:text-green-300"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-400 hover:text-red-300"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg line-clamp-2 fantasy-heading flex-1 group-hover:text-amber-300 transition-colors">
                  {story.title ?? 'Untitled Story'}
                </h3>
                <button
                  onClick={() => handleStartEdit(story.id, story.title ?? '')}
                  className="p-1 text-amber-400 hover:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit Title"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
            {story.description || 'No description available'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/story/${story.id}`)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 group-hover:shadow-lg group-hover:shadow-amber-500/25"
            >
              <Eye className="h-4 w-4" />
              <span>{story.is_completed ? 'Read Story' : 'Continue'}</span>
            </button>
            <button
              onClick={() => handleSetStoryToDelete(story.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
              title="Delete Story"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Performance log
  React.useEffect(() => {
    // Optionally log renderCount or timeSinceLastRender for debugging
    // console.log('MyStories renders:', renderCount, 'Last render time:', timeSinceLastRender);
  }, [renderCount, timeSinceLastRender, filteredAndSortedStories.length]);

  return (
    <div className="magical-page-container">
      <div className="magical-content">
        <div className="container mx-auto px-4 py-16">
          {/* NEW compact hero */}
          <div className="text-center mb-12 animate-magical-fade-in">
            <h1 className="fantasy-heading text-3xl md:text-4xl font-bold text-white mb-2">
              Your Library
            </h1>
            <p className="fantasy-subtitle text-gray-400 text-lg">
              Every adventure you've authored, here to replay or continue.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 btn-magical text-lg px-8 py-3">
              <PenTool className="h-5 w-5 mr-2" />
              Create New Story
            </button>
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
                            : 'glass-card text-gray-300 hover:bg-slate-700'}`}
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
          ) : (
            <>
              {filteredAndSortedStories.length === 0 ? (
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
                <div className="space-y-12">
                  {Object.entries(storyGroups).map(([key, group]) => {
                    if (group.stories.length === 0) return null;
                    
                    return (
                      <div key={key} className="animate-magical-fade-in">
                        {/* Group Header */}
                        <div className="mb-8 text-center">
                          <h2 className="fantasy-heading text-2xl md:text-3xl font-bold text-white mb-2">
                            {group.title}
                          </h2>
                          <p className="fantasy-subtitle text-gray-400 text-lg mb-4">
                            {group.description}
                          </p>
                          <div className="flex items-center justify-center gap-4 text-amber-300/80">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stories Grid */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6' : 'space-y-4'}>
                          {group.stories.map((story) => renderStoryCard(story))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
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