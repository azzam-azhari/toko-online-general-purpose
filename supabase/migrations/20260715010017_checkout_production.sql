-- Phase 8: production order ledger for sales completed through WhatsApp or an external HTTPS link.
-- Public CTA clicks still do not create orders automatically. An active admin records the order
-- only after receiving sufficient customer/order details through the external channel.

alter table public.products
drop constraint if exists products_phase_6_cta_only;

alter table public.products
add constraint products_external_cta_only
check (cta_type in ('custom_url', 'whatsapp') and midtrans_enabled = false);

alter table public.orders
  add column sales_channel text not null default 'whatsapp',
  add column source_reference text,
  alter column expires_at drop not null;

alter table public.orders
add constraint orders_external_sales_channel
check (sales_channel in ('whatsapp', 'custom_url'));

alter table public.orders
add constraint orders_source_reference_length
check (source_reference is null or char_length(trim(source_reference)) between 1 and 160);

do $$
begin
  if exists (
    select 1 from public.payment_transactions
    where provider not in ('whatsapp', 'custom_url')
  ) then
    raise exception 'Payment transaction non-eksternal ditemukan. Tinjau data sebelum menerapkan Fase 8.';
  end if;
end;
$$;

alter table public.payment_transactions
  alter column provider set default 'whatsapp';

alter table public.payment_transactions
add constraint payment_transactions_external_provider
check (provider in ('whatsapp', 'custom_url'));

alter table public.payment_transactions
add constraint payment_transactions_external_status
check (
  transaction_status is null
  or transaction_status in ('unpaid', 'pending', 'paid', 'failed', 'expired', 'refunded')
);

create index orders_sales_channel_created_idx
on public.orders (sales_channel, created_at desc)
where deleted_at is null;

create index payment_transactions_provider_status_idx
on public.payment_transactions (provider, transaction_status, created_at desc);

-- Re-declare the settings RPC to normalize the UUID constant on databases that were
-- provisioned before migration history was adopted. This also clears the live lint warning.
create or replace function public.save_store_settings(p_payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id constant uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_before jsonb;
  v_after jsonb;
begin
  if not (select private.is_active_admin()) then
    raise exception using errcode = '42501', message = 'Akses admin diperlukan.';
  end if;
  select to_jsonb(settings) into v_before
  from public.store_settings as settings
  where settings.id = v_id
  for update;

  update public.store_settings set
    store_name = p_payload ->> 'store_name',
    tagline = nullif(p_payload ->> 'tagline', ''),
    description = nullif(p_payload ->> 'description', ''),
    logo_path = coalesce(nullif(p_payload ->> 'logo_path', ''), logo_path),
    favicon_path = coalesce(nullif(p_payload ->> 'favicon_path', ''), favicon_path),
    contact_email = nullif(p_payload ->> 'contact_email', ''),
    contact_phone = nullif(p_payload ->> 'contact_phone', ''),
    whatsapp_number = nullif(p_payload ->> 'whatsapp_number', ''),
    address = nullif(p_payload ->> 'address', ''),
    business_hours = p_payload -> 'business_hours',
    facebook_url = nullif(p_payload ->> 'facebook_url', ''),
    instagram_url = nullif(p_payload ->> 'instagram_url', ''),
    currency = 'IDR',
    timezone = 'Asia/Jakarta',
    flat_shipping_fee = (p_payload ->> 'flat_shipping_fee')::bigint,
    low_stock_threshold = (p_payload ->> 'low_stock_threshold')::integer,
    seo_title = nullif(p_payload ->> 'seo_title', ''),
    seo_description = nullif(p_payload ->> 'seo_description', ''),
    updated_by = auth.uid()
  where id = v_id;

  select to_jsonb(settings) into v_after
  from public.store_settings as settings
  where settings.id = v_id;

  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (auth.uid(), 'store_settings.updated', 'store_settings', v_id, v_before, v_after);
  return v_id;
end;
$$;

create or replace function public.create_external_order(p_payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_channel text := nullif(trim(coalesce(p_payload ->> 'sales_channel', '')), '');
  v_customer_name text := nullif(trim(coalesce(p_payload ->> 'customer_name', '')), '');
  v_customer_email text := nullif(lower(trim(coalesce(p_payload ->> 'customer_email', ''))), '');
  v_customer_phone text := regexp_replace(coalesce(p_payload ->> 'customer_phone', ''), '[^0-9+]', '', 'g');
  v_source_reference text := nullif(trim(coalesce(p_payload ->> 'source_reference', '')), '');
  v_notes text := nullif(trim(coalesce(p_payload ->> 'notes', '')), '');
  v_idempotency_key uuid;
  v_existing_id uuid;
  v_order_id uuid := extensions.gen_random_uuid();
  v_order_number text;
  v_requested_count integer;
  v_matched_count integer;
  v_subtotal bigint;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;

  if v_channel not in ('whatsapp', 'custom_url') then
    raise exception 'Kanal pesanan harus WhatsApp atau tautan eksternal.' using errcode = '23514';
  end if;
  if v_customer_name is null or char_length(v_customer_name) > 120 then
    raise exception 'Nama pelanggan wajib diisi dan maksimal 120 karakter.' using errcode = '23514';
  end if;
  if char_length(v_customer_phone) < 8 or char_length(v_customer_phone) > 20 then
    raise exception 'Nomor pelanggan tidak valid.' using errcode = '23514';
  end if;
  if v_customer_email is not null and v_customer_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'Email pelanggan tidak valid.' using errcode = '23514';
  end if;
  if v_source_reference is not null and char_length(v_source_reference) > 160 then
    raise exception 'Referensi kanal maksimal 160 karakter.' using errcode = '23514';
  end if;
  if v_notes is not null and char_length(v_notes) > 1000 then
    raise exception 'Catatan maksimal 1000 karakter.' using errcode = '23514';
  end if;
  if jsonb_typeof(p_payload -> 'items') <> 'array'
     or jsonb_array_length(p_payload -> 'items') < 1
     or jsonb_array_length(p_payload -> 'items') > 50 then
    raise exception 'Pesanan harus memiliki 1 sampai 50 item.' using errcode = '23514';
  end if;

  begin
    v_idempotency_key := coalesce(nullif(p_payload ->> 'idempotency_key', '')::uuid, extensions.gen_random_uuid());
  exception when invalid_text_representation then
    raise exception 'Idempotency key tidak valid.' using errcode = '23514';
  end;

  select id into v_existing_id
  from public.orders
  where idempotency_key = v_idempotency_key;
  if found then return v_existing_id; end if;

  with requested as (
    select item.product_id, item.quantity
    from jsonb_to_recordset(p_payload -> 'items') as item(product_id uuid, quantity integer)
  )
  select count(*), count(distinct product_id)
  into v_requested_count, v_matched_count
  from requested
  where quantity > 0 and quantity <= 100;

  if v_requested_count <> jsonb_array_length(p_payload -> 'items') or v_matched_count <> v_requested_count then
    raise exception 'Item duplikat atau jumlah item tidak valid.' using errcode = '23514';
  end if;

  with requested as (
    select item.product_id, item.quantity
    from jsonb_to_recordset(p_payload -> 'items') as item(product_id uuid, quantity integer)
  )
  select count(*), coalesce(sum(product.price * requested.quantity), 0)::bigint
  into v_matched_count, v_subtotal
  from requested
  join public.products as product on product.id = requested.product_id
  where product.status = 'active'
    and product.deleted_at is null
    and product.cta_type::text = v_channel
    and product.midtrans_enabled = false
    and product.stock - product.reserved_stock >= requested.quantity;

  if v_matched_count <> v_requested_count then
    raise exception 'Produk tidak aktif, kanal tidak sesuai, atau stok tidak mencukupi.' using errcode = '23514';
  end if;

  v_order_number := 'ORD-' || to_char(statement_timestamp() at time zone 'Asia/Jakarta', 'YYYYMMDD')
    || '-' || upper(substr(replace(v_order_id::text, '-', ''), 1, 8));

  insert into public.orders (
    id, order_number, customer_name, customer_email, customer_phone, status,
    payment_status, payment_method, currency, subtotal, discount_total, shipping_total,
    grand_total, notes, idempotency_key, expires_at, sales_channel, source_reference
  ) values (
    v_order_id, v_order_number, v_customer_name, v_customer_email, v_customer_phone, 'pending',
    'unpaid', v_channel, 'IDR', v_subtotal, 0, 0,
    v_subtotal, v_notes, v_idempotency_key, null, v_channel, v_source_reference
  );

  insert into public.order_items (
    order_id, product_id, product_name, product_sku, unit_price, quantity, line_total, metadata
  )
  select
    v_order_id, product.id, product.name, product.sku, product.price,
    requested.quantity, product.price * requested.quantity,
    jsonb_build_object('sales_channel', v_channel, 'recorded_by', auth.uid())
  from jsonb_to_recordset(p_payload -> 'items') as requested(product_id uuid, quantity integer)
  join public.products as product on product.id = requested.product_id;

  insert into public.payment_transactions (
    order_id, provider, provider_order_id, transaction_status, gross_amount, currency
  ) values (
    v_order_id, v_channel, v_order_number, 'unpaid', v_subtotal, 'IDR'
  );

  insert into public.order_status_history (order_id, from_status, to_status, note, actor_id)
  values (v_order_id, null, 'pending', 'Pesanan eksternal dicatat oleh admin.', auth.uid());

  insert into public.activity_logs (actor_id, action, entity_type, entity_id, after_data)
  values (
    auth.uid(), 'order.created', 'order', v_order_id,
    jsonb_build_object('order_number', v_order_number, 'sales_channel', v_channel, 'grand_total', v_subtotal)
  );

  return v_order_id;
exception
  when unique_violation then
    select id into v_existing_id from public.orders where idempotency_key = v_idempotency_key;
    if v_existing_id is not null then return v_existing_id; end if;
    raise;
end;
$$;

create or replace function public.update_external_payment_status(
  p_order_id uuid,
  p_status public.payment_status,
  p_reference text default null,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before public.orders;
  v_after public.orders;
  v_next_order_status public.order_status;
  v_reference text := nullif(trim(coalesce(p_reference, '')), '');
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_stock_sufficient boolean := true;
  v_item_count integer := 0;
  v_stock_item_count integer := 0;
begin
  if not private.is_active_admin() then
    raise exception 'Akses admin aktif diperlukan.' using errcode = '42501';
  end if;
  if p_status not in ('pending', 'paid', 'failed', 'expired', 'refunded') then
    raise exception 'Status pembayaran eksternal tidak didukung.' using errcode = '23514';
  end if;
  if v_reference is not null and char_length(v_reference) > 160 then
    raise exception 'Referensi pembayaran maksimal 160 karakter.' using errcode = '23514';
  end if;
  if v_note is not null and char_length(v_note) > 500 then
    raise exception 'Catatan pembayaran maksimal 500 karakter.' using errcode = '23514';
  end if;

  select * into v_before
  from public.orders
  where id = p_order_id and deleted_at is null
  for update;
  if not found then raise exception 'Pesanan tidak ditemukan.' using errcode = 'P0002'; end if;
  if v_before.sales_channel not in ('whatsapp', 'custom_url') then
    raise exception 'Pesanan bukan berasal dari kanal eksternal.' using errcode = '23514';
  end if;
  if v_before.payment_status = p_status then return p_order_id; end if;

  if not (
    (v_before.payment_status in ('unpaid', 'pending', 'failed', 'expired') and p_status in ('pending', 'paid', 'failed', 'expired'))
    or (v_before.payment_status = 'paid' and p_status = 'refunded')
  ) then
    raise exception 'Perubahan status pembayaran tidak diizinkan.' using errcode = '23514';
  end if;

  v_next_order_status := v_before.status;

  if p_status = 'paid' then
    perform product.id
    from public.products as product
    join (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by product_id
    ) as requested on requested.product_id = product.id
    order by product.id
    for update of product;

    select
      count(*)::integer,
      count(product.id)::integer,
      coalesce(bool_and(product.id is not null and product.stock >= requested.quantity), false)
    into v_item_count, v_stock_item_count, v_stock_sufficient
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id
      group by product_id
    ) as requested
    left join public.products as product on product.id = requested.product_id;

    v_stock_sufficient := v_item_count > 0
      and v_item_count = v_stock_item_count
      and v_stock_sufficient;

    if v_stock_sufficient and v_before.status <> 'cancelled' then
      update public.products as product
      set stock = product.stock - requested.quantity,
          updated_at = statement_timestamp(),
          updated_by = auth.uid()
      from (
        select product_id, sum(quantity)::integer as quantity
        from public.order_items
        where order_id = p_order_id and product_id is not null
        group by product_id
      ) as requested
      where product.id = requested.product_id;

      if v_before.status = 'pending' then v_next_order_status := 'confirmed'; end if;
    end if;
  elsif p_status in ('failed', 'expired') and v_before.status = 'pending' then
    v_next_order_status := 'cancelled';
  end if;

  update public.orders
  set payment_status = p_status,
      status = v_next_order_status,
      reconciliation_required = reconciliation_required
        or (p_status = 'paid' and (not v_stock_sufficient or v_before.status = 'cancelled'))
        or p_status = 'refunded'
  where id = p_order_id
  returning * into v_after;

  update public.payment_transactions
  set transaction_status = p_status::text,
      transaction_id = coalesce(v_reference, transaction_id),
      paid_at = case when p_status = 'paid' then statement_timestamp() else paid_at end,
      expired_at = case when p_status = 'expired' then statement_timestamp() else expired_at end,
      last_notification = jsonb_build_object(
        'source', 'admin', 'actor_id', auth.uid(), 'note', v_note, 'recorded_at', statement_timestamp()
      )
  where order_id = p_order_id and provider = v_before.sales_channel;

  if not found then
    insert into public.payment_transactions (
      order_id, provider, provider_order_id, transaction_id, transaction_status,
      gross_amount, currency, last_notification, paid_at, expired_at
    ) values (
      p_order_id, v_before.sales_channel, v_before.order_number, v_reference, p_status::text,
      v_before.grand_total, v_before.currency,
      jsonb_build_object('source', 'admin', 'actor_id', auth.uid(), 'note', v_note, 'recorded_at', statement_timestamp()),
      case when p_status = 'paid' then statement_timestamp() else null end,
      case when p_status = 'expired' then statement_timestamp() else null end
    );
  end if;

  if v_after.status <> v_before.status then
    insert into public.order_status_history (order_id, from_status, to_status, note, actor_id)
    values (
      p_order_id, v_before.status, v_after.status,
      coalesce(v_note, 'Status order diperbarui mengikuti pembayaran eksternal.'), auth.uid()
    );
  end if;

  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    auth.uid(), 'payment.status_changed', 'order', p_order_id,
    jsonb_build_object('payment_status', v_before.payment_status, 'order_status', v_before.status),
    jsonb_build_object(
      'payment_status', v_after.payment_status,
      'order_status', v_after.status,
      'reference', v_reference,
      'reconciliation_required', v_after.reconciliation_required
    )
  );

  return p_order_id;
end;
$$;

revoke all on function public.create_external_order(jsonb) from public, anon, authenticated;
revoke all on function public.update_external_payment_status(uuid, public.payment_status, text, text) from public, anon, authenticated;
grant execute on function public.create_external_order(jsonb) to authenticated;
grant execute on function public.update_external_payment_status(uuid, public.payment_status, text, text) to authenticated;
