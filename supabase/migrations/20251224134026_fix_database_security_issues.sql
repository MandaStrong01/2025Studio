/*
  # Fix Database Security and Performance Issues

  ## Summary
  This migration addresses critical security and performance issues identified by Supabase:
  - Adds missing indexes on foreign keys for optimal query performance
  - Optimizes all RLS policies to use auth.uid() initialization pattern
  - Removes duplicate SELECT policy on subscriptions table
  - Ensures all foreign keys have proper covering indexes

  ## Changes Made

  ### 1. Missing Foreign Key Indexes
  Added indexes for:
  - `community_posts.project_id` - Improves post lookup by project
  - `post_comments.user_id` - Speeds up comment queries by user
  - `post_likes.user_id` - Optimizes like queries by user
  - `timeline_clips.media_file_id` - Improves clip lookup by media file

  ### 2. RLS Policy Optimization
  Updated ALL policies to use `(select auth.uid())` pattern:
  - Prevents re-evaluation of auth function for each row
  - Significantly improves query performance at scale
  - Affects policies on: subscriptions, user_assets, projects, tool_usage,
    media_files, timeline_clips, community_posts, post_likes, post_comments,
    user_profiles, user_roles

  ### 3. Duplicate Policy Removal
  - Removed duplicate "Users can view own subscription" policy
  - Kept only "Users can read own subscription" policy
  - Ensures single SELECT policy per table per role

  ## Performance Impact
  - Query performance improved for all foreign key lookups
  - RLS policy evaluation optimized for large-scale operations
  - Reduced database overhead on authenticated requests
*/

-- ============================================================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_community_posts_project_id ON community_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON timeline_clips(media_file_id);

-- ============================================================================
-- PART 2: Remove Duplicate Policy on Subscriptions Table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

-- ============================================================================
-- PART 3: Optimize RLS Policies - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- SUBSCRIPTIONS TABLE
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- USER_ASSETS TABLE
DROP POLICY IF EXISTS "Users can view own assets" ON user_assets;
CREATE POLICY "Users can view own assets"
  ON user_assets FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own assets" ON user_assets;
CREATE POLICY "Users can insert own assets"
  ON user_assets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own assets" ON user_assets;
CREATE POLICY "Users can delete own assets"
  ON user_assets FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- PROJECTS TABLE
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- TOOL_USAGE TABLE
DROP POLICY IF EXISTS "Users can view own tool usage" ON tool_usage;
CREATE POLICY "Users can view own tool usage"
  ON tool_usage FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own tool usage" ON tool_usage;
CREATE POLICY "Users can insert own tool usage"
  ON tool_usage FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- MEDIA_FILES TABLE
DROP POLICY IF EXISTS "Users can view own media files" ON media_files;
CREATE POLICY "Users can view own media files"
  ON media_files FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own media files" ON media_files;
CREATE POLICY "Users can create own media files"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own media files" ON media_files;
CREATE POLICY "Users can update own media files"
  ON media_files FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own media files" ON media_files;
CREATE POLICY "Users can delete own media files"
  ON media_files FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- TIMELINE_CLIPS TABLE
DROP POLICY IF EXISTS "Users can view clips in own projects" ON timeline_clips;
CREATE POLICY "Users can view clips in own projects"
  ON timeline_clips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create clips in own projects" ON timeline_clips;
CREATE POLICY "Users can create clips in own projects"
  ON timeline_clips FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update clips in own projects" ON timeline_clips;
CREATE POLICY "Users can update clips in own projects"
  ON timeline_clips FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete clips in own projects" ON timeline_clips;
CREATE POLICY "Users can delete clips in own projects"
  ON timeline_clips FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- COMMUNITY_POSTS TABLE
DROP POLICY IF EXISTS "Users can create own posts" ON community_posts;
CREATE POLICY "Users can create own posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- POST_LIKES TABLE
DROP POLICY IF EXISTS "Users can create own likes" ON post_likes;
CREATE POLICY "Users can create own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;
CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- POST_COMMENTS TABLE
DROP POLICY IF EXISTS "Users can create own comments" ON post_comments;
CREATE POLICY "Users can create own comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- USER_PROFILES TABLE
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- USER_ROLES TABLE
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
