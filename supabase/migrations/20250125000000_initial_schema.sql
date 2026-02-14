
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('admin', 'editor')) DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create pages table
CREATE TABLE public.pages (
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
CREATE TABLE public.services (
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
CREATE TABLE public.areas (
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
CREATE TABLE public.portfolios (
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
CREATE TABLE public.partners (
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
CREATE TABLE public.contacts (
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
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

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
CREATE POLICY "Public pages are viewable by everyone" 
ON public.pages FOR SELECT USING (published = true OR is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert pages" 
ON public.pages FOR INSERT WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins and Editors can update pages" 
ON public.pages FOR UPDATE USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete pages" 
ON public.pages FOR DELETE USING (is_admin_or_editor());

-- Services Policies
CREATE POLICY "Public services are viewable by everyone" 
ON public.services FOR SELECT USING (published = true OR is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert services" 
ON public.services FOR INSERT WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins and Editors can update services" 
ON public.services FOR UPDATE USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete services" 
ON public.services FOR DELETE USING (is_admin_or_editor());

-- Areas Policies
CREATE POLICY "Public areas are viewable by everyone" 
ON public.areas FOR SELECT USING (published = true OR is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert areas" 
ON public.areas FOR INSERT WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins and Editors can update areas" 
ON public.areas FOR UPDATE USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete areas" 
ON public.areas FOR DELETE USING (is_admin_or_editor());

-- Portfolios Policies
CREATE POLICY "Public portfolios are viewable by everyone" 
ON public.portfolios FOR SELECT USING (published = true OR is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert portfolios" 
ON public.portfolios FOR INSERT WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins and Editors can update portfolios" 
ON public.portfolios FOR UPDATE USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete portfolios" 
ON public.portfolios FOR DELETE USING (is_admin_or_editor());

-- Partners Policies
CREATE POLICY "Public partners are viewable by everyone" 
ON public.partners FOR SELECT USING (published = true OR is_admin_or_editor());

CREATE POLICY "Admins and Editors can insert partners" 
ON public.partners FOR INSERT WITH CHECK (is_admin_or_editor());

CREATE POLICY "Admins and Editors can update partners" 
ON public.partners FOR UPDATE USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete partners" 
ON public.partners FOR DELETE USING (is_admin_or_editor());

-- Contacts Policies
CREATE POLICY "Anyone can insert contacts" 
ON public.contacts FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and Editors can view contacts" 
ON public.contacts FOR SELECT USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can update contacts" 
ON public.contacts FOR UPDATE USING (is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete contacts" 
ON public.contacts FOR DELETE USING (is_admin_or_editor());

-- Create Storage Bucket for Media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Media is viewable by everyone"
ON storage.objects FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Admins and Editors can upload media"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin_or_editor());

CREATE POLICY "Admins and Editors can update media"
ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND is_admin_or_editor());

CREATE POLICY "Admins and Editors can delete media"
ON storage.objects FOR DELETE USING (bucket_id = 'media' AND is_admin_or_editor());

-- Trigger to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
