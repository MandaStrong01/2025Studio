/*
  # Add Performance Indexes

  1. Performance Improvements
    - Add indexes on frequently queried columns for faster lookups
    - Optimize media_files queries by user_id and created_at
    - Optimize projects queries by user_id and updated_at
    - Optimize timeline_clips queries by project_id and track_number

  2. Notes
    - These indexes will significantly speed up common queries
    - created_at descending index optimizes "recent files" queries
    - Composite indexes optimize multi-column WHERE clauses
*/

CREATE INDEX IF NOT EXISTS idx_media_files_user_created
  ON media_files(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_files_project
  ON media_files(project_id)
  WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_user_updated
  ON projects(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_track
  ON timeline_clips(project_id, track_number, start_time);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON subscriptions(user_id, status, current_period_end);

CREATE INDEX IF NOT EXISTS idx_user_assets_user_created
  ON user_assets(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_created
  ON community_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_usage_user_time
  ON tool_usage(user_id, used_at DESC);
