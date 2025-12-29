/*
  # Fix Security Issues: Indexes and Password Protection

  ## Changes Made

  1. **Add Missing Index**
     - Add index on `community_posts.project_id` to cover the foreign key `community_posts_project_id_fkey`
     - This improves query performance when joining or filtering by project_id

  2. **Remove Unused Indexes**
     - Drop `idx_community_posts_user_id` from `community_posts` table
     - Drop `idx_media_files_project_id` from `media_files` table
     - Drop `idx_post_comments_post_id` from `post_comments` table
     - Drop `idx_post_comments_user_id` from `post_comments` table
     - Drop `idx_static_videos_updated_by` from `static_videos` table
     - Drop `idx_timeline_clips_media_file_id` from `timeline_clips` table
     - Drop `idx_timeline_clips_project_id` from `timeline_clips` table
     - Drop `idx_tool_usage_user_id` from `tool_usage` table
     - Drop `idx_user_assets_user_id` from `user_assets` table
     - Unused indexes consume storage and slow down write operations without providing query benefits

  3. **Password Protection Note**
     - Leaked password protection must be enabled in Supabase Dashboard
     - Navigate to: Settings > Authentication > Password Requirements
     - Enable "Check for leaked passwords" option
     - This prevents users from using compromised passwords from HaveIBeenPwned.org

  ## Important Notes
  - Removing unused indexes improves write performance and reduces storage costs
  - Adding the missing foreign key index prevents slow queries on community_posts
  - Password protection setting requires dashboard configuration (cannot be set via SQL)
*/

-- Add missing index for foreign key on community_posts.project_id
CREATE INDEX IF NOT EXISTS idx_community_posts_project_id ON public.community_posts(project_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_community_posts_user_id;
DROP INDEX IF EXISTS idx_media_files_project_id;
DROP INDEX IF EXISTS idx_post_comments_post_id;
DROP INDEX IF EXISTS idx_post_comments_user_id;
DROP INDEX IF EXISTS idx_static_videos_updated_by;
DROP INDEX IF EXISTS idx_timeline_clips_media_file_id;
DROP INDEX IF EXISTS idx_timeline_clips_project_id;
DROP INDEX IF EXISTS idx_tool_usage_user_id;
DROP INDEX IF EXISTS idx_user_assets_user_id;
