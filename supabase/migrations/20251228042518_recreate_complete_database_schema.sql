/*
  # Complete Database Schema Recreation

  ## Overview
  This migration creates the complete database schema for MandaStrong Studio
  from scratch, consolidating all necessary tables and security policies.

  ## New Tables

  ### 1. user_roles
  Stores user permission levels
  - `id` (uuid, primary key)
  - `user_id` (uuid, unique, references auth.users)
  - `role` (text): 'user' or 'admin'
  - `created_at` (timestamptz)

  ### 2. subscriptions
  Tracks user subscription plans and payments
  - `id` (uuid, primary key)
  - `user_id` (uuid, unique, references auth.users)
  - `status` (text): 'pending', 'active', 'cancelled', 'expired'
  - `plan_tier` (text): 'none', 'basic', 'pro', 'studio'
  - `plan_price` (integer): 0, 10, 20, 30
  - `stripe_customer_id` (text, nullable)
  - `stripe_subscription_id` (text, nullable)
  - `started_at` (timestamptz)
  - `expires_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. user_profiles
  Extended user information
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique, nullable)
  - `display_name` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `projects_count` (integer)
  - `followers_count` (integer)
  - `following_count` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. projects
  User video projects
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `project_name` (text)
  - `description` (text)
  - `timeline_data` (jsonb)
  - `render_status` (text): 'draft', 'rendering', 'completed', 'failed'
  - `output_url` (text, nullable)
  - `duration_seconds` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. user_assets
  AI-generated and uploaded media
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `asset_type` (text): 'image', 'video', 'audio', 'text'
  - `file_name` (text)
  - `file_url` (text)
  - `tool_name` (text)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 6. media_files
  Uploaded and generated media files
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `project_id` (uuid, references projects, nullable)
  - `file_name` (text)
  - `file_type` (text)
  - `file_url` (text)
  - `file_size` (bigint)
  - `duration` (integer)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 7. timeline_clips
  Individual clips in project timelines
  - `id` (uuid, primary key)
  - `project_id` (uuid, references projects)
  - `media_file_id` (uuid, references media_files, nullable)
  - `track_number` (integer)
  - `track_type` (text)
  - `start_time` (decimal)
  - `end_time` (decimal)
  - `trim_start` (decimal)
  - `trim_end` (decimal)
  - `properties` (jsonb)
  - `created_at` (timestamptz)

  ### 8. tool_usage
  Tracks AI tool usage
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `tool_name` (text)
  - `page_number` (integer)
  - `used_at` (timestamptz)

  ### 9. community_posts
  User-shared content
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `project_id` (uuid, references projects, nullable)
  - `title` (text)
  - `description` (text)
  - `video_url` (text)
  - `thumbnail_url` (text)
  - `likes_count` (integer)
  - `comments_count` (integer)
  - `views_count` (integer)
  - `created_at` (timestamptz)

  ### 10. post_likes
  Likes on community posts
  - `id` (uuid, primary key)
  - `post_id` (uuid, references community_posts)
  - `user_id` (uuid, references auth.users)
  - `created_at` (timestamptz)
  - Unique constraint on (post_id, user_id)

  ### 11. post_comments
  Comments on community posts
  - `id` (uuid, primary key)
  - `post_id` (uuid, references community_posts)
  - `user_id` (uuid, references auth.users)
  - `content` (text)
  - `created_at` (timestamptz)

  ### 12. templates
  Pre-built project templates
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `category` (text)
  - `thumbnail_url` (text)
  - `template_data` (jsonb)
  - `is_premium` (boolean)
  - `created_at` (timestamptz)

  ### 13. public_movies
  Public video showcase
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `video_url` (text)
  - `thumbnail_url` (text)
  - `category` (text)
  - `duration_seconds` (integer)
  - `views_count` (integer)
  - `likes_count` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Comprehensive policies for data access
  - Users can only access their own data
  - Public read access where appropriate

  ## Performance
  - Indexes on all foreign keys
  - Indexes on frequently queried columns
*/

-- 1. user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- 2. subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  plan_tier text NOT NULL DEFAULT 'none',
  plan_price integer NOT NULL DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 3. user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  projects_count integer DEFAULT 0,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text DEFAULT '',
  timeline_data jsonb DEFAULT '{}',
  render_status text NOT NULL DEFAULT 'draft',
  output_url text,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(render_status);

-- 5. user_assets table
CREATE TABLE IF NOT EXISTS user_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  tool_name text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets"
  ON user_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON user_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON user_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_type ON user_assets(asset_type);

-- 6. media_files table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  duration integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media files"
  ON media_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own media files"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media files"
  ON media_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media files"
  ON media_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON media_files(project_id);

-- 7. timeline_clips table
CREATE TABLE IF NOT EXISTS timeline_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  media_file_id uuid REFERENCES media_files(id) ON DELETE CASCADE,
  track_number integer DEFAULT 0,
  track_type text DEFAULT 'video',
  start_time decimal DEFAULT 0,
  end_time decimal DEFAULT 0,
  trim_start decimal DEFAULT 0,
  trim_end decimal DEFAULT 0,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clips in own projects"
  ON timeline_clips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create clips in own projects"
  ON timeline_clips FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clips in own projects"
  ON timeline_clips FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clips in own projects"
  ON timeline_clips FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = timeline_clips.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_media_file_id ON timeline_clips(media_file_id);

-- 8. tool_usage table
CREATE TABLE IF NOT EXISTS tool_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  page_number integer NOT NULL,
  used_at timestamptz DEFAULT now()
);

ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool usage"
  ON tool_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool usage"
  ON tool_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON tool_usage(user_id);

-- 9. community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text DEFAULT '',
  thumbnail_url text DEFAULT '',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- 10. post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 11. post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- 12. templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  thumbnail_url text DEFAULT '',
  template_data jsonb DEFAULT '{}',
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

-- 13. public_movies table
CREATE TABLE IF NOT EXISTS public_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  category text DEFAULT 'general',
  duration_seconds integer DEFAULT 0,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public movies"
  ON public_movies FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_public_movies_category ON public_movies(category);
CREATE INDEX IF NOT EXISTS idx_public_movies_created_at ON public_movies(created_at DESC);

-- Insert sample templates
INSERT INTO templates (title, description, category, is_premium) VALUES
  ('Action Movie Trailer', 'High-energy trailer template with epic music and transitions', 'trailer', false),
  ('Product Showcase', 'Professional product presentation template', 'business', false),
  ('Travel Vlog', 'Cinematic travel video template', 'vlog', false),
  ('Music Video', 'Dynamic music video template with beat-synced effects', 'music', true),
  ('Corporate Presentation', 'Professional business presentation template', 'business', false),
  ('Social Media Reel', 'Vertical format template optimized for TikTok and Instagram', 'social', false)
ON CONFLICT DO NOTHING;

-- Create registration handler function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create pending subscription
  INSERT INTO public.subscriptions (
    user_id, 
    status, 
    plan_tier,
    plan_price
  )
  VALUES (
    NEW.id, 
    'pending',
    'none',
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_registration ON auth.users;
CREATE TRIGGER on_auth_user_created_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_registration();