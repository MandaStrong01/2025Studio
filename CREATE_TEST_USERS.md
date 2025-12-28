# Test User Accounts

## Test Login Credentials

Use these accounts to test your live app with full subscription access:

### Test User 1
- **Email:** test1@mandastrong.com
- **Password:** TestPass123!
- **Plan:** Premium (Active)
- **Expires:** 1 year from creation

### Test User 2
- **Email:** test2@mandastrong.com
- **Password:** TestPass123!
- **Plan:** Premium (Active)
- **Expires:** 1 year from creation

### Test User 3
- **Email:** test3@mandastrong.com
- **Password:** TestPass123!
- **Plan:** Premium (Active)
- **Expires:** 1 year from creation

## Features

All test accounts have:
- ✅ Active premium subscription (no payment required)
- ✅ Full access to all app features
- ✅ Upload and create movies
- ✅ Access to all AI tools
- ✅ Access to media library
- ✅ Community features

## Setup Instructions

Run the following SQL in your Supabase SQL Editor to create these test accounts:

```sql
-- Create test user 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test1@mandastrong.com',
  crypt('TestPass123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Test User 1"}'::jsonb,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Get the user ID and create subscription
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'test1@mandastrong.com';

  INSERT INTO subscriptions (user_id, status, plan_tier, plan_price, started_at, current_period_end)
  VALUES (user_id, 'active', 'premium', 2999, now(), now() + interval '1 year')
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    plan_tier = 'premium',
    current_period_end = now() + interval '1 year';

  INSERT INTO user_profiles (id, display_name)
  VALUES (user_id, 'Test User 1')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- Repeat for test2 and test3
-- (Replace test1 with test2 and test3 in the above SQL)
```

## Quick Setup via Supabase Dashboard

Alternatively, you can create these users through your deployed app:

1. Go to your app's signup page
2. Sign up with each email address
3. Then run this SQL to activate their subscriptions:

```sql
UPDATE subscriptions
SET
  status = 'active',
  plan_tier = 'premium',
  plan_price = 2999,
  started_at = now(),
  current_period_end = now() + interval '1 year'
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('test1@mandastrong.com', 'test2@mandastrong.com', 'test3@mandastrong.com')
);
```

## Usage

1. Go to your live app on Render
2. Click "Login"
3. Enter one of the test email addresses and password
4. You'll have immediate access with full premium features
5. No payment required - subscription is already active

## Important Notes

- These are permanent test accounts for your platform
- They bypass all payment flows
- Useful for demos, testing, and QA
- Share these credentials with your team for testing
- Consider creating more test accounts as needed using the same SQL pattern
