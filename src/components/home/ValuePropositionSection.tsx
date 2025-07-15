
import React from 'react';
import { BookOpen, Image, Volume2, MousePointer } from 'lucide-react';

const ValuePropositionSection: React.FC = () => {
  const outputs = [
    {
      icon: BookOpen,
      title: 'Rich Story Text',
      description: 'AI-crafted narratives that adapt to your choices'
    },
    {
      icon: Image,
      title: 'Custom AI Images',
      description: 'Unique visuals generated for each story scene'
    },
    {
      icon: Volume2,
      title: 'Voice Narration',
      description: 'Professional AI voice brings stories to life'
    },
    {
      icon: MousePointer,
      title: 'Interactive Choices',
      description: 'Your decisions shape the story\'s direction'
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 md:p-8 border border-white/20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 font-serif magical-text">
              Transform Any Idea Into an Interactive Story
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-sans">
              Turn a simple prompt like "A lonely astronaut discovers an ancient book" into a complete 
              15-chapter adventure with images, audio, and choices that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {outputs.map((output, index) => (
              <div key={index} className="text-center space-y-3 md:space-y-4">
                <div className="flex justify-center mb-3 md:mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <output.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white font-serif">
                  {output.title}
                </h3>
                <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed px-2">
                  {output.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
