
import { Loader2, Clock, AlertCircle, RefreshCw, ImageIcon } from 'lucide-react';

export interface ImageStatusDisplay {
    icon: typeof Loader2;
    text: string;
    subtext: string;
    spinning: boolean;
    showRetry: boolean;
}

export const getImageStatusDisplay = (
    imageGenerationStatus?: string,
    isRealImageUrl?: boolean,
    imageLoaded?: boolean,
    imageError?: boolean
): ImageStatusDisplay => {
    if (imageGenerationStatus === 'in_progress') {
        return { 
            icon: Loader2, 
            text: 'AI is generating image...', 
            subtext: 'This usually takes 10-30 seconds',
            spinning: true,
            showRetry: false
        };
    }
    if (imageGenerationStatus === 'pending') {
        return { 
            icon: Clock, 
            text: 'Image generation queued...', 
            subtext: 'Waiting for AI to start',
            spinning: false,
            showRetry: false
        };
    }
    if (imageGenerationStatus === 'failed') {
        return { 
            icon: AlertCircle, 
            text: 'Image generation failed', 
            subtext: 'Click retry to try again',
            spinning: false,
            showRetry: true
        };
    }
    if (imageError) {
        return { 
            icon: AlertCircle, 
            text: 'Failed to load image', 
            subtext: 'Click retry to reload',
            spinning: false,
            showRetry: true
        };
    }
    if (imageGenerationStatus === 'completed' && isRealImageUrl && !imageLoaded) {
        return { 
            icon: Loader2, 
            text: 'Loading generated image...', 
            subtext: 'Almost ready!',
            spinning: true,
            showRetry: false
        };
    }
    if (imageGenerationStatus === 'completed' && !isRealImageUrl) {
        return { 
            icon: RefreshCw, 
            text: 'Image ready, refreshing...', 
            subtext: 'Click to refresh if it doesn\'t appear',
            spinning: true,
            showRetry: true
        };
    }
    return { 
        icon: ImageIcon, 
        text: 'No image available', 
        subtext: 'Image will appear when generated',
        spinning: false,
        showRetry: false
    };
};
