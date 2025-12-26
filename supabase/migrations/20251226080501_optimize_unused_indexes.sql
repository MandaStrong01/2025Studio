/*
  # Optimize Database Indexes

  1. New Index Added
    - `post_comments.post_id` - foreign key was missing an index
  
  2. Unused Indexes Removed
    - `idx_post_comments_user_id` - not being used by queries
    - `idx_post_likes_user_id` - not being used by queries
    - `idx_public_movies_uploaded_by` - not being used by queries
    - `idx_timeline_clips_media_file_id` - not being used by queries
    - `idx_community_posts_project_id` - not being used by queries
    - `idx_community_posts_user_id` - not being used by queries
    - `idx_media_files_project_id` - not being used by queries
    - `idx_timeline_clips_project_id` - not being used by queries
    - `idx_tool_usage_user_id` - not being used by queries
  
  3. Notes
    - Indexes are only kept if they improve query performance
    - Unused indexes add storage overhead and slow down writes
    - Auth DB connection strategy and leaked password protection must be configured in Supabase Dashboard
*/

-- Add index for missing foreign key
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- Remove unused indexes to reduce overhead
DROP INDEX IF EXISTS public.idx_post_comments_user_id;
DROP INDEX IF EXISTS public.idx_post_likes_user_id;
DROP INDEX IF EXISTS public.idx_public_movies_uploaded_by;
DROP INDEX IF EXISTS public.idx_timeline_clips_media_file_id;
DROP INDEX IF EXISTS public.idx_community_posts_project_id;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_media_files_project_id;
DROP INDEX IF EXISTS public.idx_timeline_clips_project_id;
DROP INDEX IF EXISTS public.idx_tool_usage_user_id;
