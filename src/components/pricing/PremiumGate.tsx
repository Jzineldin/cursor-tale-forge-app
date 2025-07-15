
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  feature?: string;
  className?: string;
  showUpgrade?: boolean;
}

// Updated with your actual Premium price ID from Stripe Dashboard
const PREMIUM_PRICE_ID = 'price_1RkAM4K8ILu7UAIcJrR6YJl0'; // TaleForge Premium $9.99

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  title = "Premium Feature",
  description = "This feature requires a premium subscription to access.",
  feature = "premium features",
  className = "",
  showUpgrade = true,
}) => {
  const { isPremium, isAuthenticated } = useSubscription();
  const { mutate: checkout, isPending: isCheckingOut } = useStripeCheckout();

  // If user has premium access, render the children
  if (isPremium) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth?redirect=/pricing';
      return;
    }
    
    console.log('Starting premium upgrade checkout');
    checkout({
      priceId: PREMIUM_PRICE_ID,
      tier: 'Premium'
    });
  };

  // Render premium gate
  return (
    <Card className={`relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 ${className}`}>
      {/* Premium Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      </div>

      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preview/Placeholder Content */}
        <div className="relative">
          <div className="opacity-50 pointer-events-none select-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end justify-center pb-8">
            <div className="text-center space-y-2">
              <Crown className="w-8 h-8 mx-auto text-yellow-500" />
              <p className="text-sm font-medium">Premium Feature</p>
            </div>
          </div>
        </div>

        {/* Upgrade Actions */}
        {showUpgrade && (
          <div className="space-y-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <h4 className="font-semibold">Unlock {feature}</h4>
              <p className="text-sm text-muted-foreground">
                Get instant access to all premium features including video compilation, 
                audio narration, and unlimited story creation.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!isAuthenticated ? (
                <Button 
                  onClick={() => window.location.href = '/#waitlist'} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isCheckingOut}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {isCheckingOut ? 'Opening Checkout...' : 'Upgrade to Premium'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/pricing'}
                    className="flex-1 sm:flex-initial"
                  >
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
