-- Create menu_sidebar_config table
CREATE TABLE IF NOT EXISTS public.menu_sidebar_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_ordenacao_id UUID NOT NULL REFERENCES public.system_modules(id) ON DELETE CASCADE,
  nome_botao TEXT NOT NULL,
  status_botao BOOLEAN DEFAULT true, -- Ativo/Inativo
  visibilidade_botao BOOLEAN DEFAULT true, -- Visível/Invisível
  data_ultima_configuracao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  usuario_ultima_alteracao UUID REFERENCES auth.users(id),
  metadados JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_menu_config UNIQUE (menu_ordenacao_id)
);

-- Enable RLS
ALTER TABLE public.menu_sidebar_config ENABLE ROW LEVEL SECURITY;

-- Create policies (DROP IF EXISTS to ensure idempotency)
DROP POLICY IF EXISTS "Public menu configs are viewable by everyone" ON public.menu_sidebar_config;
CREATE POLICY "Public menu configs are viewable by everyone" 
ON public.menu_sidebar_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Editors can manage menu configs" ON public.menu_sidebar_config;
CREATE POLICY "Admins and Editors can manage menu configs" 
ON public.menu_sidebar_config FOR ALL USING (public.is_admin_or_editor());

-- Create audit function for this table
CREATE OR REPLACE FUNCTION update_menu_sidebar_audit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_ultima_configuracao = timezone('utc'::text, now());
  NEW.usuario_ultima_alteracao = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updates (DROP IF EXISTS to ensure idempotency)
DROP TRIGGER IF EXISTS update_menu_sidebar_timestamp ON public.menu_sidebar_config;
CREATE TRIGGER update_menu_sidebar_timestamp
BEFORE UPDATE ON public.menu_sidebar_config
FOR EACH ROW
EXECUTE PROCEDURE update_menu_sidebar_audit();

-- Create view to merge system_modules with menu_sidebar_config (Integration)
CREATE OR REPLACE VIEW public.view_menu_sidebar_completo AS
SELECT 
  sm.id AS modulo_id,
  sm.key AS modulo_key,
  sm.name AS modulo_nome_original,
  sm.order_position,
  COALESCE(msc.id, uuid_generate_v4()) AS config_id, -- Generate dummy ID if null to ensure view stability
  COALESCE(msc.nome_botao, sm.name) AS nome_exibicao,
  COALESCE(msc.status_botao, sm.is_active) AS status_ativo,
  COALESCE(msc.visibilidade_botao, true) AS visivel,
  msc.metadados
FROM 
  public.system_modules sm
LEFT JOIN 
  public.menu_sidebar_config msc ON sm.id = msc.menu_ordenacao_id
WHERE
  (msc.visibilidade_botao IS NULL OR msc.visibilidade_botao = true); -- Lógica de filtrar invisíveis na view de leitura pública

-- Grant access to view
GRANT SELECT ON public.view_menu_sidebar_completo TO anon, authenticated, service_role;
