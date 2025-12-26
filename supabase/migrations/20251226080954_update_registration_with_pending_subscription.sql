/*
  # Update Registration Flow to Create Pending Subscription
  
  1. Changes Made
    - Modified registration trigger to create pending subscription
    - Users start with 'pending' status requiring payment
    - Only 'active' subscriptions grant access to platform
  
  2. Business Logic
    - New users get user_role AND pending subscription
    - Subscription activates only after successful Stripe payment
    - Forces payment completion before platform access
  
  3. Security
    - Maintains RLS policies
    - Subscription status controls feature access
*/

-- Drop and recreate the registration handler with subscription creation
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
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
    'none',
    0
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger already exists from previous migration, function will be updated
