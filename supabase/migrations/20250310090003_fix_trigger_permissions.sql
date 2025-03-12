-- Grant permissions to the trigger function
GRANT ALL ON profiles TO postgres, authenticated;
GRANT ALL ON clients TO postgres, authenticated;
GRANT ALL ON vendors TO postgres, authenticated;

-- Update the trigger function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    user_name text;
    user_phone text;
    user_brand_name text;
BEGIN
    -- Log the raw user metadata for debugging
    RAISE LOG 'New user metadata: %', NEW.raw_user_meta_data;

    -- Extract data from user_metadata
    user_role := NEW.raw_user_meta_data->>'role';
    user_name := NEW.raw_user_meta_data->>'name';
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_brand_name := NEW.raw_user_meta_data->>'brand_name';

    -- Create base profile
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, COALESCE(user_role, 'Client'));

    -- Handle different roles
    CASE 
        WHEN user_role = 'Client' THEN
            INSERT INTO public.clients (id, name, phone, brand_name)
            VALUES (NEW.id, user_name, user_phone, user_brand_name);
        WHEN user_role = 'Vendor' THEN
            INSERT INTO public.vendors (id, name, phone)
            VALUES (NEW.id, user_name, user_phone);
        ELSE
            RAISE LOG 'Unknown role: %', user_role;
    END CASE;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 