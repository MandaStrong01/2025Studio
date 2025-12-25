/*
  # MandaStrong Studio Database Schema
  
  ## Overview
  This migration creates the complete database schema for MandaStrong Studio,
  a movie creation platform with AI tools, media management, and subscription tiers.
  
  ## New Tables
  
  ### 1. `subscriptions`
  Tracks user subscription plans and payment status
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `plan_tier` (text): "basic", "pro", or "studio"
  - `plan_price` (integer): 10, 20, or 30
  - `stripe_customer_id` (text): Stripe customer identifier
  - `stripe_subscription_id` (text): Stripe subscription identifier
  - `status` (text): "active", "cancelled", "expired"
  - `current_period_end` (timestamptz): Subscription end date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. `user_assets`
  Stores all AI-generated and uploaded media files
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `asset_type` (text): "image", "video", "audio", "text"
  - `file_name` (text): Original filename
  - `file_url` (text): Storage URL
  - `tool_name` (text): Which AI tool generated this
  - `metadata` (jsonb): Additional info (dimensions, duration, etc.)
  - `created_at` (timestamptz)
  
  ### 3. `projects`
  User video projects and renders
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `project_name` (text)
  - `description` (text)
  - `timeline_data` (jsonb): Editor timeline/composition data
  - `render_status` (text): "draft", "rendering", "completed", "failed"
  - `output_url` (text): Final rendered video URL
  - `duration_seconds` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `tool_usage`
  Tracks which tools users interact with
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `tool_name` (text)
  - `page_number` (integer): Which page (4-9)
  - `used_at` (timestamptz)
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Authenticated users only
  
  ## Indexes
  - Performance indexes on foreign keys and commonly queried columns
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_tier text NOT NULL CHECK (plan_tier IN ('basic', 'pro', 'studio')),
  plan_price integer NOT NULL CHECK (plan_price IN (10, 20, 30)),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_assets table
CREATE TABLE IF NOT EXISTS user_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('image', 'video', 'audio', 'text')),
  file_name text NOT NULL,
  file_url text NOT NULL,
  tool_name text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text DEFAULT '',
  timeline_data jsonb DEFAULT '{}'::jsonb,
  render_status text NOT NULL DEFAULT 'draft' CHECK (render_status IN ('draft', 'rendering', 'completed', 'failed')),
  output_url text,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create tool_usage table
CREATE TABLE IF NOT EXISTS tool_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  page_number integer NOT NULL CHECK (page_number BETWEEN 4 AND 9),
  used_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_type ON user_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(render_status);
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON tool_usage(user_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_assets
CREATE POLICY "Users can view own assets"
  ON user_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON user_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON user_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for tool_usage
CREATE POLICY "Users can view own tool usage"
  ON tool_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool usage"
  ON tool_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);