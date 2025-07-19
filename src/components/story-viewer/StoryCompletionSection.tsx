
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceSelector, voices } from '@/components/VoiceSelector';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { Loader2, Mic, Eye, Sparkles } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';
import AudioPlayer from '@/components/AudioPlayer';
import StorySlideshow from './StorySlideshow';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
            {/* Magical Story Completion Container */}
            <div className="mt-8 relative">
                {/* Magical Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
                
                {/* Main Content Card */}
                <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Magical Border Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-purple-400/20 to-blue-400/20 rounded-3xl blur-sm"></div>
                    
                    {/* Header Section */}
                    <div className="relative p-8 text-center border-b border-amber-400/20">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
                                <Sparkles className="h-8 w-8 text-amber-400" />
                            </div>
                        </div>
                        <h1 className="fantasy-heading text-4xl md:text-5xl font-bold text-white mb-4">
                            Story <span className="text-amber-400">Complete!</span>
                        </h1>
                        <p className="fantasy-subtitle text-xl text-gray-300 max-w-2xl mx-auto">
                            Your magical adventure has reached its conclusion with{' '}
                            <span className="text-amber-300 font-semibold">{segments.length} chapters</span>,{' '}
                            <span className="text-purple-300 font-semibold">{totalWords} words</span>, and{' '}
                            <span className="text-blue-300 font-semibold">{imagesGenerated} images</span>
                        </p>
                    </div>
                    
                    {/* Content Sections */}
                    <div className="p-8 space-y-8">
                        {/* Watch Story Section */}
                        <div className="text-center">
                            <div className="mb-6">
                                <h3 className="fantasy-heading text-2xl text-white mb-2 flex items-center justify-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30">
                                        <Eye className="h-6 w-6 text-purple-400" />
                                    </div>
                                    Experience Your Story
                                </h3>
                                <p className="fantasy-subtitle text-gray-400">
                                    Watch your complete story as an immersive slideshow with synchronized text highlighting
                                </p>
                            </div>
                            
                            <Button 
                                onClick={handleWatchStory}
                                size="lg"
                                className="fantasy-button bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                style={{ 
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <Eye className="mr-3 h-6 w-6" />
                                🎬 Watch Your Story
                            </Button>
                        </div>

                        {/* Voice Generation Section */}
                        {canGenerate && (
                            <div className="bg-gradient-to-r from-amber-900/20 to-purple-900/20 border border-amber-400/30 rounded-2xl p-6">
                                <div className="text-center mb-6">
                                    <h3 className="fantasy-heading text-xl text-amber-300 mb-2 flex items-center justify-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
                                            <Mic className="h-5 w-5 text-amber-400" />
                                        </div>
                                        Add Voice Narration
                                    </h3>
                                    <p className="fantasy-subtitle text-gray-400">
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
                                        className="w-full fantasy-button bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        size="lg"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2 h-5 w-5 " />
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
                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-400/30 rounded-2xl p-6 text-center">
                                <LoadingSpinner size="lg" className="h-12 w-12  mx-auto mb-4 text-blue-400" />
                                <p className="fantasy-heading text-xl text-blue-300 font-medium mb-2">Generating full story audio...</p>
                                <p className="fantasy-subtitle text-blue-200/70">This may take a few minutes</p>
                            </div>
                        )}

                        {/* Audio Player */}
                        {hasAudio && (
                            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-400/30 rounded-2xl p-6">
                                <div className="text-center mb-6">
                                    <h3 className="fantasy-heading text-xl text-green-300 mb-2 flex items-center justify-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                                            🎵
                                        </div>
                                        Your Story Audio is Ready!
                                    </h3>
                                </div>
                                
                                {/* Compact Audio Player */}
                                <div className="max-w-md mx-auto mb-6">
                                    <AudioPlayer src={fullStoryAudioUrl} />
                                </div>
                                
                                <div className="text-center">
                                    <Button 
                                        onClick={handleWatchStory}
                                        className="fantasy-button bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                        size="lg"
                                    >
                                        🎬 Watch with Audio
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {audioGenerationStatus === 'failed' && (
                            <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-400/30 rounded-2xl p-6 text-center">
                                <p className="fantasy-subtitle text-red-300 mb-4">Audio generation failed. You can try again or watch your story without audio.</p>
                                <Button 
                                    onClick={handleGenerateVoice}
                                    variant="outline"
                                    className="border-red-500/50 text-red-300 hover:bg-red-500/20 fantasy-button"
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
