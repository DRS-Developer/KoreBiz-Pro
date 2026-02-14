export const INSTALL_SCHEMA_SQL = `
-- MIGRATION: 20250125000000_initial_schema.sql --

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('admin', 'editor')) DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    meta_title TEXT,
    meta_description TEXT,
    featured_image TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    icon TEXT,
    image_url TEXT,
    category TEXT,
    "order" INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create areas (practice areas) table
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    "order" INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    client TEXT,
    completion_date DATE,
    category TEXT,
    image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    "order" INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'read', 'archived')) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Helper function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pages Policies
DROP POLICY IF EXISTS "Public pages are viewable by everyone" ON public.pages;
CREATE POLICY "Public pages are viewable by everyone" ON public.pages FOR SELECT USING (published = true OR is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can insert pages" ON public.pages;
CREATE POLICY "Admins and Editors can insert pages" ON public.pages FOR INSERT WITH CHECK (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update pages" ON public.pages;
CREATE POLICY "Admins and Editors can update pages" ON public.pages FOR UPDATE USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete pages" ON public.pages;
CREATE POLICY "Admins and Editors can delete pages" ON public.pages FOR DELETE USING (is_admin_or_editor());

-- Services Policies
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON public.services;
CREATE POLICY "Public services are viewable by everyone" ON public.services FOR SELECT USING (published = true OR is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can insert services" ON public.services;
CREATE POLICY "Admins and Editors can insert services" ON public.services FOR INSERT WITH CHECK (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update services" ON public.services;
CREATE POLICY "Admins and Editors can update services" ON public.services FOR UPDATE USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete services" ON public.services;
CREATE POLICY "Admins and Editors can delete services" ON public.services FOR DELETE USING (is_admin_or_editor());

-- Areas Policies
DROP POLICY IF EXISTS "Public areas are viewable by everyone" ON public.areas;
CREATE POLICY "Public areas are viewable by everyone" ON public.areas FOR SELECT USING (published = true OR is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can insert areas" ON public.areas;
CREATE POLICY "Admins and Editors can insert areas" ON public.areas FOR INSERT WITH CHECK (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update areas" ON public.areas;
CREATE POLICY "Admins and Editors can update areas" ON public.areas FOR UPDATE USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete areas" ON public.areas;
CREATE POLICY "Admins and Editors can delete areas" ON public.areas FOR DELETE USING (is_admin_or_editor());

-- Portfolios Policies
DROP POLICY IF EXISTS "Public portfolios are viewable by everyone" ON public.portfolios;
CREATE POLICY "Public portfolios are viewable by everyone" ON public.portfolios FOR SELECT USING (published = true OR is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can insert portfolios" ON public.portfolios;
CREATE POLICY "Admins and Editors can insert portfolios" ON public.portfolios FOR INSERT WITH CHECK (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update portfolios" ON public.portfolios;
CREATE POLICY "Admins and Editors can update portfolios" ON public.portfolios FOR UPDATE USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete portfolios" ON public.portfolios;
CREATE POLICY "Admins and Editors can delete portfolios" ON public.portfolios FOR DELETE USING (is_admin_or_editor());

-- Partners Policies
DROP POLICY IF EXISTS "Public partners are viewable by everyone" ON public.partners;
CREATE POLICY "Public partners are viewable by everyone" ON public.partners FOR SELECT USING (published = true OR is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can insert partners" ON public.partners;
CREATE POLICY "Admins and Editors can insert partners" ON public.partners FOR INSERT WITH CHECK (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update partners" ON public.partners;
CREATE POLICY "Admins and Editors can update partners" ON public.partners FOR UPDATE USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete partners" ON public.partners;
CREATE POLICY "Admins and Editors can delete partners" ON public.partners FOR DELETE USING (is_admin_or_editor());

-- Contacts Policies
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.contacts;
CREATE POLICY "Anyone can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and Editors can view contacts" ON public.contacts;
CREATE POLICY "Admins and Editors can view contacts" ON public.contacts FOR SELECT USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update contacts" ON public.contacts;
CREATE POLICY "Admins and Editors can update contacts" ON public.contacts FOR UPDATE USING (is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete contacts" ON public.contacts;
CREATE POLICY "Admins and Editors can delete contacts" ON public.contacts FOR DELETE USING (is_admin_or_editor());

-- Create Storage Bucket for Media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Media is viewable by everyone" ON storage.objects;
CREATE POLICY "Media is viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admins and Editors can upload media" ON storage.objects;
CREATE POLICY "Admins and Editors can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can update media" ON storage.objects;
CREATE POLICY "Admins and Editors can update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND is_admin_or_editor());

DROP POLICY IF EXISTS "Admins and Editors can delete media" ON storage.objects;
CREATE POLICY "Admins and Editors can delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND is_admin_or_editor());

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_areas_updated_at ON public.areas;
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;


-- MIGRATION: 20250125000003_create_site_settings.sql --
create table IF NOT EXISTS public.site_settings (
  id uuid not null default extensions.uuid_generate_v4(),
  site_name text not null default 'ArsInstalações',
  site_description text,
  contact_email text,
  contact_phone text,
  address text,
  logo_url text,
  social_links jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint site_settings_pkey primary key (id)
);

alter table public.site_settings enable row level security;

DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
create policy "Allow public read access" on public.site_settings for select to public using (true);

DROP POLICY IF EXISTS "Allow authenticated update access" ON public.site_settings;
create policy "Allow authenticated update access" on public.site_settings for update to authenticated using (true) with check (true);

DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.site_settings;
create policy "Allow authenticated insert access" on public.site_settings for insert to authenticated with check (true);

insert into public.site_settings (site_name, site_description, contact_email)
select 'ArsInstalações', 'Especialistas em instalações elétricas e hidráulicas.', 'contato@arsinstalacoes.com.br'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);


-- MIGRATION: 20250125000004_add_email_to_profiles.sql --
alter table public.profiles add column IF NOT EXISTS email text;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Note: Skipping backfill loop for safety in automated script, users can run manually if needed for old data


-- MIGRATION: 20250129000000_create_media_files.sql --
create table if not exists media_files (
  id uuid default extensions.uuid_generate_v4() primary key,
  filename text not null,
  url text not null unique,
  size bigint,
  width integer,
  height integer,
  mime_type text,
  folder text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table media_files enable row level security;

DROP POLICY IF EXISTS "Public Read Access" ON media_files;
create policy "Public Read Access" on media_files for select using (true);

DROP POLICY IF EXISTS "Authenticated Insert Access" ON media_files;
create policy "Authenticated Insert Access" on media_files for insert with check (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Access" ON media_files;
create policy "Authenticated Update Access" on media_files for update using (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete Access" ON media_files;
create policy "Authenticated Delete Access" on media_files for delete using (auth.role() = 'authenticated');


-- MIGRATION: 20250131000001_add_professional_fields.sql --
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS privacy_policy text DEFAULT '<h2>Política de Privacidade</h2><p>Em construção...</p>',
ADD COLUMN IF NOT EXISTS terms_of_use text DEFAULT '<h2>Termos de Uso</h2><p>Em construção...</p>',
ADD COLUMN IF NOT EXISTS seo_keywords text DEFAULT 'instalações, elétrica, manutenção, residencial, industrial',
ADD COLUMN IF NOT EXISTS seo_title_suffix text DEFAULT '| ArsInstalações',
ADD COLUMN IF NOT EXISTS not_found_title text DEFAULT 'Página não encontrada',
ADD COLUMN IF NOT EXISTS not_found_message text DEFAULT 'Desculpe, a página que você está procurando não existe ou foi movida.';


-- MIGRATION: 20250131000002_add_email_settings.sql --
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{"provider": "emailjs", "emailjs": {"serviceId": "", "templateId": "", "publicKey": ""}, "supabase": {"functionUrl": "", "anonKey": ""}}'::jsonb;


-- MIGRATION: 20250201133000_add_indexing_toggle.sql --
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS indexing_enabled BOOLEAN DEFAULT true;


-- MIGRATION: 20250201134500_add_analytics_settings.sql --
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS analytics_settings JSONB DEFAULT '{}'::jsonb;


-- MIGRATION: 20250203150000_add_portfolio_short_description.sql --
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS short_description text;
`;
