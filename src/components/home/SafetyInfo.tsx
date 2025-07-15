
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, BookOpen, Star } from 'lucide-react';

const SafetyInfo: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: "Safe Content",
      description: "All stories are generated with family-friendly guidelines and content filters"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Educational Value",
      description: "Stories encourage reading, critical thinking, and creative decision-making"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      title: "Literary Skills",
      description: "Improve vocabulary, comprehension, and narrative understanding through play"
    },
    {
      icon: <Star className="h-6 w-6 text-amber-500" />,
      title: "Positive Themes",
      description: "Stories promote values like friendship, courage, problem-solving, and growth"
    }
  ];

  return (
    <section className="py-16 px-4 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
            Safe & Educational
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-sans">
            TaleForge is designed with safety and learning in mind, making it perfect for readers of all ages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-black/20 border-white/10 backdrop-blur-sm hover:bg-black/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 font-serif">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-sans">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-amber-500/10 border-amber-500/30 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4 font-serif">
                Perfect for Educators & Parents
              </h3>
              <p className="text-gray-200 leading-relaxed font-sans">
                TaleForge stories can be used in classrooms to encourage creative writing, 
                critical thinking, and collaborative storytelling. Teachers and parents love 
                how it combines entertainment with educational value, making reading 
                an interactive and engaging experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SafetyInfo;
