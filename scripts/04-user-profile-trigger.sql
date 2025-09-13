-- Create a trigger to automatically create user profiles when users sign up

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    employee_number, 
    department, 
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'employee_number' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'employee_number')::INTEGER
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'department', 'MobiAzores'),
    'fleet_manager'::user_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
