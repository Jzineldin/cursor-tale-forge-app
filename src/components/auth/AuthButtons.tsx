

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/auth/signin">
        <Button variant="ghost" className="text-slate-300 hover:text-white">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
      {/* Sign Up button hidden for showcase - only waitlist available */}
    </div>
  );
};

export default AuthButtons;
