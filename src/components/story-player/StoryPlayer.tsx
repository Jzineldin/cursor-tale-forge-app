import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Loader2,
  VolumeX,
  Volume1,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoryImage from '@/components/story-viewer/StoryImage';

interface StorySegment {
  id: string;
  segment_text: string;
  image_url?: string;
  audio_url?: string;
  image_generation_status?: string;
  word_count?: number;
  audio_duration?: number;
}

interface StoryPlayerProps {
  storyId: string;
  segments: StorySegment[];
  initialSegmentIndex?: number;
  className?: string;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ 
  segments, 
  initialSegmentIndex = 0,
  className = ''
}) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(initialSegmentIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [localSegments, setLocalSegments] = useState<StorySegment[]>(segments);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSegment = localSegments[currentSegmentIndex];

  // Update local segments when props change, preserving existing audio URLs
  useEffect(() => {
    setLocalSegments(prevSegments => {
      const updatedSegments = segments.map((newSegment, index) => {
        const existingSegment = prevSegments[index];
        // Preserve existing audio_url if it exists
        return {
          ...newSegment,
          audio_url: existingSegment?.audio_url || newSegment.audio_url || ''
        };
      });
      return updatedSegments;
    });
  }, [segments]);

  // Remove automatic audio generation on segment change
  // Audio will only be generated when user explicitly requests it

  const generateAudioForSegment = async (segment: StorySegment) => {
    if (isGeneratingAudio) return;
    
    setIsGeneratingAudio(true);
    setAudioError(null);
    
    try {
      console.log('🔊 Generating audio for segment:', segment.id);
      
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: {
          text: segment.segment_text,
          voice: 'fable',
          speed: 1.0,
          segmentId: segment.id
        }
      });
      
      if (error) throw error;
      
      if (data?.audio_url) {
        // Update the segment in our local state
        setLocalSegments(prev => prev.map(seg => 
          seg.id === segment.id 
            ? { ...seg, audio_url: data.audio_url, audio_duration: data.duration }
            : seg
        ));
        
        // Update in database
        await supabase
          .from('story_segments')
          .update({ 
            audio_url: data.audio_url,
            audio_duration: data.duration 
          })
          .eq('id', segment.id);
        
        toast.success('Audio generated successfully!');
      }
    } catch (error) {
      console.error('Failed to generate audio:', error);
      setAudioError('Failed to generate audio. Please try again.');
      toast.error('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSegment?.audio_url) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Error playing audio:', error);
          setAudioError('Failed to play audio');
          setIsPlaying(false);
        });
    }
  };

  const goToNextSegment = () => {
    if (currentSegmentIndex < localSegments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
    }
  };

  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (currentSegmentIndex < localSegments.length - 1) {
      setTimeout(() => goToNextSegment(), 1000);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <div className={`story-player max-w-4xl mx-auto bg-slate-900 rounded-lg overflow-hidden shadow-2xl ${className}`}>
      {/* Story Display */}
      <div className="relative">
        <div className="w-full h-96 overflow-hidden bg-slate-800">
          <StoryImage
            imageUrl={currentSegment?.image_url || null}
            imageGenerationStatus={currentSegment?.image_generation_status || ''}
            altText={`Chapter ${currentSegmentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
          <h2 className="text-white text-2xl font-bold mb-2">
            Chapter {currentSegmentIndex + 1}
          </h2>
          <div className="text-amber-400 text-sm flex items-center gap-2">
            <span>{currentSegmentIndex + 1} of {localSegments.length}</span>
            {currentSegment?.word_count && (
              <span>• {currentSegment.word_count} words</span>
            )}
          </div>
        </div>
      </div>

      {/* Story Text */}
      <div className="p-6 bg-slate-800 max-h-64 overflow-y-auto">
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-200 text-lg leading-relaxed font-serif">
            {currentSegment?.segment_text}
          </p>
        </div>
      </div>

      {/* Audio Player Controls */}
      <div className="bg-slate-900 p-6">
        {currentSegment?.audio_url && (
          <audio
            ref={audioRef}
            src={currentSegment.audio_url}
            preload="metadata"
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onEnded={handleAudioEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setAudioError('Failed to load audio')}
          />
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            className="w-full h-2 bg-slate-700 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Control Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            onClick={goToPreviousSegment}
            disabled={currentSegmentIndex === 0}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button
            onClick={togglePlayPause}
            disabled={!currentSegment?.audio_url || isGeneratingAudio}
            size="lg"
            className="bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-50 rounded-full w-16 h-16"
          >
            {isGeneratingAudio ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={goToNextSegment}
            disabled={currentSegmentIndex === localSegments.length - 1}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Volume and Additional Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getVolumeIcon()}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 accent-amber-400"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {!currentSegment?.audio_url && !isGeneratingAudio && (
              <Button
                onClick={() => generateAudioForSegment(currentSegment)}
                variant="outline"
                size="sm"
                className="text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-slate-900"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Generate Audio
              </Button>
            )}
            
            {audioError && (
              <Button
                onClick={() => {
                  setAudioError(null);
                  if (currentSegment) generateAudioForSegment(currentSegment);
                }}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {isGeneratingAudio && (
          <div className="mt-4 text-center text-amber-400 text-sm flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating audio for this chapter...</span>
          </div>
        )}
        
        {audioError && (
          <div className="mt-4 text-center text-red-400 text-sm">
            {audioError}
          </div>
        )}
      </div>

      {/* Chapter Navigation */}
      <div className="bg-slate-800 p-4 border-t border-slate-700">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {localSegments.map((segment, index) => (
            <Button
              key={segment.id}
              onClick={() => {
                setCurrentSegmentIndex(index);
                setCurrentTime(0);
                setIsPlaying(false);
                setAudioError(null);
              }}
              variant={index === currentSegmentIndex ? "default" : "outline"}
              size="sm"
              className={`flex-shrink-0 ${
                index === currentSegmentIndex
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                  : 'border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <span>Chapter {index + 1}</span>
              {segment.audio_url && (
                <Volume2 className="w-3 h-3 ml-1" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
