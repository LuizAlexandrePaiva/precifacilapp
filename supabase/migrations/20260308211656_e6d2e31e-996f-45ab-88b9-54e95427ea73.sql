DROP FUNCTION public.get_user_meta(uuid);

CREATE FUNCTION public.get_user_meta(p_user_id uuid)
 RETURNS TABLE(meta_mensal numeric, meta_liquida numeric, preco_hora numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.meta_mensal, p.meta_liquida, p.preco_hora
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$function$;