import { supabase } from '@/integrations/supabase/client';

export interface DemoLimitCheck {
  allowed: boolean;
  isDemo: boolean;
  currentUsage?: number;
  limit?: number;
  message?: string;
}

export interface DemoUsage {
  voice: number;
  story: number;
  image: number;
  limits: {
    voice: number;
    story: number;
    image: number;
  };
}

const DEMO_LIMITS = {
  voice: 3,
  story: 10,
  image: 5
};

// Call the demo protection Edge Function
const callDemoProtection = async (action: string, featureType: string = 'voice') => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No session found');
  }

  // Get Supabase URL from environment or use a default
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

  const response = await fetch(
    `${supabaseUrl}/functions/v1/demo-protection?action=${action}&feature=${featureType}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Demo protection check failed');
  }

  return response.json();
};

export const checkDemoLimits = async (featureType: 'voice' | 'story' | 'image' = 'voice'): Promise<DemoLimitCheck> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only check limits for demo account
    if (user?.email !== 'demo@tale-forge.app') {
      return { allowed: true, isDemo: false };
    }

    // Call the Edge Function to check limits
    const result = await callDemoProtection('check', featureType);
    return result;

  } catch (error) {
    console.error('Demo limit check error:', error);
    return { allowed: true, isDemo: false }; // Fail open
  }
};

export const incrementDemoUsage = async (featureType: 'voice' | 'story' | 'image' = 'voice'): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email !== 'demo@tale-forge.app') return;

    // Call the Edge Function to increment usage
    await callDemoProtection('increment', featureType);

  } catch (error) {
    console.error('Demo usage increment error:', error);
  }
};

export const getDemoUsage = async (): Promise<DemoUsage | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email !== 'demo@tale-forge.app') return null;

    // Call the Edge Function to get usage
    const result = await callDemoProtection('usage');
    return result;

  } catch (error) {
    console.error('Failed to get demo usage:', error);
    return null;
  }
}; 