alter table public.product_images
add column if not exists public_url text;

alter table public.product_images
add constraint product_images_public_url_https
check (public_url is null or public_url ~* '^https://[^[:space:]]+$');

create or replace function public.save_catalog_product(
  p_product_id uuid,
  p_product jsonb,
  p_category_ids uuid[] default '{}'::uuid[],
  p_new_images jsonb default '[]'::jsonb,
  p_delete_image_ids uuid[] default '{}'::uuid[]
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_removed_paths jsonb := '[]'::jsonb;
  v_is_new boolean;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_new_images, '[]'::jsonb))
      as image(storage_path text, public_url text)
    where nullif(trim(image.storage_path), '') is null
      or image.public_url is null
      or image.public_url !~* '^https://[^[:space:]]+$'
  ) then
    raise exception 'Path dan URL publik gambar wajib valid sebelum data disimpan.' using errcode = '23514';
  end if;

  select to_jsonb(product_row.*)
  into v_before
  from public.products as product_row
  where product_row.id = p_product_id
    and product_row.deleted_at is null;

  v_is_new := v_before is null;

  if v_is_new then
    insert into public.products (
      id, name, slug, sku, short_description, description, price,
      compare_at_price, stock, status, is_featured, sort_order,
      seo_title, seo_description, cta_type, cta_label, custom_url,
      whatsapp_number, whatsapp_template, open_in_new_tab,
      midtrans_enabled, created_by, updated_by
    )
    values (
      p_product_id,
      trim(p_product ->> 'name'),
      trim(p_product ->> 'slug'),
      trim(p_product ->> 'sku'),
      nullif(trim(p_product ->> 'short_description'), ''),
      nullif(trim(p_product ->> 'description'), ''),
      (p_product ->> 'price')::bigint,
      nullif(p_product ->> 'compare_at_price', '')::bigint,
      (p_product ->> 'stock')::integer,
      (p_product ->> 'status')::public.product_status,
      coalesce((p_product ->> 'is_featured')::boolean, false),
      coalesce((p_product ->> 'sort_order')::integer, 0),
      nullif(trim(p_product ->> 'seo_title'), ''),
      nullif(trim(p_product ->> 'seo_description'), ''),
      (p_product ->> 'cta_type')::public.cta_type,
      coalesce(nullif(trim(p_product ->> 'cta_label'), ''), 'Beli Sekarang'),
      nullif(trim(p_product ->> 'custom_url'), ''),
      nullif(trim(p_product ->> 'whatsapp_number'), ''),
      nullif(trim(p_product ->> 'whatsapp_template'), ''),
      coalesce((p_product ->> 'open_in_new_tab')::boolean, false),
      (p_product ->> 'cta_type') = 'midtrans',
      auth.uid(),
      auth.uid()
    );
  else
    update public.products
    set
      name = trim(p_product ->> 'name'),
      slug = trim(p_product ->> 'slug'),
      sku = trim(p_product ->> 'sku'),
      short_description = nullif(trim(p_product ->> 'short_description'), ''),
      description = nullif(trim(p_product ->> 'description'), ''),
      price = (p_product ->> 'price')::bigint,
      compare_at_price = nullif(p_product ->> 'compare_at_price', '')::bigint,
      stock = (p_product ->> 'stock')::integer,
      status = (p_product ->> 'status')::public.product_status,
      is_featured = coalesce((p_product ->> 'is_featured')::boolean, false),
      sort_order = coalesce((p_product ->> 'sort_order')::integer, 0),
      seo_title = nullif(trim(p_product ->> 'seo_title'), ''),
      seo_description = nullif(trim(p_product ->> 'seo_description'), ''),
      cta_type = (p_product ->> 'cta_type')::public.cta_type,
      cta_label = coalesce(nullif(trim(p_product ->> 'cta_label'), ''), 'Beli Sekarang'),
      custom_url = nullif(trim(p_product ->> 'custom_url'), ''),
      whatsapp_number = nullif(trim(p_product ->> 'whatsapp_number'), ''),
      whatsapp_template = nullif(trim(p_product ->> 'whatsapp_template'), ''),
      open_in_new_tab = coalesce((p_product ->> 'open_in_new_tab')::boolean, false),
      midtrans_enabled = (p_product ->> 'cta_type') = 'midtrans',
      updated_by = auth.uid()
    where id = p_product_id
      and deleted_at is null;
  end if;

  delete from public.product_categories
  where product_id = p_product_id;

  insert into public.product_categories (product_id, category_id)
  select p_product_id, category_id
  from (
    select distinct unnest(coalesce(p_category_ids, '{}'::uuid[])) as category_id
  ) as selected_categories;

  select coalesce(jsonb_agg(image_row.storage_path), '[]'::jsonb)
  into v_removed_paths
  from public.product_images as image_row
  where image_row.product_id = p_product_id
    and image_row.id = any(coalesce(p_delete_image_ids, '{}'::uuid[]));

  delete from public.product_images
  where product_id = p_product_id
    and id = any(coalesce(p_delete_image_ids, '{}'::uuid[]));

  insert into public.product_images (
    product_id, storage_path, public_url, alt_text, sort_order, is_primary, created_by, updated_by
  )
  select
    p_product_id,
    image.storage_path,
    image.public_url,
    coalesce(nullif(trim(image.alt_text), ''), trim(p_product ->> 'name')),
    coalesce(image.sort_order, 0),
    false,
    auth.uid(),
    auth.uid()
  from jsonb_to_recordset(coalesce(p_new_images, '[]'::jsonb))
    as image(storage_path text, public_url text, alt_text text, sort_order integer);

  update public.product_images
  set is_primary = false
  where product_id = p_product_id
    and is_primary = true;

  update public.product_images
  set is_primary = true
  where id = (
    select image_row.id
    from public.product_images as image_row
    where image_row.product_id = p_product_id
    order by image_row.sort_order, image_row.created_at, image_row.id
    limit 1
  );

  select to_jsonb(product_row.*)
  into v_after
  from public.products as product_row
  where product_row.id = p_product_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  )
  values (
    auth.uid(),
    case when v_is_new then 'product.created' else 'product.updated' end,
    'product',
    p_product_id,
    v_before,
    v_after
  );

  return jsonb_build_object(
    'product_id', p_product_id,
    'removed_paths', v_removed_paths,
    'created', v_is_new
  );
end;
$$;

create or replace function public.archive_catalog_product(p_product_id uuid)
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

  select to_jsonb(product_row.*)
  into v_before
  from public.products as product_row
  where product_row.id = p_product_id
    and product_row.deleted_at is null;

  if v_before is null then
    raise exception 'Produk tidak ditemukan.' using errcode = 'P0002';
  end if;

  update public.products
  set status = 'archived', deleted_at = statement_timestamp(), updated_by = auth.uid()
  where id = p_product_id;

  select to_jsonb(product_row.*)
  into v_after
  from public.products as product_row
  where product_row.id = p_product_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(), 'product.archived', 'product', p_product_id, v_before, v_after
  );

  return p_product_id;
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
    return public.archive_catalog_product(p_product_id);
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

create or replace function public.save_catalog_category(
  p_category_id uuid,
  p_category jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_parent_id uuid := nullif(p_category ->> 'parent_id', '')::uuid;
  v_is_new boolean;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;

  if v_parent_id = p_category_id then
    raise exception 'Kategori tidak dapat menjadi induknya sendiri.' using errcode = '23514';
  end if;

  if v_parent_id is not null and not exists (
    select 1 from public.categories
    where id = v_parent_id and deleted_at is null
  ) then
    raise exception 'Kategori induk tidak ditemukan.' using errcode = '23503';
  end if;

  if v_parent_id is not null and exists (
    with recursive ancestors as (
      select id, parent_id
      from public.categories
      where id = v_parent_id
      union all
      select category_row.id, category_row.parent_id
      from public.categories as category_row
      join ancestors on category_row.id = ancestors.parent_id
    )
    select 1 from ancestors where id = p_category_id
  ) then
    raise exception 'Hierarki kategori akan membentuk siklus.' using errcode = '23514';
  end if;

  select to_jsonb(category_row.*)
  into v_before
  from public.categories as category_row
  where category_row.id = p_category_id
    and category_row.deleted_at is null;

  v_is_new := v_before is null;

  if v_is_new then
    insert into public.categories (
      id, parent_id, name, slug, description, icon, is_active,
      sort_order, created_by, updated_by
    ) values (
      p_category_id,
      v_parent_id,
      trim(p_category ->> 'name'),
      trim(p_category ->> 'slug'),
      nullif(trim(p_category ->> 'description'), ''),
      nullif(trim(p_category ->> 'icon'), ''),
      coalesce((p_category ->> 'is_active')::boolean, true),
      coalesce((p_category ->> 'sort_order')::integer, 0),
      auth.uid(),
      auth.uid()
    );
  else
    update public.categories
    set
      parent_id = v_parent_id,
      name = trim(p_category ->> 'name'),
      slug = trim(p_category ->> 'slug'),
      description = nullif(trim(p_category ->> 'description'), ''),
      icon = nullif(trim(p_category ->> 'icon'), ''),
      is_active = coalesce((p_category ->> 'is_active')::boolean, true),
      sort_order = coalesce((p_category ->> 'sort_order')::integer, 0),
      updated_by = auth.uid()
    where id = p_category_id
      and deleted_at is null;
  end if;

  select to_jsonb(category_row.*)
  into v_after
  from public.categories as category_row
  where category_row.id = p_category_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(),
    case when v_is_new then 'category.created' else 'category.updated' end,
    'category',
    p_category_id,
    v_before,
    v_after
  );

  return p_category_id;
end;
$$;

create or replace function public.archive_catalog_category(p_category_id uuid)
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

  select to_jsonb(category_row.*)
  into v_before
  from public.categories as category_row
  where category_row.id = p_category_id
    and category_row.deleted_at is null;

  if v_before is null then
    raise exception 'Kategori tidak ditemukan.' using errcode = 'P0002';
  end if;

  update public.categories
  set parent_id = null, updated_by = auth.uid()
  where parent_id = p_category_id
    and deleted_at is null;

  update public.categories
  set is_active = false, deleted_at = statement_timestamp(), updated_by = auth.uid()
  where id = p_category_id;

  select to_jsonb(category_row.*)
  into v_after
  from public.categories as category_row
  where category_row.id = p_category_id;

  insert into public.activity_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(), 'category.archived', 'category', p_category_id, v_before, v_after
  );

  return p_category_id;
end;
$$;

revoke all on function public.save_catalog_product(uuid, jsonb, uuid[], jsonb, uuid[]) from public, anon;
revoke all on function public.archive_catalog_product(uuid) from public, anon;
revoke all on function public.set_catalog_product_status(uuid, public.product_status) from public, anon;
revoke all on function public.save_catalog_category(uuid, jsonb) from public, anon;
revoke all on function public.archive_catalog_category(uuid) from public, anon;

grant execute on function public.save_catalog_product(uuid, jsonb, uuid[], jsonb, uuid[]) to authenticated;
grant execute on function public.archive_catalog_product(uuid) to authenticated;
grant execute on function public.set_catalog_product_status(uuid, public.product_status) to authenticated;
grant execute on function public.save_catalog_category(uuid, jsonb) to authenticated;
grant execute on function public.archive_catalog_category(uuid) to authenticated;
