alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.product_images enable row level security;
alter table public.product_images force row level security;
alter table public.categories enable row level security;
alter table public.categories force row level security;
alter table public.product_categories enable row level security;
alter table public.product_categories force row level security;
alter table public.orders enable row level security;
alter table public.orders force row level security;
alter table public.order_items enable row level security;
alter table public.order_items force row level security;
alter table public.payment_transactions enable row level security;
alter table public.payment_transactions force row level security;
alter table public.banners enable row level security;
alter table public.banners force row level security;
alter table public.testimonials enable row level security;
alter table public.testimonials force row level security;
alter table public.faqs enable row level security;
alter table public.faqs force row level security;
alter table public.store_settings enable row level security;
alter table public.store_settings force row level security;
alter table public.activity_logs enable row level security;
alter table public.activity_logs force row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.products, public.product_images, public.categories,
  public.product_categories, public.banners, public.testimonials, public.faqs
to anon, authenticated;

grant select on public.store_settings to authenticated;
grant select (
  id, store_name, tagline, description, logo_path, favicon_path,
  contact_email, contact_phone, whatsapp_number, address, business_hours,
  facebook_url, instagram_url, currency, timezone, flat_shipping_fee,
  low_stock_threshold, seo_title, seo_description, created_at, updated_at
) on public.store_settings to anon;

grant select, insert, update, delete on public.profiles, public.products,
  public.product_images, public.categories, public.product_categories,
  public.orders, public.order_items, public.payment_transactions,
  public.banners, public.testimonials, public.faqs, public.store_settings
to authenticated;

grant select, insert on public.activity_logs to authenticated;

create policy profiles_admin_select
on public.profiles for select to authenticated
using ((select private.is_active_admin()));

create policy profiles_admin_update
on public.profiles for update to authenticated
using ((select private.is_active_admin()))
with check (role = 'admin'::public.app_role);

create policy products_public_select
on public.products for select to anon, authenticated
using (status = 'active' and deleted_at is null);

create policy products_admin_all
on public.products for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy product_images_public_select
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.status = 'active'
      and products.deleted_at is null
  )
);

create policy product_images_admin_all
on public.product_images for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy categories_public_select
on public.categories for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy categories_admin_all
on public.categories for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy product_categories_public_select
on public.product_categories for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_categories.product_id
      and products.status = 'active'
      and products.deleted_at is null
  )
  and exists (
    select 1 from public.categories
    where categories.id = product_categories.category_id
      and categories.is_active = true
      and categories.deleted_at is null
  )
);

create policy product_categories_admin_all
on public.product_categories for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy orders_admin_all
on public.orders for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy order_items_admin_all
on public.order_items for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy payment_transactions_admin_all
on public.payment_transactions for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy banners_public_select
on public.banners for select to anon, authenticated
using (
  is_active = true
  and deleted_at is null
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

create policy banners_admin_all
on public.banners for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy testimonials_public_select
on public.testimonials for select to anon, authenticated
using (is_active = true and consented_at is not null and deleted_at is null);

create policy testimonials_admin_all
on public.testimonials for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy faqs_public_select
on public.faqs for select to anon, authenticated
using (is_active = true and deleted_at is null);

create policy faqs_admin_all
on public.faqs for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy store_settings_public_select
on public.store_settings for select to anon, authenticated
using (true);

create policy store_settings_admin_all
on public.store_settings for all to authenticated
using ((select private.is_active_admin()))
with check ((select private.is_active_admin()));

create policy activity_logs_admin_select
on public.activity_logs for select to authenticated
using ((select private.is_active_admin()));

create policy activity_logs_admin_insert
on public.activity_logs for insert to authenticated
with check (
  (select private.is_active_admin())
  and (actor_id is null or actor_id = (select auth.uid()))
);

