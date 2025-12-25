/*
  # Create Public Movies Table

  ## Overview
  This table stores movies that admins upload for all users to watch,
  similar to a streaming platform content library.

  ## New Tables
  
  ### public_movies
  - `id` (uuid, primary key)
  - `uploaded_by` (uuid, references auth.users) - Admin who uploaded
  - `title` (text) - Movie title
  - `description` (text) - Movie description
  - `video_url` (text) - Storage URL for the movie file
  - `thumbnail_url` (text) - Thumbnail/poster image
  - `duration_minutes` (integer) - Movie duration in minutes
  - `genre` (text) - Movie genre/category
  - `release_year` (integer) - Release year
  - `rating` (text) - Content rating (G, PG, PG-13, R, etc.)
  - `views_count` (integer) - Number of views
  - `is_featured` (boolean) - Featured on homepage
  - `is_published` (boolean) - Published and visible to users
  - `metadata` (jsonb) - Additional info (resolution, file size, etc.)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Admins can create, update, and delete movies
  - All authenticated users can view published movies
  - RLS policies enforce access control

  ## Indexes
  - Performance indexes on commonly queried columns
*/

-- Create public_movies table
CREATE TABLE IF NOT EXISTS public_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  genre text DEFAULT 'general',
  release_year integer,
  rating text DEFAULT 'NR',
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_public_movies_uploaded_by ON public_movies(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_public_movies_is_published ON public_movies(is_published);
CREATE INDEX IF NOT EXISTS idx_public_movies_is_featured ON public_movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_public_movies_genre ON public_movies(genre);
CREATE INDEX IF NOT EXISTS idx_public_movies_created_at ON public_movies(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public_movies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view published movies
CREATE POLICY "Anyone can view published movies"
  ON public_movies FOR SELECT
  TO authenticated
  USING (is_published = true);

-- RLS Policy: Admins can view all movies (published and unpublished)
CREATE POLICY "Admins can view all movies"
  ON public_movies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policy: Admins can insert movies
CREATE POLICY "Admins can insert movies"
  ON public_movies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policy: Admins can update movies
CREATE POLICY "Admins can update movies"
  ON public_movies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policy: Admins can delete movies
CREATE POLICY "Admins can delete movies"
  ON public_movies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );
