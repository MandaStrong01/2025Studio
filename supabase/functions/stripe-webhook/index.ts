import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey || !webhookSecret) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.client_reference_id || session.metadata?.user_id;
      const planTier = session.metadata?.plan_tier;
      const planPrice = session.metadata?.plan_price;

      if (!userId || !planTier || !planPrice) {
        console.error('Missing metadata:', { userId, planTier, planPrice });
        throw new Error('Missing required metadata');
      }

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const expiresAt = new Date(subscription.current_period_end * 1000);

      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          plan_tier: planTier,
          plan_price: parseFloat(planPrice),
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
          current_period_end: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Subscription activated for user:', userId);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const status = subscription.status === 'active' ? 'active' : 'canceled';
      const expiresAt = new Date(subscription.current_period_end * 1000);

      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: status,
          current_period_end: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (updateError) {
        console.error('Subscription update error:', updateError);
        throw updateError;
      }

      console.log('Subscription updated:', subscription.id);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});