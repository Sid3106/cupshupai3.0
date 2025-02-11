/*
  # Fix Profile Policies

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies
    - Add service role policy for profile creation
    - Update permissions

  2. Security
    - Enable RLS
    - Grant proper permissions
    - Ensure service role can create profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "CupShup users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "CupShup users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'CupShup'::user_role);

CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO service_role;
GRANT SELECT, UPDATE ON profiles TO authenticated;