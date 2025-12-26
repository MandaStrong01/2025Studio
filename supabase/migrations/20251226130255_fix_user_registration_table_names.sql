/*
  # Fix User Registration Function Table Names

  ## Changes Made

  1. **Correct Function Table References**
     - Fix `handle_new_user_registration` to use correct table names:
       - Use `user_roles` (not `user_profiles`)
       - Use `subscriptions` (not `user_subscriptions`)
     - Maintain immutable search_path for security
     - Insert into `user_roles` with default 'user' role
     - Insert into `subscriptions` with 'pending' status

  ## Security
  - Maintains SECURITY DEFINER with immutable search_path
  - Proper error handling with ON CONFLICT clauses
*/

-- Fix function to use correct table names
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user role with default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create pending subscription requiring payment
  INSERT INTO public.subscriptions (
    user_id, 
    status, 
    plan_tier,
    plan_price
  )
  VALUES (
    NEW.id, 
    'pending',
    'basic',
    10
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;