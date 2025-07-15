
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoiceSelector } from '@/components/VoiceSelector';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { Mic, Loader2 } from 'lucide-react';

interface VoiceSelectionDialogProps {
  storyId: string;
  storyTitle: string;
  onAudioGenerated?: (audioUrl: string) => void;
}

const VoiceSelectionDialog: React.FC<VoiceSelectionDialogProps> = ({
  storyId,
  storyTitle,
  onAudioGenerated
}) => {
  const [selectedVoice, setSelectedVoice] = useState('fable');
  const [isOpen, setIsOpen] = useState(false);
  const generateAudioMutation = useGenerateFullStoryAudio();

  const handleGenerateAudio = () => {
    console.log('🎵 Starting audio generation for story:', storyId, 'with voice:', selectedVoice);
    
    generateAudioMutation.mutate(
      { storyId, voiceId: selectedVoice },
      {
        onSuccess: (data) => {
          console.log('🎵 Audio generation successful:', data);
          if (data?.audioUrl) {
            // Trigger the callback to refresh story data
            onAudioGenerated?.(data.audioUrl);
          }
          setIsOpen(false);
        },
        onError: (error) => {
          console.error('🚨 Audio generation failed:', error);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 text-lg"
          disabled={generateAudioMutation.isPending}
        >
          <Mic className="mr-2 h-5 w-5" />
          {generateAudioMutation.isPending ? 'Generating...' : 'Generate Voice Narration'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-amber-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-300">Choose Your Narrator Voice</DialogTitle>
          <DialogDescription className="text-gray-300">
            Select a voice for your story "{storyTitle.substring(0, 30)}..."
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            disabled={generateAudioMutation.isPending}
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={generateAudioMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAudio}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
              disabled={generateAudioMutation.isPending}
            >
              {generateAudioMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Audio'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectionDialog;
