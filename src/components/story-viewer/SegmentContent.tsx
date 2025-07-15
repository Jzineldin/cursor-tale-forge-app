
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SegmentContentProps {
    segmentText: string;
    triggeringChoiceText?: string;
    isEnd: boolean;
    index: number;
    canContinue: boolean;
    segmentId: string;
    onGoBack: (segmentId: string) => void;
    isGoBackPending: boolean;
}

const SegmentContent: React.FC<SegmentContentProps> = ({
    segmentText,
    triggeringChoiceText,
    isEnd,
    index,
    canContinue,
    segmentId,
    onGoBack,
    isGoBackPending
}) => {
    return (
        <div className="col-span-2">
            {index > 0 && canContinue && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onGoBack(segmentId)}
                    disabled={isGoBackPending}
                    title="Go back to this point"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Go back to this point</span>
                </Button>
            )}
            {triggeringChoiceText && (
                <p className="text-sm text-muted-foreground italic mb-2">
                    You chose: "{triggeringChoiceText}"
                </p>
            )}
            <p className="font-serif text-lg leading-relaxed">{segmentText}</p>
            {isEnd && (
                <p className="font-serif text-2xl text-foreground mt-6 text-center">The End.</p>
            )}
        </div>
    );
};

export default SegmentContent;
