-- Grant necessary permissions to access auth schema
GRANT USAGE ON SCHEMA auth TO postgres, service_role;

-- Ensure the function has proper permissions to access auth schema
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
        AND tgenabled = 'O'
    ) THEN
        RAISE EXCEPTION 'Trigger was not created or is not enabled';
    END IF;
END
$$; 