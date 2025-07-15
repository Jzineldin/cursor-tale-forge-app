
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StorySegmentRow } from '@/types/stories';
import StoryImage from './StoryImage';
import SegmentContent from './SegmentContent';

interface StorySegmentItemProps {
    segment: StorySegmentRow;
    index: number;
    canContinue: boolean;
    onGoBack: (segmentId: string) => void;
    isGoBackPending: boolean;
}

const StorySegmentItem: React.FC<StorySegmentItemProps> = ({ 
    segment, 
    index, 
    canContinue, 
    onGoBack, 
    isGoBackPending 
}) => {
    console.log(`[StorySegmentItem ${segment.id}] Rendering segment:`, {
        id: segment.id,
        image_url: segment.image_url,
        image_generation_status: segment.image_generation_status,
        segment_text_preview: segment.segment_text?.substring(0, 50) + '...',
        hasImageUrl: !!segment.image_url,
        imageUrlLength: segment.image_url?.length || 0,
        isPlaceholder: segment.image_url === '/placeholder.svg',
        propsToStoryImage: {
            imageUrl: segment.image_url,
            imageGenerationStatus: segment.image_generation_status,
            altText: `Visual for segment ${index + 1}`
        }
    });

    return (
        <Card className="relative group">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <StoryImage
                    imageUrl={segment.image_url}
                    imageGenerationStatus={segment.image_generation_status}
                    altText={`Visual for segment ${index + 1}`}
                    className="rounded-lg col-span-1"
                />
                
                <SegmentContent
                    segmentText={segment.segment_text}
                    triggeringChoiceText={segment.triggering_choice_text || ''}
                    isEnd={segment.is_end}
                    index={index}
                    canContinue={canContinue}
                    segmentId={segment.id}
                    onGoBack={onGoBack}
                    isGoBackPending={isGoBackPending}
                />
            </CardContent>
        </Card>
    );
};

export default StorySegmentItem;
