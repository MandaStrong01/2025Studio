/*
  # Fix Unindexed Foreign Keys and Security Issues

  1. Performance Improvements
    - Add covering indexes for all unindexed foreign keys:
      - `community_posts.user_id`
      - `media_files.project_id`
      - `post_comments.post_id`
      - `post_comments.user_id`
      - `static_videos.updated_by`
      - `timeline_clips.media_file_id`
      - `timeline_clips.project_id`
      - `tool_usage.user_id`
      - `user_assets.user_id`
    - Remove unused index `idx_community_posts_project_id`

  2. Security Enhancements
    - Password leak protection must be enabled in Supabase Dashboard:
      Authentication > Providers > Email > Enable "Check for leaked passwords"
    
  3. Important Notes
    - Foreign key indexes improve query performance for JOIN operations and foreign key checks
    - Removing unused indexes reduces storage overhead and improves write performance
    - These changes optimize both read performance (via new indexes) and write performance (via unused index removal)
*/

-- Add indexes for foreign keys without covering indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON public.media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_static_videos_updated_by ON public.static_videos(updated_by);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON public.timeline_clips(media_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON public.timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON public.user_assets(user_id);

-- Remove unused index to improve write performance
DROP INDEX IF EXISTS public.idx_community_posts_project_id;