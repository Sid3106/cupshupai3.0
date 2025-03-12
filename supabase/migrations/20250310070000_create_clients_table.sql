-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_brand_name CHECK (
        brand_name IN ('Amazon', 'Flipkart', 'DCB Bank', 'Spencers', 'Tata 1mg', 'HDFC Life', 'Apnamart')
    ),
    CONSTRAINT unique_user_id UNIQUE(user_id)
);

-- Add RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Service role can manage clients" ON public.clients;

-- Recreate policies
CREATE POLICY "Clients can view own data"
    ON public.clients FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage clients"
    ON public.clients FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create function to create client entry
CREATE OR REPLACE FUNCTION public.handle_client_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if the new user is a client
    IF NEW.raw_user_meta_data->>'role' = 'Client' THEN
        INSERT INTO public.clients (user_id, brand_name)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'brand_name'
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger to automatically create client entry
DROP TRIGGER IF EXISTS on_auth_user_created_create_client ON auth.users;
CREATE TRIGGER on_auth_user_created_create_client
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_client_creation(); 