-- PostgREST roles still need explicit table privileges even when service_role
-- bypasses RLS. Keep this grant limited to server-only read paths.
grant usage on schema public to service_role;

grant select on
  public.store_settings,
  public.categories,
  public.products,
  public.orders,
  public.order_items
to service_role;
