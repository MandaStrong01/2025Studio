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

    // In production, this would call actual video generation API (RunwayML, Pika, etc.)
    // For now, returning sample videos based on keywords/style
    const sampleVideos = {
      nature: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      urban: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      cinematic: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      fun: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      joyrides: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      meltdowns: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
    };

    // Select video based on style or keywords in prompt
    let videoUrl = sampleVideos.cinematic;
    const lowerPrompt = (prompt || '').toLowerCase();
    const lowerStyle = (style || '').toLowerCase();

    if (lowerStyle.includes('nature') || lowerPrompt.includes('nature') || lowerPrompt.includes('forest') || lowerPrompt.includes('landscape')) {
      videoUrl = sampleVideos.nature;
    } else if (lowerStyle.includes('urban') || lowerPrompt.includes('city') || lowerPrompt.includes('urban')) {
      videoUrl = sampleVideos.urban;
    } else if (lowerPrompt.includes('fun') || lowerPrompt.includes('comedy')) {
      videoUrl = sampleVideos.fun;
    } else if (lowerPrompt.includes('car') || lowerPrompt.includes('drive')) {
      videoUrl = sampleVideos.joyrides;
    }

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
        isDemo: true,
        message: lipSync
          ? "Demo: Lip sync video generated (sample video). Integrate RunwayML or Pika AI for real generation."
          : "Demo: Video generated successfully (sample video). Integrate RunwayML or Pika AI for real generation."
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