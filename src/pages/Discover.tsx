import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Search, Heart, Calendar, User, BookOpen, Sparkles, Filter, Grid, List, PenTool, Check, X, MessageCircle, Eye, Bookmark } from 'lucide-react';
import { LikeButton } from '@/components/ui/LikeButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

interface PublicStory {
  id: string;
  title: string;
  description: string;
  story_mode: string;
  created_at: string;
  published_at: string;
  segment_count: number;
  like_count: number;
  comment_count: number;
  author_name: string;
  thumbnail_url?: string;
  is_completed: boolean;
  audio_generation_status?: string;
  full_story_audio_url?: string;
  user_id?: string;
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'title' | 'length';
type ViewMode = 'grid' | 'list';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const storiesPerPage = 12;

  const { data: storiesData, isLoading, error } = useQuery({
    queryKey: ['public-stories', debouncedSearchTerm, selectedGenre, sortBy, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('stories')
        .select(`
          id,
          title,
          description,
          story_mode,
          created_at,
          published_at,
          segment_count,
          thumbnail_url,
          is_completed,
          audio_generation_status,
          full_story_audio_url,
          user_id
        `)
        .eq('is_public', true);

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply genre filter
      if (selectedGenre) {
        query = query.eq('story_mode', selectedGenre);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('published_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('published_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'length':
          query = query.order('segment_count', { ascending: false });
          break;
        case 'popular':
          // For now, order by segment count as a proxy for popularity
          query = query.order('segment_count', { ascending: false });
          break;
      }

      const { data, error, count } = await query.range(
        (currentPage - 1) * storiesPerPage,
        currentPage * storiesPerPage - 1
      );

      if (error) {
        console.error('❌ Discover page query error:', error);
        throw error;
      }

      // Filter out stories without published_at on the client side
      const publishedStories = data?.filter(story => story.published_at) || [];

      console.log('🔍 Discover page - Stories query result:', {
        totalCount: count,
        storiesFound: publishedStories.length,
        stories: publishedStories.map(s => ({
          id: s.id,
          title: s.title,
          published_at: s.published_at,
          hasUser: !!s.user_id
        }))
      });

      // Get likes and comments counts for all stories
      const storyIds = publishedStories.map(story => story.id);
      
      const { data: likesData } = await supabase
        .from('story_likes')
        .select('story_id')
        .in('story_id', storyIds);

      const { data: commentsData } = await supabase
        .from('story_comments')
        .select('story_id')
        .in('story_id', storyIds);

      // Count likes and comments per story
      const likeCounts = likesData?.reduce((acc, like) => {
        if (like.story_id) {
          acc[like.story_id] = (acc[like.story_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const commentCounts = commentsData?.reduce((acc, comment) => {
        if (comment.story_id) {
          acc[comment.story_id] = (acc[comment.story_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const stories = publishedStories.map(story => ({
        ...story,
        author_name: story.user_id ? 'Story Creator' : 'Anonymous',
        like_count: likeCounts[story.id] || 0,
        comment_count: commentCounts[story.id] || 0
      })) as PublicStory[];

      return {
        stories,
        totalCount: publishedStories.length,
        totalPages: Math.ceil(publishedStories.length / storiesPerPage)
      };
    }
  });

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
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'length', label: 'Longest First' }
  ];

  const getGenreEmoji = (genre: string) => {
    const genreData = genres.find(g => g.value === genre);
    return genreData?.emoji || '📖';
  };

  const getGenreLabel = (genre: string) => {
    const genreData = genres.find(g => g.value === genre);
    return genreData?.label || genre.replace('-', ' ');
  };

  const handleEditTitle = (storyId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingStory(storyId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = async (storyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to edit stories');
      return;
    }

    try {
      const { error } = await supabase
        .from('stories')
        .update({ title: editTitle.trim() || 'Untitled Story' })
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Story title updated!');
      setEditingStory(null);
      // Refetch the stories to show updated title
      window.location.reload();
    } catch (error) {
      console.error('Error updating story title:', error);
      toast.error('Failed to update story title');
    }
  };

  const handleCancelEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingStory(null);
    setEditTitle('');
  };

  const handleBookmark = useCallback(async (_storyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) {
      toast.error('Please sign in to bookmark stories');
      return;
    }
    // TODO: Implement bookmark functionality
    toast.success('Bookmark feature coming soon!');
  }, [user]);

  const renderStoryCard = (story: PublicStory) => {
    const isOwner = user && story.user_id === user.id;
    const isEditing = editingStory === story.id;

    if (viewMode === 'list') {
      return (
        <Card 
          key={story.id}
          className="bg-slate-800/90 border-slate-600 backdrop-blur-sm hover:border-amber-400/60 transition-all duration-300 cursor-pointer group"
          onClick={() => navigate(`/story/${story.id}`)}
        >
          <div className="flex items-center p-4 gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{getGenreEmoji(story.story_mode)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-white bg-slate-700 border-slate-600"
                        autoFocus
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => handleSaveTitle(story.id, e)}
                        className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div 
                        className="text-white text-lg font-serif group-hover:text-amber-400 transition-colors flex-1"
                        style={{ 
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                          whiteSpace: 'normal',
                          lineHeight: '1.3',
                          display: 'block'
                        }}
                      >
                        {story.title}
                      </div>
                      {isOwner && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                          title="Edit Title"
                          onClick={(e) => handleEditTitle(story.id, story.title, e)}
                        >
                          <PenTool className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getGenreLabel(story.story_mode)}
                    </Badge>
                    {story.is_completed && (
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                        Complete
                      </Badge>
                    )}
                    {story.full_story_audio_url && (
                      <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                        Audio
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleBookmark(story.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-300 text-sm mt-2 line-clamp-1">
                {story.description}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{story.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{story.segment_count} chapters</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(story.published_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card 
        key={story.id}
        className="bg-slate-800/90 border-slate-600 backdrop-blur-sm hover:border-amber-400/60 transition-all duration-300 cursor-pointer group relative overflow-hidden"
        onClick={() => navigate(`/story/${story.id}`)}
      >
        {story.thumbnail_url && (
          <div className="h-32 overflow-hidden">
            <img 
              src={story.thumbnail_url} 
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xl">{getGenreEmoji(story.story_mode)}</span>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-white bg-slate-700 border-slate-600"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => handleSaveTitle(story.id, e)}
                      className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleCancelEdit}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div 
                      className="text-white text-base font-serif group-hover:text-amber-400 transition-colors font-semibold flex-1"
                      style={{ 
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'normal',
                        lineHeight: '1.3',
                        display: 'block'
                      }}
                    >
                      {story.title}
                    </div>
                    {isOwner && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                        title="Edit Title"
                        onClick={(e) => handleEditTitle(story.id, story.title, e)}
                      >
                        <PenTool className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleBookmark(story.id, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="secondary" className="text-xs">
              {getGenreLabel(story.story_mode)}
            </Badge>
            {story.is_completed && (
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                Complete
              </Badge>
            )}
            {story.full_story_audio_url && (
              <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                Audio
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <User className="h-3 w-3" />
            <span className="truncate">{story.author_name}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {story.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {story.segment_count}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {story.like_count}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(story.published_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const stories = storiesData?.stories || [];
  const totalPages = storiesData?.totalPages || 1;

  return (
    <div 
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 pb-16">
        {/* Enhanced Page Header */}
        <div className="mb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent mb-2">
                Discover Amazing Stories
              </h1>
              <p className="text-gray-400 text-lg">
                Explore stories created by our community of storytellers
              </p>
            </div>
            <div className="flex items-center gap-6 text-amber-300/80">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{storiesData?.totalCount || 0} stories</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Community created</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search stories by title or description..."
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

        {/* Stories Content */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-slate-800/90 border-slate-600 backdrop-blur-sm animate-pulse">
                <div className="h-32 bg-slate-600 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-slate-600 rounded mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm text-center py-12">
            <CardContent>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Error Loading Stories</h3>
              <p className="text-gray-300 mb-6">
                There was an error loading the stories. Please try again later.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : stories.length > 0 ? (
          <>
            <div className={`grid gap-6 mb-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {stories.map(renderStoryCard)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  Previous
                </Button>
                <span className="text-gray-300 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-amber-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Stories Found</h3>
              <p className="text-gray-300 mb-6">
                {searchTerm || selectedGenre 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to publish a public story!"
                }
              </p>
              <Button
                onClick={() => navigate('/create/genre')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Create Story
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Discover;
