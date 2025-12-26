/*
  # Fix User Registration Flow
  
  1. New Database Trigger
    - Automatically creates user_role when new user registers
    - Sets default role to 'user'
    - Ensures users have basic access even if payment fails
  
  2. Changes Made
    - Created trigger function to handle new user registration
    - Trigger fires on auth.users insert
    - Creates corresponding user_role record automatically
  
  3. Security Notes
    - Users start with 'user' role by default
    - No subscription created by default (must complete payment)
    - Prevents errors when loading user data after registration
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user role with default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_registration();
