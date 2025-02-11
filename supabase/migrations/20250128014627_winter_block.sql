/*
  # Add brand fields and city enum to profiles table

  1. Changes
    - Create city enum type with predefined values
    - Add brand_name and brand_logo columns
    - Add profile_photo column
    - Convert city column to use new enum type

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Create city enum type
CREATE TYPE city_enum AS ENUM (
  'Delhi',
  'Pune',
  'Noida',
  'Gurgaon',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Jaipur',
  'Ahmedabad',
  'Kolkata',
  'Lucknow'
);

-- Add new columns
ALTER TABLE profiles
  ADD COLUMN brand_name TEXT,
  ADD COLUMN brand_logo TEXT,
  ADD COLUMN profile_photo TEXT;

-- Convert city column to use enum
-- First, create a temporary column
ALTER TABLE profiles ADD COLUMN city_new city_enum;

-- Update the new column based on existing values
DO $$
BEGIN
  UPDATE profiles
  SET city_new = city::city_enum
  WHERE city IS NOT NULL
  AND city IN (
    'Delhi', 'Pune', 'Noida', 'Gurgaon', 'Mumbai',
    'Bengaluru', 'Chennai', 'Jaipur', 'Ahmedabad',
    'Kolkata', 'Lucknow'
  );
END $$;

-- Drop the old column and rename the new one
ALTER TABLE profiles DROP COLUMN city;
ALTER TABLE profiles RENAME COLUMN city_new TO city;