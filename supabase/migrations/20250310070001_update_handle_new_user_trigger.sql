-- Update the handle_new_user function to handle both profiles and clients
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- First, create the profile entry
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        phone,
        city
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'CupShup'),
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'city'
    );

    -- If the user is a client, create entry in clients table
    IF NEW.raw_user_meta_data->>'role' = 'Client' THEN
        INSERT INTO public.clients (
            user_id,
            brand_name
        ) VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'brand_name'
        );
    END IF;

    RETURN NEW;
END;
$$; 