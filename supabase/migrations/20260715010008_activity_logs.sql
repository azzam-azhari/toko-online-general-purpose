create table public.activity_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_length check (char_length(trim(action)) between 1 and 120),
  constraint activity_logs_entity_type_length check (char_length(trim(entity_type)) between 1 and 120)
);

