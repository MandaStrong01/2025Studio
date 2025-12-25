/*
  # Optimize Database Security and Performance

  ## Overview
  This migration optimizes RLS policies for better performance and removes unused indexes
  to reduce database maintenance overhead.

  ## Changes Made

  ### 1. RLS Policy Optimization (public_movies table)
  - Optimizes all admin RLS policies by wrapping auth.uid() in subqueries
  - This prevents the auth function from being re-evaluated for each row
  - Significantly improves query performance at scale
  - Policies affected:
    - "Admins can view all movies" (SELECT)
    - "Admins can insert movies" (INSERT)
    - "Admins can update movies" (UPDATE)
    - "Admins can delete movies" (DELETE)
  - Also fixes multiple permissive policies issue by combining them

  ### 2. Index Cleanup
  - Removes unused indexes that add maintenance overhead without providing value
  - Keeps essential indexes for actual query patterns
  - Fixes duplicate index issue on community_posts table

  ### 3. Security Improvements
  - Maintains restrictive RLS while improving performance
  - Ensures no data access regression

  ## Important Notes
  - All security policies remain functionally identical
  - Only performance characteristics are improved
  - No data is modified, only schema optimizations
*/

-- ============================================
-- 1. OPTIMIZE PUBLIC_MOVIES RLS POLICIES
-- ============================================

-- Drop existing admin policies (they will be recreated with optimized queries)
DROP POLICY IF EXISTS "Admins can view all movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can insert movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can update movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can delete movies" ON public_movies;

-- Recreate optimized SELECT policy that combines both user and admin access
-- This fixes both the performance issue and the multiple permissive policies issue
DROP POLICY IF EXISTS "Anyone can view published movies" ON public_movies;

CREATE POLICY "Users can view published movies, admins can view all"
  ON public_movies FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Optimized INSERT policy for admins
CREATE POLICY "Admins can insert movies"
  ON public_movies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Optimized UPDATE policy for admins
CREATE POLICY "Admins can update movies"
  ON public_movies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Optimized DELETE policy for admins
CREATE POLICY "Admins can delete movies"
  ON public_movies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================

-- Drop unused indexes on public_movies
DROP INDEX IF EXISTS idx_public_movies_uploaded_by;
DROP INDEX IF EXISTS idx_public_movies_is_published;
DROP INDEX IF EXISTS idx_public_movies_is_featured;
DROP INDEX IF EXISTS idx_public_movies_genre;
DROP INDEX IF EXISTS idx_public_movies_created_at;

-- Drop unused indexes on media_files
DROP INDEX IF EXISTS idx_media_files_project;
DROP INDEX IF EXISTS idx_media_files_user_id;
DROP INDEX IF EXISTS idx_media_files_project_id;

-- Drop unused indexes on timeline_clips
DROP INDEX IF EXISTS idx_timeline_clips_project_track;
DROP INDEX IF EXISTS idx_timeline_clips_project_id;
DROP INDEX IF EXISTS idx_timeline_clips_media_file_id;

-- Drop unused indexes on subscriptions
DROP INDEX IF EXISTS idx_subscriptions_status;

-- Drop unused indexes on user_assets
DROP INDEX IF EXISTS idx_user_assets_type;
DROP INDEX IF EXISTS idx_user_assets_user_created;

-- Drop unused indexes on projects
DROP INDEX IF EXISTS idx_projects_status;

-- Drop unused indexes on tool_usage
DROP INDEX IF EXISTS idx_tool_usage_user_id;
DROP INDEX IF EXISTS idx_tool_usage_user_time;

-- Drop unused indexes on community_posts (including duplicate)
DROP INDEX IF EXISTS idx_community_posts_created;
DROP INDEX IF EXISTS idx_community_posts_created_at;
DROP INDEX IF EXISTS idx_community_posts_project_id;
DROP INDEX IF EXISTS idx_community_posts_user_id;

-- Drop unused indexes on post_comments
DROP INDEX IF EXISTS idx_post_comments_user_id;
DROP INDEX IF EXISTS idx_post_comments_post_id;

-- Drop unused indexes on post_likes
DROP INDEX IF EXISTS idx_post_likes_user_id;
DROP INDEX IF EXISTS idx_post_likes_post_id;

-- ============================================
-- 3. RECREATE ESSENTIAL INDEXES ONLY
-- ============================================

-- These indexes are recreated based on actual query patterns
-- Only create indexes that will actually be used

-- Community posts: Keep created_at for sorting
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- Media files: Keep user_id for filtering user's media
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);

-- Post comments: Keep post_id for fetching comments by post
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- Post likes: Keep post_id for counting likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
