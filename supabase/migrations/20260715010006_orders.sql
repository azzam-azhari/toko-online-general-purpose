create table public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address jsonb,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  payment_method text,
  currency text not null default 'IDR',
  subtotal bigint not null default 0,
  discount_total bigint not null default 0,
  shipping_total bigint not null default 0,
  grand_total bigint not null default 0,
  notes text,
  idempotency_key uuid not null unique,
  expires_at timestamptz not null,
  reconciliation_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint orders_number_length check (char_length(trim(order_number)) between 8 and 80),
  constraint orders_email_format check (
    customer_email is null or customer_email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
  ),
  constraint orders_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint orders_totals_nonnegative check (
    subtotal >= 0 and discount_total >= 0 and shipping_total >= 0 and grand_total >= 0
  ),
  constraint orders_grand_total_consistent check (
    grand_total = subtotal - discount_total + shipping_total
  )
);

create table public.order_items (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_sku text,
  unit_price bigint not null,
  quantity integer not null,
  line_total bigint not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_price_nonnegative check (unit_price >= 0),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_line_total_consistent check (line_total = unit_price * quantity)
);

create table public.payment_transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  provider text not null default 'midtrans',
  provider_order_id text not null,
  transaction_id text,
  transaction_status text,
  payment_type text,
  fraud_status text,
  gross_amount bigint not null,
  currency text not null default 'IDR',
  snap_token text,
  redirect_url text,
  raw_response jsonb,
  last_notification jsonb,
  paid_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_transactions_provider_order_unique unique (provider, provider_order_id),
  constraint payment_transactions_gross_nonnegative check (gross_amount >= 0),
  constraint payment_transactions_currency_format check (currency ~ '^[A-Z]{3}$')
);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger order_items_set_updated_at
before update on public.order_items
for each row execute function public.set_updated_at();

create trigger payment_transactions_set_updated_at
before update on public.payment_transactions
for each row execute function public.set_updated_at();

