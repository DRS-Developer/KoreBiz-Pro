-- Create the media bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Enable RLS
alter table storage.objects enable row level security;

-- Policy to allow public viewing of files in the media bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'media' );

-- Policy to allow authenticated users to upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to update their files
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to delete files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'media' and auth.role() = 'authenticated' );
