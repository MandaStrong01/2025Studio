/*
  # Add Missing Foreign Key Indexes

  ## Overview
  This migration adds indexes for all foreign key columns to optimize query performance.
  Foreign keys require indexes for efficient joins and lookups, even if not immediately used.

  ## Changes Made

  1. **Foreign Key Indexes Added**
     - `idx_community_posts_project_id` on `community_posts.project_id`
     - `idx_community_posts_user_id` on `community_posts.user_id`
     - `idx_media_files_project_id` on `media_files.project_id`
     - `idx_post_comments_user_id` on `post_comments.user_id`
     - `idx_post_likes_user_id` on `post_likes.user_id`
     - `idx_public_movies_uploaded_by` on `public_movies.uploaded_by`
     - `idx_timeline_clips_media_file_id` on `timeline_clips.media_file_id`
     - `idx_timeline_clips_project_id` on `timeline_clips.project_id`
     - `idx_tool_usage_user_id` on `tool_usage.user_id`

  2. **Performance Impact**
     - Improves JOIN performance between related tables
     - Optimizes foreign key constraint checking
     - Reduces query execution time for filtered lookups
     - Essential for database scalability

  ## Notes
  - These indexes are critical for production performance
  - Foreign key columns should always have covering indexes
  - Index usage will grow as the application scales
*/

-- Add indexes for all foreign key columns
CREATE INDEX IF NOT EXISTS idx_community_posts_project_id ON public.community_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON public.media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_public_movies_uploaded_by ON public.public_movies(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON public.timeline_clips(media_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON public.timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);