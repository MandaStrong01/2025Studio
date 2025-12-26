/*
  # Fix Foreign Key Indexes and Security Issues

  ## Changes Made

  1. **Add Missing Foreign Key Indexes**
     - `community_posts.project_id` - improves query performance for project-based post lookups
     - `community_posts.user_id` - improves query performance for user-based post lookups
     - `media_files.project_id` - improves query performance for project media queries
     - `post_comments.user_id` - improves query performance for user comment lookups
     - `post_likes.user_id` - improves query performance for user like queries
     - `public_movies.uploaded_by` - improves query performance for user upload lookups
     - `timeline_clips.media_file_id` - improves query performance for media file clips
     - `timeline_clips.project_id` - improves query performance for project timeline queries
     - `tool_usage.user_id` - improves query performance for user activity tracking

  2. **Remove Unused Index**
     - Drop `idx_post_comments_post_id` as it's not being used

  3. **Fix Function Security**
     - Update `handle_new_user_registration` function with immutable search_path

  ## Performance Impact
  These indexes will improve query performance for foreign key lookups and JOIN operations.
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_community_posts_project_id ON public.community_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON public.media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_public_movies_uploaded_by ON public.public_movies(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON public.timeline_clips(media_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON public.timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);

-- Drop unused index
DROP INDEX IF EXISTS public.idx_post_comments_post_id;

-- Fix function security by setting immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );

  INSERT INTO public.user_subscriptions (
    user_id,
    plan_tier,
    status,
    trial_ends_at,
    created_at
  ) VALUES (
    NEW.id,
    'pending',
    'pending',
    NOW() + INTERVAL '7 days',
    NOW()
  );

  RETURN NEW;
END;
$$;