import React, { useState, useEffect } from 'react';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { usePublishStory } from '@/hooks/usePublishStory';
import { StorySegmentRow } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StorySlideshow from './StorySlideshow';
import StoryCompletionHeader from './completion/StoryCompletionHeader';
import StoryContentPreview from './completion/StoryContentPreview';
import VoiceGenerationSection from './completion/VoiceGenerationSection';
import { VideoCompilationSection } from './completion/VideoCompilationSection';
import PublishStorySection from './completion/PublishStorySection';
import WatchStorySection from './completion/WatchStorySection';
import DownloadStorySection from './completion/DownloadStorySection';

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
    const [isGeneratingMissingImage, setIsGeneratingMissingImage] = useState(false);
    const [missingImageFixed, setMissingImageFixed] = useState(false);
    
    const generateAudioMutation = useGenerateFullStoryAudio();
    const publishStoryMutation = usePublishStory();

    // Calculate story stats
    const totalWords = segments.reduce((acc, segment) => acc + (segment.segment_text?.split(' ').length || 0), 0);
    const segmentsWithImages = segments.filter(s => s.image_url && s.image_url !== '/placeholder.svg').length;
    const hasImages = segmentsWithImages > 0;
    
    // Check if last segment is missing image when others have images
    const lastSegment = segments[segments.length - 1];
    const needsLastImage = hasImages && (!lastSegment?.image_url || lastSegment.image_url === '/placeholder.svg');

    const isGenerating = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
    const hasAudio = audioGenerationStatus === 'completed' && fullStoryAudioUrl;
    const canGenerate = !isGenerating && (!audioGenerationStatus || audioGenerationStatus === 'not_started' || audioGenerationStatus === 'failed');

    // Auto-generate missing image for last segment
    useEffect(() => {
        if (needsLastImage && !isGeneratingMissingImage && !missingImageFixed) {
            handleGenerateMissingImage();
        }
    }, [needsLastImage, isGeneratingMissingImage, missingImageFixed]);

    const handleGenerateMissingImage = async () => {
        if (!lastSegment || isGeneratingMissingImage) return;
        
        setIsGeneratingMissingImage(true);
        console.log('🎨 Generating missing image for final segment:', lastSegment.id);

        try {
            const { error } = await supabase.functions.invoke('generate-story-segment', {
                body: {
                    action: 'generate_image_only',
                    segmentId: lastSegment.id,
                    storyId: storyId,
                    segmentText: lastSegment.segment_text
                }
            });

            if (error) throw error;
            
            toast.success('Generating final image...');
            setMissingImageFixed(true);
        } catch (error) {
            console.error('Failed to generate missing image:', error);
            toast.error('Failed to generate final image');
        } finally {
            setIsGeneratingMissingImage(false);
        }
    };

    const handleGenerateVoice = (voiceId: string) => {
        generateAudioMutation.mutate({ storyId, voiceId });
    };

    const handleWatchStory = () => {
        setShowSlideshow(true);
    };

    const handlePublishStory = () => {
        publishStoryMutation.mutate(storyId);
    };

    const handleSlideshowClose = () => {
        setShowSlideshow(false);
    };

    return (
        <>
            <div className="mt-8 space-y-8">
                <StoryCompletionHeader
                    segmentCount={segments.length}
                    totalWords={totalWords}
                    imageCount={segmentsWithImages}
                    onExit={onExit || (() => {})}
                />

                <StoryContentPreview
                    segments={segments}
                    isGeneratingMissingImage={isGeneratingMissingImage}
                />

                <VoiceGenerationSection
                    hasAudio={!!hasAudio}
                    isGenerating={isGenerating}
                    canGenerate={canGenerate}
                    fullStoryAudioUrl={fullStoryAudioUrl || ''}
                    onGenerateVoice={handleGenerateVoice}
                    storyId={storyId}
                    audioGenerationStatus={audioGenerationStatus || ''}
                />

                <VideoCompilationSection
                    story={{
                        id: storyId,
                        title: storyTitle || '',
                        shotstack_status: story?.shotstack_status,
                        shotstack_video_url: story?.shotstack_video_url,
                        shotstack_render_id: story?.shotstack_render_id,
                    }}
                />

                <DownloadStorySection
                    storyId={storyId}
                    storyTitle={storyTitle || 'TaleForge Story'}
                />

                <PublishStorySection
                    isPublic={isPublic}
                    isPublishing={publishStoryMutation.isPending}
                    onPublishStory={handlePublishStory}
                />

                <WatchStorySection
                    hasAudio={!!hasAudio}
                    onWatchStory={handleWatchStory}
                />
            </div>

            {/* Slideshow Modal */}
            <StorySlideshow
                segments={segments}
                fullStoryAudioUrl={fullStoryAudioUrl || ''}
                isOpen={showSlideshow}
                onClose={handleSlideshowClose}
            />
        </>
    );
};

export default UnifiedStoryCompletion;
