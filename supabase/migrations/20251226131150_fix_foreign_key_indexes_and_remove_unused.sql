/*
  # Fix Foreign Key Indexes and Remove Unused Indexes

  ## Changes Made

  1. **Add Missing Foreign Key Index**
     - Add index on `post_comments.post_id` to support the foreign key constraint
     - This improves query performance when joining posts with comments

  2. **Remove Unused Indexes**
     - Drop `idx_community_posts_project_id` - not being used
     - Drop `idx_community_posts_user_id` - not being used
     - Drop `idx_media_files_project_id` - not being used
     - Drop `idx_post_comments_user_id` - not being used
     - Drop `idx_post_likes_user_id` - not being used
     - Drop `idx_public_movies_uploaded_by` - not being used
     - Drop `idx_timeline_clips_media_file_id` - not being used
     - Drop `idx_timeline_clips_project_id` - not being used
     - Drop `idx_tool_usage_user_id` - not being used

  3. **Performance Impact**
     - Reduces database overhead from maintaining unused indexes
     - Improves write performance (inserts/updates/deletes)
     - Adds critical index for foreign key lookups
*/

-- Add missing index for post_comments foreign key
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- Drop unused indexes
DROP INDEX IF EXISTS public.idx_community_posts_project_id;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_media_files_project_id;
DROP INDEX IF EXISTS public.idx_post_comments_user_id;
DROP INDEX IF EXISTS public.idx_post_likes_user_id;
DROP INDEX IF EXISTS public.idx_public_movies_uploaded_by;
DROP INDEX IF EXISTS public.idx_timeline_clips_media_file_id;
DROP INDEX IF EXISTS public.idx_timeline_clips_project_id;
DROP INDEX IF EXISTS public.idx_tool_usage_user_id;