export interface StripeService {
  createCheckoutSession(priceId: string): Promise<string>;
}

export class StripeServiceImpl implements StripeService {
  async createCheckoutSession(priceId: string): Promise<string> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.checkoutUrl;
  }
}

export const stripeService = new StripeServiceImpl();

// Stripe price IDs (these would be set in environment variables)
export const STRIPE_PRICES = {
  starter: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_starter',
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro',
};
