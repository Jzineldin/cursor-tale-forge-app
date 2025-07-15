import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ImageIcon, Loader2 } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';

interface StoryContentPreviewProps {
  segments: StorySegmentRow[];
  isGeneratingMissingImage: boolean;
}

const StoryContentPreview: React.FC<StoryContentPreviewProps> = ({
  segments,
  isGeneratingMissingImage
}) => {
  return (
    <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          Step 1: Your Complete Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {segments.map((segment, index) => (
            <div key={segment.id} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-amber-500/30">
              {/* Image */}
              <div className="flex-shrink-0 w-24 h-24">
                {segment.image_url && segment.image_url !== '/placeholder.svg' ? (
                  <img 
                    src={segment.image_url} 
                    alt={`Chapter ${index + 1}`}
                    className="w-full h-full object-cover rounded border border-amber-300/50"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center border border-amber-500/30">
                    {index === segments.length - 1 && isGeneratingMissingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                )}
              </div>
              {/* Text */}
              <div className="flex-1">
                <h4 className="font-semibold text-slate-200 mb-2">Chapter {index + 1}</h4>
                <p className="text-slate-300 text-sm line-clamp-3">
                  {segment.segment_text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryContentPreview;