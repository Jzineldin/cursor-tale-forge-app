
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Github, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  // Check if demo mode is requested
  const isDemoMode = searchParams.get('demo') === 'true';

  // Add class to body when component mounts
  useEffect(() => {
    document.body.classList.add('signin-page');
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('signin-page');
    };
  }, []);

  // Pre-fill demo credentials if demo mode
  useEffect(() => {
    if (isDemoMode) {
      setFormData({
        email: 'demo@tale-forge.app',
        password: 'ShippedS1'
      });
      toast.info('Demo credentials pre-filled! Click "Sign In" to continue.', {
        duration: 4000,
      });
    }
  }, [isDemoMode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      toast.success('Successfully signed in!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
      setGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'GitHub sign in failed');
      setGithubLoading(false);
    }
  };

  const handleGuestMode = () => {
    toast.info('Continuing as guest - some features may be limited');
    navigate('/');
  };

  const handleTestEmail = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      
      toast.success('Test email sent! Check your inbox to verify email delivery.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email');
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@tale-forge.app',
        password: 'ShippedS1'
      });

      if (error) throw error;
      
      toast.success('Welcome to Tale Forge Demo! You can now test all features including voice generation.');
      navigate('/');
    } catch (error: any) {
      toast.error('Demo login failed. The demo account may not exist yet. Please create it manually in Supabase dashboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="signin-card">
          <h1 className="signin-title">Welcome Back</h1>
          <p className="signin-subtitle">Sign in to continue your storytelling journey</p>
          
          {/* Social Auth Buttons */}
          <button 
            className="auth-button google-button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>
          
          <button 
            className="auth-button github-button"
            onClick={handleGithubSignIn}
            disabled={githubLoading || loading}
          >
            {githubLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </button>
          
          <div className="divider">or continue with email</div>
          
          {/* Email Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input pr-10" 
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="forgot-password">
                <Link to="/auth/forgot-password">Forgot password?</Link>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/30"
                />
                <label htmlFor="remember" className="text-sm text-white/80">
                  Remember me
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button signin-button"
              disabled={loading || googleLoading || githubLoading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <button 
            className="auth-button demo-button"
            onClick={handleDemoLogin}
            disabled={loading || googleLoading || githubLoading}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            🎭 Try Demo Account
          </button>

          {/* Debug: Test email delivery */}
          <button
            type="button"
            className="auth-button"
            onClick={handleTestEmail}
            style={{ background: 'transparent', color: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          >
            Test Email Delivery
          </button>
          
          <div className="divider">or</div>
          
          <button 
            className="auth-button"
            onClick={handleGuestMode}
            style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          >
            Continue as Guest
          </button>
          
          <div className="signin-footer">
            Don't have an account? <Link to="/auth/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
