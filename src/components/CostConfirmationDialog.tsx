
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Coins, Image, Volume2 } from 'lucide-react';

interface CostConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pendingAction: 'start' | 'choice' | 'audio' | null;
  skipImage: boolean;
  skipAudio: boolean;
  onSkipImageChange: (checked: boolean) => void;
  onSkipAudioChange: (checked: boolean) => void;
  apiUsageCount: number;
  showAudioOption?: boolean;
}

export const CostConfirmationDialog: React.FC<CostConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  pendingAction,
  skipImage,
  skipAudio,
  onSkipImageChange,
  onSkipAudioChange,
  apiUsageCount,
  showAudioOption = false
}) => {
  const getEstimatedCost = () => {
    if (pendingAction === 'audio') {
      return '0.015'; // Audio generation cost
    }
    let baseCost = 0.02; // Text generation
    if (!skipImage) baseCost += 0.04; // Image generation
    if (showAudioOption && !skipAudio) baseCost += 0.015; // Audio generation (only if audio option is shown)
    return baseCost.toFixed(3);
  };

  const getActionText = () => {
    switch (pendingAction) {
      case 'start': return 'start your story';
      case 'choice': return 'generate next segment';
      case 'audio': return 'generate audio narration';
      default: return 'continue';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-400">
            <Coins className="h-5 w-5" />
            Confirm AI Generation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Ready to {getActionText()}? This will use AI services to generate content.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Estimated Cost:</span>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                ~${getEstimatedCost()}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">
              Usage Count: {apiUsageCount} calls made
            </div>
          </div>

          {pendingAction !== 'audio' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-image"
                  checked={skipImage}
                  onCheckedChange={onSkipImageChange}
                />
                <label htmlFor="skip-image" className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Skip image generation (save ~$0.04)
                </label>
              </div>

              {showAudioOption && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-audio"
                    checked={skipAudio}
                    onCheckedChange={onSkipAudioChange}
                  />
                  <label htmlFor="skip-audio" className="text-sm flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Skip audio generation (save ~$0.015)
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Generate Content
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
