-- Create admin view for Menu Sidebar configuration (includes hidden items)
CREATE OR REPLACE VIEW public.view_menu_sidebar_admin AS
SELECT 
  sm.id AS modulo_id,
  sm.key AS modulo_key,
  sm.name AS modulo_nome_original,
  sm.order_position,
  msc.id AS config_id,
  COALESCE(msc.nome_botao, sm.name) AS nome_exibicao,
  COALESCE(msc.status_botao, sm.is_active) AS status_ativo,
  COALESCE(msc.visibilidade_botao, true) AS visivel,
  msc.visibilidade_botao AS visibilidade_personalizada,
  msc.metadados
FROM 
  public.system_modules sm
LEFT JOIN 
  public.menu_sidebar_config msc ON sm.id = msc.menu_ordenacao_id;

-- Grant permissions (restricted to authenticated users/admins)
GRANT SELECT ON public.view_menu_sidebar_admin TO authenticated, service_role;

-- Ensure it's security invoker to respect RLS on underlying tables
ALTER VIEW public.view_menu_sidebar_admin SET (security_invoker = true);
