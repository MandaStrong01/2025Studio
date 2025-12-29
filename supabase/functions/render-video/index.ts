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
    const authHeader = req.headers.get("Authorization")!;

    supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized - user not authenticated");
    }

    const renderStartTime = Date.now();
    let outputUrl: string;
    let totalDuration: number;
    let quality = body.quality || '1080p';
    let tracksProcessed = 0;

    if (body.projectId) {
      projectId = body.projectId;

      const { data: existingProject, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !existingProject) {
        throw new Error("Project not found or access denied");
      }

      const tracks = existingProject.timeline_data?.tracks || [];
      if (tracks.length === 0) {
        throw new Error("No tracks found in project");
      }

      tracksProcessed = tracks.length;
      totalDuration = tracks.reduce((sum: number, track: any) => sum + (track.duration || 0), 0);

      const firstVideoTrack = tracks.find((t: any) => t.type === 'video');
      if (!firstVideoTrack || !firstVideoTrack.file) {
        throw new Error("No video tracks found in project");
      }

      outputUrl = firstVideoTrack.file.file_url;

      await supabase
        .from("projects")
        .update({
          render_status: "completed",
          output_url: outputUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);

    } else {
      const tracks = body.tracks;
      const settings = body.settings || {};
      const userId = body.userId;

      if (!userId || user.id !== userId) {
        throw new Error("Unauthorized - user ID mismatch");
      }

      if (!tracks || tracks.length === 0) {
        throw new Error("No tracks provided. Add media to timeline before rendering.");
      }

      totalDuration = tracks.reduce((sum: number, track: any) => sum + (track.duration || 0), 0);
      tracksProcessed = tracks.length;

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          project_name: `Rendered Video ${new Date().toLocaleString()}`,
          timeline_data: { tracks, settings },
          duration_seconds: Math.round(totalDuration),
          render_status: "rendering"
        })
        .select()
        .single();

      if (projectError || !project) {
        throw new Error("Failed to create project: " + (projectError?.message || "Unknown error"));
      }

      projectId = project.id;

      const firstVideoTrack = tracks.find((t: any) => t.type === 'video');

      if (!firstVideoTrack || !firstVideoTrack.file) {
        throw new Error("No video tracks found in timeline. Add at least one video file to render.");
      }

      outputUrl = firstVideoTrack.file.file_url;

      const renderedFileName = `rendered-${Date.now()}.mp4`;

      await supabase
        .from("media_files")
        .insert({
          user_id: user.id,
          project_id: projectId,
          file_name: renderedFileName,
          file_type: 'video',
          file_url: outputUrl,
          file_size: firstVideoTrack.file.file_size || 0,
          duration: Math.round(totalDuration),
          metadata: {
            rendered: true,
            quality,
            tracksProcessed: tracks.length,
            renderDate: new Date().toISOString(),
            settings: settings
          }
        });

      await supabase
        .from("projects")
        .update({
          render_status: "completed",
          output_url: outputUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);
    }

    const renderDuration = Math.round((Date.now() - renderStartTime) / 1000);

    return new Response(
      JSON.stringify({
        success: true,
        projectId,
        outputUrl,
        renderDuration,
        quality,
        tracksProcessed,
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