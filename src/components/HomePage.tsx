
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

import '@/styles/hero-buttons.css';

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

  const handleDemoLogin = async () => {
    // Show demo credentials in a toast and navigate to signin
    toast.success('Demo credentials: demo@tale-forge.app / ShippedS1', {
      duration: 5000,
    });
    
    // Navigate to signin page with pre-filled demo credentials
    navigate('/auth/signin?demo=true');
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

        {/* 1. HERO SECTION - Clean Professional Layout */}
        <div className="hero-section relative min-h-screen flex items-center justify-center px-4">
          <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-8 md:p-12 lg:p-16 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
            <div className="text-center">
              {/* Main Title */}
              <h1 className="fantasy-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold mb-8 text-center">
                TALE FORGE
              </h1>
              {/* Subtitle */}
              <h2 className="fantasy-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                CREATE MAGICAL STORIES<br />
                TOGETHER - IN MINUTES!
              </h2>
              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
                Transform your ideas into enchanting stories with AI-powered creativity. Perfect for families, educators, and storytellers of all ages!
              </p>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-0">
                {/* Primary Action */}
                <button 
                  onClick={handleCreateStory}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✨ Start Creating Stories
                </button>
                {/* Secondary Action */}
                <button 
                  onClick={handleDemoLogin}
                  className="w-full sm:w-auto bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Use Demo Account
                </button>
                {/* Waitlist */}
                <button 
                  onClick={() => {
                    const waitlistSection = document.getElementById('waitlist-section');
                    if (waitlistSection) {
                      waitlistSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-purple-400"
                >
                  Join Waitlist
                </button>
              </div>
              {/* Removed translation text here */}
            </div>
          </div>
        </div>

        {/* Social Proof Metrics Section - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div 
                    className="fantasy-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    15+
                  </div>
                  <div 
                    className="fantasy-body text-sm sm:text-base leading-tight"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    Stories Created
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="fantasy-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    4+
                  </div>
                  <div 
                    className="fantasy-body text-sm sm:text-base leading-tight"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    Countries
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="fantasy-heading text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    Built by
                  </div>
                  <div 
                    className="fantasy-body text-sm sm:text-base leading-tight"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    Parent Developers
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="fantasy-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    4+
                  </div>
                  <div 
                    className="fantasy-body text-sm sm:text-base leading-tight"
                    style={{ 
                      paddingBottom: '8px'
                    }}
                  >
                    Weeks Testing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WHY TALEFORGE? - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-16 sm:py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-2" style={{ paddingBottom: '16px' }}>
              <h2 
                className="fantasy-heading text-4xl md:text-5xl font-bold text-center mb-4"
                style={{ 
                  lineHeight: '1.2',
                  paddingBottom: '12px'
                }}
              >
                Why Tale Forge?
              </h2>
              <p 
                className="section-body-text text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed"
                style={{ 
                  lineHeight: '1.5',
                  paddingBottom: '12px'
                }}
              >
                Everything families need for magical storytelling
              </p>
            </div>

            <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
                {/* Feature 1 - Fantasy Typography */}
                <div className="text-center relative">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🎭</div>
                  <h3 
                    className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight"
                    style={{ 
                      lineHeight: '1.2',
                      paddingBottom: '8px'
                    }}
                  >
                    Kids Create
                  </h3>
                  <p 
                    className="fantasy-body text-sm sm:text-base leading-relaxed"
                    style={{ 
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Your children become storytellers, not just story listeners
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Feature 2 - Fantasy Typography */}
                <div className="text-center relative">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🎵</div>
                  <h3 
                    className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight"
                    style={{ 
                      lineHeight: '1.2',
                      paddingBottom: '8px'
                    }}
                  >
                    Pro Narration
                  </h3>
                  <p 
                    className="fantasy-body text-sm sm:text-base leading-relaxed"
                    style={{ 
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Stories read back with broadcast-quality voices
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Feature 3 - Fantasy Typography */}
                <div className="text-center relative">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">📱</div>
                  <h3 
                    className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight"
                    style={{ 
                      lineHeight: '1.2',
                      paddingBottom: '8px'
                    }}
                  >
                    Works Anywhere
                  </h3>
                  <p 
                    className="fantasy-body text-sm sm:text-base leading-relaxed"
                    style={{ 
                      lineHeight: '1.5',
                      paddingBottom: '8px'
                    }}
                  >
                    Create on laptop, listen on phone, print for bedtime
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Feature 4 - Fantasy Typography */}
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">✅</div>
                  <h3 
                    className="fantasy-heading text-lg sm:text-xl font-bold mb-3 sm:mb-4 leading-tight"
                    style={{ 
                      lineHeight: '1.2',
                      paddingBottom: '8px'
                    }}
                  >
                    Parent Approved
                  </h3>
                  <p 
                    className="fantasy-body text-sm sm:text-base leading-relaxed"
                    style={{ 
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

        {/* 3. HOW IT WORKS - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-16 sm:py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-2" style={{ paddingBottom: '16px' }}>
              <h2 
                className="fantasy-heading text-4xl md:text-5xl font-bold text-center mb-4"
                style={{ 
                  lineHeight: '1.2',
                  paddingBottom: '12px'
                }}
              >
                How It Works
              </h2>
              <p 
                className="text-lg text-center mb-8 text-white"
                style={{ 
                  lineHeight: '1.5',
                  paddingBottom: '12px'
                }}
              >
                Simple, exciting, and perfect for families
              </p>
            </div>

            <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
                {/* Step 1 */}
                <div className="text-center relative">
                  <div className="text-5xl mb-6">⚡</div>
                  <h3 
                    className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400"
                    style={{ 
                      lineHeight: '1.3',
                      paddingBottom: '12px'
                    }}
                  >
                    Choose Your Adventure
                  </h3>
                  <p 
                    className="fantasy-body text-base sm:text-lg"
                    style={{ 
                      lineHeight: '1.6',
                      paddingBottom: '12px'
                    }}
                  >
                    Pick a theme or let your imagination run wild
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden md:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Step 2 */}
                <div className="text-center relative">
                  <div className="text-5xl mb-6">🎭</div>
                  <h3 
                    className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400"
                    style={{ 
                      lineHeight: '1.3',
                      paddingBottom: '12px'
                    }}
                  >
                    Create Together
                  </h3>
                  <p 
                    className="fantasy-body text-base sm:text-lg"
                    style={{ 
                      lineHeight: '1.6',
                      paddingBottom: '12px'
                    }}
                  >
                    Kids guide the story, AI helps with the magic
                  </p>
                  {/* Vertical line separator */}
                  <div className="hidden md:block absolute top-1/2 -right-6 w-0.5 h-12 bg-amber-400"></div>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="text-5xl mb-6">🎵</div>
                  <h3 
                    className="fantasy-heading text-xl sm:text-2xl font-bold mb-4 text-amber-400"
                    style={{ 
                      lineHeight: '1.3',
                      paddingBottom: '12px'
                    }}
                  >
                    Listen & Share
                  </h3>
                  <p 
                    className="fantasy-body text-base sm:text-lg"
                    style={{ 
                      lineHeight: '1.6',
                      paddingBottom: '12px'
                    }}
                  >
                    Professional narration brings your story to life
                  </p>
                </div>
              </div>
            </div>

            {/* Try It Now Button */}
            <div className="text-center mt-20 sm:mt-24">
              <button
                onClick={handleCreateStory}
                className="font-semibold px-12 py-6 text-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-lg"
                style={{ 
                  minHeight: '72px',
                  backgroundColor: '#FF9500',
                  color: '#000000',
                  border: 'none'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#E6851A'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#FF9500'}
              >
                <Sparkles className="mr-3 h-7 w-7 inline" />
                Try It Now
              </button>
            </div>
          </div>
        </section>



        {/* 5. LOVED BY FAMILIES & EDUCATORS - TESTIMONIALS */}
        <section className="py-20 sm:py-24 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 sm:mb-20" style={{ paddingBottom: '20px' }}>
              <h2 
                className="fantasy-heading text-4xl md:text-5xl font-bold text-center mb-4"
                style={{ 
                  lineHeight: '1.3',
                  paddingBottom: '16px'
                }}
              >
                Loved by Families & Educators
              </h2>
              <p 
                className="text-lg text-center mb-8 text-white"
                style={{ 
                  lineHeight: '1.6',
                  paddingBottom: '12px'
                }}
              >
                Real stories from real families
              </p>
              <p 
                className="section-subheading text-base sm:text-lg"
                style={{ 
                  paddingBottom: '12px'
                }}
              >
                Review {currentTestimonial + 1} of {testimonials.length}
                {!isPaused && <span className="ml-2 text-sm opacity-70">• Auto-playing</span>}
                {isPaused && <span className="ml-2 text-sm opacity-70">• Paused</span>}
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

        {/* 6. FAQ SECTION - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section className="py-20 sm:py-24 md:py-32 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 sm:mb-20" style={{ paddingBottom: '20px' }}>
              <h2 
                className="fantasy-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                style={{ 
                  lineHeight: '1.3',
                  paddingBottom: '16px'
                }}
              >
                Got Questions?
              </h2>
              <p 
                className="fantasy-body text-lg sm:text-xl max-w-3xl mx-auto"
                style={{ 
                  lineHeight: '1.6',
                  paddingBottom: '12px'
                }}
              >
                Everything you need to know about Tale Forge
              </p>
            </div>

            <div className="glass-enhanced rounded-2xl p-8 sm:p-10 md:p-12">
              <div className="space-y-6 sm:space-y-8">
                {/* FAQ Item 1 */}
                <div className="border-b border-amber-500/20 pb-6 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 0 ? null : 0)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <h3 
                      className="fantasy-heading text-lg sm:text-xl font-bold pr-4"
                      style={{ 
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
                        className="fantasy-body text-base sm:text-lg leading-relaxed"
                        style={{ 
                          lineHeight: '1.6',
                          paddingBottom: '12px'
                        }}
                      >
                        Yes! Our AI creates family-friendly stories with positive themes like friendship, adventure, and learning.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ Item 2 */}
                <div className="border-b border-amber-500/20 pb-6 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <h3 
                      className="fantasy-heading text-lg sm:text-xl font-bold pr-4"
                      style={{ 
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
                        className="fantasy-body text-base sm:text-lg leading-relaxed"
                        style={{ 
                          lineHeight: '1.6',
                          paddingBottom: '12px'
                        }}
                      >
                        Perfect for children ages 4-12, but enjoyable for the whole family.
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ Item 3 */}
                <div className="border-b border-amber-500/20 pb-6 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg hover:bg-amber-500/10 transition-all duration-300"
                  >
                    <h3 
                      className="fantasy-heading text-lg sm:text-xl font-bold pr-4"
                      style={{ 
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
                        className="fantasy-body text-base sm:text-lg leading-relaxed"
                        style={{ 
                          lineHeight: '1.6',
                          paddingBottom: '12px'
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

        {/* 7. FINAL CTA SECTION - ENHANCED SPACING & FANTASY TYPOGRAPHY */}
        <section id="waitlist-section" className="py-20 sm:py-24 md:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {!isSubmitted ? (
              <div className="glass-enhanced rounded-3xl p-8 sm:p-10 md:p-12">
                
                <h2 
                  className="fantasy-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight"
                  style={{ 
                    lineHeight: '1.2',
                    paddingBottom: '16px'
                  }}
                >
                  Ready to Forge Your First Tale?
                </h2>
                <p 
                  className="fantasy-body text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
                  style={{ 
                    lineHeight: '1.6',
                    paddingBottom: '12px'
                  }}
                >
                  Sign up now to join our waitlist and be the first to explore endless stories — adventures await!
                </p>

                <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto space-y-6">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="glass-input h-14 text-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input h-14 text-lg"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-6 text-xl shadow-lg transition-all duration-300"
                  >
                    <Users className="mr-2 h-6 w-6" />
                    Join Waitlist
                  </Button>
                </form>

                <p 
                  className="fantasy-subtitle text-base sm:text-lg mt-6"
                  style={{ 
                    lineHeight: '1.5',
                    paddingBottom: '12px'
                  }}
                >
                  No credit card required. We'll notify you when you can start creating stories!
                </p>
              </div>
            ) : (
              <div className="glass-enhanced rounded-3xl p-8 sm:p-10 md:p-12">
                <div className="text-5xl mb-8">🎉</div>
                <h2 
                  className="fantasy-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-amber-400"
                  style={{ 
                    lineHeight: '1.2',
                    paddingBottom: '16px'
                  }}
                >
                  Welcome Aboard, Storyteller!
                </h2>
                <p 
                  className="fantasy-body text-lg sm:text-xl"
                  style={{ 
                    lineHeight: '1.6',
                    paddingBottom: '12px'
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

