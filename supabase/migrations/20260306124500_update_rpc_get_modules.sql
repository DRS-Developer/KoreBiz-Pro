-- Update get_system_modules_config to include Menu SideBar configurations
-- This ensures backward compatibility while exposing new features

-- Drop existing function to allow return type change
DROP FUNCTION IF EXISTS get_system_modules_config();

CREATE OR REPLACE FUNCTION get_system_modules_config()
RETURNS TABLE (
  id UUID,
  key TEXT,
  name TEXT,
  is_active BOOLEAN,
  order_position INTEGER,
  is_sort_enabled BOOLEAN,
  -- New fields from Menu SideBar Config
  config_id UUID,
  nome_personalizado TEXT,
  visibilidade_personalizada BOOLEAN,
  metadados JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.key,
    -- If a custom name is configured, use it. Otherwise, use default name.
    COALESCE(msc.nome_botao, sm.name) AS name,
    -- If a custom status is configured, use it. Otherwise, use default active status.
    COALESCE(msc.status_botao, sm.is_active) AS is_active,
    sm.order_position,
    sm.is_sort_enabled,
    msc.id AS config_id,
    msc.nome_botao AS nome_personalizado,
    msc.visibilidade_botao AS visibilidade_personalizada,
    msc.metadados
  FROM 
    public.system_modules sm
  LEFT JOIN 
    public.menu_sidebar_config msc ON sm.id = msc.menu_ordenacao_id
  WHERE
    -- Filter out items that are strictly invisible in the sidebar config
    (msc.visibilidade_botao IS NULL OR msc.visibilidade_botao = true)
  ORDER BY 
    sm.order_position ASC;
END;
$$ LANGUAGE plpgsql;
