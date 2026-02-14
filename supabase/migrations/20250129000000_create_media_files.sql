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

-- Add RLS policies
alter table media_files enable row level security;

create policy "Public Read Access" on media_files
  for select using (true);

create policy "Authenticated Insert Access" on media_files
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated Update Access" on media_files
  for update using (auth.role() = 'authenticated');

create policy "Authenticated Delete Access" on media_files
  for delete using (auth.role() = 'authenticated');
