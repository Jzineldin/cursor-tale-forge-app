import { useAuth } from '@/context/AuthProvider';

export const useSubscription = () => {
  const { subscription, refreshSubscription, isAuthenticated } = useAuth();
  
  const isSubscribed = subscription.subscribed;
  const isPremium = isSubscribed && (subscription.subscription_tier === 'Premium' || subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Enterprise');
  const isPro = isSubscribed && (subscription.subscription_tier === 'Pro' || subscription.subscription_tier === 'Enterprise');
  const isEnterprise = isSubscribed && subscription.subscription_tier === 'Enterprise';
  
  return {
    ...subscription,
    isSubscribed,
    isPremium,
    isPro,
    isEnterprise,
    refreshSubscription,
    isAuthenticated,
  };
};