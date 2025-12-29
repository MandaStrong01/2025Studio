import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    console.log('Starting subscription activation...');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      throw new Error('No authorization header');
    }

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid JWT');
    }

    console.log('User authenticated:', user.id);

    const { plan_tier, plan_price } = await req.json();
    console.log('Plan details:', { plan_tier, plan_price });

    if (!plan_tier || plan_price === undefined) {
      console.error('Missing parameters:', { plan_tier, plan_price });
      throw new Error('Missing plan_tier or plan_price');
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    console.log('Attempting to upsert subscription...');
    const { data: subscription, error: updateError } = await serviceClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        status: 'active',
        plan_tier: plan_tier,
        plan_price: plan_price,
        current_period_end: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Database error:', updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }

    if (!subscription) {
      console.error('No subscription data returned');
      throw new Error('Failed to create or update subscription');
    }

    console.log('Subscription upserted successfully:', subscription.id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        message: 'Subscription activated successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Subscription activation error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to activate subscription'
      }),
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