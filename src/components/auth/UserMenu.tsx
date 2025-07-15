
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Settings, BookOpen, LogOut, Shield, Search } from 'lucide-react';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { hasAccess } = useAdminAccess();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-purple-600 text-white">
              {getInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-stories" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            My Stories
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/discover" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Discover
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        {hasAccess && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
