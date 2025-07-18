
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Wand2, Home, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useGenerateInspiration } from '@/hooks/useGenerateInspiration';

const CreatePrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const { generateNewPrompts, isGenerating, error } = useGenerateInspiration();

  useEffect(() => {
    const genre = searchParams.get('genre');
    const age = searchParams.get('age');
    
    if (!genre) {
      navigate('/create/genre');
      return;
    }
    
    if (!age) {
      navigate('/create/age');
      return;
    }
    
    setSelectedGenre(genre);
    // Initialize with default prompts for the genre
    setCurrentPrompts(genrePrompts[genre] || []);
  }, [searchParams, navigate]);

  useEffect(() => {
    document.body.setAttribute('data-route', '/create/prompt');
    return () => {
      document.body.removeAttribute('data-route');
    };
  }, []);

  // Hide global scene-bg when this component mounts
  useEffect(() => {
    const sceneBg = document.querySelector('.scene-bg') as HTMLElement;
    if (sceneBg) {
      sceneBg.style.display = 'none';
    }

    // Show it again when component unmounts
    return () => {
      if (sceneBg) {
        sceneBg.style.display = 'block';
      }
    };
  }, []);

  const genrePrompts: Record<string, string[]> = {
    'bedtime-stories': [
      'You find a magical crayon that brings everything you draw to life in your backyard.',
      'A friendly dragon visits your school and needs help finding its way home.',
      'You discover that your pet hamster can actually talk, but only to you.'
    ],
    'fantasy-magic': [
      'You discover you are the last heir to a magical kingdom hidden beneath your city.',
      'An ancient dragon awakens and claims you are the chosen one mentioned in an old prophecy.',
      'You find a magical sword in your grandmother\'s attic that transports you to a realm under siege.'
    ],
    'adventure-exploration': [
      'You find a treasure map hidden in the pages of an old library book.',
      'Your grandfather\'s compass doesn\'t point north—it points to adventure.',
      'You receive an invitation to join a secret society of modern-day explorers.'
    ],
    'mystery-detective': [
      'You inherit your detective grandfather\'s office and find his unsolved case files.',
      'Every book you check out from the library contains a hidden message meant just for you.',
      'You notice that everyone in your small town disappears for exactly one hour every Tuesday.'
    ],
    'science-space': [
      'You wake up on a space station with no memory of how you got there, and the AI seems hostile.',
      'Your new smartphone starts receiving messages from your future self warning of danger.',
      'You discover that your dreams are actually glimpses into parallel universes.'
    ],
    'educational-stories': [
      'You time travel to ancient Egypt and must help build the pyramids using mathematical principles.',
      'A mysterious scientist shrinks you down to explore the human body from the inside.',
      'You become the apprentice to a Renaissance inventor who needs help with their latest creation.'
    ],
    'values-lessons': [
      'You meet a new student at school who seems sad and has no friends to sit with at lunch.',
      'You find a wallet full of money on the playground and must decide what to do.',
      'Your best friend starts spreading rumors about someone, and you have to choose what\'s right.'
    ],
    'silly-humor': [
      'Your pet goldfish becomes a stand-up comedian and starts telling jokes to other pets.',
      'You wake up to find that gravity works backwards in your house for one day.',
      'Your school cafeteria food comes to life and starts a food fight revolution.'
    ]
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const handleGenerateNewPrompts = async () => {
    try {
      const newPrompts = await generateNewPrompts(selectedGenre);
      setCurrentPrompts(newPrompts);
      toast.success('✨ New inspiration prompts generated!');
    } catch (err) {
      toast.error('Failed to generate new prompts. Please try again.');
    }
  };

  const handleBeginAdventure = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt or select one from the suggestions');
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('Creating new story with prompt:', prompt);
      
      // Create a new story first
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''), // Use first 100 chars as title
          description: prompt,
          story_mode: selectedGenre || 'fantasy',
          target_age: searchParams.get('age'), // Store the selected age
          user_id: user?.id || null // Associate with user if authenticated, otherwise anonymous
        })
        .select()
        .single();

      if (storyError) {
        console.error('Error creating story:', storyError);
        throw new Error('Failed to create story');
      }

      if (!story) {
        throw new Error('No story data returned');
      }

      console.log('Story created successfully:', story);

      // Navigate to the enhanced story display with initial parameters
      const params = new URLSearchParams({
        genre: selectedGenre || 'fantasy',
        prompt: prompt.trim(),
        mode: 'create',
        age: searchParams.get('age') || ''
      });
      
      navigate(`/story/${story.id}?${params.toString()}`, { replace: true });
      
    } catch (err) {
      console.error('Error starting story:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start story';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const genreDisplayNames: Record<string, string> = {
    'bedtime-stories': '🌙 Bedtime Stories',
    'fantasy-magic': '🏰 Fantasy & Magic',
    'adventure-exploration': '🗺️ Adventure & Exploration',
    'mystery-detective': '🕵️ Mystery & Detective',
    'science-space': '🚀 Science Fiction & Space',
    'educational-stories': '📚 Educational Stories',
    'values-lessons': '❤️ Values & Life Lessons',
    'silly-humor': '😂 Silly & Humorous Stories'
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
      className="prompt-page-container fixed top-0 left-0 w-full h-full overflow-y-auto z-50"
      style={{
        background: `
          linear-gradient(rgba(15, 23, 42, 0.2), rgba(30, 41, 59, 0.3)),
          url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="prompt-content relative z-10 min-h-full">
        <div className="container mx-auto px-4 pb-16" style={{ marginTop: '80px' }}>
          {/* Header */}
          <div className="text-center mb-12 relative px-4">
            <div className="flex justify-between items-center mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/create/genre')}
                className="!text-white !bg-slate-800/60 hover:!bg-amber-500/20 !border !border-amber-500/30 !backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="!text-white !bg-slate-800/60 hover:!bg-amber-500/20 !border !border-amber-500/30 !backdrop-blur-sm flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
            
            <div className="pt-8 md:pt-12">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold !text-white mb-6 font-serif drop-shadow-2xl leading-tight break-words">
                Your <span className="!text-amber-400 drop-shadow-lg">✨{genreDisplayNames[selectedGenre]}</span> Adventure
              </h1>
              <p className="text-xl !text-gray-200 max-w-2xl mx-auto drop-shadow-lg">
                Describe your story idea or choose from our suggestions below
              </p>
            </div>
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
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold !text-white font-serif drop-shadow-lg flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                Need Inspiration?
                <div className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></div>
              </h3>
              {/* Temporarily hidden - will be re-enabled later */}
              {/* <div className="mt-4">
                <Button
                  onClick={handleGenerateNewPrompts}
                  disabled={isGenerating}
                  variant="outline"
                  className="!text-amber-300 !border-amber-500/50 hover:!bg-amber-500/20 !backdrop-blur-sm"
                >
                  {isGenerating ? (
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate New Prompts'}
                </Button>
              </div> */}
            </div>
            <div className="grid gap-4">
              {currentPrompts.map((suggestion, index) => (
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
          <div className="text-center mb-8">
            <Button
              onClick={handleBeginAdventure}
              disabled={!prompt.trim() || isCreating}
              className="!bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !text-white px-12 py-4 text-xl font-medium disabled:!opacity-50 disabled:!cursor-not-allowed !shadow-lg !shadow-amber-500/30 hover:!shadow-xl hover:!shadow-amber-500/40 !transition-all !duration-300 hover:!scale-105"
            >
              {isCreating ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              {isCreating ? 'Creating Adventure...' : `Begin My ${genreDisplayNames[selectedGenre] ? genreDisplayNames[selectedGenre].split(' ').slice(1).join(' ') : 'Story'} Adventure`}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
