
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceSelector, voices } from '@/components/VoiceSelector';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { Loader2, Mic, Eye, Sparkles } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';
import AudioPlayer from '@/components/AudioPlayer';
import StorySlideshow from './StorySlideshow';

interface StoryCompletionSectionProps {
    storyId: string;
    segments: StorySegmentRow[];
    fullStoryAudioUrl?: string;
    audioGenerationStatus?: string;
}

const StoryCompletionSection: React.FC<StoryCompletionSectionProps> = ({
    storyId,
    segments,
    fullStoryAudioUrl,
    audioGenerationStatus
}) => {
    const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
    const [showSlideshow, setShowSlideshow] = useState(false);
    const generateAudioMutation = useGenerateFullStoryAudio();

    const handleGenerateVoice = () => {
        generateAudioMutation.mutate({ storyId, voiceId: selectedVoice });
    };

    const handleWatchStory = () => {
        setShowSlideshow(true);
    };

    const isGenerating = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
    const hasAudio = audioGenerationStatus === 'completed' && fullStoryAudioUrl;
    const canGenerate = !isGenerating && (!audioGenerationStatus || audioGenerationStatus === 'not_started' || audioGenerationStatus === 'failed');

    // Calculate story stats
    const totalWords = segments.reduce((acc, segment) => acc + (segment.segment_text?.split(' ').length || 0), 0);
    const imagesGenerated = segments.filter(s => s.image_generation_status === 'completed').length;

    return (
        <>
            <Card className="mt-8 border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-purple-900/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-amber-300 flex items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6" />
                        🎉 Story Complete!
                    </CardTitle>
                    <p className="text-slate-300">
                        Your adventure has reached its conclusion with <strong>{segments.length} chapters</strong>, 
                        <strong> {totalWords} words</strong>, and <strong>{imagesGenerated} images</strong>
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {/* Watch Story Button - Always Available */}
                    <div className="text-center">
                        <Button 
                            onClick={handleWatchStory}
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 mb-4"
                        >
                            <Eye className="mr-2 h-5 w-5" />
                            🎬 Watch Your Story
                        </Button>
                        <p className="text-sm text-slate-400">
                            Experience your story as a full-screen slideshow
                        </p>
                    </div>

                    {/* Voice Generation Section */}
                    {canGenerate && (
                        <div className="border-t border-slate-600 pt-6">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center justify-center gap-2">
                                    <Mic className="h-5 w-5" />
                                    Add Voice Narration
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    Transform your story into an immersive audio experience
                                </p>
                            </div>
                            
                            <div className="max-w-md mx-auto space-y-4">
                                <VoiceSelector 
                                    selectedVoice={selectedVoice} 
                                    onVoiceChange={setSelectedVoice}
                                />
                                
                                <Button 
                                    onClick={handleGenerateVoice}
                                    disabled={isGenerating}
                                    className="w-full bg-amber-600 hover:bg-amber-700"
                                    size="lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating Voice...
                                        </>
                                    ) : (
                                        <>
                                            🎙️ Generate Voice Narration
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isGenerating && (
                        <div className="border-t border-slate-600 pt-6 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-400" />
                            <p className="text-blue-300 font-medium">Generating full story audio...</p>
                            <p className="text-sm text-blue-200/70 mt-1">This may take a few minutes</p>
                        </div>
                    )}

                    {/* Audio Player */}
                    {hasAudio && (
                        <div className="border-t border-green-600/30 pt-6">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-green-300 mb-2">
                                    🎵 Your Story Audio is Ready!
                                </h3>
                            </div>
                            <AudioPlayer src={fullStoryAudioUrl} />
                            
                            <div className="text-center mt-4">
                                <Button 
                                    onClick={handleWatchStory}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                    size="lg"
                                >
                                    🎬 Watch with Audio
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {audioGenerationStatus === 'failed' && (
                        <div className="border-t border-red-600/30 pt-6 text-center">
                            <p className="text-red-300 mb-4">Audio generation failed. You can try again or watch your story without audio.</p>
                            <Button 
                                onClick={handleGenerateVoice}
                                variant="outline"
                                className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Slideshow Modal */}
            <StorySlideshow
                segments={segments}
                fullStoryAudioUrl={fullStoryAudioUrl || ''}
                isOpen={showSlideshow}
                onClose={() => setShowSlideshow(false)}
            />
        </>
    );
};

export default StoryCompletionSection;
