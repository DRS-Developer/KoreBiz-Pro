create table public.site_settings (
  id uuid not null default extensions.uuid_generate_v4(),
  site_name text not null default 'KoreBiz-Pro',
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

-- Enable RLS
alter table public.site_settings enable row level security;

-- Create policies
create policy "Allow public read access"
  on public.site_settings
  for select
  to public
  using (true);

create policy "Allow authenticated update access"
  on public.site_settings
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated insert access"
  on public.site_settings
  for insert
  to authenticated
  with check (true);

-- Insert default row
insert into public.site_settings (site_name, site_description, contact_email)
values ('KoreBiz-Pro', 'Especialistas em instalações elétricas e hidráulicas.', 'contato@korebiz-pro.com.br');
