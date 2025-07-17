
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Home, Clock, PenTool, Crown, Search, Menu, X } from '@/lib/icons';
import UserMenu from '@/components/auth/UserMenu';
import AuthButtons from '@/components/auth/AuthButtons';
import ChangelogModal from './ChangelogModal';
import WhatsNewModal from './WhatsNewModal';
import { Button } from '@/components/ui/button';
import { FileText, Star } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/create-story')) {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const isCreateStoryActive = () => location.pathname === '/create-story';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const NavigationLinks = ({ isMobile = false }) => (
    <>
      <Link 
        to="/" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive('/') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        } ${isMobile ? 'w-full text-left' : ''}`}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      
      {isCreateStoryActive() && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground">
          <PenTool className="h-4 w-4" />
          <span>Creating Story</span>
        </div>
      )}
      
      <Link 
        to="/my-stories" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive('/my-stories') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        } ${isMobile ? 'w-full text-left' : ''}`}
        title="View your temporary stories (saved locally)"
      >
        <Clock className="h-4 w-4" />
        <span className="hidden lg:inline">My Stories</span>
        <span className="lg:hidden">Stories</span>
        <span className="text-xs bg-orange-500 text-white px-1 rounded">Local</span>
      </Link>
      
      <Link 
        to="/discover" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive('/discover') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        } ${isMobile ? 'w-full text-left' : ''}`}
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">Discover</span>
        <span className="lg:hidden">Explore</span>
      </Link>
      
      <Link 
        to="/pricing" 
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive('/pricing') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        } ${isMobile ? 'w-full text-left' : ''}`}
      >
        <Crown className="h-4 w-4" />
        <span className="hidden lg:inline">Pricing</span>
        <span className="lg:hidden">Premium</span>
      </Link>
    </>
  );

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 min-h-[64px] flex items-center">
      <div className="container mx-auto px-4 w-full">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="text-xl md:text-2xl font-bold text-white hover:text-primary transition-colors cursor-pointer font-heading flex-shrink-0"
            onClick={closeMobileMenu}
          >
            Tale Forge
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-4 min-w-0">
            {/* Changelog and What's New Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ChangelogModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-amber-200 hover:text-amber-100 hover:bg-amber-600/20">
                    <FileText className="mr-2 h-4 w-4" />
                    Changelog
                  </Button>
                }
              />
              <WhatsNewModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-amber-200 hover:text-amber-100 hover:bg-amber-600/20">
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
                  <Button variant="ghost" size="sm" className="text-amber-200 hover:text-amber-100 hover:bg-amber-600/20 p-2">
                    <FileText className="h-4 w-4" />
                  </Button>
                }
              />
              <WhatsNewModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-amber-200 hover:text-amber-100 hover:bg-amber-600/20 p-2">
                    <Star className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md bg-slate-800/50 hover:bg-slate-700/50 transition-colors flex-shrink-0"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-700/50">
            <nav className="flex flex-col gap-2 mt-4">
              <NavigationLinks isMobile={true} />
              
              {user ? (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <UserMenu />
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <AuthButtons />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
