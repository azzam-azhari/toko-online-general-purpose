alter table public.products
  add column available_stock integer
  generated always as (stock - reserved_stock) stored;

create index products_available_stock_idx
  on public.products (available_stock)
  where status = 'active'
    and deleted_at is null
    and cta_type <> 'midtrans';
