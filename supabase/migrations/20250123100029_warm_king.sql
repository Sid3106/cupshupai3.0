/*
  # Activities and Assignments Schema

  1. New Tables
    - `activities`
      - Core marketing activity/project data
      - Tracks status, timeline, and ownership
      - Links to client (brand owner)
    - `activity_assignments`
      - Maps vendors to activities (many-to-many)
      - Includes vendor-specific instructions
  
  2. Security
    - Enable RLS on both tables
    - Policies for:
      - CupShup users can do everything
      - Vendors can read assigned activities
      - Clients can read their brand's activities
*/

-- Create activity status enum
CREATE TYPE activity_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES profiles(user_id),
  city TEXT,
  location TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  instructions TEXT,
  status activity_status DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  brand TEXT NOT NULL,
  CONSTRAINT valid_dates CHECK (start_date <= end_date)
);

-- Create activity assignments table
CREATE TABLE IF NOT EXISTS activity_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES profiles(user_id),
  instructions TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, vendor_id)
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_assignments ENABLE ROW LEVEL SECURITY;

-- Activities policies
CREATE POLICY "CupShup users have full access to activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Vendors can view assigned activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM activity_assignments
      WHERE activity_id = activities.id
      AND vendor_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'Vendor'
    )
  );

CREATE POLICY "Clients can view their brand activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'Client'
    )
  );

-- Activity assignments policies
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

-- Add updated_at trigger to activities
CREATE TRIGGER set_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();