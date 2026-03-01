DROP POLICY IF EXISTS "Admin Write Settings" ON public.site_settings;

CREATE POLICY "Admin Write Settings" ON public.site_settings
FOR UPDATE TO authenticated
USING (public.is_admin_or_editor())
WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admin Insert Settings" ON public.site_settings;
CREATE POLICY "Admin Insert Settings" ON public.site_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admin Delete Settings" ON public.site_settings;
CREATE POLICY "Admin Delete Settings" ON public.site_settings
FOR DELETE TO authenticated
USING (public.is_admin_or_editor());
