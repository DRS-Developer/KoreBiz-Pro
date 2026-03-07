-- Add new columns to system_modules to centralize configuration
ALTER TABLE public.system_modules 
ADD COLUMN IF NOT EXISTS custom_name TEXT,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Migrate existing data from menu_sidebar_config to system_modules
UPDATE public.system_modules sm
SET 
  custom_name = msc.nome_botao,
  is_visible = msc.visibilidade_botao
FROM public.menu_sidebar_config msc
WHERE sm.id = msc.menu_ordenacao_id;

-- Update the RPC to read directly from system_modules (simpler, faster)
CREATE OR REPLACE FUNCTION get_system_modules_config()
RETURNS TABLE (
  id UUID,
  key TEXT,
  name TEXT,
  is_active BOOLEAN,
  order_position INTEGER,
  is_sort_enabled BOOLEAN,
  config_id UUID, -- Keeping for compatibility temporarily (will be same as id)
  nome_personalizado TEXT,
  visibilidade_personalizada BOOLEAN,
  metadados JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.key,
    COALESCE(sm.custom_name, sm.name) AS name,
    sm.is_active,
    sm.order_position,
    sm.is_sort_enabled,
    sm.id AS config_id,
    sm.custom_name AS nome_personalizado,
    sm.is_visible AS visibilidade_personalizada,
    '{}'::jsonb AS metadados
  FROM 
    public.system_modules sm
  ORDER BY 
    sm.order_position ASC;
END;
$$ LANGUAGE plpgsql;

-- Create a dedicated RPC for updating module details
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
$$ LANGUAGE plpgsql;
