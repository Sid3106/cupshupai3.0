/*
  # Tasks and Clients Schema

  1. New Tables
    - `tasks`
      - Tracks vendor tasks for activities
      - Links to activities and vendors
      - Includes status tracking
    - `clients`
      - Extended client information
      - Links to profiles for authentication
  
  2. Security
    - Enable RLS on both tables
    - Policies for:
      - CupShup users can do everything
      - Vendors can manage their own tasks
      - Clients can view tasks for their activities
*/

-- Create task status enum
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES profiles(user_id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "CupShup users have full access to tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Vendors can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "Clients can view tasks for their activities"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = tasks.activity_id
      AND a.client_id = auth.uid()
    )
  );

-- Clients policies
CREATE POLICY "CupShup users have full access to clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Clients can view own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create function to validate vendor assignment
CREATE OR REPLACE FUNCTION validate_vendor_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM activity_assignments
    WHERE activity_id = NEW.activity_id
    AND vendor_id = NEW.vendor_id
  ) THEN
    RAISE EXCEPTION 'Vendor must be assigned to the activity before creating tasks';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate vendor assignment
CREATE TRIGGER validate_vendor_assignment_trigger
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_vendor_assignment();