/*
  # Fix Public Movies RLS Permission Issues

  ## Overview
  This migration fixes the "permission denied for table users" error by using
  auth.jwt() instead of querying auth.users directly in RLS policies.

  ## Changes Made

  ### RLS Policy Fix
  - Replaces auth.users table queries with auth.jwt() function
  - Uses app_metadata from JWT to check admin role
  - Maintains same security while fixing permission errors
  - Properly wraps auth functions in subqueries for performance

  ## Security Notes
  - Admin role must be stored in user's raw_app_meta_data
  - JWT contains app_metadata accessible via auth.jwt()
  - No degradation of security, just different access method
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view published movies, admins can view all" ON public_movies;
DROP POLICY IF EXISTS "Admins can insert movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can update movies" ON public_movies;
DROP POLICY IF EXISTS "Admins can delete movies" ON public_movies;

-- Recreate SELECT policy using auth.jwt() for admin check
CREATE POLICY "Users can view published movies, admins can view all"
  ON public_movies FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    OR 
    (select auth.jwt()->>'role') = 'admin'
    OR
    (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Recreate INSERT policy using auth.jwt() for admin check
CREATE POLICY "Admins can insert movies"
  ON public_movies FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.jwt()->>'role') = 'admin'
    OR
    (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Recreate UPDATE policy using auth.jwt() for admin check
CREATE POLICY "Admins can update movies"
  ON public_movies FOR UPDATE
  TO authenticated
  USING (
    (select auth.jwt()->>'role') = 'admin'
    OR
    (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  )
  WITH CHECK (
    (select auth.jwt()->>'role') = 'admin'
    OR
    (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Recreate DELETE policy using auth.jwt() for admin check
CREATE POLICY "Admins can delete movies"
  ON public_movies FOR DELETE
  TO authenticated
  USING (
    (select auth.jwt()->>'role') = 'admin'
    OR
    (select auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
