
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Home, Clock, PenTool, Crown, Search, Menu, X } from '@/lib/icons';
import UserMenu from '@/components/auth/UserMenu';
import AuthButtons from '@/components/auth/AuthButtons';
import ChangelogModal from './ChangelogModal';
import WhatsNewModal from './WhatsNewModal';
import { Button } from '@/components/ui/button';
import { FileText, Star } from 'lucide-react';

interface HeaderProps {
  isSlideshowOpen?: boolean;
}

export default function Header({ isSlideshowOpen = false }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobile = window.innerWidth <= 768;

  // Click outside handler to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Manage body class for mobile menu
  useEffect(() => {
    if (open) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [open]);

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/create-story')) {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const isCreateStoryActive = () => location.pathname === '/create-story';

  const closeMobileMenu = () => {
    setOpen(false);
  };

  const NavigationLinks = ({ isMobile = false }) => (
    <>
      <Link 
        to="/" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
          isActive('/') 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        } ${isMobile ? 'w-full text-left' : ''}`}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      
      {isCreateStoryActive() && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
          <PenTool className="h-4 w-4" />
          <span>Creating Story</span>
        </div>
      )}
      
      <Link 
        to="/my-stories" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
          isActive('/my-stories') 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        } ${isMobile ? 'w-full text-left' : ''}`}
        title="View your temporary stories (saved locally)"
      >
        <Clock className="h-4 w-4" />
        <span className="hidden lg:inline">My Stories</span>
        <span className="lg:hidden">Stories</span>
        <span className="text-xs bg-amber-500 text-white px-1 rounded">Local</span>
      </Link>
      
      <Link 
        to="/discover" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
          isActive('/discover') 
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        } ${isMobile ? 'w-full text-left' : ''}`}
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">Discover</span>
        <span className="lg:hidden">Explore</span>
      </Link>
    </>
  );

  return (
    <header className={`bg-slate-900 text-white ${isSlideshowOpen ? 'hidden' : 'block'}`} ref={mobileMenuRef}>
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        {/* LOGO */}
        <Link
          to="/"
          className="text-xl font-semibold text-white hover:text-amber-400 transition-colors"
          onClick={closeMobileMenu}
        >
          TaleForge
        </Link>

        {/* Desktop nav */}
        {!mobile && (
          <div className="flex items-center gap-4">
            {/* Changelog and What's New Buttons */}
            <div className="flex items-center gap-2">
              <ChangelogModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                    <FileText className="mr-2 h-4 w-4" />
                    Changelog
                  </Button>
                }
              />
              <WhatsNewModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                    <Star className="mr-2 h-4 w-4" />
                    What's New?
                  </Button>
                }
              />
            </div>
            
            <nav className="flex space-x-6 text-sm">
              <NavigationLinks />
            </nav>

            {user ? (
              <UserMenu />
            ) : (
              <AuthButtons />
            )}
          </div>
        )}

        {/* Mobile menu */}
        {mobile && (
          <div className="flex items-center gap-2">
            <ChangelogModal 
              trigger={
                <Button variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white">
                  <FileText className="h-4 w-4" />
                </Button>
              }
            />
            <WhatsNewModal 
              trigger={
                <Button variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white">
                  <Star className="h-4 w-4" />
                </Button>
              }
            />
            <button onClick={() => setOpen(!open)} className="p-1 rounded">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {mobile && open && (
        <nav className="absolute w-full bg-slate-800 top-16 pb-4 z-50">
          <div className="flex flex-col gap-2 p-4">
            <NavigationLinks isMobile={true} />
            
            {user ? (
              <div className="mt-4 pt-4 border-t border-white/10">
                <UserMenu />
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/10">
                <AuthButtons />
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
