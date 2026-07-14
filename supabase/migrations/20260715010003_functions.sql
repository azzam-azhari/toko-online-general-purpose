create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role, supabase_auth_admin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'admin'::public.app_role,
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
grant execute on function private.handle_new_auth_user() to service_role, supabase_auth_admin;
