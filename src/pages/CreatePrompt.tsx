
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
    'bedtime-stories': 'Bedtime Stories',
    'fantasy-magic': 'Fantasy & Magic',
    'adventure-exploration': 'Adventure & Exploration',
    'mystery-detective': 'Mystery & Detective',
    'science-space': 'Science Fiction & Space',
    'educational-stories': 'Educational Stories',
    'values-lessons': 'Values & Life Lessons',
    'silly-humor': 'Silly & Humorous Stories'
  };

  if (!selectedGenre) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="magical-page-container">
      <div className="magical-content">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12 relative px-4">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate('/create/genre')}
                className="glass-card px-4 py-2 text-white hover:bg-amber-500/20 border-amber-500/30 backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="glass-card px-4 py-2 text-white hover:bg-amber-500/20 border-amber-500/30 backdrop-blur-sm flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            </div>
            
            <div className="pt-8 md:pt-12 animate-magical-fade-in">
              <h1 className="fantasy-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight break-words">
                Your <span className="text-amber-400">{genreDisplayNames[selectedGenre]}</span> Adventure
              </h1>
              <p className="fantasy-subtitle text-xl text-gray-200 max-w-2xl mx-auto">
                Describe your story idea or choose from our suggestions below
              </p>
            </div>
          </div>

          {/* Story Prompt Input */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="prompt-input-container">
              <div className="mb-4">
                <h3 className="fantasy-title text-xl text-white flex items-center gap-2 mb-2">
                  <Wand2 className="h-5 w-5 text-amber-400" />
                  Your Story Beginning
                </h3>
                <p className="text-amber-200/90 font-medium">
                  Write your own prompt or select one from the magical suggestions below
                </p>
              </div>
              <textarea
                placeholder="A mysterious letter arrives at your door on a stormy night..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-textarea w-full"
              />
            </div>
          </div>

          {/* Story Suggestions */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="text-center mb-6">
              <h3 className="fantasy-title text-2xl font-bold text-white">
                Need Inspiration?
              </h3>
            </div>
            <div className="grid gap-4">
              {currentPrompts.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-card ${prompt === suggestion ? 'selected' : ''}`}
                  onClick={() => handlePromptSelect(suggestion)}
                >
                  <p className="suggestion-text">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Begin Adventure Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleBeginAdventure}
              disabled={!prompt.trim() || isCreating}
              className="btn-magical px-12 py-4 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap mx-auto"
            >
              {isCreating ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
              <span>{isCreating ? 'Creating Adventure...' : `Begin My ${genreDisplayNames[selectedGenre] ? genreDisplayNames[selectedGenre].split(' ').slice(1).join(' ') : 'Story'} Adventure`}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
