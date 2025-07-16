
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
  ChevronRight
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

  const testimonials = [
    {
      quote: "This has completely changed our bedtime routine. My son loves helping create the story, and it's amazing to see him so engaged and excited to read!",
      author: "Mark, Father of a 6‑year‑old",
      stars: 5
    },
    {
      quote: "As a teacher, I'm impressed. Tale Forge turns reading time into an interactive adventure – my students were absolutely riveted and even the reluctant readers wanted to participate.",
      author: "Anna, 2nd Grade Teacher",
      stars: 5
    },
    {
      quote: "I got to pick what happens next in the story and hear my own story out loud! It was the coolest thing ever.",
      author: "Emily, 7‑year‑old storyteller",
      stars: 5
    },
    {
      quote: "Finally, a screen time activity I actually feel good about! My daughter creates the most imaginative stories, and I love how we can do it together.",
      author: "Sarah, Homeschool Mom",
      stars: 5
    },
    {
      quote: "My students with reading difficulties are suddenly excited about storytelling. The combination of pictures, choices, and audio makes it accessible for everyone.",
      author: "David, Special Education Teacher",
      stars: 5
    },
    {
      quote: "We use this every Friday as a reward activity. The kids collaborate on creating stories and then share them with the class. It's become our favorite tradition!",
      author: "Maria, 4th Grade Teacher",
      stars: 5
    },
    {
      quote: "My shy daughter has found her voice through storytelling. She's now creating characters and adventures I never would have imagined!",
      author: "Jennifer, Mother of twins",
      stars: 5
    },
    {
      quote: "I make stories about my dog and my friends! The computer draws exactly what I'm thinking and it's like magic!",
      author: "Alex, 8‑year‑old",
      stars: 5
    }
  ];

  // Auto-rotate testimonials every 5 seconds - MOVED BEFORE CONDITIONAL RETURN
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

  const handleLearnMore = () => {
    const benefitsSection = document.getElementById('benefits-section');
    if (benefitsSection) {
      benefitsSection.scrollIntoView({ behavior: 'smooth' });
    }
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
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20 pt-28">
          <div className="max-w-5xl mx-auto text-center">
            {/* Glassmorphic overlay for readability */}
            <div className="backdrop-blur-sm bg-black/30 rounded-3xl p-6 md:p-12 border border-white/10 shadow-2xl">
              
              {/* Simple astronaut icon */}
              <div className="mb-6">
              </div>

              {/* Tale Forge Title - Beautiful Gold */}
              <div className="mb-6">
                <h1 className="tale-forge-title text-3xl md:text-5xl lg:text-6xl font-bold">
                  Tale Forge
                </h1>
              </div>
              
              {/* Hero Headlines - Fixed spacing */}
              <h2 className="magical-heading text-xl md:text-2xl lg:text-3xl font-bold mb-6 leading-relaxed max-w-4xl mx-auto" style={{lineHeight: '1.4'}}>
                Where imagination meets storytelling
              </h2>
              
              <p className="text-readable text-base md:text-lg mb-8 leading-relaxed max-w-3xl mx-auto" style={{lineHeight: '1.6'}}>
                Create interactive AI‑powered stories together — with text, pictures, and narration in a safe kid-friendly environment.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={handleCreateStory}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold px-8 py-4 text-lg shadow-lg transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Story
                </Button>
                
                <Button
                  onClick={handleLearnMore}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-amber-400/50 px-8 py-4 text-lg backdrop-blur-sm transition-all duration-300"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>

              {/* Navigation hint */}
              <div className="text-gray-400 text-sm">
                ⬇ Scroll to discover the magic ⬇
              </div>
            </div>
          </div>
        </section>

                 {/* Benefits Section */}
         <section id="benefits-section" className="py-16 px-4">
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="magical-heading text-3xl md:text-4xl font-bold mb-4">
                 Why Tale Forge?
               </h2>
               <p className="text-readable text-lg md:text-xl max-w-3xl mx-auto">
                 Benefits for your family and classroom
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Benefit 1: Creativity */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10 hover:bg-black/40 transition-all duration-300">
                 <div className="text-amber-400 mb-4">
                   <Palette className="h-10 w-10 mx-auto" />
                 </div>
                 <h3 className="text-lg font-bold mb-3 text-amber-400">
                   Inspires Creativity & Imagination
                 </h3>
                 <p className="text-readable text-sm">
                   Kids become co-authors of the story. Tale Forge encourages children to invent ideas and see them come to life with AI as a friendly sidekick.
                 </p>
               </div>

               {/* Benefit 2: Educational */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10 hover:bg-black/40 transition-all duration-300">
                 <div className="text-amber-400 mb-4">
                   <GraduationCap className="h-10 w-10 mx-auto" />
                 </div>
                 <h3 className="text-lg font-bold mb-3 text-amber-400">
                   Educational & Skill-Building
                 </h3>
                 <p className="text-readable text-sm">
                   Each tale can teach – whether it's vocabulary, world facts, or social skills – all disguised as fun. Perfect for classrooms or bedtime learning.
                 </p>
               </div>

               {/* Benefit 3: Safety */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10 hover:bg-black/40 transition-all duration-300">
                 <div className="text-amber-400 mb-4">
                   <Shield className="h-10 w-10 mx-auto" />
                 </div>
                 <h3 className="text-lg font-bold mb-3 text-amber-400">
                   Safe & Kid-Friendly
                 </h3>
                 <p className="text-readable text-sm">
                   AI guardrails ensure all content is kid-safe. No violence, explicit language, or mature themes will appear in children's stories.
                 </p>
               </div>

               {/* Benefit 4: Easy */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10 hover:bg-black/40 transition-all duration-300">
                 <div className="text-amber-400 mb-4">
                   <Clock className="h-10 w-10 mx-auto" />
                 </div>
                 <h3 className="text-lg font-bold mb-3 text-amber-400">
                   Fast & Easy for Busy Adults
                 </h3>
                 <p className="text-readable text-sm">
                   Create a full story in less than 5 minutes. No need to spend hours writing – Tale Forge provides instant adventures for busy schedules.
                 </p>
               </div>
             </div>
           </div>
         </section>

                 {/* How It Works Section */}
         <section className="py-16 px-4">
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="magical-heading text-3xl md:text-4xl font-bold mb-4">
                 How It Works
               </h2>
               <p className="text-readable text-lg md:text-xl max-w-3xl mx-auto">
                 From idea to illustrated storybook in minutes
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Step 1 */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10">
                 <div className="flex items-center mb-4">
                   <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                     1
                   </div>
                   <h3 className="text-lg font-bold text-amber-400">
                     Pick a Genre or Theme
                   </h3>
                 </div>
                 <p className="text-readable text-sm">
                   Choose the kind of adventure. Use our fun genre carousel to pick from many story worlds that interest your child.
                 </p>
               </div>

               {/* Step 2 */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10">
                 <div className="flex items-center mb-4">
                   <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                     2
                   </div>
                   <h3 className="text-lg font-bold text-amber-400">
                     Set the Scene in One Sentence
                   </h3>
                 </div>
                 <p className="text-readable text-sm">
                   Describe your story idea. Just one sentence like "A boy and his dog exploring Mars" and AI will weave it into a personalized tale.
                 </p>
               </div>

               {/* Step 3 */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10">
                 <div className="flex items-center mb-4">
                   <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                     3
                   </div>
                   <h3 className="text-lg font-bold text-amber-400">
                     Watch the Story Magic Unfold
                   </h3>
                 </div>
                 <p className="text-readable text-sm">
                   AI writes and narrates as you choose what happens. Make choices together to guide the adventure with vibrant pictures at each step.
                 </p>
               </div>

               {/* Step 4 */}
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 border border-white/10">
                 <div className="flex items-center mb-4">
                   <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                     4
                   </div>
                   <h3 className="text-lg font-bold text-amber-400">
                     Enjoy & Share Your Story
                   </h3>
                 </div>
                 <p className="text-readable text-sm">
                   Reach a happy ending and read again anytime. Bedtime story ready! Save your tale and share the adventure with family.
                 </p>
               </div>
             </div>
           </div>
         </section>

        

                 {/* Testimonials Section */}
         <section className="py-16 px-4">
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="magical-heading text-3xl md:text-4xl font-bold mb-4">
                 Loved by Families & Educators
               </h2>
               <p className="text-readable text-lg mb-2">
                 Join 1,200+ families and educators already exploring Tale Forge
               </p>
               <p className="text-amber-400 text-sm">
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
               <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-8 border border-white/10">
                 <div className="text-center">
                   <div className="text-4xl text-amber-400 mb-4">"</div>
                   <blockquote className="text-lg text-high-contrast mb-6 italic leading-relaxed max-w-3xl mx-auto min-h-[120px] flex items-center justify-center">
                     {testimonials[currentTestimonial].quote}
                   </blockquote>
                   
                   <div className="flex justify-center mb-4">
                     {[...Array(testimonials[currentTestimonial].stars)].map((_, i) => (
                       <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                     ))}
                   </div>
                   
                   <p className="text-amber-400 font-bold">
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

                 {/* Safety & Trust Section */}
         <section className="py-16 px-4">
           <div className="max-w-4xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="magical-heading text-3xl md:text-4xl font-bold mb-4">
                 Safe, Educational, and Fun
               </h2>
               <p className="text-readable text-lg max-w-3xl mx-auto">
                 Every story is age-appropriate, educational, and designed to spark creativity while giving parents complete peace of mind.
               </p>
             </div>

             <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-8 border border-white/10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400">
                     <Shield className="h-6 w-6 text-green-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-green-400 mb-1">Kid-Safe Content</h3>
                     <p className="text-readable text-sm">AI filters ensure age-appropriate stories</p>
                   </div>
                 </div>

                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400">
                     <GraduationCap className="h-6 w-6 text-blue-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-blue-400 mb-1">Educational Value</h3>
                     <p className="text-readable text-sm">Perfect for classrooms and learning</p>
                   </div>
                 </div>

                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-400">
                     <Lock className="h-6 w-6 text-purple-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-purple-400 mb-1">Privacy Protected</h3>
                     <p className="text-readable text-sm">COPPA compliant, no ads, stories stay private</p>
                   </div>
                 </div>

                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400">
                     <Heart className="h-6 w-6 text-amber-400" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-amber-400 mb-1">Family Bonding</h3>
                     <p className="text-readable text-sm">Create memories together with shared storytelling</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </section>

                 {/* Waitlist Sign-Up Section */}
         <section className="py-16 px-4">
           <div className="max-w-4xl mx-auto text-center">
             {!isSubmitted ? (
               <div className="backdrop-blur-sm bg-black/30 rounded-3xl p-8 border border-white/10">
                 
                 <h2 className="magical-heading text-3xl md:text-4xl font-bold mb-6 leading-tight">
                   Ready to Forge Your First Tale?
                 </h2>
                 <p className="text-readable text-lg mb-8 max-w-2xl mx-auto">
                   Sign up now to join our waitlist and be the first to explore endless stories — adventures await!
                 </p>

                 <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto space-y-4">
                   <Input
                     type="text"
                     placeholder="Your name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                     className="bg-black/30 border-white/30 text-white placeholder-gray-400 h-12"
                   />
                   <Input
                     type="email"
                     placeholder="Your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="bg-black/30 border-white/30 text-white placeholder-gray-400 h-12"
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

                 <p className="text-sm text-gray-400 mt-4">
                   No credit card required. We'll notify you when you can start creating stories!
                 </p>
               </div>
             ) : (
               <div className="backdrop-blur-sm bg-black/30 rounded-3xl p-8 border border-white/10">
                 <div className="text-4xl mb-6">🎉</div>
                 <h2 className="magical-heading text-3xl md:text-4xl font-bold mb-4 text-amber-400">
                   Welcome Aboard, Storyteller!
                 </h2>
                 <p className="text-readable text-lg">
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

