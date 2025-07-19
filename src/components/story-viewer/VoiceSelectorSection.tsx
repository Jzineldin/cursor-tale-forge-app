import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, Volume2, Loader2, RefreshCw, User, Mic, Crown } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

interface VoiceSelectorSectionProps {
  storyId: string;
  fullStoryAudioUrl?: string | undefined;
  audioGenerationStatus?: string | undefined;
  onAudioGenerated?: (audioUrl: string) => void;
}

const VoiceSelectorSection: React.FC<VoiceSelectorSectionProps> = ({
  storyId,
  fullStoryAudioUrl,
  audioGenerationStatus,
  onAudioGenerated
}) => {
  const { user } = useAuth();
  const { hasAccess: hasPremium, loading: premiumLoading } = usePremiumAccess();
  const [selectedVoice, setSelectedVoice] = useState('');
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [showVoiceGrid, setShowVoiceGrid] = useState(false);

  const generateAudioMutation = useGenerateFullStoryAudio();
  const isGenerating = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
  const hasAudio = audioGenerationStatus === 'completed' && fullStoryAudioUrl;

  // Fetch real voices from ElevenLabs API
  const fetchVoices = async () => {
    setLoadingVoices(true);
    setVoiceError(null);
    
    try {
      console.log('🎵 Fetching voices from ElevenLabs API...');
      const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices');
      
      if (error) {
        console.error('❌ Error fetching voices:', error);
        setVoiceError(`Failed to fetch voices: ${error.message}`);
        toast.error('Failed to fetch voices from ElevenLabs');
        return;
      }

      if (data && data.allVoices && data.allVoices.length > 0) {
        console.log(`✅ Successfully loaded ${data.allVoices.length} voices`);
        setAvailableVoices(data.allVoices);
        
        // Set first voice as default if none selected
        if (!selectedVoice && data.allVoices.length > 0) {
          setSelectedVoice(data.allVoices[0].voice_id);
        }
        
        toast.success(`Loaded ${data.allVoices.length} voices from ElevenLabs`);
      } else {
        setVoiceError('No voices found in your ElevenLabs account');
        toast.warning('No voices found in your ElevenLabs account');
      }
    } catch (error: any) {
      console.error('❌ Error fetching voices:', error);
      setVoiceError(`Network error: ${error.message}`);
      toast.error('Failed to connect to voice service');
    } finally {
      setLoadingVoices(false);
    }
  };

  // Test a specific voice
  const testVoice = async (voiceId: string, voiceName: string) => {
    console.log('🎵 Testing voice:', voiceId, voiceName);
    setTestingVoice(voiceId);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-voice', {
        body: {
          voiceId: voiceId,
          text: `Hello! This is ${voiceName} speaking. I'm perfect for storytelling adventures!`,
        }
      });
      
      if (error) {
        console.error('🎵 Voice test error:', error);
        toast.error(`Failed to test ${voiceName}: ${error.message}`);
        return;
      }

      if (data && data.success !== false) {
        console.log('🎵 Voice test successful:', data);
        toast.success(`Voice test successful for ${voiceName}`);
        
        // Play the audio if we have content
        if (data.audioContent) {
          const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.error('Failed to play audio:', e));
        }
      } else {
        toast.error(`Voice test failed for ${voiceName}: ${data?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('🎵 Error testing voice:', error);
      toast.error(`Failed to test ${voiceName}: ${error.message}`);
    } finally {
      setTestingVoice(null);
    }
  };

  // Fetch voices on component mount
  useEffect(() => {
    if (hasPremium && !premiumLoading) {
      fetchVoices();
    }
  }, [hasPremium, premiumLoading]);

  const handleGenerateAudio = async () => {
    if (!selectedVoice) {
      alert('Please select a voice first');
      return;
    }

    try {
      const result = await generateAudioMutation.mutateAsync({
        storyId,
        voiceId: selectedVoice
      });

      if (result?.audioUrl && onAudioGenerated) {
        onAudioGenerated(result.audioUrl);
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      alert('Failed to generate audio. Please try again.');
    }
  };

  const selectedVoiceData = availableVoices.find(v => v.voice_id === selectedVoice);

  // Get voice category icon
  const getVoiceIcon = (category: string) => {
    switch (category) {
      case 'premade':
        return <Mic className="h-4 w-4" />;
      case 'professional':
        return <Crown className="h-4 w-4" />;
      case 'cloned':
      case 'generated':
        return <User className="h-4 w-4" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  // Get voice category color
  const getVoiceCategoryColor = (category: string) => {
    switch (category) {
      case 'premade':
        return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'professional':
        return 'text-purple-400 bg-purple-900/30 border-purple-500/30';
      case 'cloned':
        return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      case 'generated':
        return 'text-brand-indigo bg-indigo-900/30 border-brand-indigo/30';
      default:
        return 'text-slate-400 bg-slate-700/30 border-slate-500/30';
    }
  };

  // Premium access is now checked via usePremiumAccess hook
  // Also allow demo account access for testing (fallback)
  const hasAccess = hasPremium || (user?.email === 'demo@taleforge.app');

  // Show loading state while checking premium access
  if (premiumLoading) {
    return (
      <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-6 mb-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-200">
          <span className="mr-2">🎵</span>
          Story Narration
        </h2>
        <div className="text-center py-8 bg-slate-700/50 rounded-lg">
          <LoadingSpinner size="md" className=" w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-300">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-6 mb-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-200">
          <span className="mr-2">🎵</span>
          Story Narration
        </h2>
        <div className="text-center py-8 bg-slate-700/50 rounded-lg">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold text-amber-200 mb-2">
            Premium Voice Features
          </h3>
          <p className="text-slate-300">
            Voice narration available for registered users
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-6 mb-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center text-amber-200">
          <span className="mr-2">🎵</span>
          Story Narration
        </h2>
        
        {/* Refresh voices button */}
        <button
          onClick={fetchVoices}
          disabled={loadingVoices}
          className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
        >
          {loadingVoices ? (
            <LoadingSpinner size="sm" className="h-3 w-3 " />
          ) : (
            <LoadingSpinner size="sm" className="h-3 w-3" />
          )}
          {loadingVoices ? 'Loading...' : 'Refresh Voices'}
        </button>
      </div>
      
      {hasAudio ? (
        // Show audio player if audio exists
        <div className="space-y-4">
          <div className="bg-green-900/50 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 font-medium mb-3 flex items-center">
              <span className="mr-2">✅</span>
              Your story audio is ready!
            </p>
            <audio controls className="w-full">
              <source src={fullStoryAudioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
          
          <button 
            onClick={() => {
              // Reset audio state to allow regeneration
              if (onAudioGenerated) {
                onAudioGenerated('');
              }
            }}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Generate with different voice
          </button>
        </div>
      ) : (
        // Show voice selector and generate button
        <div className="space-y-4">
          <p className="text-slate-300">
            Choose a voice to narrate your story with professional AI voice generation
          </p>
          
          {/* Enhanced Voice Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-amber-200">
                Select your storyteller:
              </label>
              {availableVoices.length > 0 && (
                <span className="text-xs text-slate-400">
                  {availableVoices.length} voices available
                </span>
              )}
            </div>
            
            {loadingVoices ? (
              <div className="w-full px-4 py-8 border border-slate-600 rounded-lg bg-slate-700 text-slate-300 text-center">
                <LoadingSpinner size="sm" className=" w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
                Loading voices from ElevenLabs...
              </div>
            ) : voiceError ? (
              <div className="w-full px-4 py-4 border border-red-500/30 rounded-lg bg-red-900/20 text-red-300">
                <div className="flex items-center justify-between">
                  <span>Error loading voices</span>
                  <button
                    onClick={fetchVoices}
                    className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 rounded"
                  >
                    Retry
                  </button>
                </div>
                <p className="text-xs mt-1">{voiceError}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Selected Voice Display */}
                {selectedVoiceData && (
                  <div className="border-2 border-amber-500/50 rounded-lg p-4 bg-amber-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1 rounded ${getVoiceCategoryColor(selectedVoiceData.category)}`}>
                            {getVoiceIcon(selectedVoiceData.category)}
                          </div>
                          <h3 className="font-semibold text-amber-200">{selectedVoiceData.name}</h3>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">
                          {selectedVoiceData.description || 'Professional voice'}
                        </p>
                        <div className="text-xs text-amber-400">
                          {selectedVoiceData.category} • {selectedVoiceData.labels?.accent || 'Standard accent'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => testVoice(selectedVoiceData.voice_id, selectedVoiceData.name)}
                          disabled={testingVoice === selectedVoiceData.voice_id}
                          className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
                          title={`Test ${selectedVoiceData.name}`}
                        >
                          {testingVoice === selectedVoiceData.voice_id ? (
                            <LoadingSpinner size="sm" className="h-4 w-4  text-white" />
                          ) : (
                            <Play className="h-4 w-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Voice Grid Toggle */}
                <button
                  onClick={() => setShowVoiceGrid(!showVoiceGrid)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-between"
                >
                  <span>{showVoiceGrid ? 'Hide' : 'Browse'} all voices</span>
                  <span className="text-slate-400">{showVoiceGrid ? '▲' : '▼'}</span>
                </button>

                {/* Voice Grid */}
                {showVoiceGrid && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-slate-600 rounded-lg p-3 bg-slate-700/50">
                    {availableVoices.map((voice) => (
                      <div
                        key={voice.voice_id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                          voice.voice_id === selectedVoice 
                            ? 'border-amber-500 bg-amber-900/20' 
                            : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                        }`}
                        onClick={() => setSelectedVoice(voice.voice_id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${getVoiceCategoryColor(voice.category)}`}>
                              {getVoiceIcon(voice.category)}
                            </div>
                            <h4 className="font-medium text-slate-200 text-sm">{voice.name}</h4>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(voice.voice_id, voice.name);
                            }}
                            disabled={testingVoice === voice.voice_id}
                            className="p-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors disabled:opacity-50"
                            title={`Test ${voice.name}`}
                          >
                            {testingVoice === voice.voice_id ? (
                              <LoadingSpinner size="sm" className="h-3 w-3  text-amber-400" />
                            ) : (
                              <Play className="h-3 w-3 text-amber-400" />
                            )}
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                          {voice.description || 'Professional voice'}
                        </p>
                        
                        <div className="text-xs text-amber-400">
                          {voice.category} • {voice.labels?.accent || 'Standard'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Generate Button */}
          <button 
            onClick={handleGenerateAudio}
            disabled={!selectedVoice || isGenerating || loadingVoices}
            className="w-full px-6 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className=" w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating Audio...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🎤</span>
                Generate Voice Narration
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSelectorSection; 