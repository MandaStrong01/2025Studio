/*
  # Disable Email Confirmation Requirement

  1. Changes
    - Creates a trigger function to auto-confirm user emails on signup
    - Applies trigger to auth.users table to confirm emails immediately
    
  2. Purpose
    - Allows users to login immediately after registration
    - Removes the need for email confirmation step
    - Streamlines user onboarding process

  Note: This is for production use where email confirmation is not required.
*/

-- Create function to auto-confirm user emails
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user's email
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();