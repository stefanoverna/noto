-- Enable pg_cron extension for scheduled jobs
create extension if not exists pg_cron with schema extensions;

-- Grant permissions to postgres role
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Schedule daily job to delete lists older than 10 days
-- Runs every day at 3:00 AM UTC
select cron.schedule(
  'delete-old-lists',           -- job name
  '0 3 * * *',                  -- cron expression: daily at 3am UTC
  $$
  delete from public.todo_lists
  where created_at < now() - interval '10 days'
  $$
);
