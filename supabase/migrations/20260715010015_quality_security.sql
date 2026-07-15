-- Phase 7: defense in depth for account provisioning, public settings, and uploads.
-- New Auth users are inactive unless a trusted admin API explicitly sets app_metadata.role=admin.
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
    coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
grant execute on function private.handle_new_auth_user() to service_role, supabase_auth_admin;

-- Anonymous visitors only receive the explicitly granted public columns. An authenticated
-- but inactive account must not gain full-row access through the public policy.
drop policy if exists store_settings_public_select on public.store_settings;

create policy store_settings_public_select
on public.store_settings for select to anon
using (true);

create policy store_settings_admin_select
on public.store_settings for select to authenticated
using ((select private.is_active_admin()));

-- SVG is not needed by the implemented upload flow and is excluded to remove active-content risk.
update storage.buckets
set allowed_mime_types = array['image/avif', 'image/jpeg', 'image/png', 'image/webp']
where id = 'store-assets';
