-- Create brand_name enum type
CREATE TYPE brand_name_enum AS ENUM (
  'Amazon',
  'Flipkart',
  'DCB Bank',
  'Spencers',
  'Tata 1mg',
  'HDFC Life',
  'Apnamart'
);

-- Modify profiles table to use brand_name_enum
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS brand_name,
  ADD COLUMN brand_name brand_name_enum;

-- Update RLS policies to allow access to brand_name
CREATE POLICY "Users can update own brand_name"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);