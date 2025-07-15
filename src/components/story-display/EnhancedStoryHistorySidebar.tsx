
import React from 'react';
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
  const totalWords = storySegments.reduce((sum, segment) => sum + (segment.word_count || 0), 0);
  const estimatedReadTime = Math.max(1, Math.ceil(totalWords / 200));

  const handleChapterClick = (index: number) => {
    console.log('Sidebar chapter clicked:', index, 'calling onSegmentClick');
    onSegmentClick(index);
  };

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Story Statistics */}
      <Card className="bg-slate-800/60 border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-300 text-lg flex items-center gap-2">
            <Book className="h-5 w-5" />
            Story Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{storySegments.length}</div>
              <div className="text-sm text-gray-400">Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{totalWords}</div>
              <div className="text-sm text-gray-400">Words</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{estimatedReadTime}</div>
              <div className="text-sm text-gray-400">Min Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{storySegments.length}</div>
              <div className="text-sm text-gray-400">Images</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story History */}
      <Card className="bg-slate-800/60 border-amber-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-300 text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Story History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64 md:h-80">
            <div className="space-y-2 p-4">
              {storySegments.map((segment, index) => {
                const isCurrentChapter = index === currentChapterIndex;
                return (
                  <div
                    key={segment.id}
                    onClick={() => handleChapterClick(index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:border-amber-400 hover:bg-slate-700/50 ${
                      isCurrentChapter 
                        ? 'border-amber-400 bg-amber-500/10' 
                        : 'border-slate-600 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold text-sm ${
                        isCurrentChapter ? 'text-amber-300' : 'text-amber-400'
                      }`}>
                        Chapter {index + 1}
                        {isCurrentChapter && (
                          <span className="ml-2 text-xs bg-amber-400 text-slate-900 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>1 min</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                      {segment.segment_text.length > 100
                        ? `${segment.segment_text.substring(0, 100)}...`
                        : segment.segment_text}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStoryHistorySidebar;
