
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, RefreshCw, AlertCircle, Clock } from 'lucide-react';

interface ImageStatusOverlayProps {
    imageGenerationStatus?: string;
    imageError: boolean;
    segmentId: string;
    imageUrl?: string;
    imageLoaded: boolean;
    onRetry?: () => void;
}

const ImageStatusOverlay: React.FC<ImageStatusOverlayProps> = ({
    imageGenerationStatus,
    imageError,
    segmentId,
    imageUrl,
    imageLoaded,
    onRetry
}) => {
    const getStatusDisplay = () => {
        if (imageGenerationStatus === 'in_progress') {
            return { 
                icon: Loader2, 
                text: 'Generating image...', 
                spinning: true, 
                showRetry: false,
                description: 'AI is creating your image'
            };
        }
        if (imageGenerationStatus === 'pending') {
            return { 
                icon: Clock, 
                text: 'Image generation queued...', 
                spinning: false, 
                showRetry: false,
                description: 'Waiting for AI to start generating'
            };
        }
        if (imageGenerationStatus === 'failed') {
            return { 
                icon: AlertCircle, 
                text: 'Image generation failed', 
                spinning: false, 
                showRetry: true,
                description: 'There was an error generating your image'
            };
        }
        if (imageError) {
            return { 
                icon: AlertCircle, 
                text: 'Failed to load image', 
                spinning: false, 
                showRetry: true,
                description: 'The image could not be displayed'
            };
        }
        if (imageUrl && !imageLoaded && !imageError) {
            return { 
                icon: Loader2, 
                text: 'Loading image...', 
                spinning: true, 
                showRetry: false,
                description: 'Downloading your generated image'
            };
        }
        return { 
            icon: ImageIcon, 
            text: 'Processing...', 
            spinning: true, 
            showRetry: false,
            description: 'Preparing your image'
        };
    };

    const handleRetryImage = async () => {
        console.log(`[ImageStatusOverlay ${segmentId}] Retrying image generation/loading`);
        if (onRetry) {
            onRetry();
        }
    };

    const status = getStatusDisplay();
    const IconComponent = status.icon;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/95 backdrop-blur-sm">
            <div className="text-center space-y-3">
                <IconComponent className={`h-8 w-8 text-primary mx-auto ${status.spinning ? 'animate-spin' : ''}`} />
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {status.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {status.description}
                    </p>
                </div>
                {status.showRetry && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetryImage}
                        className="mt-2"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                    </Button>
                )}
            </div>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute bottom-2 left-2 right-2 text-xs text-muted-foreground text-center bg-background/80 rounded p-2">
                    <div>Status: {imageGenerationStatus || 'none'}</div>
                    <div>URL: {imageUrl ? 'Present' : 'Missing'}</div>
                    <div>Loaded: {imageLoaded ? 'Yes' : 'No'}</div>
                    <div>Error: {imageError ? 'Yes' : 'No'}</div>
                </div>
            )}
        </div>
    );
};

export default ImageStatusOverlay;
