/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys to improve query performance
    - Remove unused indexes to reduce storage overhead and maintenance cost
  
  2. Foreign Key Indexes Added
    - `community_posts.project_id` - improves joins and lookups by project
    - `community_posts.user_id` - improves joins and lookups by user
    - `media_files.project_id` - improves joins and lookups by project
    - `post_comments.user_id` - improves joins and lookups by user
    - `post_likes.user_id` - improves joins and lookups by user
    - `public_movies.uploaded_by` - improves joins and lookups by uploader
    - `timeline_clips.media_file_id` - improves joins and lookups by media file
    - `timeline_clips.project_id` - improves joins and lookups by project
    - `tool_usage.user_id` - improves joins and lookups by user
  
  3. Unused Indexes Removed
    - `idx_community_posts_created_at` - not being used by queries
    - `idx_media_files_user_id` - not being used by queries
    - `idx_post_comments_post_id` - not being used by queries
    - `idx_post_likes_post_id` - not being used by queries
  
  4. Notes
    - Auth DB connection strategy and leaked password protection must be configured in Supabase Dashboard
    - All indexes use IF NOT EXISTS/IF EXISTS to prevent errors on re-run
*/

-- Add indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_community_posts_project_id ON public.community_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON public.media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_public_movies_uploaded_by ON public.public_movies(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON public.timeline_clips(media_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON public.timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);

-- Remove unused indexes (using DROP INDEX IF EXISTS to prevent errors)
DROP INDEX IF EXISTS public.idx_community_posts_created_at;
DROP INDEX IF EXISTS public.idx_media_files_user_id;
DROP INDEX IF EXISTS public.idx_post_comments_post_id;
DROP INDEX IF EXISTS public.idx_post_likes_post_id;
