create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role not null default 'admin',
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) <= 120),
  constraint profiles_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 2048)
);

create or replace function private.is_active_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'::public.app_role
      and is_active = true
  );
$$;

revoke all on function private.is_active_admin(uuid) from public, anon;
grant execute on function private.is_active_admin(uuid) to authenticated, service_role;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

-- Menyinkronkan akun Auth yang mungkin sudah ada sebelum migration dijalankan.
insert into public.profiles (id, full_name, role, is_active)
select
  users.id,
  nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), ''),
  'admin'::public.app_role,
  true
from auth.users as users
on conflict (id) do nothing;
