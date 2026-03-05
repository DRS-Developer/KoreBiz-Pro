CREATE OR REPLACE FUNCTION public.rebalance_system_modules_order_positions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE WHEN is_active THEN 0 ELSE 1 END,
          order_position,
          name,
          id
      ) AS new_position
    FROM public.system_modules
  )
  UPDATE public.system_modules sm
  SET order_position = -ranked.new_position
  FROM ranked
  WHERE sm.id = ranked.id
    AND sm.order_position IS DISTINCT FROM -ranked.new_position;

  UPDATE public.system_modules
  SET order_position = ABS(order_position)
  WHERE order_position < 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.reorder_system_modules(p_keys TEXT[])
RETURNS SETOF public.system_modules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_keys_count INTEGER;
  v_previous_state JSONB;
  v_next_state JSONB;
  v_offset INTEGER;
BEGIN
  IF NOT public.is_admin_or_editor() THEN
    RAISE EXCEPTION 'Acesso negado para reordenar módulos';
  END IF;

  IF p_keys IS NULL OR array_length(p_keys, 1) IS NULL THEN
    RAISE EXCEPTION 'A lista de módulos para ordenação não pode ser vazia';
  END IF;

  PERFORM 1
  FROM public.system_modules
  FOR UPDATE;

  SELECT COUNT(*) INTO v_total
  FROM public.system_modules;

  SELECT COUNT(DISTINCT value) INTO v_keys_count
  FROM unnest(p_keys) value;

  IF v_total <> v_keys_count THEN
    RAISE EXCEPTION 'A lista de ordenação deve conter todos os módulos configuráveis sem duplicidade';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.system_modules sm
    WHERE sm.key NOT IN (SELECT unnest(p_keys))
  ) OR EXISTS (
    SELECT 1
    FROM unnest(p_keys) keys(value)
    WHERE value NOT IN (SELECT sm.key FROM public.system_modules sm)
  ) THEN
    RAISE EXCEPTION 'A lista contém chaves inválidas para ordenação';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'key', key,
      'is_active', is_active,
      'is_sort_enabled', is_sort_enabled,
      'order_position', order_position
    )
    ORDER BY order_position
  )
  INTO v_previous_state
  FROM public.system_modules;

  SELECT COALESCE(MAX(order_position), 0) + 1000
  INTO v_offset
  FROM public.system_modules;

  WITH requested_order AS (
    SELECT value AS key, ordinality AS new_position
    FROM unnest(p_keys) WITH ORDINALITY
  )
  UPDATE public.system_modules sm
  SET
    order_position = requested_order.new_position + v_offset,
    updated_by = auth.uid()
  FROM requested_order
  WHERE sm.key = requested_order.key
    AND sm.is_sort_enabled = true;

  PERFORM public.rebalance_system_modules_order_positions();

  SELECT jsonb_agg(
    jsonb_build_object(
      'key', key,
      'is_active', is_active,
      'is_sort_enabled', is_sort_enabled,
      'order_position', order_position
    )
    ORDER BY order_position
  )
  INTO v_next_state
  FROM public.system_modules;

  INSERT INTO public.system_module_audit_logs (
    action,
    module_key,
    previous_state,
    next_state,
    changed_by
  ) VALUES (
    'reorder_modules',
    NULL,
    COALESCE(v_previous_state, '[]'::jsonb),
    COALESCE(v_next_state, '[]'::jsonb),
    auth.uid()
  );

  RETURN QUERY
  SELECT sm.*
  FROM public.system_modules sm
  ORDER BY sm.order_position;
END;
$$;
