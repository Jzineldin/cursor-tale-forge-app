
import React from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-4">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
