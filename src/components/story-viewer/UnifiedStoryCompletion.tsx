import React, { useState, useEffect } from 'react';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { usePublishStory } from '@/hooks/usePublishStory';
import { StorySegmentRow } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EnhancedSlideshow from './EnhancedSlideshow';
import VoiceSelectorSection from './VoiceSelectorSection';
import DemoUsageIndicator from '@/components/DemoUsageIndicator';
import PublishStorySection from './completion/PublishStorySection';
// import StoryCompletionHeader from './completion/StoryCompletionHeader';
// import StoryContentPreview from './completion/StoryContentPreview';
// import VoiceGenerationSection from './completion/VoiceGenerationSection';
// import { VideoCompilationSection } from './completion/VideoCompilationSection';
// import WatchStorySection from './completion/WatchStorySection';
// import DownloadStorySection from './completion/DownloadStorySection';

interface UnifiedStoryCompletionProps {
    storyId: string;
    segments: StorySegmentRow[];
    fullStoryAudioUrl?: string;
    audioGenerationStatus?: string;
    isPublic?: boolean;
    onExit?: () => void;
    storyTitle?: string;
    story?: any; // Add story object for video compilation
}

const UnifiedStoryCompletion: React.FC<UnifiedStoryCompletionProps> = ({
    storyId,
    segments,
    fullStoryAudioUrl,
    audioGenerationStatus,
    isPublic = false,
    onExit,
    storyTitle,
    story
}) => {
    const [showSlideshow, setShowSlideshow] = useState(false);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(fullStoryAudioUrl);
    // const [isGeneratingMissingImage, setIsGeneratingMissingImage] = useState(false);
    // const [missingImageFixed, setMissingImageFixed] = useState(false);
    
    const generateAudioMutation = useGenerateFullStoryAudio();
    const publishStoryMutation = usePublishStory();

    // Calculate story stats
    const totalWords = segments.reduce((acc, segment) => acc + (segment.segment_text?.split(' ').length || 0), 0);
    const segmentsWithImages = segments.filter(s => s.image_url && s.image_url !== '/placeholder.svg').length;
    
    const isGenerating = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
    const hasAudio = audioGenerationStatus === 'completed' && currentAudioUrl;

    const handleAudioGenerated = (audioUrl: string) => {
        setCurrentAudioUrl(audioUrl);
    };

    const handleWatchStory = () => {
        setShowSlideshow(true);
    };

    const handleSlideshowClose = () => {
        setShowSlideshow(false);
    };

    const handlePublishStory = () => {
        publishStoryMutation.mutate(storyId);
    };

    // Debug: Log segments to check image URLs
    useEffect(() => {
        console.log('🖼️ Debugging segment images:');
        segments.forEach((segment, index) => {
            console.log(`Chapter ${index + 1}:`, {
                hasImageUrl: !!segment.image_url,
                imageUrl: segment.image_url,
                imageStatus: segment.image_generation_status,
                textLength: segment.segment_text?.length || 0
            });
        });
    }, [segments]);

    return (
        <>
            <div className="min-h-screen bg-slate-900 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    
                    {/* Demo Usage Indicator */}
                    <div className="flex justify-center mb-6">
                        <DemoUsageIndicator />
                    </div>
                    
                    {/* Header - Clean celebration */}
                    <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-8 mb-6 text-center backdrop-blur-sm">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-3xl font-bold text-amber-200 mb-2">
                            Story Complete!
                        </h1>
                        <p className="text-slate-300">
                            Your adventure concluded with <span className="font-semibold text-amber-300">{segments.length} chapters</span>, 
                            <span className="font-semibold text-green-300"> {totalWords} words</span>, and 
                            <span className="font-semibold text-purple-300"> {segmentsWithImages} images</span>
                        </p>
                        {onExit && (
                            <button 
                                onClick={onExit}
                                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                                ← Back to Home
                            </button>
                        )}
                    </div>

                    {/* Story Summary - Clean card with images */}
                    <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-6 mb-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-200">
                            <span className="mr-2">📖</span>
                            Your Complete Story
                        </h2>
                        
                        <div className="space-y-6 max-h-96 overflow-y-auto">
                            {segments.map((segment, index) => (
                                <div key={segment.id} className="flex gap-4 border border-slate-600 rounded-lg p-4 bg-slate-700/50">
                                    
                                    {/* Chapter Image Thumbnail */}
                                    <div className="flex-shrink-0">
                                        {segment.image_url && segment.image_url !== '/placeholder.svg' ? (
                                            <img 
                                                src={segment.image_url} 
                                                alt={`Chapter ${index + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg border border-slate-500"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const nextSibling = target.nextSibling as HTMLElement;
                                                    if (nextSibling) {
                                                        nextSibling.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        
                                        {/* Fallback if no image */}
                                        <div 
                                            className="w-24 h-24 bg-slate-600 rounded-lg border border-slate-500 flex items-center justify-center text-slate-400"
                                            style={{ display: segment.image_url && segment.image_url !== '/placeholder.svg' ? 'none' : 'flex' }}
                                        >
                                            <span className="text-xs text-center">No Image</span>
                                        </div>
                                    </div>

                                    {/* Chapter Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h3 className="font-medium text-amber-200 mb-2">
                                                Chapter {index + 1}
                                            </h3>
                                            <p className="text-slate-300 text-sm line-clamp-4 leading-relaxed">
                                                {segment.segment_text}
                                            </p>
                                            
                                            {/* Show image status */}
                                            <div className="mt-2 flex items-center space-x-2 text-xs">
                                                <span className={`px-2 py-1 rounded-full ${
                                                    segment.image_url && segment.image_url !== '/placeholder.svg'
                                                        ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                                                        : 'bg-slate-600 text-slate-400 border border-slate-500/30'
                                                }`}>
                                                    {segment.image_url && segment.image_url !== '/placeholder.svg' ? '🖼️ Image Ready' : '📝 Text Only'}
                                                </span>
                                                <span className="text-slate-400">
                                                    {segment.segment_text?.split(' ').length || 0} words
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Voice Section with Dropdown Selector */}
                    <VoiceSelectorSection
                        storyId={storyId}
                        fullStoryAudioUrl={currentAudioUrl}
                        audioGenerationStatus={audioGenerationStatus}
                        onAudioGenerated={handleAudioGenerated}
                    />

                    {/* Watch Story - Enhanced Slideshow */}
                    <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-6 mb-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-200">
                            <span className="mr-2">🎬</span>
                            Experience Your Story
                        </h2>
                        
                        <p className="text-slate-300 mb-4">
                            Watch your complete story as an immersive slideshow with synchronized text highlighting
                        </p>
                        
                        <button 
                            onClick={handleWatchStory}
                            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                        >
                            🎬 Watch Your Story
                        </button>
                        
                        {hasAudio && (
                            <p className="text-sm text-green-400 mt-2 text-center">
                                ✨ Complete with voice narration
                            </p>
                        )}
                    </div>

                    {/* Actions - Simple and clean */}
                    <div className="bg-slate-800/90 rounded-lg shadow-lg border border-amber-500/30 p-6 mb-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-200">
                            <span className="mr-2">💾</span>
                            Save & Share
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <button 
                                onClick={() => {/* Download functionality */}}
                                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <span className="mr-2">📥</span>
                                Download Story
                            </button>
                            
                            <button 
                                onClick={() => {/* Share functionality */}}
                                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span className="mr-2">🔗</span>
                                Share Link
                            </button>
                        </div>
                        
                        <p className="text-xs text-slate-400 text-center">
                            Export includes all chapters, images, and formatting
                        </p>
                    </div>

                    {/* Publish to Discover Section */}
                    <PublishStorySection
                        isPublic={isPublic}
                        isPublishing={publishStoryMutation.isPending}
                        onPublishStory={handlePublishStory}
                    />

                    {/* Simple CTA for new story */}
                    <div className="text-center">
                        <button 
                            onClick={() => window.location.href = '/create'}
                            className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                        >
                            Create Another Story
                        </button>
                    </div>

                </div>
            </div>

            {/* Enhanced Slideshow Modal */}
            <EnhancedSlideshow
                segments={segments}
                fullStoryAudioUrl={fullStoryAudioUrl || ''}
                isOpen={showSlideshow}
                onClose={handleSlideshowClose}
            />
        </>
    );
};

export default UnifiedStoryCompletion;
