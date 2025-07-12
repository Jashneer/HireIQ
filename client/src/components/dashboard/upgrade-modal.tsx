import { useState } from 'react';
import { X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { stripeService, STRIPE_PRICES } from '@/lib/stripe';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '3 analyses per day',
        'Basic match scoring',
        'Standard outreach templates',
      ],
      priceId: null,
      popular: false,
    },
    {
      name: 'Starter',
      price: 29,
      period: 'month',
      features: [
        '50 analyses per month',
        'Advanced match scoring',
        'AI-powered outreach',
        'Analysis history',
      ],
      priceId: STRIPE_PRICES.starter,
      popular: true,
    },
    {
      name: 'Pro',
      price: 99,
      period: 'month',
      features: [
        'Unlimited analyses',
        'Premium AI models',
        'Custom outreach templates',
        'Advanced analytics',
        'Priority support',
      ],
      priceId: STRIPE_PRICES.pro,
      popular: false,
    },
  ];

  const handleUpgrade = async (priceId: string) => {
    if (!priceId) return;
    
    setIsLoading(true);
    try {
      const checkoutUrl = await stripeService.createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast({
        title: "Payment processing unavailable",
        description: error.message || "Payment features will be available soon. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Choose Your Plan</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative border rounded-xl p-6 ${
                  plan.popular ? 'border-primary border-2' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    ${plan.price}
                  </div>
                  <div className="text-sm text-slate-600 mb-6">
                    per {plan.period}
                  </div>
                  
                  <ul className="text-sm text-slate-600 space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {currentPlan === plan.name.toLowerCase() ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Current Plan
                    </Button>
                  ) : plan.priceId ? (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.priceId!)}
                      disabled={isLoading}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {isLoading ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-slate-600">
                Secure payment processing by Stripe. Cancel anytime. 7-day free trial for all paid plans.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
