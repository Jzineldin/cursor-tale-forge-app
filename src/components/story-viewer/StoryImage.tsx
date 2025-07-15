
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RotateCcw, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoryImageProps {
    imageUrl?: string | null;
    imageGenerationStatus?: string;
    altText: string;
    className?: string;
    segmentId?: string;
    onRetry?: () => void;
}

const StoryImage: React.FC<StoryImageProps> = ({
    imageUrl,
    imageGenerationStatus,
    altText,
    className = "",
    segmentId,
    onRetry
}) => {
    const [imageError, setImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [imageKey, setImageKey] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    console.log('[StoryImage] Debug info:', {
        imageUrl: imageUrl || 'null/undefined',
        imageGenerationStatus,
        hasImageUrl: !!imageUrl,
        imageUrlLength: imageUrl?.length || 0,
        isPlaceholder: imageUrl === '/placeholder.svg',
        imageError,
        retryCount,
        segmentId
    });

    // Reset error state when imageUrl changes
    useEffect(() => {
        if (imageUrl && imageUrl !== '/placeholder.svg') {
            console.log('[StoryImage] Valid image URL changed, resetting error state');
            setImageError(false);
            setRetryCount(0);
            setImageKey(prev => prev + 1);
        }
    }, [imageUrl]);

    // Listen for force refresh events from real-time updates
    useEffect(() => {
        const handleForceRefresh = (event: CustomEvent) => {
            if (event.detail?.segmentId === segmentId) {
                console.log('[StoryImage] Force refresh event received for segment:', segmentId);
                setImageKey(prev => prev + 1);
                setImageError(false);
                setIsRetrying(false);
            }
        };

        window.addEventListener('force-image-refresh', handleForceRefresh as EventListener);
        return () => {
            window.removeEventListener('force-image-refresh', handleForceRefresh as EventListener);
        };
    }, [segmentId]);

    // Auto-retry after 10 seconds on first error
    useEffect(() => {
        if (imageError && retryCount === 0) {
            console.log('[StoryImage] Setting up auto-retry timer');
            const timer = setTimeout(() => {
                handleRetry();
            }, 10000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [imageError, retryCount]);

    const handleRetry = async (): Promise<void> => {
        console.log('[StoryImage] Manual/Auto retry triggered');
        setImageError(false);
        setRetryCount(prev => prev + 1);
        setImageKey(prev => prev + 1);
        setIsRetrying(true);

        // If we have a segmentId, try to regenerate the image
        if (segmentId) {
            try {
                console.log('[StoryImage] Attempting to regenerate image for segment:', segmentId);
                
                const { error } = await supabase.functions.invoke('regenerate-image', {
                    body: { segmentId }
                });

                if (error) {
                    console.error('[StoryImage] Image regeneration failed:', error);
                    toast.error('Failed to regenerate image. Please try again.');
                } else {
                    console.log('[StoryImage] Image regeneration initiated successfully');
                    toast.success('Image regeneration started. Please wait...');
                }
            } catch (error) {
                console.error('[StoryImage] Error during image regeneration:', error);
                toast.error('An error occurred while regenerating the image.');
            }
        }

        // Call external retry handler if provided
        if (onRetry) {
            onRetry();
        }

        setIsRetrying(false);
    };


    const handleImageError = () => {
        console.error('[StoryImage] Failed to load image:', imageUrl);
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log('[StoryImage] Image loaded successfully:', imageUrl);
    };

    // Determine what to show based on the current state
    const isValidImageUrl = imageUrl && imageUrl !== '/placeholder.svg' && imageUrl.trim() !== '';
    const isGenerating = imageGenerationStatus === 'pending' || imageGenerationStatus === 'in_progress';
    const isCompleted = imageGenerationStatus === 'completed';
    const isFailed = imageGenerationStatus === 'failed' || imageGenerationStatus === 'CURRENT_TASK_ERROR';

    console.log('[StoryImage] Display decision:', {
        isValidImageUrl,
        isGenerating,
        isCompleted,
        isFailed,
        imageError,
        shouldShowSpinner: isGenerating && !isValidImageUrl,
        shouldShowImage: isValidImageUrl && !imageError,
        shouldShowError: isFailed || imageError,
        shouldShowPlaceholder: !isGenerating && !isValidImageUrl && !isFailed && !imageError
    });

    // Show spinner when generating and no valid image
    if (isGenerating && !isValidImageUrl && !isRetrying) {
        return (
            <div className={`relative flex items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/20 aspect-square w-full ${className}`}>
                <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Generating image...</p>
                    <p className="text-xs text-amber-400">This may take 30-60 seconds</p>
                </div>
            </div>
        );
    }

    // Show error state for failed generation or image load errors
    if (isFailed || imageError) {
        return (
            <div className={`relative flex items-center justify-center bg-destructive/10 border-2 border-destructive/20 aspect-square w-full ${className}`}>
                <div className="flex flex-col items-center space-y-3 text-destructive p-4">
                    <AlertCircle className="h-8 w-8" />
                    <div className="text-center">
                        <p className="text-sm font-medium">
                            {isFailed && imageGenerationStatus === 'CURRENT_TASK_ERROR' 
                                ? 'Image generation service temporarily unavailable' 
                                : isFailed 
                                ? 'Image generation failed' 
                                : 'Failed to load image'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {imageGenerationStatus === 'CURRENT_TASK_ERROR' 
                                ? 'The image service is experiencing issues. Please try again.' 
                                : 'Please check your connection and try again'}
                        </p>
                    </div>
                    <Button 
                        onClick={handleRetry}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        disabled={isRetrying}
                    >
                        {isRetrying ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Retry
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // Show retry state when retrying
    if (isRetrying) {
        return (
            <div className={`relative flex items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/20 aspect-square w-full ${className}`}>
                <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Retrying image generation...</p>
                    <p className="text-xs text-amber-400">Please wait...</p>
                </div>
            </div>
        );
    }

    // Show the actual image if we have a valid URL
    if (isValidImageUrl) {
        console.log('[StoryImage] Rendering actual image with key:', imageKey);
        return (
            <div className={`relative overflow-hidden border aspect-square w-full ${className}`}>
                <img
                    key={`${imageUrl}-${imageKey}`}
                    src={imageUrl}
                    alt={altText}
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="eager"
                />
                {/* Debug info overlay for development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs p-1 rounded">
                        Status: {imageGenerationStatus}
                    </div>
                )}
            </div>
        );
    }

    // Show placeholder when no image is available and not failed
    return (
        <div className={`relative flex items-center justify-center bg-muted/20 border-2 border-dashed border-muted-foreground/20 aspect-square w-full ${className}`}>
            <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
                <p className="text-sm">No image available</p>
                <p className="text-xs">Images skipped for this story</p>
            </div>
        </div>
    );
};

export default StoryImage;
