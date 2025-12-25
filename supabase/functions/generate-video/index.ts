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
    const { 
      prompt, 
      toolName, 
      videoType = 'standard',
      duration = 60,
      style = 'cinematic',
      quality = 'high',
      lyrics = '',
      lipSync = false 
    } = await req.json();

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

    // Support for extended duration videos (up to 10 minutes)
    const maxDuration = Math.min(duration, 600);
    
    // In production, this would call actual video generation API
    // For now, returning sample video with metadata
    const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    const fileName = `generated-video-${Date.now()}.mp4`;

    const metadata = {
      prompt,
      videoType,
      duration: maxDuration,
      style,
      quality,
      lipSync,
      generatedAt: new Date().toISOString()
    };

    // Add lyrics to metadata if lip sync video
    if (lipSync && lyrics) {
      metadata.lyrics = lyrics;
    }

    const { data: asset, error } = await supabase
      .from("user_assets")
      .insert({
        user_id: user.id,
        asset_type: "video",
        file_name: fileName,
        file_url: videoUrl,
        tool_name: toolName || "Text to Video",
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
        asset,
        duration: maxDuration,
        lipSyncEnabled: lipSync,
        message: lipSync 
          ? "Lip sync video generated successfully" 
          : "Video generated successfully"
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