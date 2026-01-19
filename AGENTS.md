# Noto - Todo List Application

React 19 + TypeScript + Vite frontend with Supabase backend. Hierarchical todo organization: Lists → Groups → Items.

## Architecture

```
noto/
├── src/              # Frontend application (React + TypeScript)
├── supabase/         # Database schema and migrations
├── public/           # Static assets
└── dist/             # Build output
```

## Intent Layer

**Before modifying code in src/, read `src/AGENTS.md` first** to understand component patterns, state management, and Supabase integration.

### Global Invariants

- **All database operations** go through `src/lib/supabase.ts` client - never instantiate Supabase elsewhere
- **Optimistic UI updates**: Update local state immediately, rollback on Supabase error
- **Position-based ordering**: All lists/groups/items use `position` field with `created_at` as fallback
- **UUID generation**: Use `generateUUID()` from `src/lib/utils.ts` for all IDs
- **Database migrations**: Use Supabase CLI (`supabase migration new <name>`) - never edit existing migrations

## Database Schema

Tables: `todo_lists`, `todo_groups`, `todo_items`

- Lists contain Groups, Groups contain Items
- RLS enabled with public read/write access (no auth required)
- Auto-cleanup: Lists older than 30 days are deleted daily
- Keep-alive mechanism: Touch `keep_alive_logs` to prevent deletion

See `supabase/migrations/` for full schema and `README.md` for migration workflow.

## Development

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run types        # Generate TypeScript types from Supabase schema
supabase start       # Start local Supabase instance
supabase db reset    # Apply all migrations to local DB
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router
- **Styling**: Tailwind CSS v4, Radix UI components
- **Backend**: Supabase (PostgreSQL + real-time subscriptions)
- **Build**: Vite 6, ESLint, Prettier, Husky
