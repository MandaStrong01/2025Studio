/*
  # Update Registration to Use None Plan

  ## Changes Made

  1. **Update Registration Function**
     - Create subscriptions with 'none' plan_tier instead of 'basic'
     - Set plan_price to 0 instead of 10
     - Keep status as 'pending' until user selects a plan
     - This ensures users must actively select and pay for a plan

  2. **Business Logic**
     - New users start with no plan selected
     - Subscription activates when they choose and pay for a plan
     - Edge function will update plan_tier, plan_price, and status together
*/

-- Update registration function to create subscriptions with no plan
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
  
  -- Create pending subscription with no plan selected
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
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;