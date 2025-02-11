/*
  # Update Profiles RLS Policy

  1. Changes
    - Drop existing RLS policies on profiles table
    - Create new policy using cupshup_admins table for admin access
  
  2. Security
    - Enable RLS
    - Add policy for both CupShup admins and users to view data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "CupShup users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new policy
CREATE POLICY "CupShup sees all profiles or own row"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM cupshup_admins c
    WHERE c.user_id = auth.uid()
  )
  OR user_id = auth.uid()
);