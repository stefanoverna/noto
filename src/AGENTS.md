# Frontend Application

React 19 + TypeScript single-page application for hierarchical todo list management.

## Purpose

Owns UI components, state management, and Supabase integration. Does NOT handle backend logic (that's in Supabase functions/triggers).

## Entry Points

- `main.tsx` - React root, theme provider, router setup
- `App.tsx` - Route configuration and page wrapper
- `pages/index.tsx` - Landing page (creates new list)
- `pages/list.tsx` - Main todo list view

## Architecture

```
src/
├── components/
│   ├── ui/          # Radix UI primitives (button, dialog, checkbox, etc.)
│   └── todo/        # Business logic components (TodoItem, TodoGroup, dialogs)
├── hooks/
│   ├── useTodoList.ts    # CRUD operations for lists/groups/items
│   ├── useTodoSync.ts    # Real-time Supabase subscriptions
│   └── useSupabase.ts    # Supabase client hook
├── lib/
│   ├── supabase.ts       # Supabase client singleton
│   └── utils.ts          # UUID generation, cn() utility
├── pages/                # Route components
├── styles/               # Global CSS and Tailwind config
└── types/
    ├── database.types.ts # Generated from Supabase schema
    └── todo.ts           # Domain types (TodoList, TodoGroup, TodoItem)
```

## Contracts & Invariants

### State Management Pattern

**All Supabase operations use optimistic updates:**
1. Update local state immediately (setGroups, setItems)
2. Perform Supabase operation
3. On error: Rollback via loadList() or manual revert

Example from `useTodoList.ts:131-145`:
```typescript
const deleteGroup = async (groupId: string) => {
  setGroups((prev) => prev.filter((g) => g.id !== groupId));
  setItems((prev) => prev.filter((i) => i.group_id !== groupId));

  const { error } = await supabase.from("todo_groups").delete().eq("id", groupId);

  if (error) {
    loadList(); // Rollback on error
    throw error;
  }
};
```

### Data Flow

1. `useTodoList` - Manages local state + Supabase CRUD
2. `useTodoSync` - Subscribes to real-time changes, calls `loadList()` on updates
3. Components - Call hook methods, render local state

### Supabase Client

- Singleton instance in `lib/supabase.ts`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Never create multiple Supabase clients

## Patterns

### Adding a New Dialog

1. Create component in `components/todo/` (e.g., `NewFeatureDialog.tsx`)
2. Use Radix UI Dialog primitive from `components/ui/dialog.tsx`
3. Call `useTodoList` hook methods for data operations
4. Add trigger button to relevant parent component

### Adding a New Hook

1. Create in `hooks/` directory
2. Use Supabase client from `lib/supabase.ts`
3. Follow optimistic update pattern (update local → Supabase → rollback on error)
4. Return loading/error states for UI feedback

### Styling Components

- Use Tailwind CSS v4 utility classes
- Use `cn()` from `lib/utils.ts` to merge class names
- Follow existing Radix UI component patterns in `components/ui/`
- Theme values in `styles/globals.css` (dark mode supported)

## Anti-patterns

- **Never import Supabase types directly** - Use `types/database.types.ts` (generated via `npm run types`)
- **Don't bypass optimistic updates** - Always update local state before Supabase call
- **Never hardcode IDs** - Use `generateUUID()` from `lib/utils.ts`
- **Don't mix business logic in UI components** - Keep in hooks or separate functions
- **Never mutate state directly** - Use setState with immutable updates

## Pitfalls

- **Real-time subscriptions fire for own changes** - `useTodoSync` silently reloads to avoid flicker
- **Position field gaps are OK** - Ordering uses `position` then `created_at` as tiebreaker
- **Dialog state must be controlled** - Radix UI dialogs require explicit open/onOpenChange props
- **UUID format matters** - Use `generateUUID()` to match Supabase UUID type

## Type Generation

Run `npm run types` after schema changes to regenerate `types/database.types.ts` from Supabase.

## Related Context

- Root project context: `../AGENTS.md`
- Database schema: `../supabase/migrations/`
- Migration workflow: `../README.md` (Database Migration Workflow section)
