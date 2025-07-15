import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, Volume2, Crown, Star, User, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
  high_quality_base_model_ids?: string[];
}

interface VoicesData {
  success: boolean;
  userInfo: any;
  totalVoices: number;
  categorizedVoices: {
    premade: Voice[];
    cloned: Voice[];
    generated: Voice[];
    professional: Voice[];
  };
  allVoices: Voice[];
  testResult: any;
  timestamp: string;
}

export const ElevenLabsVoicesExplorer: React.FC = () => {
  const [voicesData, setVoicesData] = useState<VoicesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices');
      
      if (error) {
        console.error('Error fetching voices:', error);
        toast.error('Failed to fetch ElevenLabs voices');
        return;
      }

      setVoicesData(data);
      toast.success(`Found ${data.totalVoices} voices in your ElevenLabs account`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Error:', errorMessage);
      toast.error('Failed to fetch voices');
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId: string, voiceName: string) => {
    console.log('🎵 Testing voice:', voiceId, voiceName);
    setTestingVoice(voiceId);
    try {
      console.log('🎵 Calling test-voice function...');
      const { data, error } = await supabase.functions.invoke('test-voice', {
        body: {
          voiceId: voiceId,
          text: `Hello! This is ${voiceName} speaking. I'm perfect for storytelling adventures!`,
        }
      });
      
      console.log('🎵 Function response:', { data, error });
      
      if (error) {
        console.error('🎵 Function error:', error);
        toast.error(`Failed to test voice: ${voiceName} - ${error.message}`);
        return;
      }

      if (data && data.success !== false) {
        console.log('🎵 Voice test successful:', data);
        toast.success(`Voice test successful for ${voiceName}`);
        
        // If we have audio content, we could play it here
        if (data.audioContent) {
          console.log('🎵 Audio content received, length:', data.audioContent.length);
          // Convert base64 to audio and play
          const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.error('Failed to play audio:', e));
        }
      } else {
        console.error('🎵 Voice test failed:', data);
        toast.error(`Voice test failed for ${voiceName}: ${data?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('🎵 Error testing voice:', error);
      console.error('🎵 Error details:', errorMessage);
      toast.error(`Failed to test voice: ${voiceName} - ${errorMessage}`);
    } finally {
      setTestingVoice(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premade':
        return <Volume2 className="h-4 w-4" />;
      case 'professional':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'cloned':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'generated':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'premade':
        return 'High-quality voices included with your plan';
      case 'professional':
        return 'Premium voices with enhanced quality (may cost extra)';
      case 'cloned':
        return 'Custom voice clones you\'ve created';
      case 'generated':
        return 'AI-generated voices from your account';
      default:
        return 'Voice category';
    }
  };

  const VoiceCard: React.FC<{ voice: Voice }> = ({ voice }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{voice.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            {getCategoryIcon(voice.category)}
            {voice.category}
          </Badge>
        </div>
        {voice.description && (
          <CardDescription className="text-sm">{voice.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          ID: {voice.voice_id}
        </div>
        
        {voice.labels && Object.keys(voice.labels).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(voice.labels).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => testVoice(voice.voice_id, voice.name)}
            disabled={testingVoice === voice.voice_id}
            className="flex-1"
          >
            {testingVoice === voice.voice_id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Test Voice
          </Button>
          
          {voice.preview_url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(voice.preview_url, '_blank')}
            >
              Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ElevenLabs Voices Explorer</h2>
          <p className="text-muted-foreground">
            Discover and test available voices in your ElevenLabs account
          </p>
        </div>
        <Button onClick={fetchVoices} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Volume2 className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Loading...' : 'Fetch Voices'}
        </Button>
      </div>

      {voicesData && (
        <Alert>
          <Volume2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Account Summary:</strong> {voicesData.totalVoices} total voices found
            {voicesData.userInfo && (
              <span className="ml-2">
                • Plan: {voicesData.userInfo.subscription?.tier || 'Free'}
                • Characters used: {voicesData.userInfo.subscription?.character_count || 0}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {voicesData && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({voicesData.totalVoices})</TabsTrigger>
            <TabsTrigger value="premade">
              Premade ({voicesData.categorizedVoices.premade.length})
            </TabsTrigger>
            <TabsTrigger value="professional">
              Professional ({voicesData.categorizedVoices.professional.length})
            </TabsTrigger>
            <TabsTrigger value="cloned">
              Cloned ({voicesData.categorizedVoices.cloned.length})
            </TabsTrigger>
            <TabsTrigger value="generated">
              Generated ({voicesData.categorizedVoices.generated.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voicesData.allVoices.map((voice) => (
                <VoiceCard key={voice.voice_id} voice={voice} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="premade" className="space-y-4">
            <Alert>
              <Volume2 className="h-4 w-4" />
              <AlertDescription>
                {getCategoryDescription('premade')} - These are included in your current plan.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voicesData.categorizedVoices.premade.map((voice) => (
                <VoiceCard key={voice.voice_id} voice={voice} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                {getCategoryDescription('professional')} - Consider using these for premium users.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voicesData.categorizedVoices.professional.map((voice) => (
                <VoiceCard key={voice.voice_id} voice={voice} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cloned" className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                {getCategoryDescription('cloned')} - Custom voices you've created.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voicesData.categorizedVoices.cloned.map((voice) => (
                <VoiceCard key={voice.voice_id} voice={voice} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generated" className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                {getCategoryDescription('generated')} - AI-generated voices from your account.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voicesData.categorizedVoices.generated.map((voice) => (
                <VoiceCard key={voice.voice_id} voice={voice} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {voicesData?.testResult && (
        <Alert>
          <Play className="h-4 w-4" />
          <AlertDescription>
            <strong>API Test Result:</strong> {voicesData.testResult.success ? 'SUCCESS' : 'FAILED'}
            {voicesData.testResult.voiceTested && (
              <span className="ml-2">
                • Voice: {voicesData.testResult.voiceTested}
                • Status: {voicesData.testResult.status}
              </span>
            )}
            {voicesData.testResult.error && (
              <span className="ml-2 text-red-500">
                • Error: {voicesData.testResult.error}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 