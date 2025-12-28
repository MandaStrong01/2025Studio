/*
  # Fix All Security and Performance Issues

  ## 1. Unindexed Foreign Keys
    - Add missing index on `community_posts.project_id` foreign key

  ## 2. RLS Policy Optimization
    Replace `auth.uid()` with `(select auth.uid())` in all policies to prevent re-evaluation per row:
    - user_roles: 1 policy
    - subscriptions: 2 policies
    - user_profiles: 2 policies
    - projects: 4 policies
    - user_assets: 3 policies
    - media_files: 4 policies
    - timeline_clips: 5 policies
    - tool_usage: 2 policies
    - community_posts: 3 policies
    - post_likes: 2 policies
    - post_comments: 3 policies

  ## 3. Remove Unused Indexes
    Drop indexes that have not been used:
    - idx_post_likes_user_id
    - idx_post_comments_post_id
    - idx_post_comments_user_id
    - idx_subscriptions_status
    - idx_user_assets_user_id
    - idx_projects_status
    - idx_user_assets_type
    - idx_tool_usage_user_id
    - idx_media_files_project_id
    - idx_timeline_clips_project_id
    - idx_timeline_clips_media_file_id
    - idx_community_posts_user_id
    - idx_community_posts_created_at
    - idx_post_likes_post_id
    - idx_public_movies_category

  ## 4. Fix Function Search Path
    - Make auto_confirm_user function search path immutable by setting explicit search_path

  ## 5. Security Notes
    - Leaked password protection should be enabled via Supabase Dashboard:
      Authentication > Providers > Email > Password protection
*/

-- =====================================================
-- 1. Add Missing Foreign Key Index
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_community_posts_project_id 
ON public.community_posts(project_id);

-- =====================================================
-- 2. Drop Unused Indexes
-- =====================================================

DROP INDEX IF EXISTS public.idx_post_likes_user_id;
DROP INDEX IF EXISTS public.idx_post_comments_post_id;
DROP INDEX IF EXISTS public.idx_post_comments_user_id;
DROP INDEX IF EXISTS public.idx_subscriptions_status;
DROP INDEX IF EXISTS public.idx_user_assets_user_id;
DROP INDEX IF EXISTS public.idx_projects_status;
DROP INDEX IF EXISTS public.idx_user_assets_type;
DROP INDEX IF EXISTS public.idx_tool_usage_user_id;
DROP INDEX IF EXISTS public.idx_media_files_project_id;
DROP INDEX IF EXISTS public.idx_timeline_clips_project_id;
DROP INDEX IF EXISTS public.idx_timeline_clips_media_file_id;
DROP INDEX IF EXISTS public.idx_community_posts_user_id;
DROP INDEX IF EXISTS public.idx_community_posts_created_at;
DROP INDEX IF EXISTS public.idx_post_likes_post_id;
DROP INDEX IF EXISTS public.idx_public_movies_category;

-- =====================================================
-- 3. Optimize RLS Policies - user_roles
-- =====================================================

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

CREATE POLICY "Users can read own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 4. Optimize RLS Policies - subscriptions
-- =====================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 5. Optimize RLS Policies - user_profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 6. Optimize RLS Policies - projects
-- =====================================================

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 7. Optimize RLS Policies - user_assets
-- =====================================================

DROP POLICY IF EXISTS "Users can view own assets" ON public.user_assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON public.user_assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.user_assets;

CREATE POLICY "Users can view own assets"
ON public.user_assets
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own assets"
ON public.user_assets
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own assets"
ON public.user_assets
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 8. Optimize RLS Policies - media_files
-- =====================================================

DROP POLICY IF EXISTS "Users can view own media files" ON public.media_files;
DROP POLICY IF EXISTS "Users can create own media files" ON public.media_files;
DROP POLICY IF EXISTS "Users can update own media files" ON public.media_files;
DROP POLICY IF EXISTS "Users can delete own media files" ON public.media_files;

CREATE POLICY "Users can view own media files"
ON public.media_files
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own media files"
ON public.media_files
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own media files"
ON public.media_files
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own media files"
ON public.media_files
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 9. Optimize RLS Policies - timeline_clips
-- =====================================================

DROP POLICY IF EXISTS "Users can view clips in own projects" ON public.timeline_clips;
DROP POLICY IF EXISTS "Users can create clips in own projects" ON public.timeline_clips;
DROP POLICY IF EXISTS "Users can update clips in own projects" ON public.timeline_clips;
DROP POLICY IF EXISTS "Users can delete clips in own projects" ON public.timeline_clips;

CREATE POLICY "Users can view clips in own projects"
ON public.timeline_clips
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = timeline_clips.project_id
    AND projects.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can create clips in own projects"
ON public.timeline_clips
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = timeline_clips.project_id
    AND projects.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can update clips in own projects"
ON public.timeline_clips
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = timeline_clips.project_id
    AND projects.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = timeline_clips.project_id
    AND projects.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can delete clips in own projects"
ON public.timeline_clips
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = timeline_clips.project_id
    AND projects.user_id = (select auth.uid())
  )
);

-- =====================================================
-- 10. Optimize RLS Policies - tool_usage
-- =====================================================

DROP POLICY IF EXISTS "Users can view own tool usage" ON public.tool_usage;
DROP POLICY IF EXISTS "Users can insert own tool usage" ON public.tool_usage;

CREATE POLICY "Users can view own tool usage"
ON public.tool_usage
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own tool usage"
ON public.tool_usage
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 11. Optimize RLS Policies - community_posts
-- =====================================================

DROP POLICY IF EXISTS "Users can create own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;

CREATE POLICY "Users can create own posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own posts"
ON public.community_posts
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 12. Optimize RLS Policies - post_likes
-- =====================================================

DROP POLICY IF EXISTS "Users can create own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;

CREATE POLICY "Users can create own likes"
ON public.post_likes
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own likes"
ON public.post_likes
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 13. Optimize RLS Policies - post_comments
-- =====================================================

DROP POLICY IF EXISTS "Users can create own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;

CREATE POLICY "Users can create own comments"
ON public.post_comments
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own comments"
ON public.post_comments
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own comments"
ON public.post_comments
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- =====================================================
-- 14. Fix Function Search Path
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.auto_confirm_user() CASCADE;

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET 
    email_confirmed_at = now(),
    confirmed_at = now()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();