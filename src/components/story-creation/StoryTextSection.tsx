
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StoryTextSectionProps {
  text: string;
}

const StoryTextSection: React.FC<StoryTextSectionProps> = ({ text }) => {
  return (
    <div className="story-text-section w-full">
      <Card className="bg-slate-800/80 border-amber-500/20 shadow-inner">
        <CardContent className="p-8">
          <div className="prose prose-invert max-w-none">
            <div 
              className="text-gray-100 text-base sm:text-lg leading-relaxed font-serif whitespace-pre-wrap break-words overflow-wrap-anywhere"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                hyphens: 'auto'
              }}
            >
              {text}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryTextSection;
