
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, User, AlertTriangle } from 'lucide-react';

const AnonymousStoriesBanner = () => {
  return (
    <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertDescription className="text-orange-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-100 mb-1">
                Temporary Stories (Saved Locally)
              </p>
              <p className="text-sm text-orange-200">
                Your stories are saved in your browser's local storage. They will be lost if you clear your browser data or use a different device.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Link to="/#waitlist">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                <User className="h-4 w-4 mr-2" />
                Join Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AnonymousStoriesBanner;
