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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const { plan_tier, plan_price } = await req.json();

    if (!plan_tier || plan_price === undefined) {
      throw new Error('Missing plan_tier or plan_price');
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data: subscription, error: updateError } = await supabaseClient
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
      .single();

    if (updateError) {
      throw updateError;
    }

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