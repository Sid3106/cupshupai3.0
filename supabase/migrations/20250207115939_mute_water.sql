/*
  # Add target and incentive columns to activity_assignments

  1. Changes
    - Add target column (required) to track assignment goals
    - Add incentive column (optional) for vendor compensation
    - Add check constraint to ensure target is positive
    - Add check constraint to ensure incentive is non-negative when provided
*/

-- Add new columns with constraints
ALTER TABLE activity_assignments
  ADD COLUMN target INTEGER NOT NULL,
  ADD COLUMN incentive INTEGER,
  ADD CONSTRAINT activity_assignments_target_positive CHECK (target > 0),
  ADD CONSTRAINT activity_assignments_incentive_non_negative CHECK (incentive IS NULL OR incentive >= 0);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "CupShup users have full access to assignments" ON activity_assignments;
DROP POLICY IF EXISTS "Vendors can view their assignments" ON activity_assignments;

CREATE POLICY "CupShup users have full access to assignments"
  ON activity_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Vendors can view their assignments"
  ON activity_assignments
  FOR SELECT
  TO authenticated
  USING (vendor_id = auth.uid());