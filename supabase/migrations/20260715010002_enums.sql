create type public.app_role as enum ('admin');

create type public.product_status as enum (
  'draft',
  'active',
  'inactive',
  'archived'
);

create type public.cta_type as enum (
  'custom_url',
  'whatsapp',
  'midtrans'
);

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'completed',
  'cancelled'
);

create type public.payment_status as enum (
  'unpaid',
  'pending',
  'paid',
  'failed',
  'expired',
  'refunded'
);

