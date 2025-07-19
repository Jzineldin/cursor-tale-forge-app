
import React, { useState } from 'react';
import { Trash2, Eye, Edit, Calendar, BookOpen, Check, X, Play } from 'lucide-react';
import { Story } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface MagicalStoryCardProps {
  story: Story;
  onSetStoryToDelete: (storyId: string) => void;
  viewMode: 'grid' | 'list';
}

const MagicalStoryCard: React.FC<MagicalStoryCardProps> = ({
  story,
  onSetStoryToDelete,
  viewMode
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title || '');
  
  const handleView = () => {
    window.location.href = `/story/${story.id}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveTitle = async () => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ title: editTitle })
        .eq('id', story.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast.success('Story title updated');
    } catch (error) {
      toast.error('Failed to update title');
      console.error('Error updating title:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(story.title || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    onSetStoryToDelete(story.id);
  };

  const handleContinue = () => {
    // Navigate to story creation with resume state
    navigate('/create', { 
      state: { 
        resumeStoryId: story.id,
        resumeStoryTitle: story.title 
      } 
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="magical-story-card bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-amber-500/30 rounded-lg p-4 hover:border-amber-400/50 transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {story.thumbnail_url && (
              <img 
                src={story.thumbnail_url} 
                alt="Story thumbnail"
                className="w-16 h-16 object-cover rounded-lg border border-amber-500/30 cursor-pointer"
                onClick={handleView}
              />
            )}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-slate-700/50 border border-amber-500/30 rounded px-2 py-1 text-amber-200 focus:outline-none focus:border-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 text-green-400 hover:text-green-300"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <h3 className="story-title text-amber-200">
                  {story.title || 'Untitled Story'}
                </h3>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(story.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {story.segment_count || 0} segments
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleView}
              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
              title="View Story"
            >
              <Eye className="h-4 w-4" />
            </button>
            {!story.is_completed && (
              <button
                onClick={handleContinue}
                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors"
                title="Continue Story"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors"
                title="Edit Title"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
              title="Delete Story"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="magical-story-card bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-500/30 rounded-xl p-6 hover:border-amber-400/50 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105">
      <div className="flex flex-col h-full">
        {story.thumbnail_url && (
          <div className="mb-4">
            <img 
              src={story.thumbnail_url} 
              alt="Story thumbnail"
              className="w-full h-48 object-cover rounded-lg border border-amber-500/30 cursor-pointer"
              onClick={handleView}
            />
          </div>
        )}
        
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 bg-slate-700/50 border border-amber-500/30 rounded px-2 py-1 text-amber-200 focus:outline-none focus:border-amber-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 text-green-400 hover:text-green-300"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <h3 className="story-title text-amber-200 mb-3">
              {story.title || 'Untitled Story'}
            </h3>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(story.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {story.segment_count || 0} segments
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleView}
                className="px-3 py-1 text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/30 transition-colors"
              >
                View
              </button>
              {!story.is_completed && (
                <button
                  onClick={handleContinue}
                  className="px-3 py-1 text-xs bg-green-600/20 text-green-300 border border-green-500/30 rounded hover:bg-green-600/30 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <Play className="h-3 w-3" />
                  <span>Continue</span>
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-600/30 transition-colors"
                >
                  Edit Title
                </button>
              )}
            </div>
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
              title="Delete Story"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicalStoryCard;
