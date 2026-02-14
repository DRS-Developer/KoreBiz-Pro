-- Add email column to profiles
alter table public.profiles add column email text;

-- Create function to handle new user creation and sync email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger is usually already there in starter templates, but let's ensure it covers email.
-- Drop existing trigger if we want to replace it, or just rely on manual update if it exists.
-- Assuming standard Supabase starter:
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill emails for existing users (this runs once)
-- We can't easily access auth.users from here in a standard migration if not superuser, 
-- but usually migration runner is superuser.
do $$
declare
  user_record record;
begin
  for user_record in select * from auth.users loop
    update public.profiles
    set email = user_record.email
    where id = user_record.id;
  end loop;
end;
$$;
