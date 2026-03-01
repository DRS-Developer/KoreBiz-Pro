CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for authenticated users and service role" ON audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for admins only" ON audit_logs
  FOR SELECT USING (auth.role() = 'service_role' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
