create or replace function private.broadcast_catalog_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'table', tg_table_name,
      'operation', tg_op
    ),
    'catalog_changed',
    'catalog',
    false
  );

  return null;
end;
$$;

revoke all on function private.broadcast_catalog_change() from public, anon, authenticated;

drop trigger if exists broadcast_catalog_change on public.products;
create trigger broadcast_catalog_change
after insert or update or delete on public.products
for each row execute function private.broadcast_catalog_change();

drop trigger if exists broadcast_catalog_change on public.product_images;
create trigger broadcast_catalog_change
after insert or update or delete on public.product_images
for each row execute function private.broadcast_catalog_change();

drop trigger if exists broadcast_catalog_change on public.product_categories;
create trigger broadcast_catalog_change
after insert or update or delete on public.product_categories
for each row execute function private.broadcast_catalog_change();

drop trigger if exists broadcast_catalog_change on public.categories;
create trigger broadcast_catalog_change
after insert or update or delete on public.categories
for each row execute function private.broadcast_catalog_change();
