-- Phase 6: operational dashboard. Midtrans remains dormant until Phase 8.
update public.products
set cta_type = 'whatsapp',
    cta_label = 'Pesan via WhatsApp',
    midtrans_enabled = false,
    updated_at = now()
where cta_type = 'midtrans';

alter table public.products
add constraint products_phase_6_cta_only
check (cta_type in ('custom_url', 'whatsapp') and midtrans_enabled = false);

insert into public.store_settings (
  id, store_name, tagline, description, currency, timezone, flat_shipping_fee, low_stock_threshold
)
values (
  '00000000-0000-0000-0000-000000000001',
  'NusaMart',
  'Pilihan Tepat, Hidup Lebih Hebat',
  'Produk pilihan untuk membuat belanja kebutuhan harian dan gaya hidup terasa lebih praktis.',
  'IDR',
  'Asia/Jakarta',
  0,
  5
)
on conflict (id) do nothing;

create table public.order_status_history (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  from_status public.order_status,
  to_status public.order_status not null,
  note text,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint order_status_history_note_length check (note is null or char_length(note) <= 500)
);

insert into public.order_status_history (order_id, from_status, to_status, note)
select id, null, status, 'Status awal sebelum dashboard operasional diaktifkan.'
from public.orders;

create index order_status_history_order_created_idx
on public.order_status_history (order_id, created_at);

alter table public.order_status_history enable row level security;
alter table public.order_status_history force row level security;
revoke all on public.order_status_history from anon, authenticated;
grant select, insert on public.order_status_history to authenticated;

create policy order_status_history_admin_select
on public.order_status_history for select to authenticated
using ((select private.is_active_admin()));

create policy order_status_history_admin_insert
on public.order_status_history for insert to authenticated
with check ((select private.is_active_admin()) and (actor_id is null or actor_id = (select auth.uid())));

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status public.order_status,
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
begin
  if not (select private.is_active_admin()) then
    raise exception using errcode = '42501', message = 'Akses admin diperlukan.';
  end if;

  select * into v_before from public.orders
  where id = p_order_id and deleted_at is null
  for update;
  if not found then raise exception using errcode = 'P0002', message = 'Pesanan tidak ditemukan.'; end if;
  if v_before.status = p_status then return p_order_id; end if;

  if not (
    (v_before.status = 'pending' and p_status = 'cancelled')
    or (v_before.status = 'confirmed' and p_status in ('processing', 'cancelled'))
    or (v_before.status = 'processing' and p_status in ('shipped', 'cancelled'))
    or (v_before.status = 'shipped' and p_status = 'completed')
  ) then
    raise exception using errcode = '23514', message = 'Perubahan status pesanan tidak diizinkan.';
  end if;

  if p_status = 'cancelled' and nullif(trim(coalesce(p_note, '')), '') is null then
    raise exception using errcode = '23514', message = 'Alasan pembatalan wajib diisi.';
  end if;

  update public.orders set status = p_status where id = p_order_id returning * into v_after;
  insert into public.order_status_history (order_id, from_status, to_status, note, actor_id)
  values (p_order_id, v_before.status, p_status, nullif(trim(coalesce(p_note, '')), ''), auth.uid());
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (auth.uid(), 'order.status_changed', 'order', p_order_id, to_jsonb(v_before), to_jsonb(v_after));
  return p_order_id;
end;
$$;

create or replace function public.save_banner(p_id uuid, p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_before jsonb; v_after jsonb;
begin
  if not (select private.is_active_admin()) then raise exception using errcode = '42501', message = 'Akses admin diperlukan.'; end if;
  select to_jsonb(b) into v_before from public.banners b where b.id = p_id and b.deleted_at is null;
  insert into public.banners (id, title, subtitle, image_path, link_label, link_url, starts_at, ends_at, is_active, sort_order, created_by, updated_by)
  values (p_id, p_payload->>'title', nullif(p_payload->>'subtitle',''), nullif(p_payload->>'image_path',''), nullif(p_payload->>'link_label',''), nullif(p_payload->>'link_url',''), nullif(p_payload->>'starts_at','')::timestamptz, nullif(p_payload->>'ends_at','')::timestamptz, coalesce((p_payload->>'is_active')::boolean,false), coalesce((p_payload->>'sort_order')::integer,0), auth.uid(), auth.uid())
  on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, image_path=excluded.image_path, link_label=excluded.link_label, link_url=excluded.link_url, starts_at=excluded.starts_at, ends_at=excluded.ends_at, is_active=excluded.is_active, sort_order=excluded.sort_order, updated_by=auth.uid(), deleted_at=null;
  select to_jsonb(b) into v_after from public.banners b where b.id = p_id;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data) values (auth.uid(), case when v_before is null then 'banner.created' else 'banner.updated' end, 'banner', p_id, v_before, v_after);
  return p_id;
end; $$;

create or replace function public.save_testimonial(p_id uuid, p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_before jsonb; v_after jsonb;
begin
  if not (select private.is_active_admin()) then raise exception using errcode = '42501', message = 'Akses admin diperlukan.'; end if;
  select to_jsonb(t) into v_before from public.testimonials t where t.id = p_id and t.deleted_at is null;
  insert into public.testimonials (id, author_name, author_title, quote, image_path, rating, consented_at, is_active, sort_order, created_by, updated_by)
  values (p_id, p_payload->>'author_name', nullif(p_payload->>'author_title',''), p_payload->>'quote', nullif(p_payload->>'image_path',''), (p_payload->>'rating')::smallint, case when coalesce((p_payload->>'has_consent')::boolean,false) then now() else null end, coalesce((p_payload->>'is_active')::boolean,false), coalesce((p_payload->>'sort_order')::integer,0), auth.uid(), auth.uid())
  on conflict (id) do update set author_name=excluded.author_name, author_title=excluded.author_title, quote=excluded.quote, image_path=excluded.image_path, rating=excluded.rating, consented_at=excluded.consented_at, is_active=excluded.is_active, sort_order=excluded.sort_order, updated_by=auth.uid(), deleted_at=null;
  select to_jsonb(t) into v_after from public.testimonials t where t.id = p_id;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data) values (auth.uid(), case when v_before is null then 'testimonial.created' else 'testimonial.updated' end, 'testimonial', p_id, v_before, v_after);
  return p_id;
end; $$;

create or replace function public.save_faq(p_id uuid, p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_before jsonb; v_after jsonb;
begin
  if not (select private.is_active_admin()) then raise exception using errcode = '42501', message = 'Akses admin diperlukan.'; end if;
  select to_jsonb(f) into v_before from public.faqs f where f.id = p_id and f.deleted_at is null;
  insert into public.faqs (id, question, answer, is_active, sort_order, created_by, updated_by)
  values (p_id, p_payload->>'question', p_payload->>'answer', coalesce((p_payload->>'is_active')::boolean,false), coalesce((p_payload->>'sort_order')::integer,0), auth.uid(), auth.uid())
  on conflict (id) do update set question=excluded.question, answer=excluded.answer, is_active=excluded.is_active, sort_order=excluded.sort_order, updated_by=auth.uid(), deleted_at=null;
  select to_jsonb(f) into v_after from public.faqs f where f.id = p_id;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data) values (auth.uid(), case when v_before is null then 'faq.created' else 'faq.updated' end, 'faq', p_id, v_before, v_after);
  return p_id;
end; $$;

create or replace function public.archive_operational_content(p_entity text, p_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_before jsonb; v_after jsonb;
begin
  if not (select private.is_active_admin()) then raise exception using errcode = '42501', message = 'Akses admin diperlukan.'; end if;
  if p_entity = 'banner' then
    select to_jsonb(b) into v_before from public.banners b where b.id=p_id and b.deleted_at is null;
    update public.banners set is_active=false, deleted_at=now(), updated_by=auth.uid() where id=p_id and deleted_at is null;
    select to_jsonb(b) into v_after from public.banners b where b.id=p_id;
  elsif p_entity = 'testimonial' then
    select to_jsonb(t) into v_before from public.testimonials t where t.id=p_id and t.deleted_at is null;
    update public.testimonials set is_active=false, deleted_at=now(), updated_by=auth.uid() where id=p_id and deleted_at is null;
    select to_jsonb(t) into v_after from public.testimonials t where t.id=p_id;
  elsif p_entity = 'faq' then
    select to_jsonb(f) into v_before from public.faqs f where f.id=p_id and f.deleted_at is null;
    update public.faqs set is_active=false, deleted_at=now(), updated_by=auth.uid() where id=p_id and deleted_at is null;
    select to_jsonb(f) into v_after from public.faqs f where f.id=p_id;
  else raise exception using errcode='22023', message='Jenis konten tidak valid.';
  end if;
  if v_before is null then raise exception using errcode='P0002', message='Konten tidak ditemukan.'; end if;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data) values (auth.uid(), p_entity || '.archived', p_entity, p_id, v_before, v_after);
  return p_id;
end; $$;

create or replace function public.save_store_settings(p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id constant uuid := '00000000-0000-0000-0000-000000000001'; v_before jsonb; v_after jsonb;
begin
  if not (select private.is_active_admin()) then raise exception using errcode = '42501', message = 'Akses admin diperlukan.'; end if;
  select to_jsonb(s) into v_before from public.store_settings s where s.id=v_id for update;
  update public.store_settings set
    store_name=p_payload->>'store_name', tagline=nullif(p_payload->>'tagline',''), description=nullif(p_payload->>'description',''),
    logo_path=coalesce(nullif(p_payload->>'logo_path',''), logo_path), favicon_path=coalesce(nullif(p_payload->>'favicon_path',''), favicon_path),
    contact_email=nullif(p_payload->>'contact_email',''), contact_phone=nullif(p_payload->>'contact_phone',''), whatsapp_number=nullif(p_payload->>'whatsapp_number',''),
    address=nullif(p_payload->>'address',''), business_hours=p_payload->'business_hours', facebook_url=nullif(p_payload->>'facebook_url',''), instagram_url=nullif(p_payload->>'instagram_url',''),
    currency='IDR', timezone='Asia/Jakarta', flat_shipping_fee=(p_payload->>'flat_shipping_fee')::bigint, low_stock_threshold=(p_payload->>'low_stock_threshold')::integer,
    seo_title=nullif(p_payload->>'seo_title',''), seo_description=nullif(p_payload->>'seo_description',''), updated_by=auth.uid()
  where id=v_id;
  select to_jsonb(s) into v_after from public.store_settings s where s.id=v_id;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, before_data, after_data) values (auth.uid(), 'store_settings.updated', 'store_settings', v_id, v_before, v_after);
  return v_id;
end; $$;

revoke all on function public.update_order_status(uuid, public.order_status, text) from public;
revoke all on function public.save_banner(uuid, jsonb) from public;
revoke all on function public.save_testimonial(uuid, jsonb) from public;
revoke all on function public.save_faq(uuid, jsonb) from public;
revoke all on function public.archive_operational_content(text, uuid) from public;
revoke all on function public.save_store_settings(jsonb) from public;
grant execute on function public.update_order_status(uuid, public.order_status, text) to authenticated;
grant execute on function public.save_banner(uuid, jsonb) to authenticated;
grant execute on function public.save_testimonial(uuid, jsonb) to authenticated;
grant execute on function public.save_faq(uuid, jsonb) to authenticated;
grant execute on function public.archive_operational_content(text, uuid) to authenticated;
grant execute on function public.save_store_settings(jsonb) to authenticated;
