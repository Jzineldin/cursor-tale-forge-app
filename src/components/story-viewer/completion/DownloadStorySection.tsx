import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileDown, FileImage, Share2, BookOpen, FileCode } from 'lucide-react';
import { StoryExporter } from '@/utils/storyExporter';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface DownloadStorySectionProps {
  storyId: string;
  storyTitle: string;
}

const DownloadStorySection: React.FC<DownloadStorySectionProps> = ({
  storyId,
  storyTitle
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (format: 'text' | 'html' | 'markdown' | 'epub' | 'pdf' | 'json' | 'images') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'text':
          await StoryExporter.exportAsText(storyId, storyTitle);
          toast.success('Story exported as text file!');
          break;
        case 'html':
          await StoryExporter.exportAsHTML(storyId, storyTitle);
          toast.success('Story exported as HTML file!');
          break;
        case 'markdown':
          await StoryExporter.exportAsMarkdown(storyId, storyTitle);
          toast.success('Story exported as Markdown file!');
          break;
        case 'epub':
          await StoryExporter.exportAsEPUB(storyId, storyTitle);
          toast.success('E-book file created! Convert to EPUB using Calibre for best results.');
          break;
        case 'pdf':
          await StoryExporter.exportAsPDF(storyId, storyTitle);
          toast.success('PDF-ready file created! Open in browser and print to PDF.');
          break;
        case 'json':
          await StoryExporter.exportAsJSON(storyId, storyTitle);
          toast.success('Story exported as JSON file!');
          break;
        case 'images':
          await StoryExporter.downloadImages(storyId, storyTitle);
          toast.success('Story images downloaded!');
          break;
        default:
          toast.error('Unknown export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export story. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [storyId, storyTitle]);

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/story/${storyId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Story link copied to clipboard!');
  }, [storyId]);

  return (
    <Card className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border-emerald-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-emerald-200 flex items-center gap-2">
          <span className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">3</span>
          Save & Share Your Story
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-emerald-300 mb-6">
          Keep your story forever! Download it in multiple formats or share it with friends.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Enhanced Download Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="bg-emerald-600/90 hover:bg-emerald-600 border-2 border-emerald-400 hover:border-emerald-300 text-white px-6 py-3 font-semibold flex-1"
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Download className="mr-2 h-5 w-5" />
                )}
                {isExporting ? 'Exporting...' : '💾 Download Story'}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-80 bg-slate-900/95 border-emerald-400/40 backdrop-blur-sm shadow-2xl">
              <DropdownMenuLabel className="text-emerald-300 font-semibold">📖 E-book Formats</DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={() => handleExport('epub')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>E-book (.epub)</span>
                  <span className="text-xs text-gray-400">E-reader compatible format</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleExport('pdf')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileDown className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>PDF Ready (.html)</span>
                  <span className="text-xs text-gray-400">Print to PDF via browser</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-emerald-500/30" />
              <DropdownMenuLabel className="text-emerald-300 font-semibold">📄 Text Formats</DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={() => handleExport('text')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Plain Text (.txt)</span>
                  <span className="text-xs text-gray-400">Universal compatibility</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleExport('markdown')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileCode className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Markdown (.md)</span>
                  <span className="text-xs text-gray-400">Perfect for documentation</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleExport('html')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileDown className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Web Page (.html)</span>
                  <span className="text-xs text-gray-400">Rich formatting with images</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-emerald-500/30" />
              <DropdownMenuLabel className="text-emerald-300 font-semibold">🎨 Media & Data</DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={() => handleExport('images')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileImage className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Images Gallery (.html)</span>
                  <span className="text-xs text-gray-400">All story images</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleExport('json')} 
                disabled={isExporting}
                className="text-slate-200 hover:bg-emerald-700/20 focus:bg-emerald-700/20"
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Data Export (.json)</span>
                  <span className="text-xs text-gray-400">Complete story data</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="bg-cyan-600/90 hover:bg-cyan-600 border-2 border-cyan-400 hover:border-cyan-300 text-white px-6 py-3 font-semibold flex-1"
          >
            <Share2 className="mr-2 h-5 w-5" />
            🔗 Share Link
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-emerald-400 text-sm">
            ✨ Export includes all chapters, images, and formatting
          </p>
          <p className="text-emerald-400/80 text-xs mt-1">
            💡 Tip: Use EPUB for e-readers, PDF for printing, HTML for web viewing
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadStorySection;
