/*
  # Add unique constraint on user_id in subscriptions table

  1. Changes
    - Add unique constraint to user_id column in subscriptions table
    - This allows upsert operations to work correctly when activating subscriptions
  
  2. Notes
    - Required for the activate-subscription edge function to work properly
    - Each user should only have one subscription record
*/

-- Add unique constraint on user_id
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
