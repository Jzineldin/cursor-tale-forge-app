
import React from 'react';
import { StorySegmentRow } from '@/types/stories';
import { useSlideshowState } from './hooks/useSlideshowState';
import { useSlideshowAutoAdvance } from './hooks/useSlideshowAutoAdvance';

interface StorySlideshowProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

const StorySlideshow: React.FC<StorySlideshowProps> = ({ 
  segments, 
  fullStoryAudioUrl, 
  isOpen, 
  onClose 
}) => {
  const {
    currentSlide,
    isPlaying,
    autoAdvance,
    setCurrentSlide,
    setIsPlaying,
    nextSlide,
    prevSlide,
    togglePlayback,
    goToSlide,
  } = useSlideshowState({ segments, fullStoryAudioUrl: fullStoryAudioUrl || '', isOpen });

  const {
    currentTime,
    duration
  } = useSlideshowAutoAdvance({
    isPlaying,
    autoAdvance,
    segments,
    currentSlide,
    setCurrentSlide,
    setIsPlaying,
    fullStoryAudioUrl: fullStoryAudioUrl || '',
  });

  const currentSegment = segments[currentSlide];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time without decimals
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Removed word-by-word highlighting system - just show full text
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Slideshow Container - Dark Theme */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-purple-800/50 to-slate-800 p-3 sm:p-4 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-slate-400 text-xs sm:text-sm truncate">Slide {currentSlide + 1} of {segments.length}</p>
            </div>
          </div>
          
          {/* Auto-advance toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs sm:text-sm min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ${
              autoAdvance 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
            }`}
          >
            {autoAdvance ? 'Auto' : 'Manual'}
          </button>
        </div>

        {/* Audio Controls */}
        {fullStoryAudioUrl && (
          <div className="bg-slate-800/50 p-3 sm:p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2 sm:gap-4 justify-center">
              <button
                onClick={togglePlayback}
                className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 transition-colors shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3 text-slate-300 text-xs sm:text-sm">
                <span className="font-mono">{formatTime(currentTime)}</span>
                <div className="w-24 sm:w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-100 rounded-full shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
          {/* Title Section */}
          {/* Removed 'Watch Your Story' title and underline */}

          {/* Image */}
          {currentSegment?.image_url && (
            <div className="relative mb-4 sm:mb-6 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
              <img
                src={currentSegment.image_url}
                alt={`Scene ${currentSlide + 1}`}
                className="w-full h-48 sm:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          {/* Text Content with New Highlighting System */}
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="relative">
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed break-words overflow-hidden">
                {currentSegment?.segment_text}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-slate-800/50 p-3 sm:p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-1 sm:gap-2">
              {segments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors min-w-[8px] min-h-[8px] ${
                    index === currentSlide 
                      ? 'bg-amber-500 shadow-sm' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              disabled={currentSlide === segments.length - 1}
              className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySlideshow;
