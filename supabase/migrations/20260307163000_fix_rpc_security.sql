-- Update the RPC to be SECURITY DEFINER to bypass RLS issues
-- This is safe because we check is_admin_or_editor() inside
CREATE OR REPLACE FUNCTION update_system_module_details(
  p_id UUID,
  p_custom_name TEXT,
  p_is_visible BOOLEAN,
  p_is_active BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin_or_editor() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.system_modules
  SET 
    custom_name = p_custom_name,
    is_visible = p_is_visible,
    is_active = p_is_active,
    updated_at = timezone('utc'::text, now()),
    updated_by = auth.uid()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
