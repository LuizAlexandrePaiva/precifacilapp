DROP FUNCTION public.update_user_meta(uuid, numeric, numeric);

CREATE FUNCTION public.update_user_meta(p_user_id uuid, p_meta_mensal numeric, p_meta_liquida numeric, p_preco_hora numeric DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE profiles
  SET meta_mensal = p_meta_mensal,
      meta_liquida = p_meta_liquida,
      preco_hora = COALESCE(p_preco_hora, profiles.preco_hora)
  WHERE id = p_user_id;
END;
$function$;