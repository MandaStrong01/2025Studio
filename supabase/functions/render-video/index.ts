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
    const { projectId, quality = '1080p' } = await req.json();

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

    // Get project and timeline clips
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

    // Get timeline clips with media files
    const { data: clips, error: clipsError } = await supabase
      .from("timeline_clips")
      .select(`
        *,
        media_files!timeline_clips_media_file_id_fkey (*)
      `)
      .eq("project_id", projectId)
      .order("track_number", { ascending: true })
      .order("start_time", { ascending: true });

    if (clipsError) {
      throw new Error("Failed to fetch timeline clips");
    }

    // Update project status to rendering
    await supabase
      .from("projects")
      .update({
        render_status: "rendering",
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);

    // RENDERING LOGIC
    // ================
    // For production, implement one of these approaches:
    //
    // Option 1: Use Shotstack API (Recommended for < 2min renders)
    // const response = await fetch('https://api.shotstack.io/v1/render', {
    //   method: 'POST',
    //   headers: {
    //     'x-api-key': Deno.env.get('SHOTSTACK_API_KEY'),
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     timeline: {
    //       tracks: clips.map(clip => ({
    //         clips: [{
    //           asset: { type: 'video', src: clip.media_files.file_url },
    //           start: clip.start_time,
    //           length: clip.end_time - clip.start_time
    //         }]
    //       }))
    //     },
    //     output: { format: 'mp4', resolution: quality }
    //   })
    // });
    //
    // Option 2: Use Remotion with Lambda
    // Option 3: Use FFmpeg in a separate worker service
    // Option 4: Use Cloudflare Workers with FFmpeg

    // For now, simulate rendering with a delay
    // In production, this would be replaced with actual video composition
    const renderStartTime = Date.now();
    const estimatedDuration = clips?.length ? clips.length * 2 : 10; // 2 seconds per clip

    // Simulate processing time (remove in production)
    await new Promise(resolve => setTimeout(resolve, Math.min(estimatedDuration * 1000, 5000)));

    // For demo: Use first video clip or sample video as "rendered" output
    let outputUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    if (clips && clips.length > 0) {
      const firstVideoClip = clips.find(c => c.media_files?.file_type === 'video');
      if (firstVideoClip && firstVideoClip.media_files) {
        outputUrl = firstVideoClip.media_files.file_url;
      }
    }

    const renderDuration = Math.round((Date.now() - renderStartTime) / 1000);

    // Update project with completed render
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        render_status: "completed",
        output_url: outputUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        outputUrl,
        renderDuration,
        quality,
        clipsProcessed: clips?.length || 0,
        isDemo: true,
        message: `Demo: Video "rendered" in ${renderDuration}s. Integrate Shotstack, Remotion, or FFmpeg for real rendering. Current output shows first video clip.`
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Update project status to failed
    try {
      const { projectId } = await req.json();
      const authHeader = req.headers.get("Authorization")!;
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      await supabase
        .from("projects")
        .update({ render_status: "failed" })
        .eq("id", projectId);
    } catch (e) {
      console.error("Failed to update project status:", e);
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Render failed. Check project timeline and media files."
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
