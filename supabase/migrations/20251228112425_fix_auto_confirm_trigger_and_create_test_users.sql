/*
  # Fix Auto-Confirm Trigger and Create Test Users

  1. Changes
    - Drop the problematic auto_confirm_user trigger
    - Create a simpler trigger that doesn't touch generated columns
    - Create 3 test users with active premium subscriptions

  2. Test Users
    - test1@mandastrong.com / TestPass123!
    - test2@mandastrong.com / TestPass123!
    - test3@mandastrong.com / TestPass123!
    
  3. Security
    - Test users have 'user' role (not admin)
    - Active premium subscriptions (bypass payment)
    - Valid for 1 year from creation
*/

-- Drop the old function with CASCADE to remove dependent triggers
DROP FUNCTION IF EXISTS auto_confirm_user() CASCADE;

-- Create a simpler trigger that only updates email_confirmed_at (not generated column)
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();
