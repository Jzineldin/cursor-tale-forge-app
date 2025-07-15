
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthError {
  message: string;
  status?: number;
  code?: string;
}


interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end?: string | null;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  subscription: SubscriptionData;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_status: null,
    subscription_end: null,
  });

  const refreshSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-check-subscription');
      if (error) throw error;
      
      if (data) {
        setSubscription({
          subscribed: !!data?.subscribed,
          subscription_tier: data?.subscription_tier || null,
          subscription_status: data?.subscription_status || null,
          subscription_end: data?.subscription_end || null,
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      // Reset to default on error
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_status: null,
        subscription_end: null,
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Refresh subscription when user logs in
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(refreshSubscription, 1000); // Small delay to ensure session is ready
        } else if (!session?.user) {
          // Reset subscription when user logs out
          setSubscription({
            subscribed: false,
            subscription_tier: null,
            subscription_status: null,
            subscription_end: null,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Refresh subscription if user is already logged in
      if (session?.user) {
        setTimeout(refreshSubscription, 1000);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Successfully signed in!');
      }
    } catch (error: unknown) {
      console.error('Sign in failed:', error);
      const authError = error as AuthError;
      toast.error(authError.message || 'Sign in failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error: unknown) {
      console.error('Sign up failed:', error);
      const authError = error as AuthError;
      toast.error(authError.message || 'Sign up failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Successfully signed out!');
    } catch (error: unknown) {
      console.error('Sign out failed:', error);
      toast.error('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    subscription,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
