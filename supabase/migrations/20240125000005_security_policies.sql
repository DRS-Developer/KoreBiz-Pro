-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SERVICES POLICIES
DROP POLICY IF EXISTS "Public Read Services" ON services;
CREATE POLICY "Public Read Services" ON services
FOR SELECT USING (published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin All Services" ON services;
CREATE POLICY "Admin All Services" ON services
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PORTFOLIOS POLICIES
DROP POLICY IF EXISTS "Public Read Portfolios" ON portfolios;
CREATE POLICY "Public Read Portfolios" ON portfolios
FOR SELECT USING (published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin All Portfolios" ON portfolios;
CREATE POLICY "Admin All Portfolios" ON portfolios
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PAGES POLICIES
DROP POLICY IF EXISTS "Public Read Pages" ON pages;
CREATE POLICY "Public Read Pages" ON pages
FOR SELECT USING (published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin All Pages" ON pages;
CREATE POLICY "Admin All Pages" ON pages
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SITE SETTINGS POLICIES (Always public read, admin write)
DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
CREATE POLICY "Public Read Settings" ON site_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Write Settings" ON site_settings;
CREATE POLICY "Admin Write Settings" ON site_settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PROFILES POLICIES
-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Admins/Editors can read all profiles (simplified for this context)
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
CREATE POLICY "Admins view all profiles" ON profiles
FOR SELECT TO authenticated USING (true);

-- Only user can update their own profile (or admin logic if needed)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
