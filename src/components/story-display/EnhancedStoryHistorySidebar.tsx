
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Clock, FileText } from 'lucide-react';
import { StorySegment } from '@/hooks/useStoryDisplay/types';

interface EnhancedStoryHistorySidebarProps {
  storySegments: StorySegment[];
  currentSegmentId?: string;
  storyTitle: string;
  onSegmentClick: (segmentIndex: number) => void;
  currentChapterIndex?: number;
}

const EnhancedStoryHistorySidebar: React.FC<EnhancedStoryHistorySidebarProps> = ({
  storySegments,
  onSegmentClick,
  currentChapterIndex = 0
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentChapterRef = useRef<HTMLDivElement>(null);
  
  const totalWords = storySegments.reduce((sum, segment) => sum + (segment.word_count || 0), 0);
  const estimatedReadTime = Math.max(1, Math.ceil(totalWords / 200));

  // Auto-scroll to current chapter when it changes
  useEffect(() => {
    if (currentChapterRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const chapterElement = currentChapterRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const chapterRect = chapterElement.getBoundingClientRect();
        
        // Calculate if the chapter is outside the visible area
        const isAbove = chapterRect.top < containerRect.top;
        const isBelow = chapterRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
          chapterElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentChapterIndex, storySegments.length]);

  const handleChapterClick = (index: number) => {
    console.log('Sidebar chapter clicked:', index, 'calling onSegmentClick');
    onSegmentClick(index);
  };

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Story Statistics */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-6 w-6 text-amber-400" />
          <h3 className="fantasy-heading text-lg font-bold text-amber-400">
            Story Statistics
          </h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="fantasy-heading text-2xl font-bold text-amber-400">{storySegments.length}</div>
              <div className="fantasy-subtitle text-xs text-gray-300">Chapters</div>
            </div>
            <div className="text-center">
              <div className="fantasy-heading text-2xl font-bold text-amber-400">{totalWords}</div>
              <div className="fantasy-subtitle text-xs text-gray-300">Words</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="fantasy-heading text-2xl font-bold text-amber-400">{estimatedReadTime}</div>
              <div className="fantasy-subtitle text-xs text-gray-300">Min Read</div>
            </div>
            <div className="text-center">
              <div className="fantasy-heading text-2xl font-bold text-amber-400">{storySegments.length}</div>
              <div className="fantasy-subtitle text-xs text-gray-300">Images</div>
            </div>
          </div>
        </div>
      </div>

      {/* Story History */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-amber-400" />
          <h3 className="fantasy-heading text-lg font-bold text-amber-400">
            Story History
          </h3>
        </div>
        <ScrollArea ref={scrollAreaRef} className="h-64 md:h-80">
          <div className="space-y-3 pr-4">
            {storySegments.map((segment, index) => {
              const isCurrentChapter = index === currentChapterIndex;
              return (
                <div
                  key={segment.id}
                  ref={isCurrentChapter ? currentChapterRef : null}
                  onClick={() => handleChapterClick(index)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-400/10 hover:scale-[1.02] ${
                    isCurrentChapter 
                      ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 to-amber-400/20 shadow-lg shadow-amber-500/20' 
                      : 'border-slate-600/50 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`fantasy-heading font-bold text-sm ${
                      isCurrentChapter ? 'text-amber-200' : 'text-amber-400'
                    }`}>
                      Chapter {index + 1}
                      {isCurrentChapter && (
                        <span className="ml-2 text-xs bg-amber-400 text-slate-900 px-2 py-1 rounded-full font-bold">
                          Current
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>1 min</span>
                    </div>
                  </div>
                  <p className="fantasy-subtitle text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {segment.segment_text.length > 100
                      ? `${segment.segment_text.substring(0, 100)}...`
                      : segment.segment_text}
                  </p>
                  <div className="fantasy-subtitle mt-3 text-xs text-gray-400">
                    {segment.word_count || segment.segment_text.split(/\s+/).length} words
                    {segment.audio_url && (
                      <span className="ml-2 text-amber-400">• Has Audio</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default EnhancedStoryHistorySidebar;
