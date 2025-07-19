
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Volume2, Bug, CheckCircle, XCircle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
  showPremiumVoices?: boolean;
}

// Enhanced fallback voices with better descriptions for unauthenticated users
const FALLBACK_VOICES: Voice[] = [
  { voice_id: 'brian-fallback', name: 'Brian - Master Storyteller', category: 'premade', description: 'Deep, authoritative voice perfect for epic tales' },
  { voice_id: 'sarah-fallback', name: 'Sarah - Warm Storyteller', category: 'premade', description: 'Calm, conversational voice for gentle stories' },
  { voice_id: 'charlotte-fallback', name: 'Charlotte - Expressive Reader', category: 'premade', description: 'Confident, engaging voice for exciting adventures' },
  { voice_id: 'george-fallback', name: 'George - Deep & Serious', category: 'premade', description: 'Deep, serious narrator for dramatic tales' },
  { voice_id: 'chris-fallback', name: 'Chris - Energetic Narrator', category: 'premade', description: 'Clear, energetic voice for action stories' },
  { voice_id: 'jessica-fallback', name: 'Jessica - Expressive', category: 'premade', description: 'Emotional, expressive voice for character voices' }
];

// Export voices for backwards compatibility (with id field for compatibility)
const voices = FALLBACK_VOICES.map(voice => ({
  id: voice.voice_id,
  name: voice.name
}));

const VoiceSelectorInner: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange, 
  disabled = false,
  showPremiumVoices = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [useSimpleSelector, setUseSimpleSelector] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [needsAuth, setNeedsAuth] = useState(false);

  const handleLoginRedirect = () => {
    navigate('/auth/signin');
  };

  const debugVoiceLoading = async () => {
    try {
      console.log('🔍 Debugging voice loading...');
      setApiStatus('loading');
      
      const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices', {
        method: 'GET'
      });
      
      if (error) {
        console.error('❌ Supabase function error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setError(`Supabase Error: ${error.message}`);
        setApiStatus('error');
        setDebugInfo({ error, timestamp: new Date().toISOString() });
        
        // Check if it's an auth error
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setNeedsAuth(true);
        }
        return;
      }
      
      console.log('✅ Voice API success:', data);
      setDebugInfo(data);
      setApiStatus('success');
      
      if (data?.allVoices && data.allVoices.length > 0) {
        setAvailableVoices(data.allVoices);
        setError(null);
        setNeedsAuth(false);
        toast.success(`Successfully loaded ${data.allVoices.length} voices`);
      } else {
        setError('No voices found in API response');
        setApiStatus('error');
        setNeedsAuth(true);
      }
      
    } catch (err: any) {
      console.error('❌ Voice loading exception:', err);
      setError(`Exception: ${err.message}`);
      setApiStatus('error');
      setNeedsAuth(true);
      setDebugInfo({ exception: err, timestamp: new Date().toISOString() });
      
      // Test with direct fetch as fallback
      try {
        console.log('🔄 Testing direct API call...');
        const response = await fetch('/api/test-voices');
        console.log('🔄 Direct API test status:', response.status);
        setDebugInfo((prev: any) => ({ ...prev, directApiStatus: response.status }));
      } catch (fetchErr) {
        console.error('❌ Direct fetch also failed:', fetchErr);
        setDebugInfo((prev: any) => ({ ...prev, directApiError: fetchErr }));
      }
    }
  };

  const fetchVoices = async () => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, showing fallback voices with login prompt');
      setAvailableVoices(FALLBACK_VOICES);
      setNeedsAuth(true);
      setApiStatus('error');
      return;
    }

    setLoadingVoices(true);
    setError(null);
    setDebugInfo(null);
    setApiStatus('loading');
    
    try {
      console.log('🎵 Fetching voices for authenticated user...');
      
      const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices');
      
      if (error) {
        console.error('❌ Error fetching voices:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        
        // Check if it's an auth error
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setNeedsAuth(true);
          setAvailableVoices(FALLBACK_VOICES);
          setError('Authentication required for voice features');
        } else {
          setAvailableVoices(FALLBACK_VOICES);
          setError(`API Error: ${error.message}`);
        }
        setApiStatus('error');
        setDebugInfo({ error, timestamp: new Date().toISOString() });
        toast.warning('Using fallback voices - API connection failed');
        return;
      }

      if (data && data.allVoices && data.allVoices.length > 0) {
        console.log('🎵 Successfully loaded voices from API:', data.allVoices.length);
        setAvailableVoices(data.allVoices);
        setDebugInfo(data);
        setApiStatus('success');
        setNeedsAuth(false);
        toast.success(`Loaded ${data.allVoices.length} voices from ElevenLabs`);
      } else {
        console.log('🎵 No voices returned from API, using fallback voices');
        console.log('🎵 API response:', data);
        setAvailableVoices(FALLBACK_VOICES);
        setError('No voices found in ElevenLabs account');
        setApiStatus('error');
        setNeedsAuth(true);
        setDebugInfo(data);
        toast.warning('Using fallback voices - no voices found in account');
      }
    } catch (error: any) {
      console.error('❌ Error fetching voices:', error);
      console.log('Using fallback voices due to network error');
      setAvailableVoices(FALLBACK_VOICES);
      setError(`Network Error: ${error.message}`);
      setApiStatus('error');
      setNeedsAuth(true);
      setDebugInfo({ networkError: error, timestamp: new Date().toISOString() });
      toast.warning('Using fallback voices - network error');
    } finally {
      setLoadingVoices(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, [isAuthenticated]); // Re-fetch when authentication state changes

  const handleVoiceChange = (voiceId: string) => {
    console.log('🎵 Voice selected:', voiceId);
    onVoiceChange(voiceId);
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'loading':
        return <LoadingSpinner size="sm" className="h-4 w-4  text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return needsAuth ? <Lock className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Volume2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (needsAuth) {
      return 'Login required for voice features';
    }
    
    switch (apiStatus) {
      case 'loading':
        return 'Loading voices...';
      case 'success':
        return `${availableVoices.length} voices loaded`;
      case 'error':
        return 'Using fallback voices';
      default:
        return 'Ready';
    }
  };

  // Filter voices based on showPremiumVoices prop
  const filteredVoices = showPremiumVoices 
    ? availableVoices 
    : availableVoices.filter(voice => voice.category === 'premade');

  if (useSimpleSelector) {
    return (
      <div className="space-y-2">
        <Select value={selectedVoice} onValueChange={handleVoiceChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {filteredVoices.map((voice) => (
              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                <div className="flex items-center gap-2">
                  {voice.name}
                  {needsAuth && voice.voice_id.includes('fallback') && (
                    <Lock className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className="text-gray-600">{getStatusText()}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUseSimpleSelector(false)}
            className="ml-auto"
          >
            Advanced
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Authentication Notice */}
      {needsAuth && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                Premium Voice Features
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Log in to access our full library of AI voices and create narrated stories with professional-quality audio.
              </p>
              <Button
                onClick={handleLoginRedirect}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Log In to Unlock Voices
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          {error && !needsAuth && (
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          )}
          {needsAuth && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
              Premium
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={debugVoiceLoading}
            disabled={loadingVoices}
            className="text-xs"
          >
            <Bug className="h-3 w-3 mr-1" />
            Debug
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs"
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUseSimpleSelector(true)}
            className="text-xs"
          >
            Simple
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && !needsAuth && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Voice Loading Error</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchVoices}
            disabled={loadingVoices}
            className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <LoadingSpinner size="sm" className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Debug Information */}
      {showDebug && debugInfo && (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Voice Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Voice</label>
        <Select value={selectedVoice} onValueChange={handleVoiceChange} disabled={disabled || loadingVoices}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingVoices ? "Loading voices..." : "Select a voice"} />
          </SelectTrigger>
          <SelectContent>
            {filteredVoices.map((voice) => (
              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{voice.name}</span>
                    {needsAuth && voice.voice_id.includes('fallback') && (
                      <Lock className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                  {voice.description && (
                    <span className="text-xs text-gray-500">{voice.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {filteredVoices.length === 0 && !loadingVoices && (
          <p className="text-sm text-gray-500">No voices available</p>
        )}
      </div>

      {/* Voice Categories */}
      {showPremiumVoices && availableVoices.length > 0 && !needsAuth && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Voice Categories</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              availableVoices.reduce((acc, voice) => {
                acc[voice.category] = (acc[voice.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, count]) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export the enhanced component
export { VoiceSelectorInner as VoiceSelector };
export { voices };
