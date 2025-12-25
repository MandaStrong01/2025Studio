/*
  # Add Missing Application Tables

  ## New Tables Added
  
  ### media_files
  - Stores uploaded and generated media (videos, images, audio)
  - Links to projects and users
  
  ### timeline_clips
  - Stores individual clips in a project timeline
  - References media files and projects
  
  ### community_posts
  - User-shared videos and creations
  - Public viewing with engagement metrics
  
  ### post_likes, post_comments
  - Social engagement features
  
  ### templates
  - Pre-built project templates
  
  ### user_profiles
  - Extended user information

  ## Security
  - All tables have RLS enabled
  - Appropriate policies for data access
*/

-- Media files table
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Users can view own media files'
  ) THEN
    CREATE POLICY "Users can view own media files"
      ON media_files FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Users can create own media files'
  ) THEN
    CREATE POLICY "Users can create own media files"
      ON media_files FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Users can update own media files'
  ) THEN
    CREATE POLICY "Users can update own media files"
      ON media_files FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Users can delete own media files'
  ) THEN
    CREATE POLICY "Users can delete own media files"
      ON media_files FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Timeline clips table
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'timeline_clips' AND policyname = 'Users can view clips in own projects'
  ) THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'timeline_clips' AND policyname = 'Users can create clips in own projects'
  ) THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'timeline_clips' AND policyname = 'Users can update clips in own projects'
  ) THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'timeline_clips' AND policyname = 'Users can delete clips in own projects'
  ) THEN
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
  END IF;
END $$;

-- Community posts table
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Anyone can view community posts'
  ) THEN
    CREATE POLICY "Anyone can view community posts"
      ON community_posts FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Users can create own posts'
  ) THEN
    CREATE POLICY "Users can create own posts"
      ON community_posts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts"
      ON community_posts FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts"
      ON community_posts FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Anyone can view likes'
  ) THEN
    CREATE POLICY "Anyone can view likes"
      ON post_likes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can create own likes'
  ) THEN
    CREATE POLICY "Users can create own likes"
      ON post_likes FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can delete own likes'
  ) THEN
    CREATE POLICY "Users can delete own likes"
      ON post_likes FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Anyone can view comments'
  ) THEN
    CREATE POLICY "Anyone can view comments"
      ON post_comments FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can create own comments'
  ) THEN
    CREATE POLICY "Users can create own comments"
      ON post_comments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can update own comments'
  ) THEN
    CREATE POLICY "Users can update own comments"
      ON post_comments FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments"
      ON post_comments FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Templates table
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'templates' AND policyname = 'Anyone can view templates'
  ) THEN
    CREATE POLICY "Anyone can view templates"
      ON templates FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- User profiles table
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can view profiles'
  ) THEN
    CREATE POLICY "Anyone can view profiles"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON user_profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Insert sample templates
INSERT INTO templates (title, description, category, thumbnail_url, is_premium) VALUES
  ('Action Movie Trailer', 'High-energy trailer template with epic music and transitions', 'trailer', '', false),
  ('Product Showcase', 'Professional product presentation template', 'business', '', false),
  ('Travel Vlog', 'Cinematic travel video template', 'vlog', '', false),
  ('Music Video', 'Dynamic music video template with beat-synced effects', 'music', '', true),
  ('Corporate Presentation', 'Professional business presentation template', 'business', '', false),
  ('Social Media Reel', 'Vertical format template optimized for TikTok and Instagram', 'social', '', false)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_clips_project_id ON timeline_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
