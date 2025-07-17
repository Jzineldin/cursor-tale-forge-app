
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

const Header: React.FC<HeaderProps> = ({ isSlideshowOpen = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Manage body class for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/create-story')) {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const isCreateStoryActive = () => location.pathname === '/create-story';

  const toggleMobileMenu = () => {
    console.log('Toggle mobile menu clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    console.log('Closing mobile menu');
    setIsMobileMenuOpen(false);
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
      
      {/* Hide pricing until it's ready */}
      {false && (
        <Link 
          to="/pricing" 
          onClick={isMobile ? closeMobileMenu : undefined}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
            isActive('/pricing') 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg' 
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          } ${isMobile ? 'w-full text-left' : ''}`}
        >
          <Crown className="h-4 w-4" />
          <span className="hidden lg:inline">Pricing</span>
          <span className="lg:hidden">Premium</span>
        </Link>
      )}
    </>
  );

  return (
    <header className={`header-glassmorphic ${isSlideshowOpen ? 'hidden' : 'block'}`} ref={mobileMenuRef}>
      <div className="container mx-auto px-6 w-full">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="header-brand"
            onClick={closeMobileMenu}
          >
            📖 Tale Forge
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-4 min-w-0">
            {/* Changelog and What's New Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ChangelogModal 
                trigger={
                  <Button variant="ghost" size="sm" className="header-action-btn">
                    <FileText className="mr-2 h-4 w-4" />
                    Changelog
                  </Button>
                }
              />
              <WhatsNewModal 
                trigger={
                  <Button variant="ghost" size="sm" className="header-action-btn">
                    <Star className="mr-2 h-4 w-4" />
                    What's New?
                  </Button>
                }
              />
            </div>
            
            {user ? (
              <>
                {/* Navigation Links for authenticated users */}
                <nav className="flex items-center gap-4 min-w-0">
                  <NavigationLinks />
                </nav>

                {/* User Menu */}
                <div className="flex-shrink-0">
                  <UserMenu />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                {/* Navigation Links for anonymous users */}
                <nav className="flex items-center gap-4 min-w-0">
                  <NavigationLinks />
                </nav>

                <div className="flex-shrink-0">
                  <AuthButtons />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              <ChangelogModal 
                trigger={
                  <Button variant="ghost" size="sm" className="header-action-btn p-2">
                    <FileText className="h-4 w-4" />
                  </Button>
                }
              />
              <WhatsNewModal 
                trigger={
                  <Button variant="ghost" size="sm" className="header-action-btn p-2">
                    <Star className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <button
              onClick={toggleMobileMenu}
              className="header-mobile-btn"
              aria-label="Toggle mobile menu"
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Width Positioning */}
      {isMobileMenuOpen && (
        <div className="md:hidden header-mobile-menu">
          <nav className="flex flex-col gap-2">
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
