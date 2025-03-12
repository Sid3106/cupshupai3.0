-- Add policy for trigger function
CREATE POLICY "Trigger can create profiles"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add policy for trigger function to create clients
CREATE POLICY "Trigger can create clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (true); 