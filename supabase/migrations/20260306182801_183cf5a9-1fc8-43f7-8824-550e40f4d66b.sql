-- Add onboarding column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_concluido boolean DEFAULT false;

-- Mark existing users as onboarded
UPDATE profiles SET onboarding_concluido = true;

-- Update trigger to include new column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, meta_mensal, meta_liquida, onboarding_concluido)
  VALUES (NEW.id, 5000, NULL, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;