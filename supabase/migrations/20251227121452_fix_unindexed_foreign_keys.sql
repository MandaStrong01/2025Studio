/*
  # Fix Unindexed Foreign Keys

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys to improve query performance
    - Tables affected:
      - community_posts (project_id, user_id)
      - media_files (project_id)
      - post_comments (post_id, user_id)
      - post_likes (user_id)
      - public_movies (uploaded_by)
      - timeline_clips (media_file_id, project_id)
      - tool_usage (user_id)

  Important Notes:
    - Foreign key indexes significantly improve JOIN performance
    - These indexes are essential for tables with foreign key relationships
    - Indexes speed up queries that filter or join on these columns
*/

-- Add indexes for community_posts foreign keys
CREATE INDEX IF NOT EXISTS idx_community_posts_project_id 
  ON public.community_posts(project_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id 
  ON public.community_posts(user_id);

-- Add index for media_files foreign key
CREATE INDEX IF NOT EXISTS idx_media_files_project_id 
  ON public.media_files(project_id);

-- Add indexes for post_comments foreign keys
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id 
  ON public.post_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_user_id 
  ON public.post_comments(user_id);

-- Add index for post_likes foreign key
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id 
  ON public.post_likes(user_id);

-- Add index for public_movies foreign key
CREATE INDEX IF NOT EXISTS idx_public_movies_uploaded_by 
  ON public.public_movies(uploaded_by);

-- Add indexes for timeline_clips foreign keys
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id 
  ON public.timeline_clips(media_file_id);

CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id 
  ON public.timeline_clips(project_id);

-- Add index for tool_usage foreign key
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id 
  ON public.tool_usage(user_id);