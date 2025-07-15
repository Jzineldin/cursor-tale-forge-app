
import { 
  Baby, 
  Ghost, 
  Book, 
  Castle, 
  Rocket, 
  Search, 
  Heart, 
  Map
} from 'lucide-react';

export interface Genre {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  image: string;
}

export const genres: Genre[] = [
  {
    id: 'child-adapted',
    title: 'Child Adapted',
    description: 'Family-friendly adventures perfect for young minds',
    icon: Baby,
    gradient: 'from-pink-500 to-rose-400',
    image: '/images/child-adapted-story.png'
  },
  {
    id: 'horror-story',
    title: 'Horror Story',
    description: 'Supernatural thrills and spine-chilling tales',
    icon: Ghost,
    gradient: 'from-purple-600 to-indigo-600',
    image: '/images/horror-story.png'
  },
  {
    id: 'educational',
    title: 'Educational',
    description: 'Learning through engaging storytelling',
    icon: Book,
    gradient: 'from-green-500 to-emerald-400',
    image: '/images/educational-adventure.png'
  },
  {
    id: 'epic-fantasy',
    title: 'Epic Fantasy',
    description: 'Dragons, magic, and mystical kingdoms',
    icon: Castle,
    gradient: 'from-amber-500 to-orange-400',
    image: '/images/epic-fantasy.png'
  },
  {
    id: 'sci-fi-thriller',
    title: 'Sci-Fi Thriller',
    description: 'Space adventures and futuristic technology',
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-400',
    image: '/images/sci-fi-thriller.png'
  },
  {
    id: 'mystery',
    title: 'Mystery',
    description: 'Crime solving and thrilling investigations',
    icon: Search,
    gradient: 'from-slate-500 to-gray-400',
    image: '/images/mystery-detective.png'
  },
  {
    id: 'romantic-drama',
    title: 'Romantic Drama',
    description: 'Love stories and emotional relationships',
    icon: Heart,
    gradient: 'from-red-500 to-pink-400',
    image: '/images/romantic-drama.png'
  },
  {
    id: 'adventure-quest',
    title: 'Adventure Quest',
    description: 'Exploration and thrilling discoveries',
    icon: Map,
    gradient: 'from-teal-500 to-green-400',
    image: '/images/adventure-quest.png'
  }
];
