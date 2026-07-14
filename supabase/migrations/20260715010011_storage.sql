insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/avif', 'image/jpeg', 'image/png', 'image/webp']),
  ('category-images', 'category-images', true, 5242880, array['image/avif', 'image/jpeg', 'image/png', 'image/webp']),
  ('store-assets', 'store-assets', true, 5242880, array['image/avif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']),
  ('avatars', 'avatars', false, 5242880, array['image/avif', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy storage_public_read_store_assets
on storage.objects for select to anon, authenticated
using (bucket_id in ('product-images', 'category-images', 'store-assets'));

create policy storage_admin_read_avatars
on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (select private.is_active_admin()));

create policy storage_admin_insert
on storage.objects for insert to authenticated
with check (
  bucket_id in ('product-images', 'category-images', 'store-assets', 'avatars')
  and (select private.is_active_admin())
);

create policy storage_admin_update
on storage.objects for update to authenticated
using (
  bucket_id in ('product-images', 'category-images', 'store-assets', 'avatars')
  and (select private.is_active_admin())
)
with check (
  bucket_id in ('product-images', 'category-images', 'store-assets', 'avatars')
  and (select private.is_active_admin())
);

create policy storage_admin_delete
on storage.objects for delete to authenticated
using (
  bucket_id in ('product-images', 'category-images', 'store-assets', 'avatars')
  and (select private.is_active_admin())
);

