-- Create system_modules table
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public system_modules are viewable by everyone" 
ON public.system_modules FOR SELECT USING (true);

CREATE POLICY "Admins and Editors can update system_modules" 
ON public.system_modules FOR UPDATE USING (public.is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert system_modules" 
ON public.system_modules FOR INSERT WITH CHECK (public.is_admin_or_editor());

-- Seed data
INSERT INTO public.system_modules (key, name) VALUES
  ('areas_atuacao', 'Áreas de Atuação'),
  ('servicos', 'Serviços'),
  ('parceiros', 'Parceiros'),
  ('portfolio', 'Portfólio'),
  ('paginas', 'Páginas')
ON CONFLICT (key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_system_modules_updated_at BEFORE UPDATE ON public.system_modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
