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
