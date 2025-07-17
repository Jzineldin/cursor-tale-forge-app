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
      <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" />
            Voice Narration
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Premium
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Premium Voice Features
            </h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Create beautiful narrated stories with AI voices. Log in to unlock professional-quality audio narration for your stories.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleLoginRedirect}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3"
                size="lg"
              >
                Sign In to Continue
              </Button>
              <p className="text-xs text-slate-400">
                Free to sign up • No credit card required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          {hasAudio ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <span className="h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center text-xs text-white">2</span>
          )}
          Voice Narration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAudio ? (
          <div className="space-y-4">
            <p className="text-green-400 mb-4">🎵 Your story audio is ready!</p>
            <AudioPlayer src={fullStoryAudioUrl || ''} />
          </div>
        ) : canGenerate ? (
          <div className="space-y-4">
            <p className="text-slate-400 mb-4">
              Add voice narration to bring your story to life using ElevenLabs voices
            </p>
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Select a voice for your story narration:</p>
              <VoiceSelector 
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
              />
              {/* Debug info removed for cleaner UI */}
            </div>
            <Button 
              onClick={handleGenerateVoice}
              disabled={isGenerating}
              className="bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Voice...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Generate Voice Narration
                </>
              )}
            </Button>
          </div>
        ) : isGenerating && !isStuck ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-amber-500" />
            <p className="text-amber-300 font-medium mb-2">Generating voice narration...</p>
            <p className="text-sm text-amber-400 mt-1">This may take a few minutes</p>
          </div>
        ) : isStuck ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-orange-500" />
            <p className="text-orange-300 font-medium mb-2">Audio generation appears to be stuck</p>
            <p className="text-sm text-orange-400 mb-4">
              The previous audio generation may have failed. You can reset and try again with ElevenLabs voices.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleResetAudioStatus}
                disabled={isResetting}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Audio Status
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">Voice generation not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceGenerationSection;