# Switch to Live Stripe Payments - Quick Setup

Your app is ready for live payments. You just need to configure 3 things:

## Step 1: Get Live Stripe Keys (2 minutes)

1. Go to https://dashboard.stripe.com
2. **Toggle to LIVE MODE** (top-right corner - switch off "Test mode")
3. Go to Developers > API keys: https://dashboard.stripe.com/apikeys
4. Copy your **Live Secret Key** (starts with `sk_live_`)

## Step 2: Get Live Price IDs (3 minutes)

1. In Live Mode, go to Products: https://dashboard.stripe.com/products
2. Create or activate 3 products with these prices:
   - **Basic Plan**: $10/month (recurring)
   - **Pro Plan**: $20/month (recurring)
   - **Studio Plan**: $30/month (recurring)
3. Click each product and copy the **Price ID** (starts with `price_`)
4. You'll have 3 Price IDs like:
   - Basic: `price_1ABC123xyz...`
   - Pro: `price_2DEF456xyz...`
   - Studio: `price_3GHI789xyz...`

## Step 3: Update Supabase Secrets (1 minute)

1. Go to: https://supabase.com/dashboard/project/pxvbdsjwvyegzaprbxol/settings/functions
2. Click the "Secrets" tab
3. Add or update these 2 secrets:
   - **STRIPE_SECRET_KEY**: Paste your live secret key (sk_live_...)
   - **STRIPE_WEBHOOK_SECRET**: Your webhook signing secret (whsec_...)

## Step 4: Update Price IDs in .env File

Open your `.env` file and replace the placeholder values with your real Stripe Price IDs:

```
VITE_STRIPE_PRICE_BASIC=price_1ABC123xyz...
VITE_STRIPE_PRICE_PRO=price_2DEF456xyz...
VITE_STRIPE_PRICE_STUDIO=price_3GHI789xyz...
```

Replace `price_1ABC123xyz...` with your actual Price IDs from Step 2.

## Step 5: Setup Webhook (Optional but Recommended)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://pxvbdsjwvyegzaprbxol.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
5. Copy the **Signing Secret** (whsec_...) and add it to Supabase secrets

---

## Current Status

✅ Code is configured to read Price IDs from environment variables
✅ Project builds successfully
✅ Fallback system in place (bypasses payment if Stripe not configured)

## To Enable Live Payments

1. Add your live Stripe secret key to Supabase secrets (Step 3)
2. Update the 3 Price IDs in your `.env` file (Step 4)
3. Rebuild: `npm run build`
4. Deploy and accept real payments!

## How It Works

- If Stripe is properly configured with real Price IDs → Redirects to Stripe checkout
- If Stripe is not configured → Automatically activates subscription (free access for development/testing)
