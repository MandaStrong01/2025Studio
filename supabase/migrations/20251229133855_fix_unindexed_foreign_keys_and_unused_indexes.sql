/*
  # Fix Unindexed Foreign Keys and Remove Unused Indexes

  ## Changes
  1. Add missing indexes on foreign keys for optimal query performance
  2. Remove unused index

  ## New Indexes
  - `idx_community_posts_user_id` on community_posts(user_id)
  - `idx_media_files_project_id` on media_files(project_id)
  - `idx_post_comments_post_id` on post_comments(post_id)
  - `idx_post_comments_user_id` on post_comments(user_id)
  - `idx_static_videos_updated_by` on static_videos(updated_by)
  - `idx_timeline_clips_media_file_id` on timeline_clips(media_file_id)
  - `idx_timeline_clips_project_id` on timeline_clips(project_id)
  - `idx_tool_usage_user_id` on tool_usage(user_id)
  - `idx_user_assets_user_id` on user_assets(user_id)

  ## Removed Indexes
  - `idx_community_posts_project_id` (unused)

  ## Performance Impact
  All foreign key lookups will now use indexes, significantly improving query performance
*/

-- Add missing foreign key indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_static_videos_updated_by ON static_videos(updated_by);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON timeline_clips(media_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);

-- Remove unused index to reduce storage overhead
DROP INDEX IF EXISTS idx_community_posts_project_id;