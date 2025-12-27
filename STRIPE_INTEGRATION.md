# Stripe Payment Integration Guide

## Current Implementation

The app is now configured to use Stripe for payment processing. Here's what's been implemented:

### Database Changes
1. **Registration Flow**: When users register, they automatically receive:
   - A `user_role` record with role='user'
   - A `subscription` record with status='pending' and plan_tier='none'

2. **Access Control**: All protected routes now require an active subscription
   - Users with 'pending' subscriptions cannot access the platform
   - Only users with status='active' can access tools and features

3. **Stripe Fields**: The subscriptions table includes:
   - `stripe_customer_id` - Stripe customer ID
   - `stripe_subscription_id` - Stripe subscription ID
   - `current_period_end` - Subscription expiration date

### Current Payment Flow
1. User registers an account
2. User selects a plan (Basic $10, Pro $20, Studio $30)
3. User is redirected to Stripe Checkout
4. After payment, Stripe webhook activates the subscription
5. User gains access to the platform

## Setting Up Stripe Payments

To enable Stripe payments, follow these steps:

### 1. Create Stripe Account and Get API Keys
1. Sign up at https://stripe.com
2. Navigate to https://dashboard.stripe.com/apikeys
3. Copy your keys:
   - **Secret Key** (starts with `sk_test_` for test mode)
   - **Webhook Secret** (get this in step 4)

### 2. Create Products and Prices in Stripe
1. Go to https://dashboard.stripe.com/products
2. Create 3 products with recurring monthly subscriptions:
   - **Basic Plan**: $10/month
   - **Pro Plan**: $20/month
   - **Studio Plan**: $30/month
3. Copy the Price IDs (they start with `price_`)

### 3. Update Price IDs in Your Code
Edit `src/pages/Page3.tsx` line 88-92 and replace the price IDs:

```typescript
const priceIds: Record<string, string> = {
  basic: 'price_1ABC123',      // Your Basic Price ID
  pro: 'price_2DEF456',        // Your Pro Price ID
  studio: 'price_3GHI789'      // Your Studio Price ID
};
```

### 4. Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Use URL: `https://pxvbdsjwvyegzaprbxol.supabase.co/functions/v1/stripe-webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)

### 5. Add Environment Variables to Supabase
In your Supabase project dashboard:
1. Go to Project Settings > Edge Functions > Secrets
2. Add these secrets:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret

### 6. Test the Integration
1. Use Stripe test mode
2. Test card: `4242 4242 4242 4242` (any future expiry, any CVC)
3. Complete a test purchase
4. Verify the subscription activates in your database
5. Check webhook logs in Stripe dashboard

## Important Security Notes

- **Never commit Stripe Secret Keys to version control**
- Webhook signatures are automatically validated to prevent fraud
- All subscription updates go through Stripe webhooks for security
- Test thoroughly in test mode before going live

## Edge Functions Deployed

### `stripe-checkout`
Creates Stripe Checkout sessions for subscription purchases.
- Validates user authentication
- Creates checkout session with plan metadata
- Redirects to Stripe hosted checkout page

### `stripe-webhook`
Handles Stripe webhook events securely.
- Validates webhook signatures
- Processes `checkout.session.completed` events
- Handles subscription updates and cancellations
- Updates database with subscription status

### `activate-subscription` (TEMPORARY - FOR TESTING ONLY)
Test function that bypasses Stripe for development.
- Should ONLY be used during development
- Remove or disable before production launch

## Going Live

When ready to accept real payments:

1. **Switch to Live Mode in Stripe**
   - Get live API keys (start with `sk_live_`)
   - Update webhook endpoint for live mode
   - Get new webhook secret for live endpoint

2. **Update Supabase Secrets**
   - Replace test keys with live keys
   - Update both `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`

3. **Update Price IDs**
   - Create live products in Stripe (or activate test products)
   - Update price IDs in `src/pages/Page3.tsx`

4. **Final Testing**
   - Test with real card (use small amount)
   - Verify subscription activates
   - Test cancellation flow
   - Confirm webhooks are received

5. **Monitor**
   - Watch Stripe Dashboard for payments
   - Check webhook logs for any failures
   - Monitor database for subscription status
