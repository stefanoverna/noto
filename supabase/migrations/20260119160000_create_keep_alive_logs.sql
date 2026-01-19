-- Create keep_alive_logs table to track keep-alive events
create table if not exists keep_alive_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'keep-alive-saas',
  created_at timestamptz not null default now()
);
