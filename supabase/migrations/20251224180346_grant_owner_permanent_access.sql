/*
  # Grant Owner Permanent Free Access

  1. Changes
    - Ensure owner user has admin role
    - Grant permanent Studio tier subscription with far-future expiration
    - Owner: woolleya129@gmail.com (ID: 1e04ee39-d897-439a-8868-3b0590dd30d8)
  
  2. Security
    - Owner has full admin access to test all features
    - Subscription expires in year 2099 (effectively permanent)
    - No Stripe integration required for owner
*/

-- Ensure admin role exists for owner (will skip if already exists due to unique constraint)
INSERT INTO user_roles (user_id, role, created_at)
VALUES (
  '1e04ee39-d897-439a-8868-3b0590dd30d8',
  'admin',
  now()
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Grant permanent Studio tier subscription to owner (expires year 2099)
-- Using DO block to handle if subscription already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = '1e04ee39-d897-439a-8868-3b0590dd30d8'
  ) THEN
    INSERT INTO subscriptions (user_id, plan_tier, plan_price, status, current_period_end, created_at, updated_at)
    VALUES (
      '1e04ee39-d897-439a-8868-3b0590dd30d8',
      'studio',
      30,
      'active',
      '2099-12-31 23:59:59+00'::timestamptz,
      now(),
      now()
    );
  ELSE
    UPDATE subscriptions
    SET 
      plan_tier = 'studio',
      plan_price = 30,
      status = 'active',
      current_period_end = '2099-12-31 23:59:59+00'::timestamptz,
      stripe_customer_id = NULL,
      stripe_subscription_id = NULL,
      updated_at = now()
    WHERE user_id = '1e04ee39-d897-439a-8868-3b0590dd30d8';
  END IF;
END $$;