create or replace function public.delete_catalog_product(p_product_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before jsonb;
  v_storage_paths jsonb := '[]'::jsonb;
  v_category_count integer := 0;
  v_image_count integer := 0;
  v_order_item_count integer := 0;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;

  select to_jsonb(product_row.*)
  into v_before
  from public.products as product_row
  where product_row.id = p_product_id
  for update;

  if v_before is null then
    raise exception 'Produk tidak ditemukan.' using errcode = 'P0002';
  end if;

  select
    coalesce(jsonb_agg(image_row.storage_path order by image_row.sort_order, image_row.created_at), '[]'::jsonb),
    count(*)::integer
  into v_storage_paths, v_image_count
  from public.product_images as image_row
  where image_row.product_id = p_product_id;

  select count(*)::integer
  into v_category_count
  from public.product_categories
  where product_id = p_product_id;

  select count(*)::integer
  into v_order_item_count
  from public.order_items
  where product_id = p_product_id;

  v_before := v_before || jsonb_build_object(
    '_deletion_context', jsonb_build_object(
      'image_count', v_image_count,
      'category_link_count', v_category_count,
      'order_item_reference_count', v_order_item_count
    )
  );

  delete from public.products
  where id = p_product_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(), 'product.deleted', 'product', p_product_id, v_before, null
  );

  return jsonb_build_object(
    'id', p_product_id,
    'storage_paths', v_storage_paths
  );
end;
$$;

update public.products
set deleted_at = coalesce(deleted_at, updated_at, statement_timestamp())
where status = 'archived'
  and deleted_at is null;

alter table public.products
add constraint products_archived_requires_deleted_at
check (status <> 'archived' or deleted_at is not null);

create or replace function public.delete_catalog_category(p_category_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before jsonb;
  v_storage_paths jsonb := '[]'::jsonb;
  v_child_count integer := 0;
  v_product_link_count integer := 0;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;

  select to_jsonb(category_row.*)
  into v_before
  from public.categories as category_row
  where category_row.id = p_category_id
  for update;

  if v_before is null then
    raise exception 'Kategori tidak ditemukan.' using errcode = 'P0002';
  end if;

  if nullif(trim(v_before ->> 'image_path'), '') is not null then
    v_storage_paths := jsonb_build_array(trim(v_before ->> 'image_path'));
  end if;

  select count(*)::integer
  into v_child_count
  from public.categories
  where parent_id = p_category_id;

  select count(*)::integer
  into v_product_link_count
  from public.product_categories
  where category_id = p_category_id;

  v_before := v_before || jsonb_build_object(
    '_deletion_context', jsonb_build_object(
      'child_category_count', v_child_count,
      'product_link_count', v_product_link_count
    )
  );

  delete from public.categories
  where id = p_category_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(), 'category.deleted', 'category', p_category_id, v_before, null
  );

  return jsonb_build_object(
    'id', p_category_id,
    'storage_paths', v_storage_paths
  );
end;
$$;

create or replace function public.set_catalog_product_status(
  p_product_id uuid,
  p_status public.product_status
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;

  if p_status = 'archived' then
    raise exception 'Status arsip tidak lagi didukung. Gunakan penghapusan permanen.' using errcode = '23514';
  end if;

  select to_jsonb(product_row.*)
  into v_before
  from public.products as product_row
  where product_row.id = p_product_id
    and product_row.deleted_at is null;

  if v_before is null then
    raise exception 'Produk tidak ditemukan.' using errcode = 'P0002';
  end if;

  update public.products
  set status = p_status, updated_by = auth.uid()
  where id = p_product_id;

  select to_jsonb(product_row.*)
  into v_after
  from public.products as product_row
  where product_row.id = p_product_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(), 'product.status_changed', 'product', p_product_id, v_before, v_after
  );

  return p_product_id;
end;
$$;

revoke all on function public.delete_catalog_product(uuid) from public, anon, authenticated;
revoke all on function public.delete_catalog_category(uuid) from public, anon, authenticated;

grant execute on function public.delete_catalog_product(uuid) to authenticated;
grant execute on function public.delete_catalog_category(uuid) to authenticated;

drop function if exists public.archive_catalog_product(uuid);
drop function if exists public.archive_catalog_category(uuid);
