CREATE TABLE IF NOT EXISTS public.home_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT NOT NULL DEFAULT 'home',
    widget_type TEXT NOT NULL,
    variant TEXT NOT NULL DEFAULT 'default',
    order_index INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_binding JSONB,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.home_widget_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id UUID,
    action TEXT NOT NULL,
    previous_state JSONB,
    next_state JSONB,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_home_widgets_page_order
ON public.home_widgets(page_key, order_index);

CREATE INDEX IF NOT EXISTS idx_home_widgets_page_enabled
ON public.home_widgets(page_key, enabled);

ALTER TABLE public.home_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_widget_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_home_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_home_widgets_updated_at ON public.home_widgets;
CREATE TRIGGER trg_home_widgets_updated_at
BEFORE UPDATE ON public.home_widgets
FOR EACH ROW
EXECUTE FUNCTION public.set_home_widgets_updated_at();

CREATE OR REPLACE FUNCTION public.has_home_widget_write_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'editor', 'editor-conteudo', 'editor_conteudo', 'editor-conteúdo')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Allow public read access on home_widgets"
ON public.home_widgets FOR SELECT
TO public
USING (page_key = 'home');

CREATE POLICY "Allow content editors insert home_widgets"
ON public.home_widgets FOR INSERT
TO authenticated
WITH CHECK (public.has_home_widget_write_access());

CREATE POLICY "Allow content editors update home_widgets"
ON public.home_widgets FOR UPDATE
TO authenticated
USING (public.has_home_widget_write_access())
WITH CHECK (public.has_home_widget_write_access());

CREATE POLICY "Allow content editors delete home_widgets"
ON public.home_widgets FOR DELETE
TO authenticated
USING (public.has_home_widget_write_access());

CREATE POLICY "Allow content editors read home_widget_audit_logs"
ON public.home_widget_audit_logs FOR SELECT
TO authenticated
USING (public.has_home_widget_write_access());

CREATE POLICY "Allow service role insert home_widget_audit_logs"
ON public.home_widget_audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.reorder_home_widgets(
  p_page_key TEXT,
  p_widget_ids UUID[]
)
RETURNS SETOF public.home_widgets AS $$
DECLARE
  idx INTEGER;
BEGIN
  IF p_page_key IS NULL OR length(trim(p_page_key)) = 0 THEN
    RAISE EXCEPTION 'page_key é obrigatório';
  END IF;

  IF p_widget_ids IS NULL OR array_length(p_widget_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Lista de widgets vazia';
  END IF;

  IF NOT public.has_home_widget_write_access() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  FOR idx IN 1..array_length(p_widget_ids, 1) LOOP
    UPDATE public.home_widgets
       SET order_index = idx - 1,
           updated_by = auth.uid()
     WHERE id = p_widget_ids[idx]
       AND page_key = p_page_key;
  END LOOP;

  RETURN QUERY
    SELECT *
    FROM public.home_widgets
    WHERE page_key = p_page_key
    ORDER BY order_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reorder_home_widgets(TEXT, UUID[]) TO authenticated;
