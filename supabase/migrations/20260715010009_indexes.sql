create index profiles_active_admin_idx
on public.profiles (is_active)
where role = 'admin';

create index products_public_catalog_idx
on public.products (status, is_featured, sort_order, created_at desc)
where deleted_at is null;

create index products_name_search_idx
on public.products
using gin (to_tsvector('simple', name || ' ' || coalesce(description, '')));

create index products_name_trgm_idx
on public.products using gin (name extensions.gin_trgm_ops);

create index categories_public_idx
on public.categories (is_active, sort_order, name)
where deleted_at is null;

create index product_images_product_sort_idx
on public.product_images (product_id, sort_order);

create index product_categories_category_idx
on public.product_categories (category_id, product_id);

create index orders_status_created_idx
on public.orders (status, created_at desc)
where deleted_at is null;

create index orders_payment_status_created_idx
on public.orders (payment_status, created_at desc)
where deleted_at is null;

create index orders_reservation_expiry_idx
on public.orders (expires_at)
where status = 'pending' and payment_status in ('unpaid', 'pending');

create index order_items_order_idx
on public.order_items (order_id);

create index payment_transactions_order_idx
on public.payment_transactions (order_id, created_at desc);

create index activity_logs_created_idx
on public.activity_logs (created_at desc);

create index activity_logs_entity_idx
on public.activity_logs (entity_type, entity_id, created_at desc);

