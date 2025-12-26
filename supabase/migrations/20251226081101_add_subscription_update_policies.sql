/*
  # Add Subscription Update Policies for Stripe Integration
  
  1. New Policies
    - Service role can update subscription status
    - Allows Stripe webhooks to activate subscriptions
  
  2. Changes Made
    - Added policy for system to update subscription status
    - Added policy for system to update subscription details
  
  3. Security
    - Only service role can update subscriptions
    - Users can only read their subscriptions
    - Maintains data integrity for payment flow
*/

-- Allow service role to update subscriptions (for Stripe webhooks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Service role can update subscriptions'
  ) THEN
    CREATE POLICY "Service role can update subscriptions"
      ON subscriptions FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Allow service role to insert subscriptions (for manual activation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Service role can insert subscriptions'
  ) THEN
    CREATE POLICY "Service role can insert subscriptions"
      ON subscriptions FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;
