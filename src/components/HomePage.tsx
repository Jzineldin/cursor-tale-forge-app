
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Shield,
  Heart,
  BookOpen,
  Palette,
  GraduationCap,
  Lock,
  Star,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react';
import Footer from './home/Footer';

const HomePage: React.FC = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const testimonials = [
    {
      quote: "This app is awesome... The process is very clear and it's definitely something I'd use. Amazing job!",
      author: "Product Tester",
      stars: 5
    },
    {
      quote: "Feature-rich, polished, and aimed at a well-defined audience. It feels like you could really click with parents and educators.",
      author: "Education Professional",
      stars: 5
    },
    {
      quote: "Great idea! It solves a real problem and design looks great! Best of luck with scaling!",
      author: "Beta Reviewer",
      stars: 5
    },
    {
      quote: "I love the storytelling concept! Interactive stories could help parents bond and learn together.",
      author: "Parent & Developer",
      stars: 5
    },
    {
      quote: "Great app! Flows well and has a lot of features. Quality looks great - you have a great chance!",
      author: "User Tester",
      stars: 5
    }
  ];

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length]);

  const handleCreateStory = () => {
    navigate('/create/genre');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      // Here you would typically send to your backend
      console.log('Waitlist signup:', { name, email });
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Original beautiful background */}
      <div className="scene-bg"></div>

      <div className="relative z-10">
        {/* Sticky Mobile CTA Button */}
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <Button
            onClick={handleCreateStory}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-4 text-lg shadow-2xl transition-all duration-300 rounded-lg"
            style={{ minHeight: '56px' }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating Stories
          </Button>
        </div>

        {/* 1. HERO SECTION */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20 pt-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Enhanced glassmorphic overlay for better readability */}
            <div className="glass-hero rounded-3xl p-6 md:p-12 shadow-2xl transition-all duration-300">
              
              {/* Tale Forge Title - Beautiful Gold with enhanced shadows */}
              <div className="mb-6" style={{ paddingBottom: '12px' }}>
                <h1 
                  className="tale-forge-title text-3xl md:text-5xl lg:text-6xl font-bold"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)',
                    lineHeight: '1.3',
                    paddingBottom: '8px'
                  }}
                >
                  Tale Forge
                </h1>
              </div>
              
              {/* Hero Headlines - Enhanced readability */}
              <h2 
                className="magical-heading text-xl md:text-2xl lg:text-3xl font-bold mb-6 leading-relaxed max-w-4xl mx-auto" 
                style={{
                  lineHeight: '1.4',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
                  paddingBottom: '10px'
                }}
              >
                Create Magical Stories Together - In Minutes!
              </h2>
              
              <p 
                className="text-readable text-base md:text-lg mb-6 leading-relaxed max-w-3xl mx-auto" 
                style={{
                  lineHeight: '1.6',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  paddingBottom: '8px'
                }}
              >
                AI-powered storytelling that brings families together. Your kids become the heroes of their own adventures.
              </p>

              {/* Benefit line with enhanced visibility */}
              <div 
                className="text-amber-400 text-sm md:text-base mb-8 font-medium"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  paddingBottom: '8px'
                }}
              >
                ✨ Professional narration ✨ Beautiful images ✨ Export to PDF ✨
              </div>

              {/* Enhanced CTA Buttons - More prominent */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button
                  onClick={handleCreateStory}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold px-10 py-5 text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg"
                  style={{ minHeight: '60px' }}
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Start Creating Stories
                </Button>
                
                <Button
                  onClick={() => navigate('/my-stories')}
                  variant="outline"
                  size="lg"
                  className="px-10 py-5 text-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105 rounded-lg shadow-xl"
                  style={{ 
                    minHeight: '60px',
                    border: '2px solid rgba(251, 191, 36, 0.6)',
                    color: '#fbbf24',
                    background: 'rgba(251, 191, 36, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <BookOpen className="mr-3 h-6 w-6" />
                  See Story Library
                </Button>
              </div>

              {/* Social proof subtitle with enhanced visibility */}
              <div 
                className="text-amber-300 text-sm md:text-base mb-8 font-medium"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  paddingBottom: '8px'
                }}
              >
                Join 15+ families creating magical stories
              </div>

              {/* Navigation hint with enhanced visibility */}
              <div 
                className="text-gray-300 text-sm"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  paddingBottom: '8px'
                }}
              >
                ⬇ Scroll to discover the magic ⬇
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Metrics Section */}
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="glass-enhanced rounded-2xl p-6 transition-all duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div 
                    className="text-2xl md:text-3xl font-bold text-amber-400 mb-1"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      paddingBottom: '8px'
                    }}
                  >
                    15+
                  </div>
                  <div 
                    className="text-sm text-gray-200"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      paddingBottom: '4px'
                    }}
                  >
                    Stories Created
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="text-2xl md:text-3xl font-bold text-amber-400 mb-1"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      paddingBottom: '8px'
                    }}
                  >
                    4+
                  </div>
                  <div 
                    className="text-sm text-gray-200"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      paddingBottom: '4px'
                    }}
                  >
                    Countries
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="text-2xl md:text-3xl font-bold text-amber-400 mb-1"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      paddingBottom: '8px'
                    }}
                  >
                    Built by
                  </div>
                  <div 
                    className="text-sm text-gray-200"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      paddingBottom: '4px'
                    }}
                  >
                    Parent Developers
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="text-2xl md:text-3xl font-bold text-amber-400 mb-1"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      paddingBottom: '8px'
                    }}
                  >
                    4+
                  </div>
                  <div 
                    className="text-sm text-gray-200"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      paddingBottom: '4px'
                    }}
                  >
                    Weeks Testing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WHY TALEFORGE? - ONE SECTION WITH 4 FEATURE CARDS */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12" style={{ paddingBottom: '16px' }}>
              <h2 
                className="magical-heading text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  lineHeight: '1.3',
                  paddingBottom: '12px'
                }}
              >
                Why Tale Forge?
              </h2>
              <p 
                className="text-readable text-lg md:text-xl max-w-3xl mx-auto"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: '1.5',
                  paddingBottom: '8px'
                }}
              >
                Everything families need for magical storytelling
              </p>
            </div>

            <div className="glass-enhanced rounded-2xl p-8 transition-all duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature 1 */}
                <div className="text-center relative">
                  <div className="text-4xl mb-4">🎭</div>
                  <h3 
                    className="text-lg font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Kids Create
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Your children become storytellers, not just story listeners
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-0.5 h-8 bg-amber-400"></div>
                </div>

                {/* Feature 2 */}
                <div className="text-center relative">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 
                    className="text-lg font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Pro Narration
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Stories read back with broadcast-quality voices
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-0.5 h-8 bg-amber-400"></div>
                </div>

                {/* Feature 3 */}
                <div className="text-center relative">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 
                    className="text-lg font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Works Anywhere
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Create on laptop, listen on phone, print for bedtime
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-0.5 h-8 bg-amber-400"></div>
                </div>

                {/* Feature 4 */}
                <div className="text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 
                    className="text-lg font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Parent Approved
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Safe, educational, and sparks creativity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS - 3 STEPS */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12" style={{ paddingBottom: '16px' }}>
              <h2 
                className="magical-heading text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  lineHeight: '1.3',
                  paddingBottom: '12px'
                }}
              >
                How It Works
              </h2>
              <p 
                className="text-readable text-lg md:text-xl max-w-3xl mx-auto"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: '1.5',
                  paddingBottom: '8px'
                }}
              >
                Simple, exciting, and perfect for families
              </p>
            </div>

            <div className="glass-enhanced rounded-2xl p-8 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center relative">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 
                    className="text-xl font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Choose Your Adventure
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Pick a theme or let your imagination run wild
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden md:block absolute top-1/2 -right-4 w-0.5 h-8 bg-amber-400"></div>
                </div>

                {/* Step 2 */}
                <div className="text-center relative">
                  <div className="text-4xl mb-4">🎭</div>
                  <h3 
                    className="text-xl font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Create Together
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Kids guide the story, AI helps with the magic
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden md:block absolute top-1/2 -right-4 w-0.5 h-8 bg-amber-400"></div>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="text-4xl mb-4">🎵</div>
                  <h3 
                    className="text-xl font-bold mb-3 text-amber-400"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.3',
                      paddingBottom: '8px'
                    }}
                  >
                    Listen & Share
                  </h3>
                  <p 
                    className="text-readable text-sm"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Professional narration brings your story to life
                  </p>
                </div>
              </div>
            </div>

            {/* Try It Now Button */}
            <div className="text-center mt-16">
              <Button
                onClick={handleCreateStory}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold px-12 py-6 text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg"
                style={{ minHeight: '72px' }}
              >
                <Sparkles className="mr-3 h-7 w-7" />
                Try It Now
              </Button>
            </div>
          </div>
        </section>

        {/* 4. LOVED BY FAMILIES & EDUCATORS - TESTIMONIALS */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12" style={{ paddingBottom: '16px' }}>
              <h2 
                className="magical-heading text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  lineHeight: '1.3',
                  paddingBottom: '12px'
                }}
              >
                Loved by Families & Educators
              </h2>
              <p 
                className="text-readable text-lg mb-2"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: '1.5',
                  paddingBottom: '8px'
                }}
              >
                Real stories from real families
              </p>
              <p 
                className="text-amber-400 text-sm"
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  paddingBottom: '8px'
                }}
              >
                Review {currentTestimonial + 1} of {testimonials.length}
                {!isPaused && <span className="ml-2 text-xs opacity-70">• Auto-playing</span>}
                {isPaused && <span className="ml-2 text-xs opacity-70">• Paused</span>}
              </p>
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="glass-enhanced rounded-2xl p-8">
                <div className="text-center">
                  <div 
                    className="text-4xl text-amber-400 mb-4"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      paddingBottom: '8px'
                    }}
                  >
                    "
                  </div>
                  <blockquote 
                    className="text-lg text-high-contrast mb-6 italic leading-relaxed max-w-3xl mx-auto min-h-[120px] flex items-center justify-center"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: '1.6',
                      paddingBottom: '8px'
                    }}
                  >
                    {testimonials[currentTestimonial].quote}
                  </blockquote>
                  
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].stars)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  
                  <p 
                    className="text-amber-400 font-bold"
                    style={{ 
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      paddingBottom: '8px'
                    }}
                  >
                    — {testimonials[currentTestimonial].author}
                  </p>
                </div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Enhanced navigation dots */}
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-110 ${
                      index === currentTestimonial 
                        ? 'bg-amber-400 shadow-lg shadow-amber-400/50' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. SAFE, EDUCATIONAL, AND FUN */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12" style={{ paddingBottom: '16px' }}>
              <h2 
                className="magical-heading text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  lineHeight: '1.3',
                  paddingBottom: '12px'
                }}
              >
                Safe, Educational, and Fun
              </h2>
              <p 
                className="text-readable text-lg max-w-3xl mx-auto"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: '1.5',
                  paddingBottom: '8px'
                }}
              >
                Every story is age-appropriate, educational, and designed to spark creativity while giving parents complete peace of mind.
              </p>
            </div>

            <div className="glass-enhanced rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-bold text-green-400 mb-1"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      Kid-Safe Content
                    </h3>
                    <p 
                      className="text-readable text-sm"
                      style={{ 
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        lineHeight: '1.5',
                        paddingBottom: '8px'
                      }}
                    >
                      AI filters ensure age-appropriate stories
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400">
                    <GraduationCap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-bold text-blue-400 mb-1"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      Educational Value
                    </h3>
                    <p 
                      className="text-readable text-sm"
                      style={{ 
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        lineHeight: '1.5',
                        paddingBottom: '8px'
                      }}
                    >
                      Perfect for classrooms and learning
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-400">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-bold text-purple-400 mb-1"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      Privacy Protected
                    </h3>
                    <p 
                      className="text-readable text-sm"
                      style={{ 
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        lineHeight: '1.5',
                        paddingBottom: '8px'
                      }}
                    >
                      COPPA compliant, no ads, stories stay private
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400">
                    <Heart className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-bold text-amber-400 mb-1"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      Family Bonding
                    </h3>
                    <p 
                      className="text-readable text-sm"
                      style={{ 
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        lineHeight: '1.5',
                        paddingBottom: '8px'
                      }}
                    >
                      Create memories together with shared storytelling
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12" style={{ paddingBottom: '16px' }}>
              <h2 
                className="magical-heading text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  lineHeight: '1.3',
                  paddingBottom: '12px'
                }}
              >
                Got Questions?
              </h2>
              <p 
                className="text-readable text-lg max-w-3xl mx-auto"
                style={{ 
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: '1.5',
                  paddingBottom: '8px'
                }}
              >
                Everything you need to know about Tale Forge
              </p>
            </div>

            <div className="glass-enhanced rounded-2xl p-8">
              <div className="space-y-4">
                {/* FAQ Item 1 */}
                <div className="border-b border-amber-500/20 pb-4 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 0 ? null : 0)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <h3 
                      className="text-lg font-bold text-white pr-4"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      Is Tale Forge safe for kids?
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === 0 ? (
                        <Minus className="h-5 w-5 text-amber-400 transition-transform duration-300" />
                      ) : (
                        <Plus className="h-5 w-5 text-amber-400 transition-transform duration-300" />
                      )}
                    </div>
                  </button>
                  {expandedFAQ === 0 && (
                    <div className="px-4 pb-4">
                      <p 
                        className="text-readable text-base leading-relaxed"
                        style={{ 
                          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                          lineHeight: '1.6',
                          paddingBottom: '8px'
                        }}
                      >
                        Yes! Our AI creates family-friendly stories with positive themes like friendship, adventure, and learning.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ Item 2 */}
                <div className="border-b border-amber-500/20 pb-4 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <h3 
                      className="text-lg font-bold text-white pr-4"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      What ages is this designed for?
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === 1 ? (
                        <Minus className="h-5 w-5 text-amber-400 transition-transform duration-300" />
                      ) : (
                        <Plus className="h-5 w-5 text-amber-400 transition-transform duration-300" />
                      )}
                    </div>
                  </button>
                  {expandedFAQ === 1 && (
                    <div className="px-4 pb-4">
                      <p 
                        className="text-readable text-base leading-relaxed"
                        style={{ 
                          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                          lineHeight: '1.6',
                          paddingBottom: '8px'
                        }}
                      >
                        Perfect for children ages 4-12, but enjoyable for the whole family.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ Item 3 */}
                <div className="border-b border-amber-500/20 pb-4 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <h3 
                      className="text-lg font-bold text-white pr-4"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        lineHeight: '1.3',
                        paddingBottom: '8px'
                      }}
                    >
                      When will it be available?
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === 2 ? (
                        <Minus className="h-5 w-5 text-amber-400 transition-transform duration-300" />
                      ) : (
                        <Plus className="h-5 w-5 text-amber-400 transition-transform duration-300" />
                      )}
                    </div>
                  </button>
                  {expandedFAQ === 2 && (
                    <div className="px-4 pb-4">
                      <p 
                        className="text-readable text-base leading-relaxed"
                        style={{ 
                          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                          lineHeight: '1.6',
                          paddingBottom: '8px'
                        }}
                      >
                        We're in final testing now. Waitlist members will get first access in the coming weeks.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* View All FAQs Link */}
              <div className="text-center mt-8 pt-6 border-t border-amber-500/20">
                <button
                  onClick={() => navigate('/about')}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    lineHeight: '1.5',
                    paddingBottom: '8px'
                  }}
                >
                  View All FAQs
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CTA SECTION */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {!isSubmitted ? (
              <div className="glass-enhanced rounded-3xl p-8">
                
                <h2 
                  className="magical-heading text-3xl md:text-4xl font-bold mb-6 leading-tight"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    lineHeight: '1.3',
                    paddingBottom: '12px'
                  }}
                >
                  Ready to Forge Your First Tale?
                </h2>
                <p 
                  className="text-readable text-lg mb-8 max-w-2xl mx-auto"
                  style={{ 
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    lineHeight: '1.5',
                    paddingBottom: '8px'
                  }}
                >
                  Sign up now to join our waitlist and be the first to explore endless stories — adventures await!
                </p>

                <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto space-y-4">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="glass-input h-12"
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input h-12"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-4 text-lg shadow-lg transition-all duration-300"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Join Waitlist
                  </Button>
                </form>

                <p 
                  className="text-sm text-gray-300 mt-4"
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    lineHeight: '1.5',
                    paddingBottom: '8px'
                  }}
                >
                  No credit card required. We'll notify you when you can start creating stories!
                </p>
              </div>
            ) : (
              <div className="glass-enhanced rounded-3xl p-8">
                <div className="text-4xl mb-6">🎉</div>
                <h2 
                  className="magical-heading text-3xl md:text-4xl font-bold mb-4 text-amber-400"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    lineHeight: '1.3',
                    paddingBottom: '12px'
                  }}
                >
                  Welcome Aboard, Storyteller!
                </h2>
                <p 
                  className="text-readable text-lg"
                  style={{ 
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    lineHeight: '1.5',
                    paddingBottom: '8px'
                  }}
                >
                  Thank you! You're on the list. We'll invite you soon to start your adventure! Check your email for confirmation.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;

