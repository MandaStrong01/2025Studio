-- Setup Test Users for MandaStrong Studio
-- Run this SQL in your Supabase SQL Editor to create 3 test accounts

-- These test users will have active premium subscriptions and bypass payment

DO $$
DECLARE
  test_user_id1 uuid;
  test_user_id2 uuid;
  test_user_id3 uuid;
BEGIN
  -- Test User 1: test1@mandastrong.com
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
    updated_at,
    confirmation_token,
    recovery_token
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
    now(),
    '',
    ''
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('TestPass123!', gen_salt('bf')),
    email_confirmed_at = now()
  RETURNING id INTO test_user_id1;

  IF test_user_id1 IS NULL THEN
    SELECT id INTO test_user_id1 FROM auth.users WHERE email = 'test1@mandastrong.com';
  END IF;

  -- Test User 2: test2@mandastrong.com
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
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test2@mandastrong.com',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test User 2"}'::jsonb,
    now(),
    now(),
    '',
    ''
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('TestPass123!', gen_salt('bf')),
    email_confirmed_at = now()
  RETURNING id INTO test_user_id2;

  IF test_user_id2 IS NULL THEN
    SELECT id INTO test_user_id2 FROM auth.users WHERE email = 'test2@mandastrong.com';
  END IF;

  -- Test User 3: test3@mandastrong.com
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
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test3@mandastrong.com',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Test User 3"}'::jsonb,
    now(),
    now(),
    '',
    ''
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('TestPass123!', gen_salt('bf')),
    email_confirmed_at = now()
  RETURNING id INTO test_user_id3;

  IF test_user_id3 IS NULL THEN
    SELECT id INTO test_user_id3 FROM auth.users WHERE email = 'test3@mandastrong.com';
  END IF;

  -- Create subscriptions for all test users
  INSERT INTO subscriptions (user_id, status, plan_tier, plan_price, started_at, current_period_end)
  VALUES
    (test_user_id1, 'active', 'premium', 2999, now(), now() + interval '10 years'),
    (test_user_id2, 'active', 'premium', 2999, now(), now() + interval '10 years'),
    (test_user_id3, 'active', 'premium', 2999, now(), now() + interval '10 years')
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    plan_tier = 'premium',
    plan_price = 2999,
    started_at = now(),
    current_period_end = now() + interval '10 years',
    updated_at = now();

  -- Create user profiles
  INSERT INTO user_profiles (id, display_name)
  VALUES
    (test_user_id1, 'Test User 1'),
    (test_user_id2, 'Test User 2'),
    (test_user_id3, 'Test User 3')
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name;

  -- Create user roles
  INSERT INTO user_roles (user_id, role)
  VALUES
    (test_user_id1, 'user'),
    (test_user_id2, 'user'),
    (test_user_id3, 'user')
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'user';

  RAISE NOTICE 'Test users created successfully!';
END $$;

-- Verify test users were created
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL as confirmed,
  s.status as subscription_status,
  s.plan_tier,
  s.current_period_end
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email IN ('test1@mandastrong.com', 'test2@mandastrong.com', 'test3@mandastrong.com')
ORDER BY u.email;
