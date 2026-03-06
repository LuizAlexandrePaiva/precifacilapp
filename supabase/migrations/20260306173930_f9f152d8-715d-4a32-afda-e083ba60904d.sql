
CREATE OR REPLACE FUNCTION public.update_user_meta(
  p_user_id uuid,
  p_meta_mensal numeric,
  p_meta_liquida numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET meta_mensal = p_meta_mensal,
      meta_liquida = p_meta_liquida,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_meta(p_user_id uuid)
RETURNS TABLE(meta_mensal numeric, meta_liquida numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.meta_mensal, p.meta_liquida
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$;
