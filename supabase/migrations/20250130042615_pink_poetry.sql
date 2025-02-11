/*
  # Update Vendors RLS Policy

  1. Changes
    - Drop existing RLS policies on vendors table
    - Create new policy using cupshup_admins table for admin access
  
  2. Security
    - Enable RLS
    - Add policy for both CupShup admins and vendors to view data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "CupShup users can view all vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can view own record" ON vendors;
DROP POLICY IF EXISTS "CupShup users can manage vendors" ON vendors;
DROP POLICY IF EXISTS "CupShup see all vendors" ON vendors;

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create new policy
CREATE POLICY "Vendor or CupShup can see vendor row"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.cupshup_admins c
    WHERE c.user_id = auth.uid()
  )
  OR user_id = auth.uid()
);