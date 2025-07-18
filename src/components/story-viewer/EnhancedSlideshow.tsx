import React, { useState, useRef, useEffect } from 'react';
import { StorySegmentRow } from '@/types/stories';
import { useSlideshow } from '@/context/SlideshowContext';

interface EnhancedSlideshowProps {
  segments: StorySegmentRow[];
  fullStoryAudioUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedSlideshow: React.FC<EnhancedSlideshowProps> = ({ 
  segments, 
  fullStoryAudioUrl, 
  isOpen, 
  onClose 
}) => {
  const { openSlideshow, closeSlideshow } = useSlideshow();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update slideshow context when isOpen changes
  useEffect(() => {
    if (isOpen) {
      openSlideshow();
    } else {
      closeSlideshow();
    }
  }, [isOpen, openSlideshow, closeSlideshow]);

  // Simple word timing calculation (can be improved with real audio analysis)
  const calculateWordTiming = (text: string, chapterIndex: number, totalDuration: number) => {
    const words = text.split(' ');
    const wordsPerSecond = words.length / (totalDuration / segments.length);
    
    return words.map((word, index) => ({
      word,
      startTime: (chapterIndex * (totalDuration / segments.length)) + (index / wordsPerSecond),
      endTime: (chapterIndex * (totalDuration / segments.length)) + ((index + 1) / wordsPerSecond)
    }));
  };

  // Update highlighting and chapter based on audio time
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    const updateSync = () => {
      const currentTime = audioRef.current?.currentTime || 0;
      const totalDuration = audioRef.current?.duration || 1;
      
      // Calculate which chapter should be active
      const chapterDuration = totalDuration / segments.length;
      const newChapter = Math.floor(currentTime / chapterDuration);
      
      if (newChapter !== currentChapter && newChapter < segments.length) {
        setCurrentChapter(newChapter);
      }
      
      // Calculate which word should be highlighted
      const currentSegment = segments[currentChapter];
      if (currentSegment) {
        const words = calculateWordTiming(currentSegment.segment_text || '', currentChapter, totalDuration);
        const activeWord = words.findIndex(word => 
          currentTime >= word.startTime && currentTime < word.endTime
        );
        setCurrentWordIndex(Math.max(0, activeWord));
      }
    };

    const interval = setInterval(updateSync, 200);
    return () => clearInterval(interval);
  }, [isPlaying, currentChapter, segments]);

  const renderHighlightedText = (text: string) => {
    const words = text.split(' ');
    return (
      <div className="text-lg leading-relaxed">
        {words.map((word, index) => (
          <span
            key={index}
            className={`transition-all duration-300 ${
              index === currentWordIndex && isPlaying
                ? 'bg-yellow-400 bg-opacity-60 px-1 rounded-md shadow-sm font-medium text-gray-900'
                : 'text-gray-100'
            }`}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    );
  };

  const handleChapterJump = (chapterIndex: number) => {
    if (chapterIndex >= 0 && chapterIndex < segments.length) {
      setCurrentChapter(chapterIndex);
      if (audioRef.current && duration > 0) {
        const chapterStartTime = (chapterIndex * duration) / segments.length;
        audioRef.current.currentTime = chapterStartTime;
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleChapterJump(currentChapter - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleChapterJump(currentChapter + 1);
        break;
      case ' ':
        e.preventDefault();
        handlePlayPause();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentChapter, isPlaying]);

  // Prevent body scroll and hide header when slideshow is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('slideshow-open');
      document.body.classList.add('slideshow-active');
    } else {
      document.body.classList.remove('slideshow-open');
      document.body.classList.remove('slideshow-active');
    }
    
    return () => {
      document.body.classList.remove('slideshow-open');
      document.body.classList.remove('slideshow-active');
    };
  }, [isOpen]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const currentSegment = segments[currentChapter];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col slideshow-container">
      
      {/* Enhanced Header with Controls */}
      <div className="flex justify-between items-center p-4 text-white bg-black bg-opacity-50">
        <div className="flex items-center space-x-4">
          {/* Removed old exit button - now using fixed positioned one */}
        </div>
        
        <div className="text-sm opacity-75">
          Chapter {currentChapter + 1} of {segments.length}
        </div>
        
        <div className="text-xs opacity-60">
          ESC to exit • ← → to navigate • Space to play/pause
        </div>
      </div>

      {/* Fixed Position Exit Button - More Visible */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-200 p-2 rounded-full border border-white/10 hover:border-white/20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Enhanced Audio Controls */}
      {fullStoryAudioUrl && (
        <div className="px-6 py-3 bg-black bg-opacity-50">
          <audio
            ref={audioRef}
            src={fullStoryAudioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            className="w-full h-10"
            controls
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl w-full mx-auto">
          
          {/* Chapter Image - Much Larger */}
          <div className="mb-6">
            {currentSegment?.image_url && currentSegment.image_url !== '/placeholder.svg' ? (
              <img 
                src={currentSegment.image_url} 
                alt={`Chapter ${currentChapter + 1}`}
                className="w-full max-h-[60vh] object-contain rounded-lg mx-auto shadow-2xl border border-amber-500/30"
              />
            ) : (
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center border border-amber-500/30">
                <span className="text-gray-400 text-lg">📖 No image for this chapter</span>
              </div>
            )}
          </div>

          {/* Chapter Text */}
          <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-gray-600/50">
            <h3 className="text-xl font-semibold text-white mb-3">
              Chapter {currentChapter + 1}
            </h3>
            <div 
              className="text-lg leading-relaxed text-gray-100 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-amber-500"
              style={{ 
                height: '300px',
                maxHeight: '300px',
                overflowY: 'scroll',
                paddingRight: '8px'
              }}
            >
              {currentSegment?.segment_text || 'No text available for this chapter.'}
            </div>
          </div>

        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="p-6 bg-black bg-opacity-50">
        <div className="flex justify-between items-center text-white max-w-7xl mx-auto">
          
          {/* Previous Button */}
          <button 
            onClick={() => handleChapterJump(currentChapter - 1)}
            disabled={currentChapter === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>←</span>
            <span>Previous</span>
          </button>
          
          {/* Chapter Dots */}
          <div className="flex space-x-2">
            {segments.map((_, index) => (
              <button
                key={index}
                onClick={() => handleChapterJump(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentChapter 
                    ? 'bg-orange-500 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                title={`Go to Chapter ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Next Button */}
          <button 
            onClick={() => handleChapterJump(currentChapter + 1)}
            disabled={currentChapter === segments.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 max-w-7xl mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentChapter + 1) / segments.length) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Chapter {currentChapter + 1}</span>
            <span>{segments.length} Total Chapters</span>
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Ensure scrolling works */
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }

          /* Custom scrollbar for text content */
          .text-lg.leading-relaxed.text-gray-100::-webkit-scrollbar {
            width: 6px;
          }

          .text-lg.leading-relaxed.text-gray-100::-webkit-scrollbar-track {
            background: #374151;
            border-radius: 3px;
          }

          .text-lg.leading-relaxed.text-gray-100::-webkit-scrollbar-thumb {
            background: #f59e0b;
            border-radius: 3px;
          }

          .text-lg.leading-relaxed.text-gray-100::-webkit-scrollbar-thumb:hover {
            background: #d97706;
          }

          /* Prevent body scroll when slideshow is open */
          body.slideshow-open {
            overflow: hidden;
          }

          /* Hide header when slideshow is active */
          body.slideshow-active header,
          body.slideshow-active .header-glassmorphic,
          body.slideshow-active .fixed.top-0 {
            display: none !important;
          }

          body.slideshow-active {
            overflow: hidden;
          }
        `
      }} />
    </div>
  );
};

export default EnhancedSlideshow; 