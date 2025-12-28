/*
  # Fix Auto-Confirm User Function

  1. Changes
    - Updates the auto-confirm function to only set email_confirmed_at
    - Removes confirmed_at as it's a generated column
    - Confirms any existing unconfirmed users
    
  2. Purpose
    - Fixes the trigger to work correctly with auth.users schema
    - Ensures all existing users are confirmed
*/

-- Update function to only set email_confirmed_at (confirmed_at is generated)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the user's email (confirmed_at is a generated column)
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirm any existing users who are not confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;