-- Trigger function to sync auth.users to users table
-- This ensures that when a user is created in Supabase Auth, 
-- a corresponding record is created in the users table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id INTEGER;
BEGIN
  -- Check if user exists by email (since user_id types differ: UUID vs INTEGER)
  SELECT user_id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.email 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    -- Update existing user
    UPDATE public.users
    SET 
      email = NEW.email,
      password_hash = 'supabase_auth',
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = existing_user_id;
  ELSE
    -- Insert new user (use nextval for INTEGER user_id)
    -- Note: This creates a new INTEGER ID, UUID is stored in Supabase Auth only
    INSERT INTO public.users (email, password_hash, first_name, last_name)
    VALUES (
      NEW.email,
      'supabase_auth',
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also sync on update
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update by email since user_id types differ (UUID vs INTEGER)
  UPDATE public.users
  SET 
    email = NEW.email,
    updated_at = CURRENT_TIMESTAMP
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

