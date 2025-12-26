/*
  # Fix Subscription Constraints for Pending State

  ## Changes Made

  1. **Update CHECK Constraints**
     - Allow 'pending' in status constraint
     - Allow 'none' in plan_tier constraint
     - Allow 0 in plan_price constraint
     - This enables users to register with pending subscriptions

  2. **Security**
     - Maintains all existing RLS policies
     - Preserves data integrity with appropriate constraints
*/

-- Drop existing constraints
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_tier_check;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_price_check;

-- Add updated constraints that allow pending state
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
  CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'pending'::text]));

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_tier_check 
  CHECK (plan_tier = ANY (ARRAY['basic'::text, 'pro'::text, 'studio'::text, 'none'::text]));

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_price_check 
  CHECK (plan_price = ANY (ARRAY[0, 10, 20, 30]));