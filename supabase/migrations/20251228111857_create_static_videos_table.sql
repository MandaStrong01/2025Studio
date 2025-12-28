/*
  # Create Static Videos Table

  1. Purpose
    - Store URLs for app-wide static video assets (background, outro, etc.)
    - All users read from this table to display videos
    - Only admins can update URLs

  2. New Tables
    - `static_videos`
      - `id` (uuid, primary key)
      - `video_key` (text, unique) - identifier like 'background', 'outro', 'doxy_movie'
      - `video_url` (text) - public URL to the video
      - `display_name` (text) - human-readable name
      - `description` (text) - description of where this video is used
      - `is_active` (boolean) - whether this video should be used
      - `updated_at` (timestamp)
      - `updated_by` (uuid, foreign key to auth.users)

  3. Security
    - Enable RLS
    - Allow all users (even unauthenticated) to read active videos
    - Only admins can insert/update
*/

-- Create static_videos table
CREATE TABLE IF NOT EXISTS static_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_key text UNIQUE NOT NULL,
  video_url text NOT NULL,
  display_name text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE static_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone (including public) can read active static videos
CREATE POLICY "Anyone can view active static videos"
ON static_videos
FOR SELECT
TO public
USING (is_active = true);

-- Policy: Only admins can insert static videos
CREATE POLICY "Admins can insert static videos"
ON static_videos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Only admins can update static videos
CREATE POLICY "Admins can update static videos"
ON static_videos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_static_videos_key ON static_videos(video_key);
CREATE INDEX IF NOT EXISTS idx_static_videos_active ON static_videos(is_active);

-- Insert default entries for required videos
INSERT INTO static_videos (video_key, video_url, display_name, description) VALUES
  ('background', '', 'Background Video', 'Background video for landing pages (Pages 1 & 2)'),
  ('avatar', '', 'Avatar Video', 'Avatar video for Page 1 (bottom-right corner)'),
  ('doxy_movie', '', 'Doxy: The School Bully', 'Full-length movie (90 minutes) - Main feature film'),
  ('outro', '', 'Outro Video', 'Closing credits video for Page 21')
ON CONFLICT (video_key) DO NOTHING;
