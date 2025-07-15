
import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, Crown, Star, RefreshCw } from 'lucide-react';
import { useTestVoice } from '@/hooks/useTestVoice';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels?: Record<string, string>;
}

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
  showPremiumVoices?: boolean;
}

// Export voices for backwards compatibility
export const voices = [
  { id: 'default', name: 'Default Voice' }
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange, 
  disabled = false,
  showPremiumVoices = false
}) => {
  const testVoiceMutation = useTestVoice();
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  const fetchVoices = async () => {
    setLoadingVoices(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices');
      
      if (error) {
        console.error('Error fetching voices:', error);
        toast.error('Failed to fetch available voices');
        return;
      }

      if (data && data.allVoices) {
        setAvailableVoices(data.allVoices);
        toast.success(`Loaded ${data.allVoices.length} voices`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to fetch voices');
    } finally {
      setLoadingVoices(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const handleTestVoice = (voiceId: string) => {
    setTestingVoiceId(voiceId);
    testVoiceMutation.mutate({ voiceId }, {
      onSettled: () => {
        setTestingVoiceId(null);
      }
    });
  };


  const getCategoryBadge = (voice: Voice) => {
    if (voice.category === 'professional') {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          <Crown className="h-3 w-3 mr-1" />
          Pro
        </Badge>
      );
    }
    if (voice.category === 'premium') {
      return (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
          <Star className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        Free
      </Badge>
    );
  };

  // Filter voices based on showPremiumVoices setting
  const filteredVoices = showPremiumVoices 
    ? availableVoices 
    : availableVoices.filter(voice => voice.category === 'premade');

  const premadeVoices = availableVoices.filter(voice => voice.category === 'premade');
  const premiumVoices = availableVoices.filter(voice => voice.category === 'premium');
  const professionalVoices = availableVoices.filter(voice => voice.category === 'professional');

  const VoiceCard: React.FC<{ voice: Voice }> = ({ voice }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-background/90 hover:bg-background/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <RadioGroupItem value={voice.voice_id} id={voice.voice_id} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Label htmlFor={voice.voice_id} className="cursor-pointer font-medium">
              {voice.name}
            </Label>
            {getCategoryBadge(voice)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {voice.description || `${voice.category} voice`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              ID: {voice.voice_id}
            </span>
            {voice.category === 'professional' && (
              <span className="text-xs text-amber-600">Professional voice - may incur additional costs</span>
            )}
          </div>
        </div>
      </div>
      <Button 
        size="sm"
        variant="ghost"
        onClick={() => handleTestVoice(voice.voice_id)}
        disabled={disabled || testingVoiceId === voice.voice_id}
        aria-label={`Test voice ${voice.name}`}
        className="h-8 w-8 p-0"
      >
        {testingVoiceId === voice.voice_id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  if (loadingVoices) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Narration Voice
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchVoices}
            disabled={loadingVoices}
            className="h-6 px-2 text-xs"
          >
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Loading...
          </Button>
        </div>
        <div className="space-y-2">
          <div className="h-12 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-12 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-12 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Narration Voice
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filteredVoices.length} voices available
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchVoices}
            disabled={loadingVoices}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>
      
      <RadioGroup 
        value={selectedVoice} 
        onValueChange={onVoiceChange} 
        className="gap-3" 
        disabled={disabled}
      >
        {/* Premade Voices (Free) */}
        {premadeVoices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Free Voices
              <Badge variant="outline" className="text-xs">
                Included
              </Badge>
            </h4>
            {premadeVoices.map(voice => (
              <VoiceCard key={voice.voice_id} voice={voice} />
            ))}
          </div>
        )}

        {/* Premium Voices */}
        {showPremiumVoices && premiumVoices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Premium Voices
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1" />
                Standard Cost
              </Badge>
            </h4>
            {premiumVoices.map(voice => (
              <VoiceCard key={voice.voice_id} voice={voice} />
            ))}
          </div>
        )}

        {/* Professional Voices */}
        {showPremiumVoices && professionalVoices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Professional Voices
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                <Crown className="h-3 w-3 mr-1" />
                Premium Cost
              </Badge>
            </h4>
            {professionalVoices.map(voice => (
              <VoiceCard key={voice.voice_id} voice={voice} />
            ))}
          </div>
        )}

        {availableVoices.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">No voices available</p>
            <p className="text-xs mt-1">Check your ElevenLabs API key and account status</p>
          </div>
        )}
      </RadioGroup>
    </div>
  );
};
