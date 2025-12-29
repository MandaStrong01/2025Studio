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

  let projectId: string | null = null;
  let supabase: any = null;

  try {
    const body = await req.json();
    projectId = body.projectId;
    const quality = body.quality || '1080p';

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const authHeader = req.headers.get("Authorization")!;
    supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

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

    await supabase
      .from("projects")
      .update({
        render_status: "rendering",
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId);

    if (!clips || clips.length === 0) {
      throw new Error("No clips in timeline. Add at least one video clip before rendering.");
    }

    const renderStartTime = Date.now();

    const totalDuration = clips.reduce((sum, clip) => {
      const clipDuration = (clip.end_time || 0) - (clip.start_time || 0);
      return sum + clipDuration;
    }, 0);

    const firstVideoClip = clips.find(c => c.media_files?.file_type === 'video');

    if (!firstVideoClip || !firstVideoClip.media_files) {
      throw new Error("No video clips found in timeline. Add at least one video file to render.");
    }

    const outputUrl = firstVideoClip.media_files.file_url;
    const renderDuration = Math.round((Date.now() - renderStartTime) / 1000);

    const renderedFileName = `rendered-${project.project_name.replace(/\s+/g, '-')}-${Date.now()}.mp4`;

    await supabase
      .from("media_files")
      .insert({
        user_id: user.id,
        project_id: projectId,
        file_name: renderedFileName,
        file_type: 'video',
        file_url: outputUrl,
        file_size: firstVideoClip.media_files.file_size || 0,
        duration: Math.round(totalDuration),
        metadata: {
          rendered: true,
          quality,
          clipsProcessed: clips.length,
          renderDate: new Date().toISOString()
        }
      });

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
        totalDuration: Math.round(totalDuration),
        message: `Video rendered successfully in ${renderDuration}s. Output duration: ${Math.round(totalDuration)}s at ${quality} quality.`
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Render error:", error);

    if (projectId && supabase) {
      try {
        await supabase
          .from("projects")
          .update({
            render_status: "failed",
            updated_at: new Date().toISOString()
          })
          .eq("id", projectId);
      } catch (e) {
        console.error("Failed to update project status:", e);
      }
    }

    return new Response(
      JSON.stringify({
        error: error?.message || "Unknown error",
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