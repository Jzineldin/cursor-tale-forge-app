import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Mic, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import { VoiceSelector, voices } from '@/components/VoiceSelector';
import AudioPlayer from '@/components/AudioPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface VoiceGenerationSectionProps {
  hasAudio: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  fullStoryAudioUrl?: string;
  onGenerateVoice: (voiceId: string) => void;
  storyId?: string;
  audioGenerationStatus?: string;
}

const VoiceGenerationSection: React.FC<VoiceGenerationSectionProps> = ({
  hasAudio,
  isGenerating,
  canGenerate,
  fullStoryAudioUrl,
  onGenerateVoice,
  storyId,
  audioGenerationStatus
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isStuck, setIsStuck] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLoginRedirect = () => {
    navigate('/auth/signin');
  };

  // Debug function removed for cleaner UI

  // Check if audio generation is stuck (in_progress for more than 5 minutes)
  useEffect(() => {
    if (audioGenerationStatus === 'in_progress' && storyId) {
      const checkIfStuck = async () => {
        try {
          const { data: story, error } = await supabase
            .from('stories')
            .select('updated_at, audio_generation_status')
            .eq('id', storyId)
            .single();

          if (error) {
            console.error('Error checking story status:', error);
            return;
          }

          if (story && story.audio_generation_status === 'in_progress') {
            const lastUpdate = new Date(story.updated_at);
            const now = new Date();
            const timeDiff = now.getTime() - lastUpdate.getTime();
            const minutesDiff = timeDiff / (1000 * 60);

            // If it's been more than 5 minutes, consider it stuck
            if (minutesDiff > 5) {
              setIsStuck(true);
              console.log('Audio generation appears to be stuck:', { minutesDiff, storyId });
            }
          }
        } catch (error) {
          console.error('Error checking if audio generation is stuck:', error);
        }
      };

      // Check immediately
      checkIfStuck();

      // Check again after 30 seconds
      const timeout = setTimeout(checkIfStuck, 30000);
      return () => clearTimeout(timeout);
    } else {
      setIsStuck(false);
    }
    return undefined;
  }, [audioGenerationStatus, storyId]);

  const handleGenerateVoice = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to generate voice narration');
      handleLoginRedirect();
      return;
    }
    onGenerateVoice(selectedVoice);
  };

  const handleResetAudioStatus = async () => {
    if (!storyId) return;

    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update({ 
          audio_generation_status: 'not_started',
          full_story_audio_url: null
        })
        .eq('id', storyId);

      if (error) {
        throw error;
      }

      toast.success('Audio generation status reset. You can now try again with ElevenLabs voices.');
      setIsStuck(false);
      
      // Force a page refresh to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error resetting audio status:', error);
      toast.error('Failed to reset audio status. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  // Show premium features notice for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="relative">
        {/* Magical Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
        
        {/* Main Content Card */}
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-amber-400/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Magical Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 rounded-2xl blur-sm"></div>
          
          {/* Header */}
          <div className="relative p-6 text-center border-b border-amber-400/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                <Lock className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <h3 className="fantasy-heading text-2xl text-white mb-2">
              Premium Voice Features
            </h3>
            <p className="fantasy-subtitle text-gray-400">
              Create beautiful narrated stories with AI voices. Log in to unlock professional-quality audio narration.
            </p>
          </div>
          
          {/* Content */}
          <div className="relative p-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <Button
              onClick={handleLoginRedirect}
              className="fantasy-button bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Sign In to Continue
            </Button>
            <p className="fantasy-subtitle text-gray-400 text-sm mt-4">
              Free to sign up • No credit card required
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Magical Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
      
      {/* Main Content Card */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-amber-400/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Magical Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 rounded-2xl blur-sm"></div>
        
        {/* Header */}
        <div className="relative p-6 text-center border-b border-amber-400/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
              {hasAudio ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <Mic className="h-6 w-6 text-amber-400" />
              )}
            </div>
          </div>
          <h3 className="fantasy-heading text-2xl text-white mb-2">
            Voice Narration
          </h3>
          <p className="fantasy-subtitle text-gray-400">
            Transform your story into an immersive audio experience
          </p>
        </div>
        
        {/* Content */}
        <div className="relative p-6">
          {hasAudio ? (
            <div className="text-center space-y-4">
              <p className="fantasy-subtitle text-green-300 text-lg">🎵 Your story audio is ready!</p>
              <div className="max-w-md mx-auto">
                <AudioPlayer src={fullStoryAudioUrl || ''} />
              </div>
            </div>
          ) : canGenerate ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="fantasy-subtitle text-gray-400 mb-4">
                  Add voice narration to bring your story to life using ElevenLabs voices
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">Select a voice for your story narration:</p>
                  <VoiceSelector 
                    selectedVoice={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                  />
                </div>
              </div>
              <div className="text-center">
                <Button 
                  onClick={handleGenerateVoice}
                  disabled={isGenerating}
                  className="fantasy-button bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2 h-5 w-5 " />
                      Generating Voice...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Generate Voice Narration
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : isGenerating && !isStuck ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="h-12 w-12  mx-auto mb-4 text-amber-400" />
              <p className="fantasy-heading text-xl text-amber-300 font-medium mb-2">Generating voice narration...</p>
              <p className="fantasy-subtitle text-amber-200/70">This may take a few minutes</p>
            </div>
          ) : isStuck ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-400" />
              <p className="fantasy-heading text-xl text-orange-300 font-medium mb-2">Audio generation appears to be stuck</p>
              <p className="fantasy-subtitle text-orange-200/70 mb-6">
                The previous audio generation may have failed. You can reset and try again with ElevenLabs voices.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleResetAudioStatus}
                  disabled={isResetting}
                  variant="outline"
                  className="border-orange-500/50 text-orange-300 hover:bg-orange-500/20 fantasy-button"
                >
                  {isResetting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2 h-4 w-4 " />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <LoadingSpinner size="sm" className="mr-2 h-4 w-4" />
                      Reset Audio Status
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="fantasy-subtitle text-gray-400">Voice generation not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceGenerationSection;