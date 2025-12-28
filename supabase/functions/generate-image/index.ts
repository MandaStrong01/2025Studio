import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const { prompt, toolName } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // In production, integrate actual AI image generation API (DALL-E, Midjourney, Stable Diffusion)
    // For now, using random stock photos
    const seed = prompt ? prompt.split(' ').join('-') : Date.now().toString();
    const imageUrl = `https://picsum.photos/seed/${seed}/1920/1080`;
    const fileName = `generated-${Date.now()}.jpg`;

    const { data: asset, error } = await supabase
      .from("user_assets")
      .insert({
        user_id: user.id,
        asset_type: "image",
        file_name: fileName,
        file_url: imageUrl,
        tool_name: toolName || "Text to Image",
        metadata: { prompt, isDemo: true }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        asset,
        isDemo: true,
        message: "Demo: Image generated (stock photo). Integrate DALL-E, Midjourney, or Stable Diffusion for real AI generation."
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
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