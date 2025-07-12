import Stripe from 'stripe';
import { storage } from '../storage';

// Initialize Stripe only if we have a key
const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_ENV_VAR;
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
}) : null;

export class StripeService {
  async createCustomer(email: string, name: string): Promise<string> {
    if (!stripe) {
      throw new Error('Stripe not configured. Please set up payment processing first.');
    }
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createCheckoutSession(userId: number, priceId: string, successUrl: string, cancelUrl: string): Promise<string> {
    if (!stripe) {
      throw new Error('Payment processing not yet configured. Please contact support.');
    }
    try {
      const user = await storage.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        customerId = await this.createCustomer(user.email, `${user.firstName} ${user.lastName}`);
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(),
        },
      });

      return session.url!;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(body: string, signature: string): Promise<void> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    try {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new Error('Webhook error');
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (!stripe) return;
    
    const userId = parseInt(session.metadata?.userId || '0');
    if (!userId) return;

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    
    let plan = 'free';
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      plan = 'starter';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      plan = 'pro';
    }

    await storage.updateUser(userId, {
      plan,
      subscriptionStatus: 'active',
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    if (!stripe) return;
    
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) return;

    const user = await storage.getUserByEmail((customer as Stripe.Customer).email!);
    if (!user) return;

    const priceId = subscription.items.data[0]?.price.id;
    let plan = 'free';
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
      plan = 'starter';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      plan = 'pro';
    }

    await storage.updateUser(user.id, {
      plan,
      subscriptionStatus: subscription.status,
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    if (!stripe) return;
    
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!customer || customer.deleted) return;

    const user = await storage.getUserByEmail((customer as Stripe.Customer).email!);
    if (!user) return;

    await storage.updateUser(user.id, {
      plan: 'free',
      subscriptionStatus: 'cancelled',
    });
  }
}

export const stripeService = new StripeService();
