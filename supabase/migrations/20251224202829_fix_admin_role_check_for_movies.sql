/*
  # Fix Admin Role Check for Movie Uploads

  ## Overview
  The RLS policies were checking auth.jwt() for admin role, but the role is actually
  stored in the user_roles table. This migration updates the policies to check the
  user_roles table instead.

  ## Changes Made

  ### RLS Policy Updates
  - Updates all public_movies policies to check user_roles table
  - Allows users with 'admin' role in user_roles to manage movies
  - Maintains performance by wrapping queries in subqueries
  - All authenticated users can still view published movies

  ## Security Notes
  - Admin check now uses user_roles table
  - Performance optimized with proper subqueries
  - No security degradation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view published movies, admins can view all" ON public_movies;
DROP POLICY IF EXISTS "Admins can insert movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can update movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can delete movies" ON public_movies;

-- Recreate SELECT policy checking user_roles table
CREATE POLICY "Users can view published movies, admins can view all"
  ON public_movies FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    OR 
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  );

-- Recreate INSERT policy checking user_roles table
CREATE POLICY "Admins can insert movies"
  ON public_movies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  );

-- Recreate UPDATE policy checking user_roles table
CREATE POLICY "Admins can update movies"
  ON public_movies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  );

-- Recreate DELETE policy checking user_roles table
CREATE POLICY "Admins can delete movies"
  ON public_movies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  );
