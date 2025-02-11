/*
  # Update activities table schema
  
  1. Changes
    - Make name column nullable
    - Add activity_id column
    - Add function to generate activity_id
    - Add trigger for auto-generating activity_id
  
  2. New Functions
    - generate_activity_id: Creates formatted activity ID
  
  3. New Triggers
    - set_activity_id: Automatically sets activity_id on insert
*/

-- Make name column nullable
ALTER TABLE activities ALTER COLUMN name DROP NOT NULL;

-- Add activity_id column
ALTER TABLE activities ADD COLUMN activity_id TEXT;

-- Create function to generate activity_id
CREATE OR REPLACE FUNCTION generate_activity_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Format: brand-city-location-start_date-end_date
  NEW.activity_id := 
    COALESCE(NEW.brand, 'unknown') || '-' ||
    COALESCE(NEW.city, 'unknown') || '-' ||
    COALESCE(NEW.location, 'unknown') || '-' ||
    COALESCE(to_char(NEW.start_date, 'YYYYMMDD'), 'unknown') || '-' ||
    COALESCE(to_char(NEW.end_date, 'YYYYMMDD'), 'unknown');
    
  -- Replace spaces and special characters with hyphens
  NEW.activity_id := regexp_replace(NEW.activity_id, '[^a-zA-Z0-9]+', '-', 'g');
  
  -- Convert to lowercase
  NEW.activity_id := lower(NEW.activity_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set activity_id on insert
CREATE TRIGGER set_activity_id
  BEFORE INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION generate_activity_id();