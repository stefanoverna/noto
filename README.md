# Noto - Todo List Application

A modern todo list application built with React, TypeScript, and Supabase.

## Database Migration Workflow

This project uses Supabase CLI for database schema management with migrations.

### Prerequisites

- Docker installed and running
- Supabase CLI installed: `npm install -g supabase`
- Project linked to remote Supabase instance

### Initial Setup

The project is already initialized and linked. The configuration is in `supabase/config.toml`.

### Making Schema Changes

#### Option 1: Write SQL Directly

1. Create a new migration file:
   ```bash
   supabase migration new <migration_name>
   ```

2. Edit the generated file in `supabase/migrations/` and write your SQL

3. Test locally (see below)

#### Option 2: Use Dashboard + Diff

1. Start local Supabase:
   ```bash
   supabase start
   ```

2. Open Studio Dashboard at http://127.0.0.1:54323

3. Make changes through the UI

4. Generate migration from changes:
   ```bash
   supabase db diff -f <migration_name>
   ```

### Testing Migrations Locally

1. Start local Supabase (if not running):
   ```bash
   supabase start
   ```

2. Apply all migrations to local database:
   ```bash
   supabase db reset
   ```
   This recreates the local database and applies all migrations in order.

3. Verify the changes in Studio Dashboard (http://127.0.0.1:54323) or with:
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
   ```

### Deploying to Production

1. Check which migrations need to be pushed:
   ```bash
   supabase migration list
   ```

2. Push migrations to remote database:
   ```bash
   supabase db push
   ```
   Confirm when prompted.

### Syncing from Production

If schema changes are made directly in production (not recommended):

```bash
supabase db pull
```

This creates a new migration file with the changes.

### Common Commands

- `supabase start` - Start local Supabase instance
- `supabase stop` - Stop local instance
- `supabase status` - Check running services
- `supabase migration list` - Show migration status (local vs remote)
- `supabase migration new <name>` - Create new migration file
- `supabase db diff -f <name>` - Generate migration from local changes
- `supabase db reset` - Reset local DB and apply all migrations
- `supabase db push` - Push migrations to remote database
- `supabase db pull` - Pull schema changes from remote

### Migration Files

Migrations are stored in `supabase/migrations/` with timestamp prefixes:
- `20260118152549_remote_schema.sql` - Initial schema
- `20260118152846_drop_collapsed_column.sql` - Example migration

### Best Practices

1. Always test migrations locally before pushing to production
2. Use descriptive migration names
3. Keep migrations small and focused
4. Never edit existing migration files that have been applied
5. Use `supabase db reset` frequently during development to ensure migrations work correctly
6. Commit migration files to git

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
