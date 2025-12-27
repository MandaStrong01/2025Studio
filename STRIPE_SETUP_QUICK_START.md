# Stripe Setup - Quick Start Guide

Your app is now configured to use Stripe for payments. Follow these 6 steps to go live:

## Step 1: Create Stripe Account
- Sign up at https://stripe.com
- Verify your email

## Step 2: Create Your Products
Go to https://dashboard.stripe.com/products and create:

| Product Name | Price | Billing |
|--------------|-------|---------|
| Basic Plan | $10 | Monthly recurring |
| Pro Plan | $20 | Monthly recurring |
| Studio Plan | $30 | Monthly recurring |

**Save the Price IDs** - you'll need them in Step 4.

## Step 3: Get Your API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Keep this window open - you'll need it soon

## Step 4: Update Your Code
Open `src/pages/Page3.tsx` and find line 88-92.

Replace the placeholder price IDs with your real ones:

```typescript
const priceIds: Record<string, string> = {
  basic: 'price_xxxxxxxxxxxxx',    // Replace with your Basic Price ID
  pro: 'price_xxxxxxxxxxxxx',      // Replace with your Pro Price ID
  studio: 'price_xxxxxxxxxxxxx'    // Replace with your Studio Price ID
};
```

## Step 5: Setup Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   ```
   https://pxvbdsjwvyegzaprbxol.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing Secret** (starts with `whsec_`)

## Step 6: Add Secrets to Supabase
1. Go to your Supabase project: https://supabase.com/dashboard/project/pxvbdsjwvyegzaprbxol
2. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
3. Add two secrets:
   - Name: `STRIPE_SECRET_KEY`
     Value: Your secret key from Step 3
   - Name: `STRIPE_WEBHOOK_SECRET`
     Value: Your signing secret from Step 5

## Test It Out!

1. Use test card number: `4242 4242 4242 4242`
2. Any future expiry date (e.g., 12/25)
3. Any 3-digit CVC (e.g., 123)
4. Complete the checkout
5. You should be redirected to `/tools` with an active subscription

## Check Webhook Delivery
After testing, check your Stripe webhook logs:
- https://dashboard.stripe.com/webhooks
- Click on your webhook endpoint
- View recent events to confirm they're being received

## Going Live
When ready for real payments:
1. Switch to **Live Mode** in Stripe dashboard (top right toggle)
2. Get **live API keys** (start with `sk_live_`)
3. Create **live webhook** endpoint (or activate test one)
4. Update Supabase secrets with **live keys**
5. Update price IDs in code if needed

---

**Need Help?**
- Stripe Docs: https://stripe.com/docs/payments/checkout
- Stripe Support: https://support.stripe.com/
- Check webhook logs for debugging

**Current Status:**
- ✅ Stripe checkout integration deployed
- ✅ Webhook handler deployed
- ✅ Database schema ready
- ⏳ Waiting for you to add Stripe keys
