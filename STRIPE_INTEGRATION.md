# Stripe Payment Integration Guide

## Current Implementation

The app now requires users to complete payment before accessing the platform. Here's what's been implemented:

### Database Changes
1. **Registration Flow**: When users register, they automatically receive:
   - A `user_role` record with role='user'
   - A `subscription` record with status='pending' and plan_tier='none'

2. **Access Control**: All protected routes now require an active subscription
   - Users with 'pending' subscriptions cannot access the platform
   - Only users with status='active' can access tools and features

### Current Payment Flow (Test Mode)
The app currently uses a simplified payment activation:
1. User registers an account
2. User selects a plan (Basic $10, Pro $20, Studio $30)
3. Plan is activated immediately via the `activate-subscription` edge function
4. User gains access to the platform

## Setting Up Real Stripe Payments

To integrate real Stripe payments, follow these steps:

### 1. Get Stripe API Keys
1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

### 2. Update Environment Variables
Add to your `.env` file:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_your_key_here
```

### 3. Create Stripe Products and Prices
In your Stripe Dashboard:
1. Create 3 products: Basic, Pro, Studio
2. Set recurring monthly prices: $10, $20, $30
3. Note the Price IDs (start with `price_`)

### 4. Update the Checkout Function
Modify `src/pages/Page3.tsx` to use real Stripe Checkout:

```typescript
const handlePlanSelect = async (planTier: string, price: number) => {
  // Get the correct Stripe Price ID based on plan
  const priceIds = {
    basic: 'price_xxxxx',   // Replace with your Price IDs
    pro: 'price_xxxxx',
    studio: 'price_xxxxx'
  };

  // Call Stripe Checkout via your edge function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceIds[planTier],
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/auth`
      })
    }
  );

  const { checkoutUrl } = await response.json();
  window.location.href = checkoutUrl;
};
```

### 5. Implement Stripe Webhook Handler
Create a new edge function `stripe-webhook` to handle payment events:

```typescript
// This function will:
// 1. Verify the webhook signature
// 2. Handle checkout.session.completed event
// 3. Update subscription status to 'active'
// 4. Set plan_tier and plan_price
```

### 6. Test the Integration
1. Use Stripe test mode with test card: 4242 4242 4242 4242
2. Verify subscriptions are created and activated correctly
3. Test subscription cancellation and renewal

## Important Notes

- **Never commit Stripe Secret Keys to version control**
- Always validate webhook signatures to prevent fraud
- Implement proper error handling for failed payments
- Set up subscription renewal and cancellation flows
- Add email notifications for payment events
- Consider adding a grace period for failed renewals

## Current Edge Functions

### `activate-subscription`
Temporary function for testing that immediately activates a subscription.
**Replace this with proper Stripe Checkout flow in production.**

### `stripe-checkout`
Currently a placeholder. Update this to create actual Stripe Checkout Sessions.

## Next Steps

1. Sign up for Stripe and get API keys
2. Create products and prices in Stripe Dashboard
3. Update the checkout flow to use Stripe Checkout
4. Implement webhook handler for payment events
5. Remove the temporary `activate-subscription` function
6. Test thoroughly with Stripe test mode
7. Enable live mode when ready to accept real payments
