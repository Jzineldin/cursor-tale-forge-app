
import { useMemo, useState } from 'react';
import { Story } from '@/types/stories';

export type SortOption = 'latest' | 'oldest' | 'title' | 'length' | 'status';
export type SortOrder = 'asc' | 'desc';

export const useStorySorting = (stories: Story[] | undefined) => {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedStories = useMemo(() => {
    if (!stories) return [];

    return [...stories].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'latest':
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          comparison = (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
          break;
        case 'length':
          // Sort by segment count (number of chapters/parts in the story)
          comparison = a.segment_count - b.segment_count;
          break;
        case 'status':
          // Sort by completion status, then by public status
          if (a.is_completed !== b.is_completed) {
            comparison = a.is_completed ? -1 : 1;
          } else if (a.is_public !== b.is_public) {
            comparison = a.is_public ? -1 : 1;
          } else {
            comparison = 0;
          }
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [stories, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
  };

  const handleOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return {
    sortedStories,
    sortBy,
    sortOrder,
    handleSortChange,
    handleOrderToggle,
  };
};
