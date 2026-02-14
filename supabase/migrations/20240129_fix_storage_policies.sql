-- Safe script to configure storage policies
-- This script checks if policies exist before creating them to avoid errors

do $$
begin
  -- 1. Create bucket if not exists (using upsert logic)
  insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do update set public = true;

  -- 2. Drop existing policies to ensure clean state (easiest way to avoid duplicates)
  -- We use "if exists" to prevent errors if they don't exist
  drop policy if exists "Public Access" on storage.objects;
  drop policy if exists "Authenticated Upload" on storage.objects;
  drop policy if exists "Authenticated Update" on storage.objects;
  drop policy if exists "Authenticated Delete" on storage.objects;
  
  -- 3. Create policies
  
  -- Public Read Access
  create policy "Public Access"
    on storage.objects for select
    using ( bucket_id = 'media' );

  -- Authenticated Upload
  create policy "Authenticated Upload"
    on storage.objects for insert
    with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

  -- Authenticated Update
  create policy "Authenticated Update"
    on storage.objects for update
    using ( bucket_id = 'media' and auth.role() = 'authenticated' );

  -- Authenticated Delete
  create policy "Authenticated Delete"
    on storage.objects for delete
    using ( bucket_id = 'media' and auth.role() = 'authenticated' );
    
end $$;
