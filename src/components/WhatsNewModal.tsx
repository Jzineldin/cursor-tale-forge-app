
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';

interface WhatsNewModalProps {
  trigger?: React.ReactNode;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ trigger }) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const recentFeatures = [
    {
      category: "🎨 User Experience",
      items: [
        "Fixed story card title truncation issues across Discover and My Stories pages",
        "Enhanced mobile responsiveness for better viewing on all devices",
        "Improved story card layouts with better text wrapping and readability",
        "Added comprehensive search and filtering capabilities"
      ]
    },
    {
      category: "🔧 Technical Improvements",
      items: [
        "Optimized story generation with narrative context building for consistency",
        "Enhanced slideshow and audio synchronization for better user experience",
        "Implemented ElevenLabs voice integration for high-quality narration",
        "Added real-time AI provider health monitoring in admin panel"
      ]
    },
    {
      category: "🚀 New Features",
      items: [
        "Community story discovery with public story sharing",
        "Advanced story export options (EPUB, PDF, HTML, Text)",
        "Comprehensive admin dashboard with waitlist management",
        "Enhanced story completion interface with download and publishing options"
      ]
    },
    {
      category: "🛡️ Security & Performance",
      items: [
        "Enhanced security with rate limiting and input validation",
        "Improved error handling and user feedback systems",
        "Optimized database queries and real-time connection management",
        "Added comprehensive code audit and security improvements"
      ]
    }
  ];

  const defaultTrigger = (
    <Button
      onClick={() => setShowWhatsNew(true)}
      variant="outline"
      className="px-6 py-3 text-white border-white/20 bg-black/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
    >
      <Star className="mr-2 h-4 w-4" />
      What's New?
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setShowWhatsNew(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={showWhatsNew} onOpenChange={setShowWhatsNew}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900/95 border-amber-400/30 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-300 flex items-center gap-2">
              <Star className="h-6 w-6" />
              What's New in Tale Forge
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {recentFeatures.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-amber-200 border-b border-amber-400/30 pb-2">
                  {category.category}
                </h3>
                <ul className="space-y-2 pl-4">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t border-amber-400/30">
            <Button
              onClick={() => setShowWhatsNew(false)}
              variant="outline"
              className="border-amber-400/50 text-amber-300 hover:bg-amber-400/10"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsNewModal;
