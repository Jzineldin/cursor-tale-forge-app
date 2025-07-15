
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Wand2, Home } from 'lucide-react';
import { toast } from 'sonner';

const CreatePrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const genre = searchParams.get('genre');
    if (!genre) {
      navigate('/create/genre');
      return;
    }
    setSelectedGenre(genre);
  }, [searchParams, navigate]);

  const genrePrompts: Record<string, string[]> = {
    'child-adapted': [
      'You find a magical crayon that brings everything you draw to life in your backyard.',
      'A friendly dragon visits your school and needs help finding its way home.',
      'You discover that your pet hamster can actually talk, but only to you.'
    ],
    'horror-story': [
      'You inherit an old mansion where every mirror shows a different reflection than your own.',
      'The antique music box in your attic plays a melody that makes people disappear.',
      'You work the night shift at a museum where the exhibits come alive after midnight.'
    ],
    'educational': [
      'You time travel to ancient Egypt and must help build the pyramids using mathematical principles.',
      'A mysterious scientist shrinks you down to explore the human body from the inside.',
      'You become the apprentice to a Renaissance inventor who needs help with their latest creation.'
    ],
    'epic-fantasy': [
      'You discover you are the last heir to a magical kingdom hidden beneath your city.',
      'An ancient dragon awakens and claims you are the chosen one mentioned in an old prophecy.',
      'You find a magical sword in your grandmother\'s attic that transports you to a realm under siege.'
    ],
    'sci-fi-thriller': [
      'You wake up on a space station with no memory of how you got there, and the AI seems hostile.',
      'Your new smartphone starts receiving messages from your future self warning of danger.',
      'You discover that your dreams are actually glimpses into parallel universes.'
    ],
    'mystery': [
      'You inherit your detective grandfather\'s office and find his unsolved case files.',
      'Every book you check out from the library contains a hidden message meant just for you.',
      'You notice that everyone in your small town disappears for exactly one hour every Tuesday.'
    ],
    'romantic-drama': [
      'You keep meeting the same stranger in different cities around the world.',
      'A love letter meant for someone else accidentally gets delivered to your door.',
      'You can hear the thoughts of your soulmate, but you\'ve never met them.'
    ],
    'adventure-quest': [
      'You find a treasure map hidden in the pages of an old library book.',
      'Your grandfather\'s compass doesn\'t point north—it points to adventure.',
      'You receive an invitation to join a secret society of modern-day explorers.'
    ]
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const handleBeginAdventure = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt or select one from the suggestions');
      return;
    }

    // For now, navigate to the existing story creation flow
    // In the future, this would create a new story and navigate to /story/:id
    navigate(`/create-story?genre=${selectedGenre}&prompt=${encodeURIComponent(prompt)}`);
  };

  const genreDisplayNames: Record<string, string> = {
    'child-adapted': '👶 Child Adapted',
    'horror-story': '👻 Horror Story',
    'educational': '📚 Educational',
    'epic-fantasy': '🏰 Epic Fantasy',
    'sci-fi-thriller': '🚀 Sci-Fi Thriller',
    'mystery': '🕵️ Mystery',
    'romantic-drama': '💕 Romantic Drama',
    'adventure-quest': '🗺️ Adventure Quest'
  };

  if (!selectedGenre) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.90)),
          radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
          url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')
        `,
        backgroundSize: 'auto, auto, auto, cover',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 py-16 relative">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <Button
            variant="ghost"
            onClick={() => navigate('/create/genre')}
            className="!absolute top-8 left-8 !text-white !bg-slate-800/60 hover:!bg-amber-500/20 !border !border-amber-500/30 !backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="!absolute top-8 left-32 !text-white !bg-slate-800/60 hover:!bg-amber-500/20 !border !border-amber-500/30 !backdrop-blur-sm flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
          
          <h1 className="text-4xl md:text-6xl font-bold !text-white mb-6 font-serif drop-shadow-2xl">
            Your <span className="!text-amber-400 drop-shadow-lg">✨{genreDisplayNames[selectedGenre]}</span> Adventure
          </h1>
          <p className="text-xl !text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
            Describe your story idea or choose from our suggestions below
          </p>
        </div>

        {/* Story Prompt Input */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="!bg-slate-800/70 !border-2 !border-amber-500/40 !backdrop-blur-md !shadow-2xl !shadow-amber-500/10">
            <CardHeader>
              <CardTitle className="!text-white !text-xl font-serif !drop-shadow-lg flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-amber-400" />
                Your Story Beginning
              </CardTitle>
              <CardDescription className="!text-amber-200/90 !font-medium">
                Write your own prompt or select one from the magical suggestions below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="A mysterious letter arrives at your door on a stormy night..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] text-lg p-4 !bg-slate-700/60 !border-2 !border-amber-500/30 !text-white placeholder:!text-amber-300/70 focus:!border-amber-400 focus:!ring-2 focus:!ring-amber-400/30 !backdrop-blur-sm resize-none !rounded-lg !shadow-inner"
              />
            </CardContent>
          </Card>
        </div>

        {/* Story Suggestions */}
        <div className="max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-bold !text-white mb-6 text-center font-serif drop-shadow-lg flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></div>
            Need Inspiration?
            <div className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></div>
          </h3>
          <div className="grid gap-4">
            {genrePrompts[selectedGenre]?.map((suggestion, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:!shadow-xl hover:!scale-105 ${
                  prompt === suggestion 
                    ? '!border-2 !border-amber-400 !bg-slate-800/80 !shadow-amber-400/30 !shadow-lg !backdrop-blur-md' 
                    : '!border-2 !border-amber-500/30 hover:!border-amber-400/70 !bg-slate-800/60 hover:!bg-slate-800/75 !backdrop-blur-md'
                }`}
                onClick={() => handlePromptSelect(suggestion)}
              >
                <CardContent className="p-4">
                  <p className="!text-slate-100 leading-relaxed !drop-shadow-sm font-medium break-words overflow-hidden">
                    {suggestion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Begin Adventure Button */}
        <div className="text-center">
          <Button
            onClick={handleBeginAdventure}
            disabled={!prompt.trim()}
            className="!bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !text-white px-12 py-4 text-xl font-medium disabled:!opacity-50 disabled:!cursor-not-allowed !shadow-lg !shadow-amber-500/30 hover:!shadow-xl hover:!shadow-amber-500/40 !transition-all !duration-300 hover:!scale-105"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Begin My {genreDisplayNames[selectedGenre].split(' ').slice(1).join(' ')} Adventure
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
