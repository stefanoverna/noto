-- Drop the collapsed column from todo_groups table
ALTER TABLE public.todo_groups DROP COLUMN IF EXISTS collapsed;
