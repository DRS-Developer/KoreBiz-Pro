ALTER TABLE public.system_modules
  ADD COLUMN IF NOT EXISTS order_position INTEGER,
  ADD COLUMN IF NOT EXISTS is_sort_enabled BOOLEAN NOT NULL DEFAULT true;

UPDATE public.system_modules
SET order_position = CASE key
  WHEN 'areas_atuacao' THEN 1
  WHEN 'parceiros' THEN 2
  WHEN 'servicos' THEN 3
  WHEN 'portfolio' THEN 4
  WHEN 'paginas' THEN 5
  ELSE order_position
END
WHERE order_position IS NULL;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY COALESCE(order_position, 9999), name, id) AS new_position
  FROM public.system_modules
)
UPDATE public.system_modules sm
SET order_position = ordered.new_position
FROM ordered
WHERE sm.id = ordered.id
  AND sm.order_position IS DISTINCT FROM ordered.new_position;

ALTER TABLE public.system_modules
  ALTER COLUMN order_position SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_modules_order_position
  ON public.system_modules(order_position);

CREATE TABLE IF NOT EXISTS public.system_module_audit_logs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  action TEXT NOT NULL,
  module_key TEXT,
  previous_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  next_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.system_module_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Editors can read system module audit logs"
ON public.system_module_audit_logs
FOR SELECT
USING (public.is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert system module audit logs"
ON public.system_module_audit_logs
FOR INSERT
WITH CHECK (public.is_admin_or_editor());

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
  SET order_position = ranked.new_position
  FROM ranked
  WHERE sm.id = ranked.id
    AND sm.order_position IS DISTINCT FROM ranked.new_position;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_system_modules_config()
RETURNS TABLE (
  id UUID,
  key TEXT,
  name TEXT,
  is_active BOOLEAN,
  is_sort_enabled BOOLEAN,
  order_position INTEGER,
  updated_at TIMESTAMPTZ,
  updated_by UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sm.id,
    sm.key,
    sm.name,
    sm.is_active,
    sm.is_sort_enabled,
    sm.order_position,
    sm.updated_at,
    sm.updated_by
  FROM public.system_modules sm
  ORDER BY sm.order_position;
$$;

CREATE OR REPLACE FUNCTION public.update_system_module_config(
  p_key TEXT,
  p_is_active BOOLEAN,
  p_is_sort_enabled BOOLEAN
)
RETURNS public.system_modules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current public.system_modules%ROWTYPE;
  v_result public.system_modules%ROWTYPE;
  v_active_count INTEGER;
BEGIN
  IF NOT public.is_admin_or_editor() THEN
    RAISE EXCEPTION 'Acesso negado para alterar configuração da sidebar';
  END IF;

  SELECT *
  INTO v_current
  FROM public.system_modules
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Módulo não encontrado: %', p_key;
  END IF;

  IF v_current.is_active = true AND p_is_active = false THEN
    SELECT COUNT(*) INTO v_active_count
    FROM public.system_modules
    WHERE is_active = true;

    IF v_active_count <= 1 THEN
      RAISE EXCEPTION 'Ao menos um botão configurável deve permanecer ativo';
    END IF;
  END IF;

  UPDATE public.system_modules
  SET
    is_active = p_is_active,
    is_sort_enabled = p_is_sort_enabled,
    updated_by = auth.uid()
  WHERE key = p_key
  RETURNING * INTO v_result;

  PERFORM public.rebalance_system_modules_order_positions();

  SELECT *
  INTO v_result
  FROM public.system_modules
  WHERE key = p_key;

  INSERT INTO public.system_module_audit_logs (
    action,
    module_key,
    previous_state,
    next_state,
    changed_by
  ) VALUES (
    'update_module_config',
    p_key,
    to_jsonb(v_current),
    to_jsonb(v_result),
    auth.uid()
  );

  RETURN v_result;
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

  WITH requested_order AS (
    SELECT value AS key, ordinality AS new_position
    FROM unnest(p_keys) WITH ORDINALITY
  )
  UPDATE public.system_modules sm
  SET
    order_position = requested_order.new_position,
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

GRANT EXECUTE ON FUNCTION public.get_system_modules_config() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_system_module_config(TEXT, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_system_modules(TEXT[]) TO authenticated;
