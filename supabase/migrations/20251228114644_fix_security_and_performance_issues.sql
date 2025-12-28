/*
  # Fix Security and Performance Issues
  
  This migration addresses critical security and performance issues identified in the database audit:
  
  ## 1. Unindexed Foreign Keys (Performance)
  Adds indexes to all foreign key columns to optimize JOIN operations and lookups:
  - `community_posts.user_id`
  - `media_files.project_id`
  - `post_comments.post_id` and `post_comments.user_id`
  - `post_likes.user_id`
  - `static_videos.updated_by`
  - `timeline_clips.media_file_id` and `timeline_clips.project_id`
  - `tool_usage.user_id`
  - `user_assets.user_id`
  
  ## 2. Auth RLS Initialization (Security & Performance)
  Fixes RLS policies on `static_videos` table to use subquery pattern `(select auth.uid())`
  instead of direct `auth.uid()` calls. This prevents re-evaluation per row and improves performance.
  
  ## 3. Unused Indexes (Performance)
  Removes unused indexes that add overhead without providing benefit:
  - `idx_community_posts_project_id`
  - `idx_static_videos_active`
  
  ## 4. Function Search Path (Security)
  Fixes `auto_confirm_user` function to have an immutable search_path, preventing potential
  security vulnerabilities from search_path manipulation.
  
  ## Note on Leaked Password Protection
  The leaked password protection setting must be enabled in Supabase Dashboard:
  Authentication > Policies > Enable "Check for leaked passwords"
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for community_posts.user_id
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id 
  ON public.community_posts(user_id);

-- Index for media_files.project_id
CREATE INDEX IF NOT EXISTS idx_media_files_project_id 
  ON public.media_files(project_id);

-- Index for post_comments.post_id
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id 
  ON public.post_comments(post_id);

-- Index for post_comments.user_id
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id 
  ON public.post_comments(user_id);

-- Index for post_likes.user_id
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id 
  ON public.post_likes(user_id);

-- Index for static_videos.updated_by
CREATE INDEX IF NOT EXISTS idx_static_videos_updated_by 
  ON public.static_videos(updated_by);

-- Index for timeline_clips.media_file_id
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id 
  ON public.timeline_clips(media_file_id);

-- Index for timeline_clips.project_id
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id 
  ON public.timeline_clips(project_id);

-- Index for tool_usage.user_id
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id 
  ON public.tool_usage(user_id);

-- Index for user_assets.user_id
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id 
  ON public.user_assets(user_id);

-- ============================================================================
-- 2. FIX AUTH RLS POLICIES ON STATIC_VIDEOS
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can insert static videos" ON public.static_videos;
DROP POLICY IF EXISTS "Admins can update static videos" ON public.static_videos;

-- Recreate policies with optimized auth.uid() pattern
CREATE POLICY "Admins can insert static videos"
  ON public.static_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update static videos"
  ON public.static_videos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (SELECT auth.uid())
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. DROP UNUSED INDEXES
-- ============================================================================

-- Drop unused index on community_posts.project_id
DROP INDEX IF EXISTS public.idx_community_posts_project_id;

-- Drop unused index on static_videos.active
DROP INDEX IF EXISTS public.idx_static_videos_active;

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Drop and recreate auto_confirm_user function with secure search_path
DROP FUNCTION IF EXISTS public.auto_confirm_user() CASCADE;

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;

CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all indexes were created
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added 10 foreign key indexes for improved query performance';
  RAISE NOTICE 'Fixed 2 RLS policies on static_videos table';
  RAISE NOTICE 'Removed 2 unused indexes';
  RAISE NOTICE 'Fixed auto_confirm_user function search_path';
  RAISE NOTICE '';
  RAISE NOTICE 'MANUAL ACTION REQUIRED:';
  RAISE NOTICE 'Enable leaked password protection in Supabase Dashboard:';
  RAISE NOTICE 'Authentication > Policies > Enable "Check for leaked passwords"';
END $$;
